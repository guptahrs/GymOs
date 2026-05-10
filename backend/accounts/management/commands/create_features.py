# Create PlanFeature (SaaS plan level)
from django.core.management.base import BaseCommand
from subscriptions.models import PlanFeature, Plan, PlanFeatureMapping
from common.constants.enums import FeatureCode, PlanName
from subscriptions.services.plan_catalog_service import PLAN_CATALOG

features = [
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
    
    def  handle(self, *args, **kwargs):
        """Seed plans, features, and plan-feature mappings"""
        
        for code, name in features:
            PlanFeature.objects.get_or_create(code=code, defaults={"name": name})

        # Create the matching RBAC Feature (accounts level)
        from accounts.models import Feature
        for code, name in features:
            Feature.objects.get_or_create(code=code, defaults={"name": name})

        for plan_name, config in PLAN_CATALOG.items():
            plan = Plan.objects.get(name=plan_name)
            feature_codes = config["feature_codes"]
            PlanFeatureMapping.objects.filter(plan=plan).exclude(
                feature__code__in=feature_codes
            ).delete()

            for code in feature_codes:
                pf = PlanFeature.objects.get(code=code)
                PlanFeatureMapping.objects.get_or_create(plan=plan, feature=pf)
