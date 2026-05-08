import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gyms", "0008_remove_gym_active_subscription"),
    ]

    operations = [
        migrations.CreateModel(
            name="GymBranding",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_active", models.BooleanField(default=True)),
                ("is_deleted", models.BooleanField(default=False)),
                ("branding_id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("brand_name", models.CharField(blank=True, default="", max_length=255)),
                ("logo_url", models.URLField(blank=True, default="")),
                ("favicon_url", models.URLField(blank=True, default="")),
                ("primary_color", models.CharField(default="#3B82F6", max_length=20)),
                ("accent_color", models.CharField(default="#0F172A", max_length=20)),
                ("theme_mode", models.CharField(choices=[("light", "light"), ("dark", "dark"), ("system", "system")], default="dark", max_length=20)),
                ("gym", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="branding", to="gyms.gym")),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
