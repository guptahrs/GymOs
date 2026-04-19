import uuid

from django.db import models

from common.models import BaseModel
from common.constants.enums import SubscriptionStatus


class Subscription(BaseModel):
    subscription_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    gym_id = models.UUIDField()   # tenant

    plan = models.ForeignKey("Plan", on_delete=models.CASCADE)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    status = models.CharField(
    max_length=20,
    choices=SubscriptionStatus.choices(),
    default=SubscriptionStatus.ACTIVE
)

    def __str__(self):
        return str(self.subscription_id)