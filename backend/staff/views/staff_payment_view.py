from rest_framework.generics import GenericAPIView

from staff.models import Staff, StaffPayment
from common.responses.api_response import APIResponse

class PayStaffSalaryView(GenericAPIView):

    def post(self, request):
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