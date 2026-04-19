import uuid
from django.db import models
from common.models import BaseModel


class Address(BaseModel):
    address_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, null=True, blank=True)

    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    landmark = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.address_line_1}, {self.city}"