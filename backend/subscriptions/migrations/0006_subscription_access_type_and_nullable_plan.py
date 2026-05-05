import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0005_alter_plan_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="subscription",
            name="plan",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to="subscriptions.plan"),
        ),
        migrations.AddField(
            model_name="subscription",
            name="access_type",
            field=models.CharField(
                choices=[("paid", "paid"), ("trial", "trial")],
                default="paid",
                max_length=20,
            ),
        ),
    ]
