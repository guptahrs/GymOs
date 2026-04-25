import uuid
from django.db import models
from common.models import BaseModel
from common.constants.enums import PlanName


class Plan(BaseModel):
    plan_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100, choices=PlanName.choices, unique=True)   # Basic / Pro / Enterprise
    description = models.TextField(null=True, blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    duration_days = models.IntegerField()  # 30, 365
    
    badge_color = models.CharField(max_length=20, default="#4CAF50")


    def __str__(self):
        return self.name