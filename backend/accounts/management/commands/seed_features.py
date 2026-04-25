from django.core.management.base import BaseCommand
from subscriptions.models import Plan, PlanFeature, PlanFeatureMapping
from accounts.models import Feature
from common.constants.enums import FeatureCode, PlanName


FEATURES = [
    (FeatureCode.MEMBERS,   FeatureCode.MEMBERS.label),
    (FeatureCode.STAFF,     FeatureCode.STAFF.label),
    (FeatureCode.DASHBOARD, FeatureCode.DASHBOARD.label),
    (FeatureCode.LEADS,     FeatureCode.LEADS.label),
    (FeatureCode.EXPENSES,  FeatureCode.EXPENSES.label),
    (FeatureCode.TRAINERS,  FeatureCode.TRAINERS.label),
    (FeatureCode.WHATSAPP,  FeatureCode.WHATSAPP.label),
]

PLAN_FEATURES = {
    PlanName.STANDARD: [FeatureCode.MEMBERS, FeatureCode.STAFF, FeatureCode.DASHBOARD],
    PlanName.ELITE:    [FeatureCode.MEMBERS, FeatureCode.STAFF, FeatureCode.DASHBOARD, FeatureCode.LEADS, FeatureCode.EXPENSES],
    PlanName.PREMIUM_PLUS: [FeatureCode.MEMBERS, FeatureCode.STAFF, FeatureCode.DASHBOARD, FeatureCode.LEADS, FeatureCode.EXPENSES, FeatureCode.TRAINERS, FeatureCode.WHATSAPP],}


class Command(BaseCommand):
    help = "Seed plans, features, and plan-feature mappings"

    def handle(self, *args, **kwargs):
        # 1. Create PlanFeature rows (subscription app)
        for code, name in FEATURES:
            PlanFeature.objects.get_or_create(code=code, defaults={"name": name})
            # Also create matching RBAC Feature (accounts app) — same code
            Feature.objects.get_or_create(code=code, defaults={"name": name})
        self.stdout.write("Features created.")

        # 2. Create plans if not exist
        basic, _      = Plan.objects.get_or_create(name=PlanName.STANDARD,      defaults={"price": PlanName.STANDARD.price,  "duration_days": PlanName.STANDARD.duration_days, "badge_color": "#22c55e"})
        pro, _        = Plan.objects.get_or_create(name=PlanName.ELITE,        defaults={"price": PlanName.ELITE.price, "duration_days": PlanName.ELITE.duration_days, "badge_color": "#a855f7"})
        enterprise, _ = Plan.objects.get_or_create(name=PlanName.PREMIUM_PLUS, defaults={"price": PlanName.PREMIUM_PLUS.price, "duration_days": PlanName.PREMIUM_PLUS.duration_days, "badge_color": "#3b82f6"})
        self.stdout.write("Plans created.")

        plan_map = {PlanName.STANDARD: basic, PlanName.ELITE: pro, PlanName.PREMIUM_PLUS: enterprise}

        # 3. Create PlanFeatureMapping rows
        for plan_name, feature_codes in PLAN_FEATURES.items():
            plan = plan_map[plan_name]
            for code in feature_codes:
                pf = PlanFeature.objects.get(code=code)
                PlanFeatureMapping.objects.get_or_create(plan=plan, feature=pf)

        self.stdout.write(self.style.SUCCESS("All plan-feature mappings seeded."))