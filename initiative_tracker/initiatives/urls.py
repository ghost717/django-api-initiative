# initiatives/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Zaktualizuj importy
from .views import InitiativeViewSet, TagViewSet, InitiativeImportView

# Utwórz router i zarejestruj nasze viewsety
router = DefaultRouter()
router.register(r'initiatives', InitiativeViewSet, basename='initiative')
router.register(r'tags', TagViewSet, basename='tag')

# URL patterns API są teraz automatycznie generowane przez router.
# Dodaj ścieżkę dla importu
urlpatterns = [
    path('', include(router.urls)),
    path('initiatives/import/', InitiativeImportView.as_view(), name='initiative-import'), # Nowy URL
]