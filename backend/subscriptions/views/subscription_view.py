from rest_framework.generics import GenericAPIView
from django.utils import timezone
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.views import APIView


from common.permissions.super_admin_permission import IsSuperAdmin
from common.permissions.gym_owner_permission import IsGymOwner
from subscriptions.models import Subscription, Plan
from gyms.models import Gym
from subscriptions.serializers.subscription_serializer import SubscriptionSerializer
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep, SubscriptionAccessType, SubscriptionStatus
from subscriptions.services.access_service import build_subscription_access_payload
from subscriptions.services.plan_catalog_service import get_plan_display_name


class CreateSubscriptionView(GenericAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        gym_id = request.data.get("gym_id")
        plan_id = request.data.get("plan_id")
        access_type = request.data.get("access_type", SubscriptionAccessType.PAID)
        trial_days = int(request.data.get("trial_days") or 7)

        if access_type == SubscriptionAccessType.PAID and not plan_id:
            return APIResponse.error("plan_id is required for a paid subscription")

        plan = None
        if access_type == SubscriptionAccessType.PAID:
            try:
                plan = Plan.objects.get(plan_id=plan_id)
            except Plan.DoesNotExist:
                return APIResponse.error("Invalid plan")
        elif access_type != SubscriptionAccessType.TRIAL:
            return APIResponse.error("Invalid access_type")

        if access_type == SubscriptionAccessType.TRIAL and trial_days <= 0:
            return APIResponse.error("trial_days must be greater than 0")

        start_date = timezone.now()
        end_date = start_date + timedelta(
            days=plan.duration_days if plan else trial_days
        )

        Subscription.objects.filter(
            gym_id=Gym.objects.get(gym_id=gym_id),
            status=SubscriptionStatus.ACTIVE,
        ).update(status=SubscriptionStatus.EXPIRED)

        subscription = Subscription.objects.create(
            gym_id=Gym.objects.get(gym_id=gym_id),
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            access_type=access_type,
        )

        gym = Gym.objects.get(gym_id=gym_id)
        gym.onboarding_step = OnboardingStep.COMPLETED
        gym.save(update_fields=["onboarding_step", "updated_at"])

        return APIResponse.success(
            message="Trial started" if access_type == SubscriptionAccessType.TRIAL else "Subscription created",
            data=build_subscription_access_payload(gym_id)
        )


class GetActiveSubscriptionView(GenericAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):

        subscription = Subscription.objects.filter(
            is_active=True
        ).first()

        if not subscription:
            return APIResponse.error("No active subscription")

        return APIResponse.success(
            data={
                "plan": get_plan_display_name(subscription.plan),
                "expiry": subscription.end_date
            }
        )


class CurrentSubscriptionView(APIView):
    permission_classes = [IsGymOwner | IsSuperAdmin]

    def get(self, request, gym_id):
        user = getattr(request, "user_claims", None) or {}
        if not user.get("is_super_admin") and str(user.get("gym_id")) != str(gym_id):
            return APIResponse.error("Access denied", status=403)

        return APIResponse.success(data=build_subscription_access_payload(gym_id))
