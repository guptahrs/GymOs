from rest_framework import serializers
from members.models import Member
from subscriptions.services.plan_catalog_service import get_plan_display_name


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
    current_plan_name = serializers.SerializerMethodField()
    plan_valid_till = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    estimated_due_date = serializers.SerializerMethodField()

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
            "current_plan_name",
            "plan_valid_till",
            "remaining_amount",
            "estimated_due_date",
            "created_at",
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
        if obj.onboarding_step == "completed":
            return "Active"
        return "Incomplete"

    def _get_latest_subscription(self, obj):
        subscriptions = getattr(obj, "prefetched_subscriptions", None)
        if subscriptions is not None:
            return subscriptions[0] if subscriptions else None

        return (
            obj.membersubscription_set.select_related("plan")
            .filter(is_deleted=False)
            .order_by("-created_at")
            .first()
        )

    def get_current_plan_name(self, obj):
        subscription = self._get_latest_subscription(obj)
        return get_plan_display_name(subscription.plan) if subscription and subscription.plan else None

    def get_plan_valid_till(self, obj):
        subscription = self._get_latest_subscription(obj)
        return subscription.end_date.date() if subscription and subscription.end_date else None

    def get_remaining_amount(self, obj):
        subscription = self._get_latest_subscription(obj)
        if not subscription or subscription.remaining_amount is None:
            return None
        return str(subscription.remaining_amount)

    def get_estimated_due_date(self, obj):
        subscription = self._get_latest_subscription(obj)
        return (
            subscription.estimated_remaining_payment_date
            if subscription and subscription.estimated_remaining_payment_date
            else None
        )
