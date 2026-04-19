from django.urls import path
from gyms.views.gym_view import CreateGymBasicView

urlpatterns = [
    path("create/", CreateGymBasicView.as_view()),
]