from django.urls import path
from staff.views.staff_view import (
    CreateStaffBasicView,
    AddStaffDetailsView,
    ListStaffView,
    UpdateStaffSalaryView,
    UpdateStaffBasicView,
    UpdateStaffAddressView
)

urlpatterns = [
    path("create/basic/", CreateStaffBasicView.as_view()),
    path("add-details/", AddStaffDetailsView.as_view()),
    path("update/basic/", UpdateStaffBasicView.as_view()),
    path("update/address/", UpdateStaffAddressView.as_view()),
    path("update/salary/", UpdateStaffSalaryView.as_view()),
    path("list/", ListStaffView.as_view()),
]