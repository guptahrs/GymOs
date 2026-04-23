from rest_framework.views import APIView
from common.responses.api_response import APIResponse
from notifications.services.whatsapp_service import WhatsAppService


class SendWhatsAppView(APIView):

    def post(self, request):

        phone = request.data.get("phone")
        message = request.data.get("message")

        res = WhatsAppService.send_message(phone, message)

        return APIResponse.success(
            message="Message sent",
            data=res
        )