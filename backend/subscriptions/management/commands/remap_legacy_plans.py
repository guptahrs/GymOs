from django.core.management.base import BaseCommand
from django.db import transaction

from common.constants.enums import PlanName
from subscriptions.models import PaymentOrder, Plan, PlanFeatureMapping, Subscription
from subscriptions.services.plan_catalog_service import PLAN_CATALOG, normalize_plan_name


LEGACY_PLAN_MAPPINGS = [
    {
        "aliases": ["standard", "Standard"],
        "target": PlanName.STARTER.value,
    },
    {
        "aliases": ["elite", "Elite"],
        "target": PlanName.GROWTH.value,
    },
    {
        "aliases": ["premium_plus", "Premium Plus", "premium plus"],
        "target": PlanName.ELITE.value,
    },
]


class Command(BaseCommand):
    help = (
        "One-time helper to remap legacy purchased plans to the new "
        "Starter/Growth/Elite catalog without losing subscriptions."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview plan remapping without writing changes.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        if dry_run:
            self.stdout.write(self.style.WARNING("Running in dry-run mode. No data will be changed."))

        with transaction.atomic():
            for mapping in LEGACY_PLAN_MAPPINGS:
                self._remap_legacy_plan(mapping["aliases"], mapping["target"], dry_run=dry_run)

            if dry_run:
                transaction.set_rollback(True)

        if dry_run:
            self.stdout.write(self.style.SUCCESS("Dry run complete."))
        else:
            self.stdout.write(self.style.SUCCESS("Legacy plans remapped successfully."))

    def _remap_legacy_plan(self, aliases, target_name, dry_run=False):
        target_name = normalize_plan_name(target_name)
        target_config = PLAN_CATALOG[target_name]

        source_plan = self._get_source_plan(aliases, exclude_name=target_name)
        if not source_plan:
            self.stdout.write(f"Skipping {aliases[0]} -> {target_name}: source plan not found.")
            return

        target_plan = Plan.objects.filter(name=target_name).first()

        if target_plan:
            self._merge_into_existing_target(source_plan, target_plan)
            self.stdout.write(
                f"Merged legacy plan '{source_plan.name}' into existing '{target_name}'."
            )
            if not dry_run:
                source_plan.delete()
        else:
            old_name = source_plan.name
            source_plan.name = target_name
            source_plan.description = target_config["description"]
            source_plan.price = PlanName[target_name.upper()].price
            source_plan.duration_days = PlanName[target_name.upper()].duration_days
            source_plan.badge_color = target_config["badge_color"]
            source_plan.is_active = True
            source_plan.is_deleted = False
            if not dry_run:
                source_plan.save(
                    update_fields=[
                        "name",
                        "description",
                        "price",
                        "duration_days",
                        "badge_color",
                        "is_active",
                        "is_deleted",
                        "updated_at",
                    ]
                )
            self.stdout.write(f"Renamed legacy plan '{old_name}' to '{target_name}'.")

    def _get_source_plan(self, aliases, exclude_name):
        for alias in aliases:
            normalized_alias = normalize_plan_name(alias)
            source_plan = Plan.objects.filter(name=normalized_alias).first()
            if source_plan and source_plan.name != exclude_name:
                return source_plan

            source_plan = Plan.objects.filter(name=alias).first()
            if source_plan and source_plan.name != exclude_name:
                return source_plan
        return None

    def _merge_into_existing_target(self, source_plan, target_plan):
        Subscription.objects.filter(plan=source_plan).update(plan=target_plan)
        PaymentOrder.objects.filter(plan=source_plan).update(plan=target_plan)
        for mapping in PlanFeatureMapping.objects.filter(plan=source_plan).select_related("feature"):
            PlanFeatureMapping.objects.get_or_create(
                plan=target_plan,
                feature=mapping.feature,
                defaults={"limit": mapping.limit},
            )
        PlanFeatureMapping.objects.filter(plan=source_plan).delete()
