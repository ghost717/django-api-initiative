# initiatives/views.py
import csv
import io # Do obsługi strumieni danych w pamięci
import openpyxl # Do obsługi plików XLSX
from django.db import transaction # Do atomowego zapisu wielu obiektów
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser # Do obsługi uploadu plików
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions

from .models import Initiative, Tag
from .serializers import InitiativeSerializer, TagSerializer

# ... (istniejące widoki TagViewSet i InitiativeViewSet) ...
class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited.
    """
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class InitiativeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows initiatives to be viewed or edited.
    """
    queryset = Initiative.objects.all().order_by('-created_at')
    serializer_class = InitiativeSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Nowy widok do importu
class InitiativeImportView(APIView):
    """
    API endpoint for importing initiatives from CSV or XLSX files.
    Expects a POST request with 'file' in form-data.
    """
