from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView

from common.constants.enums import OnboardingStep, PaymentMode, PaymentStatus
from common.responses.api_response import APIResponse
from common.utills.subscription_guard import ensure_gym_write_access
from members.models import Member, MemberPayment, MemberSubscription, MembershipPlan


class AssignMemberPlanView(GenericAPIView):

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        member_id = request.data.get("member_id")
        plan_id = request.data.get("plan_id")
        amount_paid_raw = request.data.get("amount_paid")
        remaining_amount_raw = request.data.get("remaining_amount")
        payment_mode = request.data.get("payment_mode")
        estimated_remaining_payment_date = request.data.get(
            "estimated_remaining_payment_date"
        )

        if not member_id or not plan_id:
            return APIResponse.error(
                "member_id and plan_id are required",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment_mode not in PaymentMode.values():
            return APIResponse.error(
                "payment_mode must be a valid payment mode",
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = Member.objects.get(member_id=member_id, is_deleted=False)
        except Member.DoesNotExist:
            return APIResponse.error("Member not found", status=status.HTTP_404_NOT_FOUND)

        claims = getattr(request, "user_claims", {}) or {}
        jwt_gym_id = str(claims.get("gym_id", ""))
        if jwt_gym_id and str(member.gym_id) != jwt_gym_id:
            return APIResponse.error(
                "Access denied - member does not belong to your gym",
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            plan = MembershipPlan.objects.get(
                plan_id=plan_id,
                gym_id=member.gym_id,
                is_deleted=False,
            )
        except MembershipPlan.DoesNotExist:
            return APIResponse.error("Plan not found", status=status.HTTP_404_NOT_FOUND)

        try:
            amount_paid = Decimal(
                str(amount_paid_raw if amount_paid_raw not in (None, "") else plan.price)
            )
        except (InvalidOperation, TypeError):
            return APIResponse.error("Invalid amount_paid", status=status.HTTP_400_BAD_REQUEST)

        try:
            remaining_amount = Decimal(
                str(remaining_amount_raw if remaining_amount_raw not in (None, "") else "0")
            )
        except (InvalidOperation, TypeError):
            return APIResponse.error("Invalid remaining_amount", status=status.HTTP_400_BAD_REQUEST)

        if amount_paid < 0:
            return APIResponse.error(
                "amount_paid cannot be negative",
                status=status.HTTP_400_BAD_REQUEST,
            )
        if remaining_amount < 0:
            return APIResponse.error(
                "remaining_amount cannot be negative",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (amount_paid + remaining_amount) != plan.price:
            return APIResponse.error(
                f"amount_paid + remaining_amount must equal plan price (Rs.{plan.price})",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if remaining_amount > 0 and not estimated_remaining_payment_date:
            return APIResponse.error(
                "estimated_remaining_payment_date is required when remaining_amount > 0",
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                MemberSubscription.objects.filter(
                    member=member,
                    gym_id=member.gym_id,
                    status="active",
                ).update(
                    status="expired",
                    updated_at=timezone.now(),
                )

                start_date = timezone.now()
                end_date = start_date + timedelta(days=plan.duration_days)

                subscription = MemberSubscription.objects.create(
                    gym_id=member.gym_id,
                    member=member,
                    plan=plan,
                    start_date=start_date,
                    end_date=end_date,
                    amount_paid=amount_paid,
                    remaining_amount=remaining_amount,
                    estimated_remaining_payment_date=(
                        estimated_remaining_payment_date if remaining_amount > 0 else None
                    ),
                    status="active",
                )

                if amount_paid > 0:
                    MemberPayment.objects.create(
                        gym_id=member.gym_id,
                        member=member,
                        amount=amount_paid,
                        payment_mode=payment_mode,
                    )

                member.onboarding_step = OnboardingStep.COMPLETED
                member.payment_status = (
                    PaymentStatus.PAID if remaining_amount == 0 else PaymentStatus.PARTIAL
                )
                member.save(update_fields=["onboarding_step", "payment_status", "updated_at"])

        except Exception as exc:
            return APIResponse.error(
                f"Transaction failed: {str(exc)}",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return APIResponse.success(
            message="Plan assigned successfully",
            data={
                "subscription_id": str(subscription.subscription_id),
                "member_id": str(member.member_id),
                "plan": plan.name,
                "start_date": str(start_date.date()),
                "end_date": str(end_date.date()),
                "amount_paid": float(amount_paid),
                "remaining": float(remaining_amount),
                "payment_status": member.payment_status,
                "payment_mode": payment_mode,
            },
        )
