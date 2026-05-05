# subscriptions/serializers.py
from rest_framework import serializers
from subscriptions.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()
    plan_price = serializers.SerializerMethodField()
    duration_days = serializers.SerializerMethodField()
    badge_color = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    is_trial = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            "subscription_id",
            "plan_name",
            "plan_price",
            "duration_days",
            "badge_color",
            "start_date",
            "end_date",
            "status",
            "access_type",
            "is_trial",
            "days_left",
        ]

    def get_plan_name(self, obj):
        return obj.plan.name if obj.plan else None

    def get_plan_price(self, obj):
        return obj.plan.price if obj.plan else None

    def get_duration_days(self, obj):
        if obj.plan:
            return obj.plan.duration_days
        return obj.duration_in_days

    def get_badge_color(self, obj):
        return obj.plan.badge_color if obj.plan else "#F59E0B"

    def get_is_trial(self, obj):
        return obj.access_type == "trial"

    def get_days_left(self, obj):
        from django.utils.timezone import now
        return max((obj.end_date.date() - now().date()).days, 0)
