from django.utils.timezone import now

from common.constants.enums import SubscriptionAccessType, SubscriptionStatus
from subscriptions.models import Subscription
from subscriptions.serializers.subscription_serializer import SubscriptionSerializer


def _base_payload():
    return {
        "subscription_id": None,
        "plan_name": None,
        "plan_price": None,
        "duration_days": None,
        "badge_color": None,
        "start_date": None,
        "end_date": None,
        "status": None,
        "days_left": 0,
        "access_type": SubscriptionAccessType.PAID,
        "is_trial": False,
        "access_status": "no_plan",
        "is_read_only": True,
        "can_manage_data": False,
        "show_buy_plan": True,
        "trial_days": None,
    }


def get_current_access_subscription(gym_id):
    current_time = now()
    paid_subscription = (
        Subscription.objects.select_related("plan")
        .filter(
            gym_id=gym_id,
            status=SubscriptionStatus.ACTIVE,
            end_date__gte=current_time,
            access_type=SubscriptionAccessType.PAID,
        )
        .order_by("-end_date")
        .first()
    )
    if paid_subscription:
        return paid_subscription

    return (
        Subscription.objects.select_related("plan")
        .filter(
            gym_id=gym_id,
            status=SubscriptionStatus.ACTIVE,
            end_date__gte=current_time,
            access_type=SubscriptionAccessType.TRIAL,
        )
        .order_by("-end_date")
        .first()
    )


def get_latest_subscription(gym_id):
    return (
        Subscription.objects.select_related("plan")
        .filter(gym_id=gym_id)
        .order_by("-end_date", "-created_at")
        .first()
    )


def get_gym_access_context(gym_id):
    active_subscription = get_current_access_subscription(gym_id)
    latest_subscription = get_latest_subscription(gym_id)

    if active_subscription:
        is_trial = active_subscription.access_type == SubscriptionAccessType.TRIAL
        return {
            "subscription": active_subscription,
            "latest_subscription": latest_subscription or active_subscription,
            "access_status": "trial" if is_trial else "active",
            "is_trial": is_trial,
            "is_read_only": False,
            "can_manage_data": True,
            "show_buy_plan": is_trial,
        }

    latest_is_trial = bool(
        latest_subscription
        and latest_subscription.access_type == SubscriptionAccessType.TRIAL
    )
    return {
        "subscription": None,
        "latest_subscription": latest_subscription,
        "access_status": "trial_expired" if latest_is_trial else ("expired" if latest_subscription else "no_plan"),
        "is_trial": latest_is_trial,
        "is_read_only": True,
        "can_manage_data": False,
        "show_buy_plan": True,
    }


def build_subscription_access_payload(gym_id):
    context = get_gym_access_context(gym_id)
    payload = _base_payload()

    subscription = context["subscription"] or context["latest_subscription"]
    if subscription:
        payload.update(SubscriptionSerializer(subscription).data)
        payload["trial_days"] = subscription.duration_in_days

    payload.update(
        {
            "access_status": context["access_status"],
            "is_trial": context["is_trial"],
            "is_read_only": context["is_read_only"],
            "can_manage_data": context["can_manage_data"],
            "show_buy_plan": context["show_buy_plan"],
        }
    )
    return payload
