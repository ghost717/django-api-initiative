# initiatives/models.py
from django.db import models
# Usunięto import User

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Initiative(models.Model):
    # --- Stałe dla wyborów (choices) ---
    ENTITY_STATUS_NGO = 'NGO'
    ENTITY_STATUS_BUSINESS = 'BUSINESS'
    ENTITY_STATUS_UNIVERSITY = 'UNIVERSITY'
    ENTITY_STATUS_LOCAL_GOVT = 'LOCAL_GOVT'
    ENTITY_STATUS_OTHER = 'OTHER'
    ENTITY_STATUS_CHOICES = [
        (ENTITY_STATUS_NGO, 'Organizacja pozarządowa (NGO)'),
        (ENTITY_STATUS_BUSINESS, 'Przedsiębiorstwo'),
        (ENTITY_STATUS_UNIVERSITY, 'Uczelnia'),
        (ENTITY_STATUS_LOCAL_GOVT, 'Jednostka samorządu terytorialnego (JST)'),
        (ENTITY_STATUS_OTHER, 'Inne'),
    ]

    IMPLEMENTATION_AREA_INTERNATIONAL = 'INTERNATIONAL'
    IMPLEMENTATION_AREA_NATIONAL = 'NATIONAL'
    IMPLEMENTATION_AREA_REGIONAL = 'REGIONAL'
    IMPLEMENTATION_AREA_LOCAL = 'LOCAL'
    IMPLEMENTATION_AREA_CHOICES = [
        (IMPLEMENTATION_AREA_INTERNATIONAL, 'Międzynarodowy'),
        (IMPLEMENTATION_AREA_NATIONAL, 'Krajowy'),
        (IMPLEMENTATION_AREA_REGIONAL, 'Regionalny'),
        (IMPLEMENTATION_AREA_LOCAL, 'Lokalny'),
    ]

    FUNDING_SOURCE_PUBLIC = 'PUBLIC'
    FUNDING_SOURCE_PRIVATE = 'PRIVATE'
    # Można dodać MIXED jeśli potrzeba
    # FUNDING_SOURCE_MIXED = 'MIXED'
    FUNDING_SOURCE_CHOICES = [
        (FUNDING_SOURCE_PUBLIC, 'Publiczne'),
        (FUNDING_SOURCE_PRIVATE, 'Prywatne'),
        # (FUNDING_SOURCE_MIXED, 'Mieszane'),
    ]

    # --- Informacje ogólne ---
    name = models.CharField(max_length=255, verbose_name="Nazwa inicjatywy")
    acronym = models.CharField(max_length=50, blank=True, null=True, verbose_name="Akronim")
    implementing_entity_name = models.CharField(max_length=255, verbose_name="Nazwa podmiotu wdrażającego")
    entity_status = models.CharField(
        max_length=20,
        choices=ENTITY_STATUS_CHOICES,
        verbose_name="Statut podmiotu wdrażającego",
        # Można dodać default, np. default=ENTITY_STATUS_NGO
    )
    implementation_area = models.CharField(
        max_length=20,
        choices=IMPLEMENTATION_AREA_CHOICES,
        verbose_name="Obszar wdrażania",
        # Można dodać default, np. default=IMPLEMENTATION_AREA_LOCAL
    )
    location_text = models.CharField(max_length=300, blank=True, null=True, verbose_name="Miejsce realizacji (kraj/region/miejscowość)")
    implementing_entity_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Strona WWW podmiotu wdrażającego")

    # --- Szczegółowe informacje ---
    description = models.TextField(max_length=1000, blank=True, null=True, verbose_name="Opis inicjatywy (do 1000 znaków)")
    timing = models.CharField(max_length=255, blank=True, null=True, verbose_name="Termin realizacji")
    funding_source = models.CharField(
        max_length=10,
        choices=FUNDING_SOURCE_CHOICES,
        verbose_name="Źródło finansowania",
        # Można dodać default, np. default=FUNDING_SOURCE_PUBLIC
    )
    # To jest strona samej inicjatywy (nie podmiotu)
    url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Strona internetowa inicjatywy")
    tags = models.ManyToManyField(Tag, blank=True, related_name="initiatives", verbose_name="Tagi")

    # --- Pola automatyczne ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- Pola usunięte zgodnie z nowymi wytycznymi ---
    # person, category, public, funders, place, region, target, thematic_category

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Inicjatywa"
        verbose_name_plural = "Inicjatywy"
        ordering = ['-created_at', 'name']