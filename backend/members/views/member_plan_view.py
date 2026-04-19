from django.utils import timezone
from datetime import timedelta

from rest_framework.generics import GenericAPIView

from members.models.member_model import Member
from members.models import MemberSubscription, MembershipPlan
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep


class AssignMemberPlanView(GenericAPIView):

    def post(self, request):
        member_id = request.data.get("member_id")
        plan_id = request.data.get("plan_id")

        member = Member.objects.get(id=member_id)
        plan = MembershipPlan.objects.get(plan_id=plan_id)

        start_date = timezone.now()
        end_date = start_date + timedelta(days=plan.duration_days)

        MemberSubscription.objects.create(
            gym_id=member.gym_id,
            member=member,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            amount_paid=plan.price
        )

        member.onboarding_step = OnboardingStep.COMPLETED
        member.save()

        return APIResponse.success("Member onboarding completed")