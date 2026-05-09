# integrations/whatsapp/templates.py

WHATSAPP_TEMPLATES = {
    "welcome_message": {
        "template_name": "welcome_member",
        "language": "en_US",
        "variables": [
            "member_name",
            "gym_name",
        ],
    },

    "membership_reminder": {
        "template_name": "membership_reminder",
        "language": "en_US",
        "variables": [
            "member_name",
            "gym_name",
            "expiry_date",
        ],
    },

    "payment_received": {
        "template_name": "payment_received",
        "language": "en_US",
        "variables": [
            "member_name",
            "amount",
        ],
    },
}