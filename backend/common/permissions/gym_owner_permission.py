from rest_framework.permissions import BasePermission
from common.constants.enums import UserType
class IsGymOwner(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user_claims", None)
        if not user:
            return False
        return user.get("user_type") == UserType.GYM_OWNER.value