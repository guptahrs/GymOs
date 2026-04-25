from rest_framework import serializers
from accounts.models import Role, Permission


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True)

    class Meta:
        model = Role
        fields = ["id", "name", "permissions"]

    def create(self, validated_data):
        permissions_data = validated_data.pop("permissions")
        role = Role.objects.create(**validated_data)

        for perm in permissions_data:
            Permission.objects.create(role=role, **perm)

        return role