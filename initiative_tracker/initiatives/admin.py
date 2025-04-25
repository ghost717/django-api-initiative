# initiatives/admin.py
from django.contrib import admin
from .models import Initiative, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Initiative)
class InitiativeAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'implementing_entity_name',
        'entity_status',
        'implementation_area',
        'funding_source',
        'created_at'
    )
    list_filter = (
        'entity_status',
        'implementation_area',
        'funding_source',
        'tags',
        'created_at'
    )
    search_fields = (
        'name',
        'acronym',
        'implementing_entity_name',
        'location_text',
        'description'
    )
    filter_horizontal = ('tags',) # Wygodniejszy interfejs dla tagów
    # Można dodać fieldsets dla lepszej organizacji w formularzu admina
    fieldsets = (
        ('Informacje Ogólne', {
            'fields': ('name', 'acronym', 'implementing_entity_name', 'entity_status', 'implementation_area', 'location_text', 'implementing_entity_url')
        }),
        ('Szczegółowe Informacje', {
            'fields': ('description', 'timing', 'funding_source', 'url', 'tags')
        }),
    )
    
# @admin.register(Initiative)
# class InitiativeAdmin(admin.ModelAdmin):
#     list_display = ('name', 'person', 'region', 'public', 'created_at')
#     list_filter = ('public', 'region', 'tags', 'created_at')
#     search_fields = ('name', 'description', 'person', 'place', 'region', 'funders')
#     # Ulepszenie wyświetlania pola ManyToMany
#     filter_horizontal = ('tags',) # Wygodniejszy interfejs dla tagów