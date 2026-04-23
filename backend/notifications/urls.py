from django.urls import path
from notifications.views.notification_view import SendWhatsAppView

urlpatterns = [
    path("whatsapp/send", SendWhatsAppView.as_view()),
]
