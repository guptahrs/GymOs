from django.urls import path
from members.views.member_plan_view import AssignMemberPlanView
from members.views.membership_plan_views import MembershipPlanListCreateView, MembershipPlanDetailView
from members.views.member_view import CreateMemberBasicView, AddMemberAddressView, MemberListView, MemberDetailView
from members.views.lead_view import LeadListCreateView, ConvertLeadView
from members.views.member_subscription_view import LatestMemberSubscriptionView

urlpatterns = [
    path("create/", CreateMemberBasicView.as_view()),
    path("address/", AddMemberAddressView.as_view()),
    path("", MemberListView.as_view()),
    path("<uuid:member_id>/", MemberDetailView.as_view()),
    path("<uuid:member_id>/latest-subscription/", LatestMemberSubscriptionView.as_view()),
    path("assign-plan/", AssignMemberPlanView.as_view()),
    path("plans/", MembershipPlanListCreateView.as_view()),
    path("plans/<uuid:plan_id>/", MembershipPlanDetailView.as_view()),
    path("leads/", LeadListCreateView.as_view()),
    path("leads/<uuid:lead_id>/convert/", ConvertLeadView.as_view()),
]
