from rest_framework import serializers
from staff.models import Trainer


class TrainerCreateSerializer(serializers.Serializer):
    # Onboarding helper fields
    onboarding_step = serializers.ChoiceField(choices=("basic", "training", "address"), required=False)
    trainer_id = serializers.UUIDField(required=False)

    # Basic (user) fields
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True)
    gym_id = serializers.UUIDField(required=False)

    # Training fields
    specialization = serializers.CharField(required=False, allow_blank=True)
    shift = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False)
    certification = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    max_clients = serializers.IntegerField(required=False)


class TrainerSerializer(serializers.ModelSerializer):
    # trainer_id = serializers.CharField(source="trainer_id", read_only=True)
    name = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        fields = [
            "trainer_id",
            "name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "specialization",
            "shift",
            "experience_years",
            "certification",
            "bio",
            "max_clients",
            "address_id",
            "is_active",
            "created_at",
        ]

    def get_name(self, obj):
        first = getattr(obj.user, "first_name", "")
        last = getattr(obj.user, "last_name", "")
        return f"{first} {last}".strip()

    def get_first_name(self, obj):
        return getattr(obj.user, "first_name", "")

    def get_last_name(self, obj):
        return getattr(obj.user, "last_name", "")

    def get_email(self, obj):
        return getattr(obj.user, "email", "")

    def get_phone(self, obj):
        return getattr(obj.user, "phone", None)
