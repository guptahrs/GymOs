from django.urls import path
from staff.views.staff_view import StaffDetailView, StaffListCreateView


urlpatterns = [
    path("", StaffListCreateView.as_view()),
    path("<int:staff_id>/", StaffDetailView.as_view()),
]
