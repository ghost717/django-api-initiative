# initiatives/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InitiativeViewSet, TagViewSet

# Utwórz router i zarejestruj nasze viewsety
router = DefaultRouter()
router.register(r'initiatives', InitiativeViewSet, basename='initiative')
router.register(r'tags', TagViewSet, basename='tag')

# URL patterns API są teraz automatycznie generowane przez router.
urlpatterns = [
    path('', include(router.urls)),
]