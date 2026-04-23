from rest_framework import status
from rest_framework.generics import GenericAPIView

from common.responses.api_response import APIResponse
from staff.models import TrainingType
from staff.serializers.training_type_serializer import (
    TrainingTypeCreateUpdateSerializer,
    TrainingTypeSerializer,
)


class TrainingTypeListCreateView(GenericAPIView):
    serializer_class = TrainingTypeCreateUpdateSerializer

    def get_gym_id(self, request):
        user_claims = getattr(request, "user_claims", None)
        return request.query_params.get("gym_id") or (user_claims or {}).get("gym_id") or getattr(request, "gym_id", None)

    def get(self, request):
        gym_id = self.get_gym_id(request)
        if not gym_id:
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        training_types = TrainingType.objects.filter(
            gym_id=gym_id,
            is_deleted=False,
        ).order_by("-created_at")

        return APIResponse.success(data=TrainingTypeSerializer(training_types, many=True).data)

    def post(self, request):
        gym_id = self.get_gym_id(request)
        if not gym_id:
            return APIResponse.error("Gym id is required", status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        training_type = TrainingType.objects.create(
            gym_id=gym_id,
            **serializer.validated_data,
        )

        return APIResponse.success(
            "Training type created",
            data=TrainingTypeSerializer(training_type).data,
        )


class TrainingTypeDetailView(GenericAPIView):
    serializer_class = TrainingTypeCreateUpdateSerializer

    def get_object(self, request, training_type_id):
        user_claims = getattr(request, "user_claims", None)
        gym_id = request.query_params.get("gym_id") or (user_claims or {}).get("gym_id") or getattr(request, "gym_id", None)

        try:
            queryset = TrainingType.objects.filter(
                training_type_id=training_type_id,
                is_deleted=False,
            )
            if gym_id:
                queryset = queryset.filter(gym_id=gym_id)
            return queryset.get()
        except TrainingType.DoesNotExist:
            return None

    def put(self, request, training_type_id):
        training_type = self.get_object(request, training_type_id)
        if not training_type:
            return APIResponse.error("Training type not found", status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        for field, value in serializer.validated_data.items():
            setattr(training_type, field, value)

        training_type.save()

        return APIResponse.success(
            "Training type updated",
            data=TrainingTypeSerializer(training_type).data,
        )

    def patch(self, request, training_type_id):
        training_type = self.get_object(request, training_type_id)
        if not training_type:
            return APIResponse.error("Training type not found", status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get("is_active")
        if is_active is None:
            return APIResponse.error("is_active is required", status=status.HTTP_400_BAD_REQUEST)

        if isinstance(is_active, str):
            is_active = is_active.lower() == "true"

        training_type.is_active = bool(is_active)
        training_type.save(update_fields=["is_active", "updated_at"])

        return APIResponse.success(
            "Training type updated",
            data=TrainingTypeSerializer(training_type).data,
        )

    def delete(self, request, training_type_id):
        training_type = self.get_object(request, training_type_id)
        if not training_type:
            return APIResponse.error("Training type not found", status=status.HTTP_404_NOT_FOUND)

        training_type.is_active = False
        training_type.is_deleted = True
        training_type.save(update_fields=["is_active", "is_deleted", "updated_at"])

        return APIResponse.success("Training type deleted")
