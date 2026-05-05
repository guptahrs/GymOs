from django.utils.timezone import now

from common.constants.enums import SubscriptionAccessType, SubscriptionStatus
from subscriptions.models import Subscription, PlanFeatureMapping


def has_feature(gym_id, feature_code):
    subscription = Subscription.objects.filter(
        gym_id=gym_id,
        status=SubscriptionStatus.ACTIVE,
        end_date__gte=now(),
    ).order_by("-end_date").first()

    if not subscription:
        return False

    if subscription.access_type == SubscriptionAccessType.TRIAL:
        return True

    if not subscription.plan:
        return False

    return PlanFeatureMapping.objects.filter(
        plan=subscription.plan,
        feature__code=feature_code
    ).exists()


def has_write_access(gym_id):
    subscription = Subscription.objects.filter(
        gym_id=gym_id,
        status=SubscriptionStatus.ACTIVE,
        end_date__gte=now(),
    ).first()

    return bool(subscription)
