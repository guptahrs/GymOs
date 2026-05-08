from django.contrib.auth.hashers import make_password
from rest_framework.generics import GenericAPIView

from gyms.serializers.gym_serializer import (
    GymBrandingSerializer,
    GymCreateSerializer,
    GymListSerializer,
    GymDetailSerializer,
)
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep
from common.services.address_service import create_address
from gyms.models import Gym, GymBranding
from common.utills.user_type_utils import is_super_user
from accounts.models import User
from common.constants.enums import UserType
from common.permissions.super_admin_permission import IsSuperAdmin
from common.permissions.gym_owner_permission import IsGymOwner
from common.constants.enums import FeatureCode
from common.utills.feature_checker import has_feature


class CreateGymBasicView(GenericAPIView):
    serializer_class = GymCreateSerializer
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gym = serializer.save(onboarding_step=OnboardingStep.BASIC.value)

        return APIResponse.success(
            message="Basic details saved",
            data={"gym_id": str(gym.gym_id)}
        )
    

class AddGymAddressView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    def post(self, request):
        gym_id = request.data.get("gym_id")

        gym = Gym.objects.get(gym_id=gym_id)

        address = create_address(request.data)

        gym.address = address
        gym.onboarding_step = OnboardingStep.ADDRESS
        gym.save()

        return APIResponse.success("Gym address added")


# API to add a gym owner (admin) to a gym
class AddGymOwnerView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    
    def post(self, request):
        #TODO later we will check only super admin can add gym owner to a gym
        
        gym_id = request.data.get("gym_id")
        owner_data = request.data.get("owner")
        if not gym_id or not owner_data:
            return APIResponse.error("gym_id and owner data required")

        gym = Gym.objects.get(gym_id=gym_id)

        # Create the user with user_type=GYM_OWNER and gym_id
        owner = User.objects.create(
            email=owner_data["email"],
            password=make_password(owner_data["password"]),
            first_name=owner_data.get("first_name", ""),
            last_name=owner_data.get("last_name", ""),
            user_type=UserType.GYM_OWNER,
            gym_id=gym.gym_id
        )
        return APIResponse.success("Gym owner added", data={"owner_id": str(owner.user_id)})


class GymListView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    
    serializer_class = GymListSerializer

    def get(self, request):
        gyms = Gym.objects.all()
        
        serializer = self.get_serializer(gyms, many=True)
        return APIResponse.success(data=serializer.data)


class GymDetailView(GenericAPIView):
    permission_classes = [IsGymOwner | IsSuperAdmin]
    
    def get(self, request, gym_id):
        try:
            gym = Gym.objects.get(gym_id=gym_id)
        except Gym.DoesNotExist:
            return APIResponse.error("Gym not found", status=404)

        serializer = GymDetailSerializer(gym)
        return APIResponse.success(data=serializer.data)


class GymBrandingView(GenericAPIView):
    permission_classes = [IsGymOwner | IsSuperAdmin]
    serializer_class = GymBrandingSerializer

    def get_gym(self, request, gym_id):
        user = getattr(request, "user_claims", None) or {}
        is_super_admin = user.get("is_super_admin")
        resolved_gym_id = gym_id or user.get("gym_id")

        if not resolved_gym_id:
            return None, APIResponse.error("Gym not found", status=404)

        if not is_super_admin and str(user.get("gym_id")) != str(resolved_gym_id):
            return None, APIResponse.error("Access denied", status=403)

        try:
            gym = Gym.objects.get(gym_id=resolved_gym_id)
            return gym, None
        except Gym.DoesNotExist:
            return None, APIResponse.error("Gym not found", status=404)

    def get(self, request, gym_id=None):
        gym, error = self.get_gym(request, gym_id)
        if error:
            return error

        branding, _ = GymBranding.objects.get_or_create(gym=gym)
        serializer = self.get_serializer(
            branding,
            context={
                "can_customize": has_feature(gym.gym_id, FeatureCode.WHITE_LABEL),
            },
        )
        return APIResponse.success(data=serializer.data)

    def put(self, request, gym_id=None):
        gym, error = self.get_gym(request, gym_id)
        if error:
            return error

        user = getattr(request, "user_claims", None) or {}
        if not user.get("is_super_admin") and not has_feature(gym.gym_id, FeatureCode.WHITE_LABEL):
            return APIResponse.error(
                "White labeling is not available in your current plan.",
                errors={"error": "feature_not_in_plan"},
                status=403,
            )

        branding, _ = GymBranding.objects.get_or_create(gym=gym)
        serializer = self.get_serializer(
            branding,
            data=request.data,
            partial=True,
            context={"can_customize": True},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponse.success(message="Branding updated", data=serializer.data)
