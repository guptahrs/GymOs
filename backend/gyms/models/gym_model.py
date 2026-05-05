import uuid

from django.db import models

from common.constants.enums import OnboardingStep
from common.models import BaseModel
from common.models import Address

class Gym(BaseModel):
    gym_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    onboarding_step = models.CharField(
        max_length=20,
        choices=OnboardingStep.choices(),
        default=OnboardingStep.BASIC
    )
    
    name = models.CharField(max_length=255)

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)

   # 🔥 relation
    address = models.ForeignKey(Address, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name