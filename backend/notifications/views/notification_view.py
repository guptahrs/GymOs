from rest_framework.views import APIView

from backend.common.responses.api_response import APIResponse
from backend.common.constants.enums import ResponseStatus
from backend.notifications.tasks.send_whatsapp import send_whatsapp_task

class SendManualWhatsApp(APIView):

    def post(self, request):
        phone = request.data["phone"]
        template = request.data["template"]
        params = request.data.get("params", [])

        send_whatsapp_task.delay(
            gym_id=request.user.gym_id,
            phone=phone,
            template_name=template,
            params=params,
            log_id=None,
        )

        return APIResponse(status=ResponseStatus.SUCCESS, message="Notification Send sucessfully")