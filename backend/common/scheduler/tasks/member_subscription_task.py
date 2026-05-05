from django.utils import timezone
from common.constants.enums import SubscriptionStatus
from common.scheduler.base import BaseScheduler


class MemberSubscriptionExpiryTask(BaseScheduler):
    name        = "member_subscription_expiry"
    description = "Expires gym member subscriptions whose end date has passed"

    def run(self) -> dict:
        today = timezone.now().date()

        # Import here to avoid circular imports
        from members.models import MemberSubscription

        expired = MemberSubscription.objects.filter(
            status=SubscriptionStatus.ACTIVE,
            end_date__lt=today,
        )

        expired_count  = 0
        notified_count = 0

        for sub in expired:
            sub.status = SubscriptionStatus.EXPIRED
            sub.save(update_fields=["status"])
            expired_count += 1

            try:
                self._notify_member(sub)
                notified_count += 1
            except Exception:
                pass

        return {
            "expired":  expired_count,
            "notified": notified_count,
            "date":     str(today),
        }

    def _notify_member(self, subscription):
        """
        Hook in WhatsApp / SMS / email here.
        Example:
            send_whatsapp(subscription.member.phone, "Your membership expired...")
        """
        pass  # TODO: plug in notification service