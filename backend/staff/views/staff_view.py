from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.generics import GenericAPIView

from accounts.models import User
from common.constants.enums import UserType
from common.responses.api_response import APIResponse
from common.utills.subscription_guard import ensure_gym_write_access
from staff.models import Staff
from staff.serializers.staff_serializer import StaffCreateSerializer, StaffSerializer


class StaffListCreateView(GenericAPIView):
    serializer_class = StaffCreateSerializer

    def get(self, request):
        user_claims = getattr(request, "user_claims", None)
        gym_id = request.query_params.get("gym_id") or (user_claims or {}).get("gym_id")

        if not gym_id:
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        staff = Staff.objects.filter(
            gym_id=gym_id,
            is_deleted=False,
            user__is_deleted=False,
        ).select_related("user").order_by("-created_at")

        return APIResponse.success(data=StaffSerializer(staff, many=True).data)

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        data = request.data.copy()
        user_claims = getattr(request, "user_claims", None)
        if not data.get("gym_id") and user_claims:
            data["gym_id"] = user_claims.get("gym_id")

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if not data.get("gym_id"):
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=data["email"], is_deleted=False).exists():
            return APIResponse.error("Email already exists", status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            first_name=data["first_name"],
            last_name=data.get("last_name", ""),
            email=data["email"],
            phone=data.get("phone") or None,
            password=make_password(data.get("password") or "defaultpassword123"),
            user_type=UserType.STAFF,
            gym_id=data["gym_id"],
        )

        staff = Staff.objects.create(
            user=user,
            gym_id=data["gym_id"],
            role=data.get("role") or "staff",
            salary=data.get("salary"),
        )

        return APIResponse.success("Staff created", data=StaffSerializer(staff).data)


class StaffDetailView(GenericAPIView):
    serializer_class = StaffSerializer

    def get_object(self, request, staff_id):
        user_claims = getattr(request, "user_claims", None)
        gym_id = (user_claims or {}).get("gym_id")

        try:
            queryset = Staff.objects.select_related("user").filter(
                id=staff_id,
                is_deleted=False,
                user__is_deleted=False,
            )
            if gym_id:
                queryset = queryset.filter(gym_id=gym_id)
            return queryset.get()
        except Staff.DoesNotExist:
            return None

    def put(self, request, staff_id):
        staff = self.get_object(request, staff_id)
        if not staff:
            return APIResponse.error("Staff not found", status=status.HTTP_404_NOT_FOUND)
        access_error = ensure_gym_write_access(request, staff.gym_id_id)
        if access_error:
            return access_error

        data = request.data
        user = staff.user

        if "first_name" in data:
            user.first_name = data.get("first_name") or ""
        if "last_name" in data:
            user.last_name = data.get("last_name") or ""
        if "email" in data and data.get("email"):
            exists = User.objects.filter(email=data["email"], is_deleted=False).exclude(user_id=user.user_id).exists()
            if exists:
                return APIResponse.error("Email already exists", status=status.HTTP_400_BAD_REQUEST)
            user.email = data["email"]
        if "phone" in data:
            user.phone = data.get("phone") or None
        if "role" in data:
            staff.role = data.get("role") or staff.role
        if "salary" in data:
            staff.salary = data.get("salary") or None

        user.save()
        staff.save()

        return APIResponse.success("Staff updated", data=StaffSerializer(staff).data)

    def delete(self, request, staff_id):
        staff = self.get_object(request, staff_id)
        if not staff:
            return APIResponse.error("Staff not found", status=status.HTTP_404_NOT_FOUND)
        access_error = ensure_gym_write_access(request, staff.gym_id_id)
        if access_error:
            return access_error

        staff.is_active = False
        staff.is_deleted = True
        staff.save(update_fields=["is_active", "is_deleted", "updated_at"])

        staff.user.is_active = False
        staff.user.is_deleted = True
        staff.user.save(update_fields=["is_active", "is_deleted", "updated_at"])

        return APIResponse.success("Staff deleted")


# Backward-compatible aliases for existing imports/routes.
CreateStaffBasicView = StaffListCreateView
ListStaffView = StaffListCreateView
UpdateStaffBasicView = StaffDetailView
UpdateStaffSalaryView = StaffDetailView
