# Create PlanFeature (SaaS plan level)
from subscriptions.models import PlanFeature, Plan, PlanFeatureMapping

features = [
    ("members", "Members Management"),
    ("staff", "Staff Management"),
    ("expenses", "Expenses"),
    ("dashboard", "Dashboard"),
    ("trainers", "Trainers"),
]

for code, name in features:
    PlanFeature.objects.get_or_create(code=code, defaults={"name": name})

# Create the matching RBAC Feature (accounts level)
from accounts.models import Feature
for code, name in features:
    Feature.objects.get_or_create(code=code, defaults={"name": name})

# Assign features to plans
pro_plan = Plan.objects.get(name="Pro")
for pf in PlanFeature.objects.all():
    PlanFeatureMapping.objects.get_or_create(plan=pro_plan, feature=pf)