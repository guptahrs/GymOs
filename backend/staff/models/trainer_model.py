from uuid import uuid4

from django.db import models

from .staff_model import Staff
from common.constants.enums import ShiftChoices
from common.models.base_model import BaseModel

class Trainer(Staff):
    trainer_id = models.UUIDField(default=uuid4, editable=False, unique=True)
    specialization = models.CharField(max_length=100)
    shift = models.CharField(max_length=20, choices=ShiftChoices.choices(), default=ShiftChoices.BOTH.value)
    experience_years = models.PositiveIntegerField(default=0)
    certification = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    max_clients = models.PositiveIntegerField(null=True, blank=True)


class TrainingType(BaseModel):
    training_type_id = models.UUIDField(default=uuid4, editable=False, unique=True)
    gym_id = models.UUIDField()
    name = models.CharField(max_length=100)
    shift = models.CharField(max_length=20, choices=ShiftChoices.choices(), default=ShiftChoices.BOTH.value)
    description = models.TextField(null=True, blank=True)
    capacity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name
