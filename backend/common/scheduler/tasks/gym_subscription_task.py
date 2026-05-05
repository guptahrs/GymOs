from django.utils import timezone
from common.scheduler.base import BaseScheduler
from subscriptions.models import Subscription
from common.constants.enums import SubscriptionStatus


class GymSubscriptionExpiryTask(BaseScheduler):
    name        = "gym_subscription_expiry"
    description = "Expires gym subscriptions whose end date has passed"

    def run(self) -> dict:
        today = timezone.now().date()

        # Find all active gym subscriptions that have expired
        expired_subs = Subscription.objects.filter(
            status=SubscriptionStatus.ACTIVE,
            end_date__lt=today,
        )

        expired_count = 0
        notified_count = 0

        for sub in expired_subs:
            # Mark as expired
            sub.status = SubscriptionStatus.EXPIRED
            sub.save(update_fields=["status"])
            expired_count += 1

            # Optional: notify gym owner
            try:
                self._notify_owner(sub)
                notified_count += 1
            except Exception:
                pass  # don't break the loop if notification fails

        return {
            "expired":  expired_count,
            "notified": notified_count,
            "date":     str(today),
        }

    def _notify_owner(self, subscription):
        """
        Send notification to gym owner.
        Hook in your WhatsApp / email service here.
        Example:
            send_whatsapp(subscription.gym.owner.phone, "Your plan has expired...")
        """
        pass  # TODO: plug in notification service