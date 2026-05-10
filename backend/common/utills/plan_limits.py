from common.responses.api_response import APIResponse
from subscriptions.services.plan_catalog_service import (
    get_active_paid_subscription,
    get_plan_display_name,
    get_plan_limit,
    get_plan_usage_snapshot,
)


def _build_limit_response(gym_id, limit_key, current_key, label):
    limit = get_plan_limit(gym_id, limit_key)
    if limit is None:
        return None

    usage = get_plan_usage_snapshot(gym_id)
    current = usage[current_key]
    if current < limit:
        return None

    subscription = get_active_paid_subscription(gym_id)
    plan_name = get_plan_display_name(subscription.plan) if subscription and subscription.plan else "current"
    return APIResponse.error(
        f"{plan_name} plan allows up to {limit} {label}. Please upgrade to continue.",
        errors={
            "error": "plan_limit_reached",
            "resource": label,
            "limit": limit,
            "current": current,
        },
        status=403,
    )


def ensure_member_capacity(gym_id):
    return _build_limit_response(gym_id, "member_limit", "member_count", "members")


def ensure_staff_capacity(gym_id):
    return _build_limit_response(gym_id, "staff_limit", "staff_count", "staff users")
