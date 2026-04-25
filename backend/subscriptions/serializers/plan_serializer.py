from rest_framework import serializers
from subscriptions.models import Plan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = "__all__"

class PlanListSerializer(serializers.ModelSerializer):
    features = serializers.SerializerMethodField()
    class Meta:
        model = Plan
        fields = ["plan_id", "name", "price", "duration_days", "badge_color", "features"]
        
    def get_features(self, obj):
        return [mapping.feature.code for mapping in obj.planfeaturemapping_set.all()]