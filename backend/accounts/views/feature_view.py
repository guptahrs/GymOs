from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.models import Feature
from accounts.serializers.feature_serializer import FeatureSerializer
from common.permissions.feature_rbac_permission import FeatureAndRBACPermission
from common.responses.api_response import APIResponse


class FeatureListCreateView(APIView):
    """Super admin only: manage global features."""
    permission_classes = [FeatureAndRBACPermission]

    def get(self, request):
        user = request.user_claims
        if not user or not user.get("is_super_admin"):
            return APIResponse.error("Super admin access required.", status=status.HTTP_403_FORBIDDEN)
        features = Feature.objects.all()
        return APIResponse.success(data=FeatureSerializer(features, many=True).data)

    def post(self, request):
        user = request.user_claims
        if not user or not user.get("is_super_admin"):
            return APIResponse.error("Super admin access required.", status=status.HTTP_403_FORBIDDEN)
        serializer = FeatureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponse.success(data=serializer.data, status=status.HTTP_201_CREATED)