import requests
from django.conf import settings


class WhatsAppService:

    @staticmethod
    def send_message(to, message):

        url = f"https://graph.facebook.com/v25.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"

        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }

        payload = {
            "messaging_product": "whatsapp",
             "recipient_type": "individual",
            "to": to,
            "type": "text",
            
            "text": {"body": message,"preview_url": False},
        }

        response = requests.post(url, headers=headers, json=payload)
        print("WhatsApp API response:", response.status_code, response.text)
        return response.json()