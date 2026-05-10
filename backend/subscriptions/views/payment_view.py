import hmac
import hashlib
import razorpay

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.generics import GenericAPIView
from django.db.models import Sum

from subscriptions.models import Plan, Subscription, PaymentOrder
from common.responses.api_response import APIResponse
from common.constants.enums import SubscriptionStatus, PaymentOrderStatus, ExpenseCategory
from gyms.models import Gym
from expenses.models import Expense
from common.permissions.super_admin_permission import IsSuperAdmin
from subscriptions.services.plan_catalog_service import get_plan_display_name



def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def get_gym_id(request):
    claims = getattr(request, "user_claims", {}) or {}
    return claims.get("gym_id")


class CreatePaymentOrderView(GenericAPIView):
    """
    POST /api/subscriptions/payment/create-order/
    Body: { plan_id }
    Returns Razorpay order details to frontend
    """

    def post(self, request):
        plan_id = request.data.get("plan_id")
        gym_id  = get_gym_id(request)

        if not plan_id:
            return APIResponse.error("plan_id is required", status=status.HTTP_400_BAD_REQUEST)
        if not gym_id:
            return APIResponse.error("Unauthorized", status=status.HTTP_401_UNAUTHORIZED)

        # Fetch plan
        try:
            plan = Plan.objects.get(plan_id=plan_id, is_deleted=False)
        except Plan.DoesNotExist:
            return APIResponse.error("Plan not found", status=status.HTTP_404_NOT_FOUND)

        try:
            gym = Gym.objects.get(gym_id=gym_id)
        except Gym.DoesNotExist:
            return APIResponse.error("Gym not found", status=status.HTTP_404_NOT_FOUND)

        # Amount in paise (Razorpay needs smallest currency unit)
        amount_inr   = int(plan.price)
        amount_paise = amount_inr * 100

        if amount_paise < 100:
            return APIResponse.error("Plan price too low (min ₹1)", status=status.HTTP_400_BAD_REQUEST)

        # Create Razorpay order
        try:
            client = get_razorpay_client()
            print("\n\n\n\n Creating Razorpay order with amount (paise):", amount_paise)
            print("Client auth:", client, client.auth, gym_id, plan_id, gym.name, plan.name, amount_paise)
            rz_order = client.order.create({
                "amount":   amount_paise,
                "currency": "INR",
                "receipt":  f"gyr_{str(gym_id)[:8]}_{str(plan_id)[:8]}",
                "notes": {
                    "gym_id":  str(gym_id),
                    "plan_id": str(plan_id),
                    "gym_name": gym.name,
                    "plan_name": get_plan_display_name(plan),
                }
            })
        except Exception as e:
            return APIResponse.error(
                f"Razorpay order creation failed: {str(e)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save order to DB
        PaymentOrder.objects.create(
            gym_id=gym,
            plan=plan,
            razorpay_order_id=rz_order["id"],
            amount=plan.price,
            currency="INR",
            status=PaymentOrderStatus.CREATED.value,
        )

        return APIResponse.success(
            message="Order created",
            data={
                "razorpay_order_id": rz_order["id"],
                "amount":            amount_paise,
                "currency":          "INR",
                "plan_name":         get_plan_display_name(plan),
                "plan_price":        float(plan.price),
                "key_id":            settings.RAZORPAY_KEY_ID,  # safe to send to frontend
                "gym_name":          gym.name,
            }
        )


class VerifyPaymentView(GenericAPIView):
    """
    POST /api/subscriptions/payment/verify/
    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id }
    Verifies signature → activates subscription
    """

    def post(self, request):
        razorpay_order_id   = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature  = request.data.get("razorpay_signature")
        plan_id             = request.data.get("plan_id")
        gym_id              = get_gym_id(request)

        # Validate all fields present
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id]):
            return APIResponse.error(
                "razorpay_order_id, razorpay_payment_id, razorpay_signature and plan_id are required",
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Verify signature (HMAC-SHA256) ──
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            # Mark order as failed
            PaymentOrder.objects.filter(
                razorpay_order_id=razorpay_order_id
            ).update(status=PaymentOrderStatus.FAILED.value)

            return APIResponse.error(
                "Payment verification failed — invalid signature",
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Signature valid — activate subscription ──
        try:
            with transaction.atomic():

                # Fetch order record
                payment_order = PaymentOrder.objects.get(
                    razorpay_order_id=razorpay_order_id
                )
                plan = payment_order.plan
                gym  = payment_order.gym_id  # FK to Gym

                # Expire old active subscription
                Subscription.objects.filter(
                    gym_id=gym,
                    status=SubscriptionStatus.ACTIVE.value
                ).update(
                    status=SubscriptionStatus.EXPIRED.value,
                    updated_at=timezone.now()
                )

                # Create new subscription
                start_date = timezone.now()
                end_date   = start_date + timedelta(days=plan.duration_days)

                subscription = Subscription.objects.create(
                    gym_id=gym,
                    plan=plan,
                    start_date=start_date,
                    end_date=end_date,
                    status=SubscriptionStatus.ACTIVE.value,
                )

                # Update payment order record
                payment_order.razorpay_payment_id = razorpay_payment_id
                payment_order.razorpay_signature  = razorpay_signature
                payment_order.status              = PaymentOrderStatus.PAID.value
                payment_order.save(update_fields=[
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "status",
                    "updated_at"
                ])
                Expense.objects.create(
                    gym_id=gym,
                    amount=plan.price,
                    description=f"Gymora Subscription payment for plan '{get_plan_display_name(plan)}'",
                    category=ExpenseCategory.SUBSCRIPTION.value,
                )
                

        except PaymentOrder.DoesNotExist:
            return APIResponse.error("Order not found", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return APIResponse.error(
                f"Subscription activation failed: {str(e)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return APIResponse.success(
            message="Payment verified — subscription activated!",
            data={
                "subscription_id": str(subscription.subscription_id),
                "plan":            get_plan_display_name(plan),
                "start_date":      str(start_date.date()),
                "end_date":        str(end_date.date()),
                "status":          SubscriptionStatus.ACTIVE.value,
            }
        )


class PaymentHistoryView(GenericAPIView):
    """
    GET /api/subscriptions/payment/history/
    Returns all payment orders for this gym
    """

    def get(self, request):
        gym_id = get_gym_id(request)
        if not gym_id:
            return APIResponse.error("Unauthorized", status=status.HTTP_401_UNAUTHORIZED)

        orders = PaymentOrder.objects.filter(
            gym_id__gym_id=gym_id
        ).select_related("plan").order_by("-created_at")

        data = [
            {
                "order_id":           str(o.order_id),
                "razorpay_order_id":  o.razorpay_order_id,
                "razorpay_payment_id": o.razorpay_payment_id,
                "plan":               get_plan_display_name(o.plan),
                "amount":             float(o.amount),
                "status":             o.status,
                "created_at":         str(o.created_at.date()),
            }
            for o in orders
        ]

        return APIResponse.success(data=data)


class SuperAdminPaymentListView(GenericAPIView):
    """
    GET /api/subscriptions/payment/all/
    Super admin sees all payments across all gyms
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from subscriptions.models import PaymentOrder

        status_filter = request.query_params.get("status")   # created|paid|failed
        search        = request.query_params.get("search", "").strip()

        orders = PaymentOrder.objects.select_related(
            "gym_id", "plan"
        ).order_by("-created_at")

        if status_filter:
            orders = orders.filter(status=status_filter)

        if search:
            orders = orders.filter(
                gym_id__name__icontains=search
            )

        data = [
            {
                "order_id":            str(o.order_id),
                "razorpay_order_id":   o.razorpay_order_id,
                "razorpay_payment_id": o.razorpay_payment_id or "—",
                "gym_name":            o.gym_id.name,
                "gym_id":              str(o.gym_id.gym_id),
                "plan_name":           get_plan_display_name(o.plan),
                "plan_badge_color":    getattr(o.plan, "badge_color", "#3b82f6"),
                "amount":              float(o.amount),
                "status":              o.status,
                "created_at":          o.created_at.strftime("%d %b %Y, %I:%M %p"),
            }
            for o in orders
        ]

        # summary counts for stat cards
        all_orders = PaymentOrder.objects.all()
        summary = {
            "total":    all_orders.count(),
            "paid":     all_orders.filter(status="paid").count(),
            "failed":   all_orders.filter(status="failed").count(),
            "created":  all_orders.filter(status="created").count(),
            "revenue":  float(all_orders.filter(status="paid").aggregate(
                            t=Sum("amount"))["t"] or 0),
        }

        return APIResponse.success(data={"payments": data, "summary": summary})
