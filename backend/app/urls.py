from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    path('admin/', admin.site.urls),

    #Accounts app urls
    path("api/auth/", include("accounts.urls")),
    
    #Gyms app urls
    path("api/gyms/", include("gyms.urls")),
    
    #Subscriptions app urls
    path("api/subscriptions/", include("subscriptions.urls")),
    
    #Staff app urls
    path("api/staff/", include("staff.urls")),
    
    #Members app urls
    path("api/members/", include("members.urls")),
    
    #Expenses app urls
    path("api/expenses/", include("expenses.urls")),
    
    #Dashboard app urls
    path("api/dashboard/", include("dashboard.urls")),
    
    #Notifications app urls
    path("api/notifications/", include("notifications.urls")),
    
    #subscriptions app urls
    path("api/subscriptions/", include("subscriptions.urls")),

    #common app urls
    path("api/common/", include("common.urls")),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
]