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
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    dob = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            "member_id",
            "name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "gender",
            "dob",
            "status",
            "payment_status",
            "created_at"
        ]

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_email(self, obj):
        return obj.user.email

    def get_phone(self, obj):
        return obj.user.phone

    def get_gender(self, obj):
        return obj.user.gender

    def get_dob(self, obj):
        return obj.user.date_of_birth

    def get_status(self, obj):
        payment_status = str(obj.payment_status).lower()
        if payment_status == "due":
            return "Payment Due"
        if payment_status == "partial":
            return "Partial Payment"
        if obj.onboarding_step == "completed":
            return "Active"
        return "Incomplete"
