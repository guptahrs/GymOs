from rest_framework.generics import GenericAPIView
from rest_framework import status
from django.contrib.auth.hashers import make_password

from accounts.models import User
from members.models import Member
from common.responses.api_response import APIResponse
from common.constants.enums import UserType, OnboardingStep


class LeadListCreateView(GenericAPIView):
	"""Create and list leads using the existing `User` model with `user_type=LEAD`."""

	def get(self, request):
		users = User.objects.filter(user_type=UserType.LEAD, is_deleted=False).order_by("-created_at")
		data = []
		for u in users:
			data.append({
				"lead_id": str(u.user_id),
				"name": f"{u.first_name} {u.last_name or ''}".strip(),
				"email": u.email,
				"phone": u.phone,
				"status": "lead",
                "gender": u.gender,
                "dob": u.date_of_birth,
				"created_at": u.created_at,
			})
		return APIResponse.success(data=data)

	def post(self, request):
		body = request.data

		password = body.get("password", "defaultpassword123")

		user = User.objects.create(
			first_name=body.get("first_name") or body.get("name") or "",
			last_name=body.get("last_name", "") or "",
			email=body.get("email"),
			phone=body.get("phone"),
			password=make_password(password),
			user_type=UserType.LEAD,
			gym_id=body.get("gym_id") or None,
		)

		return APIResponse.success(message="Lead created", data={"lead_id": str(user.user_id)})


class ConvertLeadView(GenericAPIView):
	"""Convert a lead (User with user_type=LEAD) into a Member.

	URL expects the lead's `user_id` as `lead_id` path param.
	"""

	def post(self, request, lead_id):
		try:
			user = User.objects.get(user_id=lead_id, is_deleted=False, user_type=UserType.LEAD)
		except User.DoesNotExist:
			return APIResponse.error(message="Lead not found", status_code=status.HTTP_404_NOT_FOUND)

		# create member record
		member = Member.objects.create(
			user=user,
			gym_id=user.gym_id or request.data.get("gym_id"),
			onboarding_step=OnboardingStep.BASIC
		)

		# update user type to member
		user.user_type = UserType.MEMBER
		user.save()

		return APIResponse.success(message="Lead converted to member", data={"member_id": str(member.member_id)})

