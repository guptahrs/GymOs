from django.apps import AppConfig

class SchedulerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scheduler"

    def ready(self):
        # auto-import all tasks so registry picks them up
        from scheduler import registry  # noqa