from django.core.management.base import BaseCommand
from common.scheduler.runner import run_all_tasks
import json


class Command(BaseCommand):
    help = "Run all registered scheduler tasks (call this daily via cron)"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting scheduler..."))
        result = run_all_tasks()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone — {result['success']}/{result['total']} tasks succeeded."
            )
        )
        # Pretty print results
        self.stdout.write(json.dumps(result, indent=2))