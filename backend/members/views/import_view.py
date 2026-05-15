from django.db.models import Q
from rest_framework import status
from rest_framework.generics import GenericAPIView

from accounts.models import User
from common.permissions.super_admin_permission import IsSuperAdmin
from common.responses.api_response import APIResponse
from gyms.models import Gym
from members.models import MemberImportJob
from members.serializers.import_serializer import MemberImportJobSerializer, MemberImportUploadSerializer
from members.services.bulk_onboarding_service import EXPECTED_COLUMNS, start_member_import, validate_upload_columns

class MemberImportUploadView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = MemberImportUploadSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gym_id = serializer.validated_data["gym_id"]
        upload = serializer.validated_data["file"]

        try:
            gym = Gym.objects.get(gym_id=gym_id, is_deleted=False)
        except Gym.DoesNotExist:
            return APIResponse.error("Gym not found", status=status.HTTP_404_NOT_FOUND)

        try:
            total_rows = validate_upload_columns(upload, upload.name)
            upload.seek(0)
        except ValueError as exc:
            return APIResponse.error(str(exc), status=status.HTTP_400_BAD_REQUEST)

        uploaded_by = None
        user_claims = getattr(request, "user_claims", None) or {}
        user_id = user_claims.get("user_id")
        if user_id:
            uploaded_by = User.objects.filter(user_id=user_id).first()

        job = MemberImportJob.objects.create(
            gym=gym,
            uploaded_by=uploaded_by,
            source_file=upload,
            original_file_name=upload.name,
            total_rows=total_rows,
            summary_message="File uploaded successfully. Waiting to process.",
        )

        start_member_import(job.import_job_id)

        return APIResponse.success(
            message="File uploaded. Import started in background.",
            data=MemberImportJobSerializer(job).data,
        )


class MemberImportJobListView(GenericAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip()
        gym_id = request.query_params.get("gym_id", "").strip()

        jobs = MemberImportJob.objects.select_related("gym", "uploaded_by").order_by("-created_at")
        if search:
            jobs = jobs.filter(
                Q(original_file_name__icontains=search)
                | Q(gym__name__icontains=search)
            )
        if status_filter:
            jobs = jobs.filter(status=status_filter)
        if gym_id:
            jobs = jobs.filter(gym_id=gym_id)

        return APIResponse.success(data=MemberImportJobSerializer(jobs, many=True).data)


class MemberImportJobDetailView(GenericAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, import_job_id):
        try:
            job = (
                MemberImportJob.objects.select_related("gym", "uploaded_by")
                .prefetch_related("row_errors")
                .get(import_job_id=import_job_id)
            )
        except MemberImportJob.DoesNotExist:
            return APIResponse.error("Import job not found", status=status.HTTP_404_NOT_FOUND)

        return APIResponse.success(data=MemberImportJobSerializer(job).data)


class MemberImportTemplateMetaView(GenericAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return APIResponse.success(
            data={
                "expected_columns": sorted(EXPECTED_COLUMNS),
                "required_columns": [
                    "first_name",
                    "phone",
                    "start_date",
                    "plan_type",
                    "plan_price",
                    "amount_paid",
                ],
                "notes": [
                    "plan_type supports monthly, quarterly, yearly",
                    "pending_due_date is required only when pending_amount is greater than 0",
                    "email is optional; a placeholder email will be generated if missing",
                    "payment_mode supports CASH, CARD, UPI",
                ],
            }
        )
