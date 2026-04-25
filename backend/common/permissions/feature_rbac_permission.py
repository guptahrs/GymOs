from rest_framework.permissions import BasePermission
from accounts.models import Permission
from common.utills.feature_checker import has_feature


class FeatureAndRBACPermission(BasePermission):
    """
    Gate 1: gym's subscription plan must include the feature.
    Gate 2: user's role must have the required CRUD permission.
    Super admin bypasses both gates.
    """

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

        # Super admin: full access, no gates
        if user.get("is_super_admin"):
            return True

        feature_code = getattr(view, "feature", None)
        if not feature_code:
            return True  # unprotected view

        gym_id = user.get("gym_id")

        # Gate 1: plan-level feature gate
        if gym_id and not has_feature(gym_id, feature_code):
            self.message = {
                    "error": "feature_not_in_plan",
                    "detail": "This feature is not available in your current plan. Please upgrade."
                }
            return False

        # Gate 2: role-based permission
        action = self.ACTION_MAP.get(request.method)
        if not action:
            return False

        perm = Permission.objects.filter(
            role_id=user.get("role_id"),
            feature__code=feature_code
        ).first()

        if not perm or not getattr(perm, f"can_{action}", False):
            self.message = {
                    "error": "permission_denied",
                    "detail": "You do not have permission to perform this action."
                }
            return False

        return getattr(perm, f"can_{action}", False)