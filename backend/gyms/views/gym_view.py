from rest_framework.generics import GenericAPIView

from gyms.serializers.gym_serializer import GymSerializer
from common.responses.api_response import APIResponse
from common.constants.enums import OnboardingStep
from common.services.address_service import create_address
from gyms.models import Gym


class CreateGymBasicView(GenericAPIView):
    serializer_class = GymSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gym = serializer.save(onboarding_step=OnboardingStep.BASIC.value)

        return APIResponse.success(
            message="Basic details saved",
            data={"gym_id": str(gym.gym_id)}
        )
    

class AddGymAddressView(GenericAPIView):

    def post(self, request):
        gym_id = request.data.get("gym_id")

        gym = Gym.objects.get(gym_id=gym_id)

        address = create_address(request.data)

        gym.address = address
        gym.onboarding_step = OnboardingStep.ADDRESS
        gym.save()

        return APIResponse.success("Gym address added")