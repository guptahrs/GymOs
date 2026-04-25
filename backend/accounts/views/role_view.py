from rest_framework.views import APIView
from rest_framework import status

from accounts.models import Role, Permission, Feature
from accounts.serializers.feature_serializer import (
    RoleWithPermissionsSerializer,
    PermissionWriteSerializer,
    FeatureSerializer,
)
from common.permissions.feature_rbac_permission import FeatureAndRBACPermission
from common.responses.api_response import APIResponse
from common.utills.feature_checker import has_feature
from subscriptions.models import Subscription, PlanFeatureMapping


class GymRoleListCreateView(APIView):
    """Owner creates and lists roles for their gym."""
    permission_classes = [FeatureAndRBACPermission]

    def get(self, request):
        user = request.user_claims
        gym_id = user.get("gym_id")
        roles = Role.objects.filter(gym_id=gym_id).prefetch_related("permissions__feature")
        return APIResponse.success(data=RoleWithPermissionsSerializer(roles, many=True).data)

    def post(self, request):
        user = request.user_claims
        gym_id = user.get("gym_id")
        data = request.data.copy()
        data["gym"] = gym_id
        serializer = RoleWithPermissionsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponse.success(data=serializer.data, status=status.HTTP_201_CREATED)


class GymAvailableFeaturesView(APIView):
    """Returns features available to this gym based on their plan."""
    permission_classes = [FeatureAndRBACPermission]

    def get(self, request):
        user = request.user_claims
        gym_id = user.get("gym_id")

        subscription = Subscription.objects.filter(gym_id=gym_id, status="active").first()
        if not subscription:
            return APIResponse.error("No active subscription found.")

        feature_codes = PlanFeatureMapping.objects.filter(
            plan=subscription.plan
        ).values_list("feature__code", flat=True)

        # Return RBAC Feature objects that match plan features
        features = Feature.objects.filter(code__in=feature_codes)
        return APIResponse.success(data=FeatureSerializer(features, many=True).data)


class GymPermissionAssignView(APIView):
    """Owner assigns CRUD permissions to a role for a feature."""
    permission_classes = [FeatureAndRBACPermission]

    def post(self, request):
        serializer = PermissionWriteSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        perm, _ = Permission.objects.update_or_create(
            role=serializer.validated_data["role"],
            feature=serializer.validated_data["feature"],
            defaults={
                "can_create": serializer.validated_data.get("can_create", False),
                "can_read": serializer.validated_data.get("can_read", True),
                "can_update": serializer.validated_data.get("can_update", False),
                "can_delete": serializer.validated_data.get("can_delete", False),
            }
        )
        return APIResponse.success(
            message="Permission assigned.",
            data=PermissionWriteSerializer(perm).data,
            status=status.HTTP_200_OK
        )