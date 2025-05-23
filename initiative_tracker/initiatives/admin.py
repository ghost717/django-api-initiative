# initiatives/admin.py
from django.contrib import admin
from .models import Initiative, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Initiative)
class InitiativeAdmin(admin.ModelAdmin):
    # Używamy nazw pól z nowego models.py
    list_display = (
        'name',
        'implementing_entity_name',
        'entity_status', # Nazwa pola w modelu
        'implementation_area', # Nazwa pola w modelu
        'funding_source', # Nazwa pola w modelu
        'created_at'
    )
    # Filtrujemy po rzeczywistych polach modelu
    list_filter = (
        'entity_status',
        'implementation_area',
        'funding_source',
        'tags',
        'created_at'
    )
    # Wyszukujemy w odpowiednich polach
    search_fields = (
        'name',
        'acronym',
        'implementing_entity_name',
        'location_text',
        'description'
    )
    filter_horizontal = ('tags',) # Dla wygody edycji tagów

    # Organizacja formularza w panelu admina
    fieldsets = (
        ('Informacje Ogólne', {
            # Używamy nazw pól z nowego models.py
            'fields': ('name', 'acronym', 'implementing_entity_name', 'entity_status', 'implementation_area', 'location_text', 'implementing_entity_url')
        }),
        ('Szczegółowe Informacje', {
            # Używamy nazw pól z nowego models.py
            'fields': ('description', 'timing', 'funding_source', 'url', 'tags')
        }),
    )
    # Nie definiujemy 'fields', jeśli używamy 'fieldsets'

    # Można dodać pola tylko do odczytu w adminie (np. daty)
    readonly_fields = ('created_at', 'updated_at')