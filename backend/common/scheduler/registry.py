from common.scheduler.tasks.gym_subscription_task import GymSubscriptionExpiryTask
from common.scheduler.tasks.member_subscription_task import MemberSubscriptionExpiryTask

# ── Register all tasks here ──
# Add any new task class to this list and it will auto-run with the scheduler
REGISTERED_TASKS = [
    GymSubscriptionExpiryTask,
    MemberSubscriptionExpiryTask,
]