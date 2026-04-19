from rest_framework import serializers
from accounts.models import User
from members.models import Member
from common.constants.enums import UserType


class MemberCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    password = serializers.CharField()

    gym_id = serializers.UUIDField()


class MemberSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "status",
            "created_at"
        ]

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_email(self, obj):
        return obj.user.email

    def get_phone(self, obj):
        return obj.user.phone

    def get_status(self, obj):
        if obj.onboarding_step == "completed":
            return "completed"
        return "incomplete"