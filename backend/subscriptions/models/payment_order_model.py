import uuid
from django.db import models
from common.models.base_model import BaseModel
from common.constants.enums import PaymentOrderStatus

class PaymentOrder(BaseModel):
    """
    Tracks every Razorpay order created.
    Created before payment, updated after verification.
    """
    order_id      = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gym_id        = models.ForeignKey("gyms.Gym", on_delete=models.CASCADE, related_name="payment_orders")
    plan          = models.ForeignKey("subscriptions.Plan", on_delete=models.CASCADE)

    razorpay_order_id   = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature  = models.CharField(max_length=255, null=True, blank=True)

    amount   = models.DecimalField(max_digits=10, decimal_places=2)  # in INR
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(max_length=20, choices=PaymentOrderStatus.choices(), default=PaymentOrderStatus.CREATED.value)

    def __str__(self):
        return f"{self.razorpay_order_id} — {self.status}"