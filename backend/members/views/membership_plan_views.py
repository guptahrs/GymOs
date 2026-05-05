from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from members.models import MembershipPlan, MemberSubscription
from members.serializers.plan_serializer import MembershipPlanSerializer
from common.responses.api_response import APIResponse
from common.utills.subscription_guard import ensure_gym_write_access


class MembershipPlanListCreateView(GenericAPIView):
    serializer_class = MembershipPlanSerializer

    def get(self, request):
        try:
            user = getattr(request, "user_claims", None)
            gym_id = user.get("gym_id") if user else None

            plans = MembershipPlan.objects.filter(gym_id=gym_id, is_deleted=False).order_by("-created_at")
            serializer = self.get_serializer(plans, many=True)
            return APIResponse.success(data=serializer.data)
        except Exception as e:
            return APIResponse.error("Failed to fetch plans", errors=str(e))

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        try:
            user = getattr(request, "user_claims", None)
            gym_id = user.get("gym_id") if user else None

            data = request.data.copy()
            if gym_id:
                data["gym_id"] = gym_id

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return APIResponse.success("Plan created", data=serializer.data)
        except Exception as e:
            return APIResponse.error("Failed to create plan", errors=str(e))


class MembershipPlanDetailView(GenericAPIView):
    serializer_class = MembershipPlanSerializer

    def get_object(self, plan_id):
        try:
            return MembershipPlan.objects.get(plan_id=plan_id, is_deleted=False)
        except MembershipPlan.DoesNotExist:
            return None

    def get(self, request, plan_id):
        plan = self.get_object(plan_id)
        if not plan:
            return APIResponse.error("Plan not found", status=404)

        serializer = self.get_serializer(plan)
        return APIResponse.success(data=serializer.data)

    def put(self, request, plan_id):
        plan = self.get_object(plan_id)
        if not plan:
            return APIResponse.error("Plan not found", status=404)
        access_error = ensure_gym_write_access(request, plan.gym_id_id)
        if access_error:
            return access_error

        serializer = self.get_serializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponse.success("Plan updated", data=serializer.data)

    def delete(self, request, plan_id):
        plan = MembershipPlan.objects.filter(plan_id=plan_id).first()
        if not plan:
            return APIResponse.error("Plan not found", status=404)
        access_error = ensure_gym_write_access(request, plan.gym_id_id)
        if access_error:
            return access_error

        # check if assigned
        assigned = MemberSubscription.objects.filter(plan=plan, is_deleted=False).exists()
        if assigned:
            return APIResponse.warning("Plan is assigned to one or more members. Cannot delete.")

        plan.is_active = False
        plan.is_deleted = True
        plan.save()

        return APIResponse.success("Plan deleted (soft)")
