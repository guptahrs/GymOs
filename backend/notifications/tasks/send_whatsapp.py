from celery import shared_task
from integrations.whatsapp.client import WhatsAppClient
from integrations.whatsapp.service import WhatsAppService


@shared_task(bind=True, max_retries=3)
def send_whatsapp_task(self, gym_id, phone, template_name, params, log_id):
    try:
        gym = get_gym(gym_id)

        client = WhatsAppClient(
            token=gym.whatsapp_token,
            phone_number_id=gym.phone_number_id,
        )

        payload = WhatsAppService.build_template_payload(
            to=phone,
            template_name=template_name,
            params=params,
        )

        response = WhatsAppService.send(client, payload)

        update_log_success(log_id, response)

    except Exception as exc:
        update_log_retry(log_id)

        raise self.retry(exc=exc, countdown=60)