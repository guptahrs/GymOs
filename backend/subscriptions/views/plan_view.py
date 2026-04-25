from rest_framework.generics import GenericAPIView
from subscriptions.serializers.plan_serializer import PlanSerializer
from common.responses.api_response import APIResponse
from common.permissions.super_admin_permission import IsSuperAdmin
from subscriptions.models import Plan, Subscription
from subscriptions.serializers.plan_serializer import PlanListSerializer


class CreatePlanView(GenericAPIView):
    serializer_class = PlanSerializer
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.save()

        return APIResponse.success(
            message="Plan created successfully",
            data=PlanSerializer(plan).data
        )


class GetAllPlansView(GenericAPIView):
    serializer_class = PlanListSerializer
    permission_classes = [IsSuperAdmin]
    
    
    def get(self, request):
        all_plans = Plan.objects.all()
        data = PlanListSerializer(all_plans, many=True).data
        return APIResponse.success(message="All plans retrieved", data=data)