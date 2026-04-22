from django.utils import timezone
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from rest_framework.generics import GenericAPIView
from rest_framework import status

from members.models.member_model import Member
from members.models import MemberSubscription, MembershipPlan
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep, PaymentStatus


class AssignMemberPlanView(GenericAPIView):

    def post(self, request):
        member_id = request.data.get("member_id")
        plan_id = request.data.get("plan_id")
        amount_paid_raw = request.data.get("amount_paid")
        remaining_amount_raw = request.data.get("remaining_amount")

        if not member_id or not plan_id:
            return APIResponse.error("Member and plan are required", status=status.HTTP_400_BAD_REQUEST)

        try:
            member = Member.objects.get(member_id=member_id, is_deleted=False)
        except Member.DoesNotExist:
            return APIResponse.error("Member not found", status=status.HTTP_404_NOT_FOUND)

        try:
            plan = MembershipPlan.objects.get(plan_id=plan_id, gym_id=member.gym_id, is_deleted=False)
        except MembershipPlan.DoesNotExist:
            return APIResponse.error("Plan not found", status=status.HTTP_404_NOT_FOUND)

        try:
            remaining_amount = Decimal(str(remaining_amount_raw)) if remaining_amount_raw not in [None, ""] else Decimal("0")
        except (InvalidOperation, TypeError):
            return APIResponse.error("Invalid remaining amount", status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_paid = Decimal(str(amount_paid_raw if amount_paid_raw not in [None, ""] else plan.price))
        except (InvalidOperation, TypeError):
            return APIResponse.error("Invalid paid amount", status=status.HTTP_400_BAD_REQUEST)

        if amount_paid < 0:
            return APIResponse.error("Paid amount cannot be negative", status=status.HTTP_400_BAD_REQUEST)
        if remaining_amount < 0:
            return APIResponse.error("Remaining amount cannot be negative", status=status.HTTP_400_BAD_REQUEST)

        start_date = timezone.now()
        end_date = start_date + timedelta(days=plan.duration_days)

        MemberSubscription.objects.create(
            gym_id=member.gym_id,
            member=member,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            amount_paid=amount_paid,
            remaining_amount=remaining_amount,
        )

        member.onboarding_step = OnboardingStep.COMPLETED
        member.payment_status = PaymentStatus.PAID if remaining_amount == 0 else PaymentStatus.PARTIAL
        member.save(update_fields=["onboarding_step", "payment_status", "updated_at"])

        return APIResponse.success("Plan assigned", data={"payment_status": member.payment_status})
