# initiatives/admin.py
from django.contrib import admin
from .models import Initiative, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Initiative)
class InitiativeAdmin(admin.ModelAdmin):
    list_display = ('name', 'person', 'region', 'public', 'created_at')
    list_filter = ('public', 'region', 'tags', 'created_at')
    search_fields = ('name', 'description', 'person', 'place', 'region', 'funders')
    # Ulepszenie wyświetlania pola ManyToMany
    filter_horizontal = ('tags',) # Wygodniejszy interfejs dla tagów