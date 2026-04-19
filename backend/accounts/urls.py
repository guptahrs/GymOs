from django.urls import path

from accounts.views.super_user_view import CreateAdminUserView
from accounts.views.login_view import LoginView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("create-admin/", CreateAdminUserView.as_view()),
]