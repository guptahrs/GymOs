from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Tail the scheduler log file"

    def add_arguments(self, parser):
        parser.add_argument(
            "--lines", type=int, default=50,
            help="Number of lines to show (default 50)"
        )

    def handle(self, *args, **kwargs):
        lines = kwargs["lines"]
        try:
            with open("/var/log/gymora_scheduler.log", "r") as f:
                all_lines = f.readlines()
                tail = all_lines[-lines:]
                self.stdout.write("".join(tail))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR("Log file not found."))