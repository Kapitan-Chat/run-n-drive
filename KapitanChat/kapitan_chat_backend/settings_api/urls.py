from django.urls import path, include
from rest_framework import routers
from .views import UserSettingsViewSet

r = routers.DefaultRouter()
r.register('', UserSettingsViewSet)

urlpatterns = [
    path('', include(r.urls))
]
