from django.urls import path
from subscriptions.views.plan_view import CreatePlanView
from subscriptions.views.subscription_view import (
    CreateSubscriptionView,
    GetActiveSubscriptionView
)

urlpatterns = [
    path("plan/create/", CreatePlanView.as_view()),
    path("assign/", CreateSubscriptionView.as_view()),
    path("active/", GetActiveSubscriptionView.as_view()),
]