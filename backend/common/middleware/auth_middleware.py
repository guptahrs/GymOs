import jwt
from django.conf import settings
from jwt import ExpiredSignatureError
from common.responses.api_response import APIResponse
from rest_framework import status


class UserClaimsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get("Authorization")
        request.auth_error = None
        request.user_claims = None

        if auth_header:
            if not auth_header.startswith("Bearer "):
                request.auth_error = "Invalid authentication token"
                return APIResponse.error(message=request.auth_error, status=status.HTTP_401_UNAUTHORIZED)

            try:
                token = auth_header.split(" ", 1)[1].strip()
                request.user_claims = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            except ExpiredSignatureError:
                request.auth_error = "Token expired"
                return APIResponse.error(message=request.auth_error, status=status.HTTP_401_UNAUTHORIZED)
            except Exception:
                request.auth_error = "Invalid token"
                return APIResponse.error(message=request.auth_error, status=status.HTTP_401_UNAUTHORIZED)

        return self.get_response(request)
