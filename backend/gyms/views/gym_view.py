from django.contrib.auth.hashers import make_password
from rest_framework.generics import GenericAPIView

from gyms.serializers.gym_serializer import GymCreateSerializer, GymListSerializer
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep
from common.services.address_service import create_address
from gyms.models import Gym
from common.utills.user_type_utils import is_super_user
from accounts.models import User
from common.constants.enums import UserType
from common.permissions.super_admin_permission import IsSuperAdmin


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