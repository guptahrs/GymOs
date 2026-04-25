# Create PlanFeature (SaaS plan level)
from django.core.management.base import BaseCommand
from subscriptions.models import PlanFeature, Plan, PlanFeatureMapping
from common.constants.enums import FeatureCode, PlanName

features = [
    (FeatureCode.MEMBERS,   FeatureCode.MEMBERS.label),
    (FeatureCode.STAFF,     FeatureCode.STAFF.label),
    (FeatureCode.DASHBOARD, FeatureCode.DASHBOARD.label),
    (FeatureCode.LEADS,     FeatureCode.LEADS.label),
    (FeatureCode.EXPENSES,  FeatureCode.EXPENSES.label),
    (FeatureCode.TRAINERS,  FeatureCode.TRAINERS.label),
    (FeatureCode.WHATSAPP,  FeatureCode.WHATSAPP.label),
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

        # Assign features to plans
        pro_plan = Plan.objects.get(name=PlanName.ELITE.value)
        for pf in PlanFeature.objects.all():
            PlanFeatureMapping.objects.get_or_create(plan=pro_plan, feature=pf)