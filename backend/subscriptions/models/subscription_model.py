import uuid

from django.db import models

from common.models import BaseModel
from common.constants.enums import SubscriptionAccessType, SubscriptionStatus


class Subscription(BaseModel):
    subscription_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    gym_id = models.ForeignKey("gyms.Gym",on_delete=models.CASCADE,related_name="subscriptions")

    plan = models.ForeignKey("Plan", on_delete=models.CASCADE, null=True, blank=True)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    access_type = models.CharField(
        max_length=20,
        choices=SubscriptionAccessType.choices(),
        default=SubscriptionAccessType.PAID,
    )

    status = models.CharField(
    max_length=20,
    choices=SubscriptionStatus.choices(),
    default=SubscriptionStatus.ACTIVE
)

    @property
    def duration_in_days(self):
        return max((self.end_date.date() - self.start_date.date()).days, 0)

    def __str__(self):
        return str(self.subscription_id)
