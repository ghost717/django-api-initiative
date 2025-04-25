from django.db import models
from django.contrib.auth.models import User # Możesz użyć tego lub CharField

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Initiative(models.Model):
    # Stałe dla wyborów (choices)
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
    FUNDING_SOURCE_CHOICES = [
        (FUNDING_SOURCE_PUBLIC, 'Publiczne'),
        (FUNDING_SOURCE_PRIVATE, 'Prywatne'),
        # Można dodać 'Mieszane' jeśli potrzeba
    ]

    # Informacje ogólne
    name = models.CharField(max_length=255, verbose_name="Nazwa inicjatywy")
    acronym = models.CharField(max_length=50, blank=True, null=True, verbose_name="Akronim")
    implementing_entity_name = models.CharField(max_length=255, verbose_name="Nazwa podmiotu wdrażającego")
    entity_status = models.CharField(
        max_length=20,
        choices=ENTITY_STATUS_CHOICES,
        verbose_name="Statut podmiotu wdrażającego"
    )
    implementation_area = models.CharField(
        max_length=20,
        choices=IMPLEMENTATION_AREA_CHOICES,
        verbose_name="Obszar wdrażania"
    )
    location_text = models.CharField(max_length=300, blank=True, null=True, verbose_name="Miejsce realizacji (kraj/region/miejscowość)")
    implementing_entity_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Strona WWW podmiotu wdrażającego")

    # Szczegółowe informacje
    description = models.TextField(max_length=1000, blank=True, null=True, verbose_name="Opis inicjatywy (do 1000 znaków)")
    timing = models.CharField(max_length=255, blank=True, null=True, verbose_name="Termin realizacji")
    funding_source = models.CharField(
        max_length=10,
        choices=FUNDING_SOURCE_CHOICES,
        verbose_name="Źródło finansowania"
    )
    url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Strona internetowa inicjatywy")
    tags = models.ManyToManyField(Tag, blank=True, related_name="initiatives", verbose_name="Tagi")

    # Pola automatyczne
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Usunięte pola: person, category, public, funders, place, region, target, thematic_category

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Inicjatywa"
        verbose_name_plural = "Inicjatywy"
        ordering = ['-created_at', 'name']
        
# class Initiative(models.Model):
#     # id - jest dodawane automatycznie przez Django jako AutoField (klucz główny)
#     name = models.CharField(max_length=255, verbose_name="Nazwa inicjatywy")
#     url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL")
#     # person = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Osoba kontaktowa") # Alternatywa
#     person = models.CharField(max_length=255, blank=True, null=True, verbose_name="Osoba kontaktowa")
#     category = models.CharField(max_length=100, blank=True, null=True, verbose_name="Kategoria")
#     timing = models.CharField(max_length=255, blank=True, null=True, verbose_name="Czas realizacji / Timing")
#     public = models.BooleanField(default=True, verbose_name="Publiczna?")
#     funders = models.CharField(max_length=500, blank=True, null=True, verbose_name="Finansujący")
#     place = models.CharField(max_length=255, blank=True, null=True, verbose_name="Miejsce")
#     region = models.CharField(max_length=100, blank=True, null=True, verbose_name="Region")
#     description = models.TextField(blank=True, null=True, verbose_name="Opis")
#     target = models.CharField(max_length=255, blank=True, null=True, verbose_name="Grupa docelowa")
#     tags = models.ManyToManyField(Tag, blank=True, related_name="initiatives", verbose_name="Tagi")
#     thematic_category = models.CharField(max_length=100, blank=True, null=True, verbose_name="Kategoria tematyczna")

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.name

#     class Meta:
#         verbose_name = "Inicjatywa"
#         verbose_name_plural = "Inicjatywy"
#         ordering = ['-created_at']