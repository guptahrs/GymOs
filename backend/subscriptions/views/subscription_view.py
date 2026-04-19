from rest_framework.generics import GenericAPIView
from django.utils import timezone
from datetime import timedelta

from subscriptions.models import Subscription, Plan
from gyms.models import Gym
from subscriptions.serializers.subscription_serializer import SubscriptionSerializer
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep


class CreateSubscriptionView(GenericAPIView):
    serializer_class = SubscriptionSerializer

    def post(self, request):
        gym_id = request.data.get("gym_id")
        plan_id = request.data.get("plan_id")

        try:
            plan = Plan.objects.get(plan_id=plan_id)
        except Plan.DoesNotExist:
            return APIResponse.error("Invalid plan")

        start_date = timezone.now()
        end_date = start_date + timedelta(days=plan.duration_days)

        subscription = Subscription.objects.create(
            gym_id=gym_id,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
        )
        
        gym = Gym.objects.get(gym_id=gym_id)
        gym.onboarding_step = OnboardingStep.COMPLETED
        gym.save()

        return APIResponse.success(
            message="Subscription created",
            data=SubscriptionSerializer(subscription).data
        )


class GetActiveSubscriptionView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        subscription = Subscription.objects.filter(
            gym_id=gym_id,
            is_active=True
        ).first()

        if not subscription:
            return APIResponse.error("No active subscription")

        return APIResponse.success(
            data={
                "plan": subscription.plan.name,
                "expiry": subscription.end_date
            }
        )