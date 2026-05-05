from rest_framework.generics import GenericAPIView
from common.responses.api_response import APIResponse
from common.constants.enums import PaymentMode

class StaticLookupView(GenericAPIView):
    """
    API to fetch static lookup data like:
    - Payment modes
    - Membership plan types
    - ETC
    """

    permission_classes = []

    def get(self, request):
        data = {
            "payment_modes": PaymentMode.values(),
        }
        return APIResponse.success(data=data)