# integrations/whatsapp/templates.py

from .enums import WhatsappTemplateCode

WHATSAPP_TEMPLATES = {
    WhatsappTemplateCode.NEW_MEMBER_WELCOME.value: {
        "template_name": "welcome_member",
        "language": "en_US",
        "variables": [
            "member_name",
            "gym_name",
        ],
    },

    WhatsappTemplateCode.MEMBERSHIP_RENEWAL_REMINDER.value: {
        "template_name": "membership_reminder",
        "language": "en_US",
        "variables": [
            "member_name",
            "gym_name",
            "expiry_date",
        ],
    },

    WhatsappTemplateCode.PAYMENT_RECEIPT.value: {
        "template_name": "payment_received",
        "language": "en_US",
        "variables": [
            "member_name",
            "amount",
        ],
    },
}