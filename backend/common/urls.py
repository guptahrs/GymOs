from django.urls import path
from common.views.static_lookup import StaticLookupView

urlpatterns = [
    path("lookup/static/", StaticLookupView.as_view()),

]