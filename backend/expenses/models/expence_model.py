from django.db import models
from gyms.models import Gym
from common.models.base_model import BaseModel
from common.constants.enums import ExpenseCategory


class Expense(BaseModel):
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=ExpenseCategory.choices(), default=ExpenseCategory.OTHER.value)
    description = models.TextField(blank=True, null=True)
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title