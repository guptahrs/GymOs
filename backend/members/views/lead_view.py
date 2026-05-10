from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView

from accounts.models import User
from common.constants.enums import OnboardingStep, PaymentStatus, UserType
from common.responses.api_response import APIResponse
from common.services.address_service import create_address
from common.utills.plan_limits import ensure_member_capacity
from common.utills.subscription_guard import ensure_gym_write_access
from members.models import Member, MembershipPlan, MemberSubscription


class LeadListCreateView(GenericAPIView):
    """Create and list leads using the existing `User` model with `user_type=LEAD`."""

    def get(self, request):
        user_claims = getattr(request, "user_claims", None) or {}
        gym_id = user_claims.get("gym_id")
        if not gym_id:
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(
            user_type=UserType.LEAD,
            gym_id=gym_id,
            is_deleted=False,
        ).order_by("-created_at")

        data = [
            {
                "lead_id": str(user.user_id),
                "name": f"{user.first_name} {user.last_name or ''}".strip(),
                "email": user.email,
                "phone": user.phone,
                "status": "lead",
                "gender": user.gender,
                "dob": user.date_of_birth,
                "created_at": user.created_at,
            }
            for user in users
        ]
        return APIResponse.success(data=data)

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        user_claims = getattr(request, "user_claims", None) or {}
        gym_id = request.data.get("gym_id") or user_claims.get("gym_id")
        if not gym_id:
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        password = request.data.get("password", "defaultpassword123")
        email = request.data.get("email")
        if email and User.objects.filter(email=email, is_deleted=False).exists():
            return APIResponse.error("Email already exists", status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            first_name=request.data.get("first_name") or request.data.get("name") or "",
            last_name=request.data.get("last_name", "") or "",
            email=email,
            phone=request.data.get("phone"),
            password=make_password(password),
            user_type=UserType.LEAD,
            gender=request.data.get("gender") or None,
            date_of_birth=request.data.get("dob") or request.data.get("date_of_birth") or None,
            gym_id=gym_id,
        )

        return APIResponse.success(message="Lead created", data={"lead_id": str(user.user_id)})


class ConvertLeadView(GenericAPIView):
    """Convert a lead (User with user_type=LEAD) into a Member."""

    def post(self, request, lead_id):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        try:
            user = User.objects.get(user_id=lead_id, is_deleted=False, user_type=UserType.LEAD)
        except User.DoesNotExist:
            return APIResponse.error(message="Lead not found", status=status.HTTP_404_NOT_FOUND)

        if Member.objects.filter(user=user, is_deleted=False).exists():
            return APIResponse.error(message="Lead is already converted", status=status.HTTP_400_BAD_REQUEST)

        address_data = request.data.get("address") or {}
        required_address_fields = ["address_line_1", "city", "state", "country", "pincode"]
        missing_fields = [field for field in required_address_fields if not address_data.get(field)]
        if missing_fields:
            return APIResponse.error(
                message="Address details are required",
                errors={field: "This field is required" for field in missing_fields},
                status=status.HTTP_400_BAD_REQUEST,
            )

        gym_id = user.gym_id or request.data.get("gym_id")
        if not gym_id:
            return APIResponse.error(message="Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        limit_error = ensure_member_capacity(gym_id)
        if limit_error:
            return limit_error

        plan = None
        plan_id = request.data.get("plan_id")
        if plan_id:
            try:
                plan = MembershipPlan.objects.get(plan_id=plan_id, gym_id=gym_id, is_deleted=False)
            except MembershipPlan.DoesNotExist:
                return APIResponse.error(message="Plan not found", status=status.HTTP_404_NOT_FOUND)

        try:
            amount_paid = Decimal(str(request.data.get("amount_paid") or "0"))
        except (InvalidOperation, TypeError):
            return APIResponse.error(message="Invalid paid amount", status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            address = create_address(address_data)
            payment_status = PaymentStatus.DUE

            member = Member.objects.create(
                user=user,
                gym_id=gym_id,
                address=address,
                date_of_birth=user.date_of_birth,
                onboarding_step=OnboardingStep.ADDRESS,
                payment_status=payment_status,
            )

            if plan:
                start_date = timezone.now()
                end_date = start_date + timedelta(days=plan.duration_days)
                remaining_amount = max(plan.price - amount_paid, Decimal("0"))
                if remaining_amount == 0:
                    payment_status = PaymentStatus.PAID
                elif amount_paid > 0:
                    payment_status = PaymentStatus.PARTIAL

                MemberSubscription.objects.create(
                    gym_id=gym_id,
                    member=member,
                    plan=plan,
                    start_date=start_date,
                    end_date=end_date,
                    amount_paid=amount_paid,
                    remaining_amount=remaining_amount,
                )
                member.onboarding_step = OnboardingStep.COMPLETED
                member.payment_status = payment_status
                member.save(update_fields=["onboarding_step", "payment_status", "updated_at"])

            user.user_type = UserType.MEMBER
            user.save(update_fields=["user_type", "updated_at"])

        return APIResponse.success(
            message="Lead marked as joined",
            data={
                "member_id": str(member.member_id),
                "payment_status": member.payment_status,
                "onboarding_step": member.onboarding_step,
            },
        )
