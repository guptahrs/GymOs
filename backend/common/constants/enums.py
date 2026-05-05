from django.db import models
from common.utills.enum_utils import BaseEnum


class PlanName(models.TextChoices):
    def __new__(cls, value, label, price, duration_days):
        obj = str.__new__(cls, value)
        obj._value_ = value
        obj._label_ = label
        obj.price = price
        obj.duration_days = duration_days
        return obj
    STANDARD     = "standard",     "Standard", 999, 30
    ELITE        = "elite",        "Elite", 2499, 30
    PREMIUM_PLUS = "premium_plus", "Premium Plus", 4999, 30


class FeatureCode(models.TextChoices):
    MEMBERS   = "members",   "Members Management"
    STAFF     = "staff",     "Staff Management"
    DASHBOARD = "dashboard", "Dashboard"
    LEADS     = "leads",     "Leads / Visitors"
    EXPENSES  = "expenses",  "Expenses"
    TRAINERS  = "trainers",  "Trainers"
    WHATSAPP  = "whatsapp",  "WhatsApp Notifications"


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


class SubscriptionAccessType(BaseEnum):
    PAID = "paid"
    TRIAL = "trial"

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

class PaymentMode(BaseEnum):
    CASH = "CASH"
    CARD = "CARD"
    UPI = "UPI"
