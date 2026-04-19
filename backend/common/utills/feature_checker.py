from subscriptions.models import Subscription, PlanFeatureMapping


def has_feature(gym_id, feature_code):
    subscription = Subscription.objects.filter(
        gym_id=gym_id,
        is_active=True
    ).first()

    if not subscription:
        return False

    return PlanFeatureMapping.objects.filter(
        plan=subscription.plan,
        feature__code=feature_code
    ).exists()