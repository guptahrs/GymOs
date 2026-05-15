import uuid

from django.db import models

from common.models import BaseModel


class MemberImportJob(BaseModel):
    STATUS_QUEUED = "queued"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_COMPLETED = "completed"
    STATUS_COMPLETED_WITH_ERRORS = "completed_with_errors"
    STATUS_FAILED = "failed"

    STATUS_CHOICES = [
        (STATUS_QUEUED, "Queued"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_COMPLETED_WITH_ERRORS, "Completed With Errors"),
        (STATUS_FAILED, "Failed"),
    ]

    import_job_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gym = models.ForeignKey("gyms.Gym", on_delete=models.CASCADE, related_name="member_import_jobs")
    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_member_import_jobs",
    )
    source_file = models.FileField(upload_to="member-imports/")
    original_file_name = models.CharField(max_length=255)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    success_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    skipped_rows = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    summary_message = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.original_file_name} - {self.status}"


class MemberImportRowError(BaseModel):
    row_error_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(MemberImportJob, on_delete=models.CASCADE, related_name="row_errors")
    row_number = models.IntegerField()
    member_name = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    plan_name = models.CharField(max_length=100, blank=True, default="")
    error_message = models.TextField()
    row_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.job_id} row {self.row_number}"
