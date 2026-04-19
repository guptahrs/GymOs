import uuid


from django.db import models


from common.models import BaseModel
from common.constants.enums import UserType, Gender


class User(BaseModel):

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    user_type = models.CharField(max_length=20, choices=UserType.choices(), default=UserType.NORMAL_USER)
    gender = models.CharField(max_length=10, choices=Gender.choices(), null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email