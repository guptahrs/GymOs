from django.urls import path
from dashboard.views.dashboard_view import (
    DashboardKPIView,
    RevenueExpenseGraphView,
    UpcomingRenewalsView,
    UpcomingDuePaymentsView,
)

urlpatterns = [
    path("kpis/",     DashboardKPIView.as_view()),
    path("chart/",    RevenueExpenseGraphView.as_view()),
    path("renewals/", UpcomingRenewalsView.as_view()),
    path("due-payments/", UpcomingDuePaymentsView.as_view()),
    
]