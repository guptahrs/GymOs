import uuid
from django.db import models
from common.models import BaseModel


class StaffPayment(BaseModel):
    payment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    gym_id = models.UUIDField()

    staff = models.ForeignKey("Staff", on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_date = models.DateTimeField(auto_now_add=True)

    payment_mode = models.CharField(max_length=20)  # cash / upi

    note = models.TextField(null=True, blank=True)

    def __str__(self):
        return str(self.payment_id)