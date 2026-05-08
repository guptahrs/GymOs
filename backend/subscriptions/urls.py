from django.urls import path
from subscriptions.views.plan_view import CreatePlanView, GetAllPlansView, GetAllActivePlansView
from subscriptions.views.subscription_view import (
    CreateSubscriptionView,
    CurrentSubscriptionView,
    GetActiveSubscriptionView,
)
from subscriptions.views.payment_view import (
    CreatePaymentOrderView,
    VerifyPaymentView,
    PaymentHistoryView
)
# from subscriptions.views.plan_view import GetActivePlansView

urlpatterns = [
    path("plans/create/", CreatePlanView.as_view()),
    path("assign/", CreateSubscriptionView.as_view()),
    path("active-subscriptions/", GetActiveSubscriptionView.as_view()),
    path("all-plans/", GetAllPlansView.as_view()),
    path("current/<uuid:gym_id>/", CurrentSubscriptionView.as_view()),
    path("active-plans/", GetAllActivePlansView.as_view()),
    
     # ── Razorpay payment ──
    path("payment/create-order/",  CreatePaymentOrderView.as_view()),
    path("payment/verify/",        VerifyPaymentView.as_view()),
    path("payment/history/",       PaymentHistoryView.as_view()),
    
]