from rest_framework.generics import GenericAPIView
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from accounts.models import User
from members.models import Member, MembershipPlan, MemberSubscription
from common.services.address_service import create_address
from common.responses.api_response import APIResponse
from common.constants.enums import UserType, OnboardingStep, PaymentStatus
from common.permissions.feature_rbac_permission import FeatureAndRBACPermission
from common.utills.subscription_guard import ensure_gym_write_access


class LeadListCreateView(GenericAPIView):
	"""Create and list leads using the existing `User` model with `user_type=LEAD`."""
	permission_classes = [FeatureAndRBACPermission]
	feature = "leads"

 
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
			gender=body.get("gender") or None,
			date_of_birth=body.get("dob") or body.get("date_of_birth") or None,
			gym_id=body.get("gym_id") or None,
		)

		return APIResponse.success(message="Lead created", data={"lead_id": str(user.user_id)})


class ConvertLeadView(GenericAPIView):
	"""Convert a lead (User with user_type=LEAD) into a Member.

	URL expects the lead's `user_id` as `lead_id` path param.
	"""

	def post(self, request, lead_id):
		access_error = ensure_gym_write_access(request)
		if access_error:
			return access_error

		try:
			user = User.objects.get(user_id=lead_id, is_deleted=False, user_type=UserType.LEAD)
		except User.DoesNotExist:
			return APIResponse.error(message="Lead not found", status=status.HTTP_404_NOT_FOUND)

		if Member.objects.filter(user=user, is_deleted=False).exists():
			return APIResponse.error(message="Lead is already converted", status=status.HTTP_400_BAD_REQUEST)

		address_data = request.data.get("address") or {}
		required_address_fields = ["address_line_1", "city", "state", "country", "pincode"]
		missing_fields = [field for field in required_address_fields if not address_data.get(field)]
		if missing_fields:
			return APIResponse.error(
				message="Address details are required",
				errors={field: "This field is required" for field in missing_fields},
				status=status.HTTP_400_BAD_REQUEST
			)

		gym_id = user.gym_id or request.data.get("gym_id")
		if not gym_id:
			return APIResponse.error(message="Gym id is required", status=status.HTTP_400_BAD_REQUEST)

		plan = None
		plan_id = request.data.get("plan_id")
		if plan_id:
			try:
				plan = MembershipPlan.objects.get(plan_id=plan_id, gym_id=gym_id, is_deleted=False)
			except MembershipPlan.DoesNotExist:
				return APIResponse.error(message="Plan not found", status=status.HTTP_404_NOT_FOUND)

		try:
			amount_paid = Decimal(str(request.data.get("amount_paid") or "0"))
		except (InvalidOperation, TypeError):
			return APIResponse.error(message="Invalid paid amount", status=status.HTTP_400_BAD_REQUEST)

		with transaction.atomic():
			address = create_address(address_data)
			payment_status = PaymentStatus.DUE
			onboarding_step = OnboardingStep.ADDRESS

			member = Member.objects.create(
				user=user,
				gym_id=gym_id,
				address=address,
				date_of_birth=user.date_of_birth,
				onboarding_step=onboarding_step,
				payment_status=payment_status,
			)

			if plan:
				start_date = timezone.now()
				end_date = start_date + timedelta(days=plan.duration_days)
				remaining_amount = max(plan.price - amount_paid, Decimal("0"))
				if remaining_amount == 0:
					payment_status = PaymentStatus.PAID
				elif amount_paid > 0:
					payment_status = PaymentStatus.PARTIAL
				else:
					payment_status = PaymentStatus.DUE

				MemberSubscription.objects.create(
					gym_id=gym_id,
					member=member,
					plan=plan,
					start_date=start_date,
					end_date=end_date,
					amount_paid=amount_paid,
					remaining_amount=remaining_amount,
				)
				member.onboarding_step = OnboardingStep.COMPLETED
				member.payment_status = payment_status
				member.save(update_fields=["onboarding_step", "payment_status", "updated_at"])

			user.user_type = UserType.MEMBER
			user.save(update_fields=["user_type", "updated_at"])

		return APIResponse.success(
			message="Lead marked as joined",
			data={
				"member_id": str(member.member_id),
				"payment_status": member.payment_status,
				"onboarding_step": member.onboarding_step,
			}
		)
