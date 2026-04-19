from rest_framework.generics import GenericAPIView
from subscriptions.serializers.plan_serializer import PlanSerializer
from common.responses.api_response import APIResponse


class CreatePlanView(GenericAPIView):
    serializer_class = PlanSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.save()

        return APIResponse.success(
            message="Plan created successfully",
            data=PlanSerializer(plan).data
        )