import jwt
from datetime import timedelta
from django.conf import settings
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import GenericAPIView
from django.contrib.auth.hashers import check_password

from accounts.models import User
from accounts.serializers.auth_serializer import LoginSerializer
from common.responses.api_response import APIResponse
from common.constants.enums import ResponseStatus


class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        # password = make_password(serializer.validated_data["password"])
        print("Hashed Password:", password)
        print(User.objects.all())
        user = User.objects.filter(email=email).first()

        if not user:
            return APIResponse.error(message="User not found", status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password):
            return APIResponse.error(message="Invalid email or password...", status=status.HTTP_401_UNAUTHORIZED)

        payload = {
            "user_id": str(user.user_id),
            "email": user.email,
            "user_type": user.user_type,
            "exp": int((timezone.now() + timedelta(minutes=60)).timestamp()),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return APIResponse.success(message="Login successful", data={"token": token})