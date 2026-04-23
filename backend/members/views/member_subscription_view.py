from rest_framework.generics import GenericAPIView
from rest_framework import status

from members.models import Member, MemberSubscription
from common.responses.api_response import APIResponse


class LatestMemberSubscriptionView(GenericAPIView):
    def get(self, request, member_id):
        try:
            member = Member.objects.get(member_id=member_id, is_deleted=False)
        except Member.DoesNotExist:
            return APIResponse.error("Member not found", status=status.HTTP_404_NOT_FOUND)

        sub = (
            MemberSubscription.objects.filter(member=member, is_deleted=False)
            .order_by("-created_at")
            .first()
        )

        if not sub:
            return APIResponse.success(data=None)

        data = {
            "subscription_id": str(sub.subscription_id),
            "plan_id": str(sub.plan.plan_id) if sub.plan else None,
            "amount_paid": str(sub.amount_paid) if sub.amount_paid is not None else None,
            "remaining_amount": str(sub.remaining_amount) if sub.remaining_amount is not None else None,
            "start_date": sub.start_date,
            "end_date": sub.end_date,
        }

        return APIResponse.success(data=data)
