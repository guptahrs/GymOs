from rest_framework import serializers
from accounts.models import Feature, Role, Permission
from common.utills.feature_checker import has_feature


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ["id", "name", "code"]


class PermissionWriteSerializer(serializers.ModelSerializer):
    """Used by gym owner to assign permissions to roles."""

    class Meta:
        model = Permission
        fields = ["id", "role", "feature", "can_create", "can_read", "can_update", "can_delete"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user_claims", None)
        gym_id = user.get("gym_id") if user else None

        # Validate role belongs to this gym
        role = attrs.get("role")
        if role and str(role.gym_id) != str(gym_id):
            raise serializers.ValidationError("Role does not belong to your gym.")

        # Validate feature is part of gym's active plan
        feature = attrs.get("feature")
        if feature and gym_id and not has_feature(gym_id, feature.code):
            raise serializers.ValidationError(
                f"Feature '{feature.name}' is not available in your gym's current plan."
            )

        return attrs


class RoleWithPermissionsSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ["id", "name", "gym", "is_default", "permissions"]
        read_only_fields = ["gym"]

    def get_permissions(self, obj):
        from accounts.models import Permission
        perms = Permission.objects.filter(role=obj).select_related("feature")
        return [
            {
                "id": p.id,
                "feature_code": p.feature.code,
                "feature_name": p.feature.name,
                "can_create": p.can_create,
                "can_read": p.can_read,
                "can_update": p.can_update,
                "can_delete": p.can_delete,
            }
            for p in perms
        ]