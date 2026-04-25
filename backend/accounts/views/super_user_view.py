from rest_framework.generics import GenericAPIView
from django.contrib.auth.hashers import make_password

from accounts.models import User
from common.responses.api_response import APIResponse
from common.constants.enums import UserType
from accounts.serializers.auth_serializer import CreateAdminSerializer
from common.permissions.super_admin_permission import IsSuperAdmin


class CreateAdminUserView(GenericAPIView):
    serializer_class = CreateAdminSerializer
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        user = User.objects.create(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            password=make_password(data["password"]),
            user_type=UserType.SUPER_ADMIN.value
        )

        return APIResponse.success("Admin created")