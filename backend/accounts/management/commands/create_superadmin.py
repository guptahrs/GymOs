from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = "Create default super admin if not exists"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        email = "harsh.gupta@gymora.co.in"

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING("Superadmin already exists"))
            return

        user = User.objects.create(
            email=email,
            first_name="Harsh",
            last_name="Gupta",
            password=make_password("Paytm@123"),
            is_superuser=True,
            is_staff=True,
            gender="male",
            date_of_birth="1996-10-06"
        )

        self.stdout.write(self.style.SUCCESS("Superadmin created successfully"))