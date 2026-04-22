import requests


class WhatsAppClient:
    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self, token: str, phone_number_id: str):
        self.token = token
        self.phone_number_id = phone_number_id

    def send_template(self, payload: dict):
        url = f"{self.BASE_URL}/{self.phone_number_id}/messages"

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        return response.json()