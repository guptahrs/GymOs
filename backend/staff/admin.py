from django.contrib import admin
from .models import Staff, Trainer, TrainingType

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "role", "gym_id", "is_active")


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
	list_display = ("id", "trainer_id", "user", "specialization", "shift", "gym_id")


@admin.register(TrainingType)
class TrainingTypeAdmin(admin.ModelAdmin):
	list_display = ("id", "training_type_id", "name", "gym_id")
