from django.urls import path
from subscriptions.views.plan_view import CreatePlanView, GetAllPlansView
from subscriptions.views.subscription_view import (
    CreateSubscriptionView,
    GetActiveSubscriptionView,
)
# from subscriptions.views.plan_view import GetActivePlansView

urlpatterns = [
    path("plan/create/", CreatePlanView.as_view()),
    path("assign/", CreateSubscriptionView.as_view()),
    path("active-subscriptions/", GetActiveSubscriptionView.as_view()),
    path("all-plans/", GetAllPlansView.as_view()),
    # path("active-plans/", GetActivePlansView.as_view()),
    
]