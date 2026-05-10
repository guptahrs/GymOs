from django.contrib.auth.hashers import make_password
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import GenericAPIView, ListAPIView

from accounts.models import User
from common.constants.enums import OnboardingStep, UserType
from common.responses.api_response import APIResponse
from common.services.address_service import create_address
from common.utills.plan_limits import ensure_member_capacity
from common.utills.subscription_guard import ensure_gym_write_access
from members.models import Member, MemberSubscription
from members.serializers.member_serializer import MemberCreateSerializer, MemberSerializer


class CreateMemberBasicView(GenericAPIView):
    serializer_class = MemberCreateSerializer

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        payload = request.data.copy()
        payload["password"] = payload.get("password", "defaultpassword123")

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        limit_error = ensure_member_capacity(data["gym_id"])
        if limit_error:
            return limit_error

        user = User.objects.create(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            phone=data["phone"],
            password=make_password(data["password"]),
            user_type=UserType.MEMBER,
            gym_id=data["gym_id"],
        )

        member = Member.objects.create(
            user=user,
            gym_id=data["gym_id"],
            onboarding_step=OnboardingStep.BASIC,
        )

        return APIResponse.success(
            message="Member basic created",
            data={"member_id": str(member.member_id), "user_id": str(user.user_id)},
        )


class AddMemberAddressView(GenericAPIView):
    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        member_id = request.data.get("user_id")
        member = Member.objects.get(user_id=member_id)

        address = create_address(request.data)
        member.address = address
        member.onboarding_step = OnboardingStep.ADDRESS
        member.save()

        return APIResponse.success("Member address added")


class MemberListView(ListAPIView):
    serializer_class = MemberSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["user__first_name", "user__email", "user__phone", "payment_status"]
    filterset_fields = []
    ordering_fields = ["created_at", "user__first_name"]
    ordering = ["-created_at"]

    def list(self, request, *args, **kwargs):
        user = getattr(request, "user_claims", None)
        if not user:
            return APIResponse.error(
                message=getattr(request, "auth_error", None) or "Authentication required",
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        try:
            user = getattr(self.request, "user_claims", None)
            if not user:
                return Member.objects.none()

            return Member.objects.filter(
                gym_id=user.get("gym_id"),
                is_deleted=False,
                user__is_deleted=False,
            ).select_related("user", "address").prefetch_related(
                Prefetch(
                    "membersubscription_set",
                    queryset=MemberSubscription.objects.filter(is_deleted=False)
                    .select_related("plan")
                    .order_by("-created_at"),
                    to_attr="prefetched_subscriptions",
                )
            )
        except Exception as exc:
            print(f"Error fetching members: {exc}")
            return Member.objects.none()


class MemberDetailView(GenericAPIView):
    serializer_class = MemberSerializer

    def get_object(self, request, member_id):
        user = getattr(request, "user_claims", None)
        if not user:
            return None

        try:
            return Member.objects.select_related("user", "address").get(
                member_id=member_id,
                gym_id=user.get("gym_id"),
                is_deleted=False,
                user__is_deleted=False,
            )
        except Member.DoesNotExist:
            return None

    def put(self, request, member_id):
        member = self.get_object(request, member_id)
        if not member:
            return APIResponse.error("Member not found", status=status.HTTP_404_NOT_FOUND)
        access_error = ensure_gym_write_access(request, member.gym_id)
        if access_error:
            return access_error

        data = request.data
        user = member.user

        if "first_name" in data:
            user.first_name = data.get("first_name") or ""
        if "last_name" in data:
            user.last_name = data.get("last_name") or ""
        if "email" in data:
            user.email = data.get("email") or user.email
        if "phone" in data:
            user.phone = data.get("phone") or None
        if "gender" in data:
            user.gender = data.get("gender") or None
        if "dob" in data or "date_of_birth" in data:
            dob = data.get("dob") or data.get("date_of_birth") or None
            user.date_of_birth = dob
            member.date_of_birth = dob

        user.save()
        member.save()

        serializer = self.get_serializer(member)
        return APIResponse.success("Member updated", data=serializer.data)

    def delete(self, request, member_id):
        member = self.get_object(request, member_id)
        if not member:
            return APIResponse.error("Member not found", status=status.HTTP_404_NOT_FOUND)
        access_error = ensure_gym_write_access(request, member.gym_id)
        if access_error:
            return access_error

        member.is_active = False
        member.is_deleted = True
        member.save(update_fields=["is_active", "is_deleted", "updated_at"])

        member.user.is_active = False
        member.user.is_deleted = True
        member.user.save(update_fields=["is_active", "is_deleted", "updated_at"])

        return APIResponse.success("Member deleted")
