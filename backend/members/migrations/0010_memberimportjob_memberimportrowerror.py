import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_feature_user_is_super_admin_role_permission_and_more"),
        ("gyms", "0010_gymbranding_created_by_gymbranding_updated_by_and_more"),
        ("members", "0009_alter_memberpayment_payment_mode"),
    ]

    operations = [
        migrations.CreateModel(
            name="MemberImportJob",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.UUIDField(blank=True, null=True)),
                ("updated_by", models.UUIDField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("is_deleted", models.BooleanField(default=False)),
                ("import_job_id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("source_file", models.FileField(upload_to="member-imports/")),
                ("original_file_name", models.CharField(max_length=255)),
                ("status", models.CharField(choices=[("queued", "Queued"), ("in_progress", "In Progress"), ("completed", "Completed"), ("completed_with_errors", "Completed With Errors"), ("failed", "Failed")], default="queued", max_length=30)),
                ("total_rows", models.IntegerField(default=0)),
                ("processed_rows", models.IntegerField(default=0)),
                ("success_rows", models.IntegerField(default=0)),
                ("failed_rows", models.IntegerField(default=0)),
                ("skipped_rows", models.IntegerField(default=0)),
                ("started_at", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("summary_message", models.TextField(blank=True, default="")),
                ("gym", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="member_import_jobs", to="gyms.gym")),
                ("uploaded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="uploaded_member_import_jobs", to="accounts.user")),
            ],
            options={},
        ),
        migrations.CreateModel(
            name="MemberImportRowError",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.UUIDField(blank=True, null=True)),
                ("updated_by", models.UUIDField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("is_deleted", models.BooleanField(default=False)),
                ("row_error_id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("row_number", models.IntegerField()),
                ("member_name", models.CharField(blank=True, default="", max_length=255)),
                ("phone", models.CharField(blank=True, default="", max_length=30)),
                ("plan_name", models.CharField(blank=True, default="", max_length=100)),
                ("error_message", models.TextField()),
                ("row_data", models.JSONField(blank=True, default=dict)),
                ("job", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="row_errors", to="members.memberimportjob")),
            ],
            options={},
        ),
    ]
