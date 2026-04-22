class WhatsAppService:

    @staticmethod
    def build_template_payload(to: str, template_name: str, params: list):
        return {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": "en"},
                "components": [
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": p} for p in params],
                    }
                ],
            },
        }

    @staticmethod
    def send(client, payload):
        return client.send_template(payload)