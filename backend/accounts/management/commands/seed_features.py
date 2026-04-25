from django.core.management.base import BaseCommand
from subscriptions.models import Plan, PlanFeature, PlanFeatureMapping
from accounts.models import Feature


FEATURES = [
    ("members",   "Members Management"),
    ("staff",     "Staff Management"),
    ("dashboard", "Dashboard"),
    ("leads",     "Leads / Visitors"),
    ("expenses",  "Expenses"),
    ("trainers",  "Trainers"),
    ("whatsapp",  "WhatsApp Notifications"),
]

PLAN_FEATURES = {
    "Basic": ["members", "staff", "dashboard"],
    "Pro":   ["members", "staff", "dashboard", "leads", "expenses", "trainers"],
    "Enterprise": ["members", "staff", "dashboard", "leads", "expenses", "trainers", "whatsapp"],
}


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
        basic, _      = Plan.objects.get_or_create(name="Basic",      defaults={"price": 999,  "duration_days": 30})
        pro, _        = Plan.objects.get_or_create(name="Pro",        defaults={"price": 2499, "duration_days": 30})
        enterprise, _ = Plan.objects.get_or_create(name="Enterprise", defaults={"price": 4999, "duration_days": 30})
        self.stdout.write("Plans created.")

        plan_map = {"Basic": basic, "Pro": pro, "Enterprise": enterprise}

        # 3. Create PlanFeatureMapping rows
        for plan_name, feature_codes in PLAN_FEATURES.items():
            plan = plan_map[plan_name]
            for code in feature_codes:
                pf = PlanFeature.objects.get(code=code)
                PlanFeatureMapping.objects.get_or_create(plan=plan, feature=pf)

        self.stdout.write(self.style.SUCCESS("All plan-feature mappings seeded."))