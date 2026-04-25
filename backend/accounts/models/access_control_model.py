from django.db import models
from gyms.models import Gym
from django.contrib.auth.models import AbstractUser


class Role(models.Model):
    name = models.CharField(max_length=100)
    gym = models.ForeignKey(Gym, on_delete=models.CASCADE)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Feature(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.code


class Permission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="permissions")
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE)

    can_create = models.BooleanField(default=False)
    can_read = models.BooleanField(default=True)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)