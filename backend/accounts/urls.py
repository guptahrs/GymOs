from django.urls import path

from accounts.views.super_user_view import CreateAdminUserView
from accounts.views.login_view import LoginView
from accounts.views.feature_view import FeatureListCreateView
from accounts.views.role_view import (
    GymRoleListCreateView,
    GymAvailableFeaturesView,
    GymPermissionAssignView,
)

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("create-admin/", CreateAdminUserView.as_view()),
    
     # Super admin: manage global features
    path("features/", FeatureListCreateView.as_view()),

    # Gym owner: manage roles and permissions
    path("roles/", GymRoleListCreateView.as_view()),
    path("roles/available-features/", GymAvailableFeaturesView.as_view()),
    path("roles/assign-permission/", GymPermissionAssignView.as_view()),
]