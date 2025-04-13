# initiatives/serializers.py
from rest_framework import serializers
from .models import Initiative, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class InitiativeSerializer(serializers.ModelSerializer):
    # Możemy zagnieździć serializator Tagów lub użyć PrimaryKeyRelatedField
    # Tutaj użyjemy PrimaryKeyRelatedField dla uproszczenia zapisu,
    # ale w odpowiedzi GET tagi mogą być reprezentowane przez ID.
    # Aby pokazać nazwy tagów w odpowiedzi GET, można dodać:
    # tags = TagSerializer(many=True, read_only=True) # lub StringRelatedField
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False # Tagi nie są wymagane
    )
    # Można też jawnie zdefiniować pole 'tags' dla odczytu inaczej niż dla zapisu.

    class Meta:
        model = Initiative
        # Lista pól, które mają być uwzględnione w API
        fields = [
            'id',
            'name',
            'url',
            'person',
            'category',
            'timing',
            'public',
            'funders',
            'place',
            'region',
            'description',
            'target',
            'tags', # To pole będzie oczekiwać listy ID tagów przy tworzeniu/aktualizacji
            'thematic_category',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] # Pola tylko do odczytu

    # Opcjonalnie: Obsługa tworzenia tagów "w locie", jeśli nie istnieją
    # def create(self, validated_data):
    #     tags_data = validated_data.pop('tags', []) # Pobierz dane tagów (listę obiektów Tag)
    #     initiative = Initiative.objects.create(**validated_data)
    #     initiative.tags.set(tags_data) # Ustaw relację ManyToMany
    #     return initiative

    # def update(self, instance, validated_data):
    #     tags_data = validated_data.pop('tags', None) # Pobierz dane tagów
    #     # Aktualizuj pozostałe pola
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     instance.save()

    #     # Aktualizuj tagi, jeśli zostały podane
    #     if tags_data is not None:
    #         instance.tags.set(tags_data)

    #     return instance