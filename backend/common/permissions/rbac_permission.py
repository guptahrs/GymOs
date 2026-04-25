from rest_framework.permissions import BasePermission
from accounts.models import Permission


class RBACPermission(BasePermission):

    ACTION_MAP = {
        "GET": "read",
        "POST": "create",
        "PUT": "update",
        "PATCH": "update",
        "DELETE": "delete",
    }

    def has_permission(self, request, view):
        user = getattr(request, "user_claims", None)

        if not user:
            return False

        if user.get("is_super_admin"):
            return True

        feature = getattr(view, "feature", None)
        action = self.ACTION_MAP.get(request.method)

        if not feature or not action:
            return True

        perm = Permission.objects.filter(
            role_id=user.get("role_id"),
            feature__code=feature
        ).first()

        if not perm:
            return False

        return getattr(perm, f"can_{action}", False)