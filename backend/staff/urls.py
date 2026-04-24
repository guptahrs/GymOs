from django.urls import path
from staff.views.staff_view import StaffDetailView, StaffListCreateView
from staff.views.training_type_view import TrainingTypeDetailView, TrainingTypeListCreateView
from staff.views.trainer_view import TrainerListCreateView, TrainerDetailView


urlpatterns = [
    path("", StaffListCreateView.as_view()),
    path("<int:staff_id>/", StaffDetailView.as_view()),
    path("training-types/", TrainingTypeListCreateView.as_view()),
    path("training-types/<uuid:training_type_id>/", TrainingTypeDetailView.as_view()),
    path("trainers/", TrainerListCreateView.as_view()),
    path("trainers/<uuid:trainer_id>/", TrainerDetailView.as_view()),
]
