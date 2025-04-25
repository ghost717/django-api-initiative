# initiatives/serializers.py
from rest_framework import serializers
from .models import Initiative, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

# Wymagany jest serializers.ChoiceField, poprawiam powyżej
class InitiativeSerializer(serializers.ModelSerializer):
    # Aby w odpowiedzi GET widzieć nazwy zamiast wartości kluczy dla pól choices
    entity_status_display = serializers.CharField(source='get_entity_status_display', read_only=True)
    implementation_area_display = serializers.CharField(source='get_implementation_area_display', read_only=True)
    funding_source_display = serializers.CharField(source='get_funding_source_display', read_only=True)

    # Tagi - tak jak poprzednio, przyjmuje listę ID przy zapisie
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
        # Nie ustawiamy write_only, bo chcemy je widzieć w GET (jako ID)
    )
    # Można dodać osobne pole do wyświetlania nazw tagów, jeśli jest potrzebne
    # tags_details = TagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Initiative
        fields = [
            'id',
            # Informacje ogólne
            'name',
            'acronym',
            'implementing_entity_name',
            'entity_status', # To pole teraz będzie używane do zapisu (przyjmuje klucz)
            'entity_status_display', # To pole do odczytu (wyświetla nazwę)
            'implementation_area', # Do zapisu
            'implementation_area_display', # Do odczytu
            'location_text',
            'implementing_entity_url',
            # Szczegółowe informacje
            'description',
            'timing',
            'funding_source', # Do zapisu
            'funding_source_display', # Do odczytu
            'url',
            'tags', # Przyjmuje ID przy zapisie, zwraca ID przy odczycie
            # 'tags_details', # Opcjonalne pole do odczytu zagnieżdżonych tagów
            # Pola automatyczne
            'created_at',
            'updated_at',
        ]
        # Pola tylko do odczytu - tylko te generowane automatycznie + display
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'entity_status_display', 'implementation_area_display', 'funding_source_display',
            # 'tags_details', # Jeśli dodano
            ]

    # Walidacja długości opisu
    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Opis nie może przekraczać 1000 znaków.")
        return value


# class InitiativeSerializer(serializers.ModelSerializer):
#     # Możemy zagnieździć serializator Tagów lub użyć PrimaryKeyRelatedField
#     # Tutaj użyjemy PrimaryKeyRelatedField dla uproszczenia zapisu,
#     # ale w odpowiedzi GET tagi mogą być reprezentowane przez ID.
#     # Aby pokazać nazwy tagów w odpowiedzi GET, można dodać:
#     # tags = TagSerializer(many=True, read_only=True) # lub StringRelatedField
#     tags = serializers.PrimaryKeyRelatedField(
#         queryset=Tag.objects.all(),
#         many=True,
#         required=False # Tagi nie są wymagane
#     )
#     # Można też jawnie zdefiniować pole 'tags' dla odczytu inaczej niż dla zapisu.

#     class Meta:
#         model = Initiative
#         # Lista pól, które mają być uwzględnione w API
#         fields = [
#             'id',
#             'name',
#             'url',
#             'person',
#             'category',
#             'timing',
#             'public',
#             'funders',
#             'place',
#             'region',
#             'description',
#             'target',
#             'tags', # To pole będzie oczekiwać listy ID tagów przy tworzeniu/aktualizacji
#             'thematic_category',
#             'created_at',
#             'updated_at',
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at'] # Pola tylko do odczytu

#     # Opcjonalnie: Obsługa tworzenia tagów "w locie", jeśli nie istnieją
#     # def create(self, validated_data):
#     #     tags_data = validated_data.pop('tags', []) # Pobierz dane tagów (listę obiektów Tag)
#     #     initiative = Initiative.objects.create(**validated_data)
#     #     initiative.tags.set(tags_data) # Ustaw relację ManyToMany
#     #     return initiative

#     # def update(self, instance, validated_data):
#     #     tags_data = validated_data.pop('tags', None) # Pobierz dane tagów
#     #     # Aktualizuj pozostałe pola
#     #     for attr, value in validated_data.items():
#     #         setattr(instance, attr, value)
#     #     instance.save()

#     #     # Aktualizuj tagi, jeśli zostały podane
#     #     if tags_data is not None:
#     #         instance.tags.set(tags_data)

#     #     return instance