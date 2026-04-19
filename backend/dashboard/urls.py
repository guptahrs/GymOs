from django.urls import path
from dashboard.views.dashboard_view import DashboardKPIView, DashboardView, FullDashboardView

urlpatterns = [
    path("kpis/", DashboardKPIView.as_view()),
    path("dashboard/", DashboardView.as_view()),
    path("", FullDashboardView.as_view()),
]