from rest_framework import serializers
from subscriptions.models import Plan
from subscriptions.services.plan_catalog_service import get_plan_catalog, get_plan_display_name


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = "__all__"


class PlanFeatureSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()


class PlanListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    target_audience = serializers.SerializerMethodField()
    highlight_text = serializers.SerializerMethodField()
    is_recommended = serializers.SerializerMethodField()
    member_limit = serializers.SerializerMethodField()
    staff_limit = serializers.SerializerMethodField()
    whatsapp_followup_limit = serializers.SerializerMethodField()
    marketing_features = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = [
            "plan_id",
            "name",
            "price",
            "duration_days",
            "badge_color",
            "description",
            "target_audience",
            "highlight_text",
            "is_recommended",
            "member_limit",
            "staff_limit",
            "whatsapp_followup_limit",
            "marketing_features",
            "features",
        ]

    def get_features(self, obj):
        return [
            {"code": mapping.feature.code, "name": mapping.feature.name}
            for mapping in obj.planfeaturemapping_set.select_related("feature").all()
        ]

    def get_name(self, obj):
        return get_plan_display_name(obj)

    def _catalog(self, obj):
        return get_plan_catalog(obj)

    def get_description(self, obj):
        return self._catalog(obj).get("description") or obj.description

    def get_target_audience(self, obj):
        return self._catalog(obj).get("target_audience")

    def get_highlight_text(self, obj):
        return self._catalog(obj).get("highlight_text")

    def get_is_recommended(self, obj):
        return bool(self._catalog(obj).get("is_recommended", False))

    def get_member_limit(self, obj):
        return self._catalog(obj).get("member_limit")

    def get_staff_limit(self, obj):
        return self._catalog(obj).get("staff_limit")

    def get_whatsapp_followup_limit(self, obj):
        return self._catalog(obj).get("whatsapp_followup_limit")

    def get_marketing_features(self, obj):
        return self._catalog(obj).get("marketing_features", [])
