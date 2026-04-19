from django.urls import path
from members.views.member_plan_view import AssignMemberPlanView
from members.views.member_view import CreateMemberBasicView, AddMemberAddressView, MemberListView

urlpatterns = [
    path("create/", CreateMemberBasicView.as_view()),
    path("address/", AddMemberAddressView.as_view()),
    path("", MemberListView.as_view()),
    path("assign-plan/", AssignMemberPlanView.as_view()),
]