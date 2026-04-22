import jwt
from django.conf import settings
from jwt import ExpiredSignatureError


class UserClaimsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get("Authorization")
        request.auth_error = None

        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                request.user_claims = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            except ExpiredSignatureError:
                request.user_claims = None
                request.auth_error = "Token expired"
            except Exception:
                request.user_claims = None
                request.auth_error = "Invalid token"
        else:
            request.user_claims = None
            request.auth_error = "Authentication token missing"

        return self.get_response(request)
