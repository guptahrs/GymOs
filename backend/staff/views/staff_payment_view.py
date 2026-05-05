from rest_framework.generics import GenericAPIView

from common.responses.api_response import APIResponse
from common.utills.subscription_guard import ensure_gym_write_access
from staff.models import Staff, StaffPayment

class PayStaffSalaryView(GenericAPIView):

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        staff_id = request.data.get("staff_id")
        amount = request.data.get("amount")

        staff = Staff.objects.get(staff_id=staff_id)

        StaffPayment.objects.create(
            gym_id=staff.gym_id,
            staff=staff,
            amount=amount,
            payment_mode=request.data.get("payment_mode")
        )

        return APIResponse.success("Salary paid successfully")
