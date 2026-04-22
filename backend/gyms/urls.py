from django.urls import path
from gyms.views.gym_view import CreateGymBasicView, AddGymAddressView, AddGymOwnerView, GymListView

urlpatterns = [
    path("create/", CreateGymBasicView.as_view()),
    path("add-address/", AddGymAddressView.as_view()),
    path("add-owner/", AddGymOwnerView.as_view()),
    path("list/", GymListView.as_view())

]