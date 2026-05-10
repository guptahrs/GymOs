from django.utils.timezone import now

from common.constants.enums import FeatureCode, PlanName, SubscriptionAccessType, SubscriptionStatus
from subscriptions.models import Subscription


PLAN_CATALOG = {
    PlanName.STARTER.value: {
        "display_name": PlanName.STARTER.label,
        "badge_color": "#16a34a",
        "description": "For small gyms",
        "target_audience": "For small gyms",
        "highlight_text": None,
        "is_recommended": False,
        "member_limit": 100,
        "staff_limit": 2,
        "whatsapp_followup_limit": 0,
        "marketing_features": [
            "Up to 100 members",
            "Attendance tracking",
            "Payment tracking",
            "Expense tracking",
            "Basic dashboard",
            "2 staff users",
            "Visitor list",
            "Basic reports",
        ],
        "feature_codes": [
            FeatureCode.MEMBERS,
            FeatureCode.STAFF,
            FeatureCode.DASHBOARD,
            FeatureCode.LEADS,
            FeatureCode.EXPENSES,
        ],
    },
    PlanName.GROWTH.value: {
        "display_name": PlanName.GROWTH.label,
        "badge_color": "#f59e0b",
        "description": "Best value for growing gyms",
        "target_audience": "Most gyms will buy this",
        "highlight_text": "Best Value",
        "is_recommended": True,
        "member_limit": 300,
        "staff_limit": 5,
        "whatsapp_followup_limit": 3,
        "marketing_features": [
            "Up to 300 members",
            "WhatsApp reminders",
            "Lead management",
            "Advanced reports",
            "Staff management",
            "Visitor tracking with WhatsApp follow-ups up to 3",
            "Automated renewal reminders",
        ],
        "feature_codes": [
            FeatureCode.MEMBERS,
            FeatureCode.STAFF,
            FeatureCode.DASHBOARD,
            FeatureCode.LEADS,
            FeatureCode.EXPENSES,
            FeatureCode.WHATSAPP,
        ],
    },
    PlanName.ELITE.value: {
        "display_name": PlanName.ELITE.label,
        "badge_color": "#2563eb",
        "description": "For high-volume gyms that want automation and branding control",
        "target_audience": "For established gyms and fitness businesses",
        "highlight_text": "Scale Fast",
        "is_recommended": False,
        "member_limit": 1000,
        "staff_limit": 10,
        "whatsapp_followup_limit": None,
        "marketing_features": [
            "Up to 1000 members",
            "Everything in Growth",
            "Unlimited visitor WhatsApp follow-ups",
            "Trainer management",
            "White labeling",
            "Priority support",
            "Advanced business insights",
            "Dedicated onboarding support",
        ],
        "feature_codes": [
            FeatureCode.MEMBERS,
            FeatureCode.STAFF,
            FeatureCode.DASHBOARD,
            FeatureCode.LEADS,
            FeatureCode.EXPENSES,
            FeatureCode.TRAINERS,
            FeatureCode.WHATSAPP,
            FeatureCode.WHITE_LABEL,
        ],
    },
}


def get_plan_catalog(plan_or_name):
    if hasattr(plan_or_name, "name"):
        plan_name = plan_or_name.name
    else:
        plan_name = str(plan_or_name or "")
    return PLAN_CATALOG.get(plan_name, {})


def get_plan_display_name(plan_or_name):
    catalog = get_plan_catalog(plan_or_name)
    if catalog.get("display_name"):
        return catalog["display_name"]

    if hasattr(plan_or_name, "name"):
        plan_name = plan_or_name.name
    else:
        plan_name = str(plan_or_name or "")
    return plan_name.replace("_", " ").title()


def normalize_plan_name(name):
    raw_name = str(name or "").strip()
    if not raw_name:
        return raw_name

    normalized = raw_name.lower().replace("-", "_").replace(" ", "_")
    for plan_name, config in PLAN_CATALOG.items():
        if normalized == plan_name:
            return plan_name
        if normalized == str(config.get("display_name", "")).strip().lower().replace(" ", "_"):
            return plan_name
    return normalized


def get_plan_feature_codes(plan_or_name):
    return list(get_plan_catalog(plan_or_name).get("feature_codes", []))


def get_active_paid_subscription(gym_id):
    return (
        Subscription.objects.select_related("plan")
        .filter(
            gym_id=gym_id,
            status=SubscriptionStatus.ACTIVE,
            access_type=SubscriptionAccessType.PAID,
            end_date__gte=now(),
        )
        .order_by("-end_date")
        .first()
    )


def get_plan_limit(gym_id, limit_key):
    subscription = get_active_paid_subscription(gym_id)
    if not subscription or not subscription.plan:
        return None
    return get_plan_catalog(subscription.plan).get(limit_key)


def get_plan_usage_snapshot(gym_id):
    from members.models import Member
    from staff.models import Staff

    return {
        "member_count": Member.objects.filter(gym_id=gym_id, is_deleted=False).count(),
        "staff_count": Staff.objects.filter(gym_id=gym_id, is_deleted=False, user__is_deleted=False).count(),
    }
