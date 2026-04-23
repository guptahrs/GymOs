from common.utills.enum_utils import BaseEnum

class ResponseStatus(BaseEnum):
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

class UserType(BaseEnum):
    SUPER_ADMIN = "super_admin"
    GYM_OWNER = "gym_owner"
    STAFF = "staff"
    LEAD = "lead"
    MEMBER = "member"
    NORMAL_USER = "normal_user"

class SubscriptionStatus(BaseEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class Gender(BaseEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class OnboardingStep(BaseEnum):
    BASIC = "basic"
    ADDRESS = "address"
    SUBSCRIPTION = "subscription"
    COMPLETED = "completed"

class PaymentStatus(BaseEnum):
    PAID = "paid"
    DUE = "due"
    
class Gender(BaseEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class NotificationStatus(BaseEnum):

        PENDING = "PENDING"
        SUCCESS = "SUCCESS"
        FAILED = "FAILED"
    
class PaymentStatus(BaseEnum):
    PAID = "PAID"
    DUE = "DUE"
    PARTIAL = "PARTIAL"
    OVERDUE = "OVERDUE"


class ShiftChoices(BaseEnum):
    MORNING = "MORNING"
    EVENING = "EVENING"
    BOTH = "BOTH"
