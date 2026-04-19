from rest_framework.generics import GenericAPIView
from django.contrib.auth.hashers import make_password

from accounts.models import User
from staff.serializers.staff_serializer import StaffCreateSerializer
from staff.models import Staff
from staff.serializers.staff_serializer import StaffCreateSerializer

from common.responses.api_response import APIResponse
from common.constants.enums import UserType, OnboardingStep
from common.services.address_service import create_address


class CreateStaffBasicView(GenericAPIView):
    serializer_class = StaffCreateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        user = User.objects.create(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            password=make_password(data.get("password")),
            user_type=UserType.STAFF
        )

        staff = Staff.objects.create(
            user=user,
            gym_id=data.get("gym_id"),
            role=data.get("role"),
            salary=data.get("salary"),
            onboarding_step=OnboardingStep.BASIC
        )

        return APIResponse.success(
            "Staff basic created",
            {"staff_id": str(staff.staff_id)}
        )



class AddStaffDetailsView(GenericAPIView):

    def post(self, request):
        staff_id = request.data.get("staff_id")

        staff = Staff.objects.get(staff_id=staff_id)

        # 🔥 Address create
        address = create_address(request.data)

        staff.address = address

        staff.onboarding_step = OnboardingStep.COMPLETED
        staff.save()

        return APIResponse.success("Staff onboarding completed")


class UpdateStaffBasicView(GenericAPIView):

    def put(self, request):
        staff_id = request.data.get("staff_id")

        staff = Staff.objects.get(staff_id=staff_id)
        user = staff.user

        # 🔥 update only basic fields
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.phone = request.data.get("phone", user.phone)

        staff.role = request.data.get("role", staff.role)

        user.save()
        staff.save()

        return APIResponse.success("Basic details updated")


class UpdateStaffAddressView(GenericAPIView):

    def put(self, request):
        staff_id = request.data.get("staff_id")

        staff = Staff.objects.get(staff_id=staff_id)

        address = create_address(request.data)

        staff.address = address
        staff.save()

        return APIResponse.success("Address updated")


class UpdateStaffSalaryView(GenericAPIView):
    def put(self, request):
        staff_id = request.data.get("staff_id")

        staff = Staff.objects.get(staff_id=staff_id)

        staff.salary = request.data.get("salary", staff.salary)
        staff.save()

        return APIResponse.success("Salary updated")
    

class ListStaffView(GenericAPIView):

    def get(self, request):
        gym_id = request.query_params.get("gym_id")

        staff_list = Staff.objects.filter(gym_id=gym_id)

        data = []

        for staff in staff_list:
            data.append({
                "staff_id": str(staff.staff_id),
                "name": f"{staff.user.first_name} {staff.user.last_name}",
                "email": staff.user.email,
                "phone": staff.user.phone,
                "role": staff.role,
                "salary": staff.salary,
                "onboarding_step": staff.onboarding_step,
                "address": {
                    "city": staff.address.city if staff.address else None
                }
            })

        return APIResponse.success(data=data)