# Generated manually for partial payment status support

import common.constants.enums
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0005_fix_member_fk_columns_to_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='payment_status',
            field=models.CharField(
                choices=[
                    ('PAID', 'Paid'),
                    ('DUE', 'Due'),
                    ('PARTIAL', 'Partial'),
                    ('OVERDUE', 'Overdue'),
                ],
                default=common.constants.enums.PaymentStatus['DUE'],
                max_length=20,
            ),
        ),
    ]
