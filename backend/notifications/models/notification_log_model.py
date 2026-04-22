
from backend.common import models
from backend.common.models import BaseModel
from backend.common.constants.enums import NotificationStatus

class NotificationLog(BaseModel):
   

    member = models.ForeignKey("members.Member", on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=NotificationStatus.choices())
    response = models.JSONField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)