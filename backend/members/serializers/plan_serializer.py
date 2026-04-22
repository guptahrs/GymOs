from rest_framework import serializers
from members.models import MembershipPlan


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = [
            "plan_id",
            "gym_id",
            "name",
            "price",
            "duration_days",
            "is_active",
            "is_deleted",
            "created_at",
        ]
        read_only_fields = ["plan_id", "created_at", "is_deleted"]

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name is required")
        return value
