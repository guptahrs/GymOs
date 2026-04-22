# Generated manually for lead conversion payment status support

import common.constants.enums
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0002_remove_member_id_member_member_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='payment_status',
            field=models.CharField(
                choices=[('paid', 'Paid'), ('due', 'Due')],
                default=common.constants.enums.PaymentStatus['DUE'],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='membersubscription',
            name='remaining_amount',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
