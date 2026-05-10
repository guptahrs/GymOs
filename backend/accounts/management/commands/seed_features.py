from django.core.management.base import BaseCommand
from subscriptions.models import Plan, PlanFeature, PlanFeatureMapping
from accounts.models import Feature
from common.constants.enums import FeatureCode, PlanName
from subscriptions.services.plan_catalog_service import PLAN_CATALOG


FEATURES = [
    (FeatureCode.MEMBERS,   FeatureCode.MEMBERS.label),
    (FeatureCode.STAFF,     FeatureCode.STAFF.label),
    (FeatureCode.DASHBOARD, FeatureCode.DASHBOARD.label),
    (FeatureCode.LEADS,     FeatureCode.LEADS.label),
    (FeatureCode.EXPENSES,  FeatureCode.EXPENSES.label),
    (FeatureCode.TRAINERS,  FeatureCode.TRAINERS.label),
    (FeatureCode.WHATSAPP,  FeatureCode.WHATSAPP.label),
    (FeatureCode.WHITE_LABEL, FeatureCode.WHITE_LABEL.label),
]

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
        starter, _ = Plan.objects.update_or_create(
            name=PlanName.STARTER.value,
            defaults={
                "description": PLAN_CATALOG[PlanName.STARTER.value]["description"],
                "price": PlanName.STARTER.price,
                "duration_days": PlanName.STARTER.duration_days,
                "badge_color": PLAN_CATALOG[PlanName.STARTER.value]["badge_color"],
                "is_active": True,
                "is_deleted": False,
            },
        )
        growth, _ = Plan.objects.update_or_create(
            name=PlanName.GROWTH.value,
            defaults={
                "description": PLAN_CATALOG[PlanName.GROWTH.value]["description"],
                "price": PlanName.GROWTH.price,
                "duration_days": PlanName.GROWTH.duration_days,
                "badge_color": PLAN_CATALOG[PlanName.GROWTH.value]["badge_color"],
                "is_active": True,
                "is_deleted": False,
            },
        )
        elite, _ = Plan.objects.update_or_create(
            name=PlanName.ELITE.value,
            defaults={
                "description": PLAN_CATALOG[PlanName.ELITE.value]["description"],
                "price": PlanName.ELITE.price,
                "duration_days": PlanName.ELITE.duration_days,
                "badge_color": PLAN_CATALOG[PlanName.ELITE.value]["badge_color"],
                "is_active": True,
                "is_deleted": False,
            },
        )
        self.stdout.write("Plans created.")

        plan_map = {
            PlanName.STARTER.value: starter,
            PlanName.GROWTH.value: growth,
            PlanName.ELITE.value: elite,
        }

        Plan.objects.exclude(name__in=plan_map.keys()).update(is_active=False)

        # 3. Create PlanFeatureMapping rows
        for plan_name, config in PLAN_CATALOG.items():
            feature_codes = config["feature_codes"]
            plan = plan_map[plan_name]
            PlanFeatureMapping.objects.filter(plan=plan).exclude(
                feature__code__in=feature_codes
            ).delete()
            for code in feature_codes:
                pf = PlanFeature.objects.get(code=code)
                PlanFeatureMapping.objects.get_or_create(plan=plan, feature=pf)

        self.stdout.write(self.style.SUCCESS("All plan-feature mappings seeded."))
