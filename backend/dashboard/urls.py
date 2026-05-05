from django.urls import path
from dashboard.views.dashboard_view import (
    DashboardKPIView,
    RevenueExpenseGraphView,
    UpcomingRenewalsView,
)

urlpatterns = [
    path("kpis/",     DashboardKPIView.as_view()),
    path("chart/",    RevenueExpenseGraphView.as_view()),
    path("renewals/", UpcomingRenewalsView.as_view()),
]