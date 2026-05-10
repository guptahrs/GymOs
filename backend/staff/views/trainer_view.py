from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.generics import GenericAPIView

from accounts.models import User
from common.constants.enums import FeatureCode, UserType
from common.responses.api_response import APIResponse
from common.utills.feature_checker import has_feature
from common.utills.plan_limits import ensure_staff_capacity
from common.services.address_service import create_address
from common.utills.subscription_guard import ensure_gym_write_access
from staff.models import Trainer
from staff.serializers.trainer_serializer import TrainerCreateSerializer, TrainerSerializer


class TrainerListCreateView(GenericAPIView):
    serializer_class = TrainerCreateSerializer

    def get(self, request):
        user_claims = getattr(request, "user_claims", None)
        gym_id = request.query_params.get("gym_id") or (user_claims or {}).get("gym_id")

        if not gym_id:
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        trainers = Trainer.objects.filter(
            gym_id=gym_id,
            is_deleted=False,
            user__is_deleted=False,
        ).select_related("user").order_by("-created_at")

        return APIResponse.success(data=TrainerSerializer(trainers, many=True).data)

    def post(self, request):
        access_error = ensure_gym_write_access(request)
        if access_error:
            return access_error

        # Unified onboarding POST handler.
        data = request.data.copy()
        user_claims = getattr(request, "user_claims", None)
        if not data.get("gym_id") and user_claims:
            data["gym_id"] = user_claims.get("gym_id")

        onboarding_step = (data.get("onboarding_step") or "basic").lower()
        trainer_id = data.get("trainer_id")

        # Basic validation for gym
        if not data.get("gym_id"):
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        if not has_feature(data["gym_id"], FeatureCode.TRAINERS):
            return APIResponse.error(
                "Trainer management is available only on the Elite plan.",
                errors={"error": "feature_not_in_plan"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # If trainer exists, load it
        trainer = None
        if trainer_id:
            try:
                trainer = Trainer.objects.select_related("user").get(trainer_id=trainer_id, is_deleted=False, user__is_deleted=False)
            except Trainer.DoesNotExist:
                return APIResponse.error("Trainer not found", status=status.HTTP_404_NOT_FOUND)

        # Handle steps
        if onboarding_step == "basic":
            # Create or update user/basic info
            if trainer:
                user = trainer.user
                if "email" in data and data.get("email"):
                    exists = User.objects.filter(email=data["email"], is_deleted=False).exclude(user_id=user.user_id).exists()
                    if exists:
                        return APIResponse.error("Email already exists", status=status.HTTP_400_BAD_REQUEST)
                user.first_name = data.get("first_name") or user.first_name
                user.last_name = data.get("last_name") or user.last_name
                if data.get("email"):
                    user.email = data.get("email")
                if "phone" in data:
                    user.phone = data.get("phone") or None
                if data.get("password"):
                    user.password = make_password(data.get("password"))
                user.save()
            else:
                # create new user and trainer shell
                if not data.get("email"):
                    return APIResponse.error("Email is required", status=status.HTTP_400_BAD_REQUEST)
                if User.objects.filter(email=data["email"], is_deleted=False).exists():
                    return APIResponse.error("Email already exists", status=status.HTTP_400_BAD_REQUEST)

                limit_error = ensure_staff_capacity(data["gym_id"])
                if limit_error:
                    return limit_error

                user = User.objects.create(
                    first_name=data.get("first_name") or "",
                    last_name=data.get("last_name") or "",
                    email=data.get("email"),
                    phone=data.get("phone") or None,
                    password=make_password(data.get("password") or "defaultpassword123"),
                    user_type=UserType.STAFF,
                    gym_id=data["gym_id"],
                )

                trainer = Trainer.objects.create(
                    user=user,
                    gym_id=data["gym_id"],
                    role=data.get("role") or "trainer",
                )

            return APIResponse.success("Basic saved", data=TrainerSerializer(trainer).data)

        if onboarding_step == "training":
            # training step requires existing trainer (created after basic)
            if not trainer:
                return APIResponse.error("Trainer id is required for training step", status=status.HTTP_400_BAD_REQUEST)

            # Update trainer-specific fields
            if "specialization" in data:
                trainer.specialization = data.get("specialization") or trainer.specialization
            if "shift" in data:
                trainer.shift = data.get("shift") or trainer.shift
            if "experience_years" in data:
                trainer.experience_years = data.get("experience_years") or trainer.experience_years
            if "certification" in data:
                trainer.certification = data.get("certification") or trainer.certification
            if "bio" in data:
                trainer.bio = data.get("bio") or trainer.bio
            if "max_clients" in data:
                trainer.max_clients = data.get("max_clients") or trainer.max_clients

            trainer.save()
            return APIResponse.success("Training saved", data=TrainerSerializer(trainer).data)

        if onboarding_step == "address":
            if not trainer:
                return APIResponse.error("Trainer id is required for address step", status=status.HTTP_400_BAD_REQUEST)

            address_fields = [
                "address_line_1",
                "address_line_2",
                "city",
                "state",
                "country",
                "pincode",
                "landmark",
            ]

            if any(f in data for f in address_fields):
                address_data = {k: data.get(k) for k in address_fields}
                address = create_address(address_data)
                trainer.address_id = address
                trainer.save()
                return APIResponse.success("Address saved", data=TrainerSerializer(trainer).data)

            return APIResponse.error("No address data provided", status=status.HTTP_400_BAD_REQUEST)

        return APIResponse.error("Invalid onboarding step", status=status.HTTP_400_BAD_REQUEST)


class TrainerDetailView(GenericAPIView):
    serializer_class = TrainerSerializer

    def get_object(self, request, trainer_id):
        user_claims = getattr(request, "user_claims", None)
        gym_id = (user_claims or {}).get("gym_id")

        try:
            queryset = Trainer.objects.select_related("user").filter(
                trainer_id=trainer_id,
                is_deleted=False,
                user__is_deleted=False,
            )
            if gym_id:
                queryset = queryset.filter(gym_id=gym_id)
            return queryset.get()
        except Trainer.DoesNotExist:
            return None

    def get(self, request, trainer_id):
        trainer = self.get_object(request, trainer_id)
        if not trainer:
            return APIResponse.error("Trainer not found", status=status.HTTP_404_NOT_FOUND)
        return APIResponse.success(data=TrainerSerializer(trainer).data)

    def put(self, request, trainer_id):
        trainer = self.get_object(request, trainer_id)
        if not trainer:
            return APIResponse.error("Trainer not found", status=status.HTTP_404_NOT_FOUND)
        access_error = ensure_gym_write_access(request, trainer.gym_id)
        if access_error:
            return access_error

        data = request.data

        # Update user basic fields
        user = trainer.user
        if "first_name" in data:
            user.first_name = data.get("first_name") or ""
        if "last_name" in data:
            user.last_name = data.get("last_name") or ""
        if "email" in data and data.get("email"):
            exists = User.objects.filter(email=data["email"], is_deleted=False).exclude(user_id=user.user_id).exists()
            if exists:
                return APIResponse.error("Email already exists", status=status.HTTP_400_BAD_REQUEST)
            user.email = data["email"]
        if "phone" in data:
            user.phone = data.get("phone") or None

        # Update trainer specific fields
        if "specialization" in data:
            trainer.specialization = data.get("specialization") or trainer.specialization
        if "shift" in data:
            trainer.shift = data.get("shift") or trainer.shift
        if "experience_years" in data:
            trainer.experience_years = data.get("experience_years") or trainer.experience_years
        if "certification" in data:
            trainer.certification = data.get("certification") or trainer.certification
        if "bio" in data:
            trainer.bio = data.get("bio") or trainer.bio
        if "max_clients" in data:
            trainer.max_clients = data.get("max_clients") or trainer.max_clients

        # If address fields are provided, create address and update
        address_fields = [
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "country",
            "pincode",
            "landmark",
        ]

        if any(f in data for f in address_fields):
            address_data = {k: data.get(k) for k in address_fields}
            address = create_address(address_data)
            trainer.address_id = address

        user.save()
        trainer.save()

        return APIResponse.success("Trainer updated", data=TrainerSerializer(trainer).data)

    def delete(self, request, trainer_id):
        trainer = self.get_object(request, trainer_id)
        if not trainer:
            return APIResponse.error("Trainer not found", status=status.HTTP_404_NOT_FOUND)
        access_error = ensure_gym_write_access(request, trainer.gym_id)
        if access_error:
            return access_error

        trainer.is_active = False
        trainer.is_deleted = True
        trainer.save(update_fields=["is_active", "is_deleted", "updated_at"])

        trainer.user.is_active = False
        trainer.user.is_deleted = True
        trainer.user.save(update_fields=["is_active", "is_deleted", "updated_at"])

        return APIResponse.success("Trainer deleted")


# Backward-compatible aliases
CreateTrainerBasicView = TrainerListCreateView
ListTrainerView = TrainerListCreateView
UpdateTrainerBasicView = TrainerDetailView
