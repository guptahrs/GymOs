from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth.hashers import make_password
from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import User
from common.services.address_service import create_address
from members.models import Member
from members.serializers.member_serializer import MemberCreateSerializer, MemberSerializer
from common.responses.api_response import APIResponse
from common.constants.enums import UserType, OnboardingStep


class CreateMemberBasicView(GenericAPIView):
    serializer_class = MemberCreateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # 🔥 Step 1: Create User
        user = User.objects.create(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            phone=data["phone"],
            password=make_password(data["password"]),
            user_type=UserType.STAFF
        )

        # 🔥 Step 2: Create Member
        member = Member.objects.create(
            user=user,
            gym_id=data["gym_id"],
            onboarding_step=OnboardingStep.BASIC
        )

        return APIResponse.success(
            message="Member basic created",
            data={"member_id": str(member.id)}
        )

class AddMemberAddressView(GenericAPIView):

    def post(self, request):
        member_id = request.data.get("member_id")

        member = Member.objects.get(id=member_id)

        address = create_address(request.data)

        member.address = address
        member.onboarding_step = OnboardingStep.ADDRESS
        member.save()

        return APIResponse.success("Member address added")


class MemberListView(ListAPIView):
    serializer_class = MemberSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]

    # 🔍 search
    search_fields = ["user__first_name", "user__email", "user__phone"]

    # 🎯 filter
    filterset_fields = []

    # ↕ ordering
    ordering_fields = ["created_at", "user__first_name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        try:
            user = getattr(self.request, "user_claims", None)
            
            return Member.objects.filter(
                gym_id=user.get("gym_id")
            ).select_related("user", "address")
        except Exception as e:
            print(f"Error fetching members: {e}")
            return Member.objects.none()