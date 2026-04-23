from rest_framework import serializers

from common.constants.enums import ShiftChoices
from staff.models import TrainingType


class TrainingTypeCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    shift = serializers.ChoiceField(choices=ShiftChoices.choices())
    capacity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class TrainingTypeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="training_type_id", read_only=True)

    class Meta:
        model = TrainingType
        fields = [
            "id",
            "name",
            "shift",
            "capacity",
            "price",
            "description",
            "is_active",
            "created_at",
        ]
