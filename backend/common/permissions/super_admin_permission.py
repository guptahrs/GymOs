from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user_claims", None)
        print("\n\n\n User Claims in Permission:", user)
        if not user:
            return False
        return bool(user.get("is_super_admin"))