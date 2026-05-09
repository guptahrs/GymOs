import requests
from django.conf import settings

from integrations.whatsapp.templates import WHATSAPP_TEMPLATES


class WhatsAppService:

    BASE_URL = (
        f"https://graph.facebook.com/v25.0/"
        f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )

    @classmethod
    def create_message_payload(cls, message_type, to, data):

        template_config = WHATSAPP_TEMPLATES.get(message_type)

        if not template_config:
            raise ValueError(f"Invalid message type: {message_type}")

        parameters = []

        for variable in template_config["variables"]:
            value = data.get(variable, "")

            parameters.append({
                "type": "text",
                "text": str(value),
            })

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "template",
            "template": {
                "name": template_config["template_name"],
                "language": {
                    "code": template_config["language"]
                },
                "components": [
                    {
                        "type": "body",
                        "parameters": parameters
                    }
                ]
            }
        }

        return payload

    @classmethod
    def send(cls, message_type, to, data):

        payload = cls.create_message_payload(
            message_type=message_type,
            to=to,
            data=data
        )

        headers = {
            "Authorization": (
                f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"
            ),
            "Content-Type": "application/json",
        }

        response = requests.post(
            cls.BASE_URL,
            headers=headers,
            json=payload
        )

        print(
            "WhatsApp API response:",
            response.status_code,
            response.text
        )

        return response.json()