import uuid
from django.db import models
from common.models import BaseModel, Address
from common.constants.enums import Gender, OnboardingStep


class Member(BaseModel):
    member_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE)

    gym_id = models.UUIDField()

    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)

    joining_date = models.DateField(auto_now_add=True)
    date_of_birth = models.DateField(null=True, blank=True)
    onboarding_step = models.CharField(
        max_length=20,
        choices=OnboardingStep.choices(),
        default=OnboardingStep.BASIC
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class MembershipPlan(BaseModel):
    plan_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    gym_id = models.UUIDField()

    name = models.CharField(max_length=100)  # Monthly / 3 Month
    price = models.DecimalField(max_digits=10, decimal_places=2)

    duration_days = models.IntegerField()

    def __str__(self):
        return self.name


class MemberSubscription(BaseModel):
    subscription_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    gym_id = models.UUIDField()

    member = models.ForeignKey("Member", on_delete=models.CASCADE)
    plan = models.ForeignKey("MembershipPlan", on_delete=models.CASCADE)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)


    def __str__(self):
        return str(self.subscription_id)

class MemberPayment(BaseModel):
    payment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    gym_id = models.UUIDField()

    member = models.ForeignKey("Member", on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_mode = models.CharField(max_length=20)  # cash / upi / card

    payment_date = models.DateTimeField(auto_now_add=True)

    transaction_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return str(self.payment_id)