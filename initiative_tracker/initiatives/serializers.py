# initiatives/serializers.py
from rest_framework import serializers
from .models import Initiative, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class InitiativeSerializer(serializers.ModelSerializer):
    # Pola *_display do odczytu czytelnych wartości dla pól 'choices'
    entity_status_display = serializers.CharField(source='get_entity_status_display', read_only=True)
    implementation_area_display = serializers.CharField(source='get_implementation_area_display', read_only=True)
    funding_source_display = serializers.CharField(source='get_funding_source_display', read_only=True)

    # Pole 'tags' przyjmuje listę ID przy zapisie (POST/PUT/PATCH)
    # i zwraca listę ID przy odczycie (GET)
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False, # Tagi nie są wymagane
    )

    # Opcjonalnie: Jeśli chcesz zwracać pełne obiekty tagów w GET zamiast ID
    # tags_details = TagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Initiative
        # Lista wszystkich pól modelu, które mają być w API
        fields = [
            'id',
            # Informacje ogólne
            'name',
            'acronym',
            'implementing_entity_name',
            'entity_status', # Do zapisu (oczekuje klucza: 'NGO', 'BUSINESS', etc.)
            'entity_status_display', # Do odczytu (zwraca nazwę: 'Organizacja pozarządowa (NGO)')
            'implementation_area', # Do zapisu
            'implementation_area_display', # Do odczytu
            'location_text',
            'implementing_entity_url',
            # Szczegółowe informacje
            'description',
            'timing',
            'funding_source', # Do zapisu
            'funding_source_display', # Do odczytu
            'url', # Strona WWW inicjatywy
            'tags', # Do zapisu i odczytu (ID)
            # 'tags_details', # Opcjonalne pole do odczytu pełnych tagów
            # Pola automatyczne
            'created_at',
            'updated_at',
        ]
        # Pola tylko do odczytu - te generowane automatycznie przez Django
        # oraz nasze pola *_display
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'entity_status_display',
            'implementation_area_display',
            'funding_source_display',
            # 'tags_details', # Jeśli dodano
        ]
        # Można też określić pola tylko do zapisu, jeśli to potrzebne
        # write_only_fields = [...]

    # Walidacja długości opisu (opcjonalnie)
    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Opis nie może przekraczać 1000 znaków.")
        return value

    # Walidacja, że nazwa jest wymagana (chociaż model już to wymusza)
    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Nazwa inicjatywy jest wymagana.")
        return value

    # Walidacja wymaganych pól choice (model tego nie wymusza, jeśli nie ma `default`)
    def validate_entity_status(self, value):
        if not value:
            raise serializers.ValidationError("Statut podmiotu jest wymagany.")
        # Sprawdzenie czy wartość jest w dozwolonych kluczach jest robione przez ChoiceField
        return value

    def validate_implementation_area(self, value):
        if not value:
            raise serializers.ValidationError("Obszar wdrażania jest wymagany.")
        return value

    def validate_funding_source(self, value):
        if not value:
            raise serializers.ValidationError("Źródło finansowania jest wymagane.")
        return value