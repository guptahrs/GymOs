from common.models import BaseModel
from django.db import models

class Staff(BaseModel):
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE)
    gym_id = models.UUIDField()
    role = models.CharField(max_length=50)
    address = models.ForeignKey("common.Address", on_delete=models.SET_NULL, null=True, blank=True)
    joining_date = models.DateField(auto_now_add=True)
    salary = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank=True)
    
    
    def __str__(self):
        return self.user.first_name