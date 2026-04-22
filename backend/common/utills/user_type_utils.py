from common.constants.enums import UserType

def is_super_user(user):
    return user.user_type == UserType.SUPER_ADMIN

def is_gym_owner(user):
    return user.user_type == UserType.GYM_OWNER

def is_admin(user):
    return user.user_type == UserType.STAFF or user.user_type == UserType.GYM_OWNER
