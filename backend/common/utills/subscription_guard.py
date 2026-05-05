from common.responses.api_response import APIResponse
from common.utills.feature_checker import has_write_access


def get_request_gym_id(request, fallback=None):
    user_claims = getattr(request, "user_claims", None) or {}
    return (
        request.data.get("gym_id")
        or request.query_params.get("gym_id")
        or user_claims.get("gym_id")
        or fallback
    )


def ensure_gym_write_access(request, gym_id=None):
    resolved_gym_id = gym_id or get_request_gym_id(request)
    if not resolved_gym_id:
        return None

    if has_write_access(resolved_gym_id):
        return None

    return APIResponse.error(
        message="Your trial or subscription has ended. Data changes are disabled until you activate a plan.",
        errors={"error": "subscription_read_only"},
        status=403,
    )
