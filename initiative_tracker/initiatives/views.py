from django.shortcuts import render

from rest_framework import viewsets, permissions
from .models import Initiative, Tag
from .serializers import InitiativeSerializer, TagSerializer

class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited.
    """
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Przykładowe uprawnienia

class InitiativeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows initiatives to be viewed or edited.
    """
    queryset = Initiative.objects.all().order_by('-created_at')
    serializer_class = InitiativeSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Przykładowe uprawnienia
    # Można dodać filtrowanie, paginację itp.
    # filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    # search_fields = ['name', 'description', 'region', 'place', 'tags__name']
    # ordering_fields = ['name', 'created_at', 'region']