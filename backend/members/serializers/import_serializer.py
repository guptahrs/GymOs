from rest_framework import serializers

from members.models import MemberImportJob, MemberImportRowError


class MemberImportUploadSerializer(serializers.Serializer):
    gym_id = serializers.UUIDField()
    file = serializers.FileField()


class MemberImportRowErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberImportRowError
        fields = [
            "row_error_id",
            "row_number",
            "member_name",
            "phone",
            "plan_name",
            "error_message",
            "row_data",
        ]


class MemberImportJobSerializer(serializers.ModelSerializer):
    gym_name = serializers.CharField(source="gym.name", read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    errors = MemberImportRowErrorSerializer(source="row_errors", many=True, read_only=True)

    class Meta:
        model = MemberImportJob
        fields = [
            "import_job_id",
            "gym",
            "gym_name",
            "original_file_name",
            "status",
            "total_rows",
            "processed_rows",
            "success_rows",
            "failed_rows",
            "skipped_rows",
            "summary_message",
            "started_at",
            "completed_at",
            "uploaded_by_name",
            "created_at",
            "errors",
        ]

    def get_uploaded_by_name(self, obj):
        if not obj.uploaded_by:
            return None
        return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip() or obj.uploaded_by.email
