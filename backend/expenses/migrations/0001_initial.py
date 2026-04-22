# Generated manually for expenses CRUD

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("gyms", "0006_remove_gym_owner_id"),
    ]

    operations = [
        migrations.CreateModel(
            name="Expense",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.UUIDField(blank=True, null=True)),
                ("updated_by", models.UUIDField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("is_deleted", models.BooleanField(default=False)),
                ("title", models.CharField(max_length=255)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("category", models.CharField(choices=[("salary", "Salary"), ("rent", "Rent"), ("maintenance", "Maintenance"), ("other", "Other")], max_length=50)),
                ("description", models.TextField(blank=True, null=True)),
                ("expense_date", models.DateField()),
                ("gym", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="expenses", to="gyms.gym")),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
