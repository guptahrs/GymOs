import jwt
from django.conf import settings


class UserClaimsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        auth_header = request.headers.get("Authorization")

        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

                request.user_claims = decoded  # 🔥 yahi missing tha

            except Exception:
                request.user_claims = None
        else:
            request.user_claims = None

        return self.get_response(request)