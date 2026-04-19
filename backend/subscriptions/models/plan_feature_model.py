import uuid
from django.db import models
from common.models import BaseModel


class PlanFeature(BaseModel):
    feature_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class PlanFeatureMapping(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    plan = models.ForeignKey("Plan", on_delete=models.CASCADE)
    feature = models.ForeignKey("PlanFeature", on_delete=models.CASCADE)

    # 🔥 optional limits (future)
    limit = models.IntegerField(null=True, blank=True)