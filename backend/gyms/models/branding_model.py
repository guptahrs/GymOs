import uuid

from django.db import models

from common.constants.enums import ThemeMode
from common.models import BaseModel


class GymBranding(BaseModel):
    branding_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gym = models.OneToOneField("gyms.Gym", on_delete=models.CASCADE, related_name="branding")
    brand_name = models.CharField(max_length=255, blank=True, default="")
    logo_url = models.URLField(blank=True, default="")
    favicon_url = models.URLField(blank=True, default="")
    primary_color = models.CharField(max_length=20, default="#3B82F6")
    accent_color = models.CharField(max_length=20, default="#0F172A")
    theme_mode = models.CharField(
        max_length=20,
        choices=ThemeMode.choices(),
        default=ThemeMode.DARK,
    )

    def __str__(self):
        return self.brand_name or f"{self.gym.name} branding"
