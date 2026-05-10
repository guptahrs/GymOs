from rest_framework import serializers
from gyms.models import Gym, GymBranding
from common.models import Address
from subscriptions.models import Subscription, Plan
from accounts.models import User
from common.constants.enums import UserType
from common.utills.feature_checker import has_feature
from common.constants.enums import FeatureCode
from subscriptions.services.access_service import get_gym_access_context
from subscriptions.services.plan_catalog_service import get_plan_display_name

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "address_line_1", "address_line_2", "city", "state", "country", "pincode", "landmark"
        ]

class GymCreateSerializer(serializers.ModelSerializer):
    # address = AddressSerializer()

    class Meta:
        model = Gym
        fields = ["name", "email", "phone"]

    # def create(self, validated_data):
    #     address_data = validated_data.pop("address")
    #     address = Address.objects.create(**address_data)
    #     gym = Gym.objects.create(address=address, **validated_data)
    #     return gym


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = ["plan_id", "badge_color", "name"]

    def get_name(self, obj):
        return get_plan_display_name(obj)

class GymOwnersSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ["user_id", "name",  "first_name", "last_name", "email", "phone"]
        
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
class GymListSerializer(serializers.ModelSerializer):
    address = AddressSerializer()
    current_plan = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    subscription_active_status = serializers.SerializerMethodField()
    subscription_end = serializers.SerializerMethodField()
    owners = serializers.SerializerMethodField()
    class Meta:
        model = Gym
        fields = ["gym_id", "name", "email", "phone", "address", 
                  "onboarding_step", "current_plan", "subscription_status", 
                  "subscription_active_status", "subscription_end", "owners"]
    
    def get_current_plan(self, obj):
        context = get_gym_access_context(obj.gym_id)
        subscription = context["subscription"] or context["latest_subscription"]
        if subscription:
            if subscription.plan:
                return SubscriptionPlanSerializer(subscription.plan).data
            return {
                "plan_id": None,
                "badge_color": "#F59E0B",
                "name": "Trial",
            }
        return None

    def get_subscription_status(self, obj):
        return bool(get_gym_access_context(obj.gym_id)["subscription"])

    def get_subscription_active_status(self, obj):
        return get_gym_access_context(obj.gym_id)["access_status"]
        
    def get_subscription_end(self, obj):
        context = get_gym_access_context(obj.gym_id)
        subscription = context["subscription"] or context["latest_subscription"]
        if subscription:
            return subscription.end_date
        return None

    def get_owners(self, obj):
        users = User.objects.filter(gym_id=obj.gym_id, user_type=UserType.GYM_OWNER)
        if users:
            return GymOwnersSerializer(users, many=True).data
        return None
        

class GymDetailSerializer(serializers.ModelSerializer):
    branding = serializers.SerializerMethodField()

    class Meta:
        model = Gym
        fields = ["gym_id", "name", "email", "phone", "branding"]

    def get_branding(self, obj):
        branding, _ = GymBranding.objects.get_or_create(gym=obj)
        return GymBrandingSerializer(
            branding,
            context={
                "can_customize": has_feature(obj.gym_id, FeatureCode.WHITE_LABEL),
            },
        ).data


class GymBrandingSerializer(serializers.ModelSerializer):
    can_customize = serializers.SerializerMethodField()
    gym_name = serializers.CharField(source="gym.name", read_only=True)

    class Meta:
        model = GymBranding
        fields = [
            "branding_id",
            "gym_name",
            "brand_name",
            "logo_url",
            "favicon_url",
            "primary_color",
            "accent_color",
            "theme_mode",
            "can_customize",
        ]

    def get_can_customize(self, obj):
        return bool(self.context.get("can_customize", False))
