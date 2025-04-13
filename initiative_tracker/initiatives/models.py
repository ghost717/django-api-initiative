from django.db import models
from django.contrib.auth.models import User # Możesz użyć tego lub CharField

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Initiative(models.Model):
    # id - jest dodawane automatycznie przez Django jako AutoField (klucz główny)
    name = models.CharField(max_length=255, verbose_name="Nazwa inicjatywy")
    url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL")
    # person = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Osoba kontaktowa") # Alternatywa
    person = models.CharField(max_length=255, blank=True, null=True, verbose_name="Osoba kontaktowa")
    category = models.CharField(max_length=100, blank=True, null=True, verbose_name="Kategoria")
    timing = models.CharField(max_length=255, blank=True, null=True, verbose_name="Czas realizacji / Timing")
    public = models.BooleanField(default=True, verbose_name="Publiczna?")
    funders = models.CharField(max_length=500, blank=True, null=True, verbose_name="Finansujący")
    place = models.CharField(max_length=255, blank=True, null=True, verbose_name="Miejsce")
    region = models.CharField(max_length=100, blank=True, null=True, verbose_name="Region")
    description = models.TextField(blank=True, null=True, verbose_name="Opis")
    target = models.CharField(max_length=255, blank=True, null=True, verbose_name="Grupa docelowa")
    tags = models.ManyToManyField(Tag, blank=True, related_name="initiatives", verbose_name="Tagi")
    thematic_category = models.CharField(max_length=100, blank=True, null=True, verbose_name="Kategoria tematyczna")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Inicjatywa"
        verbose_name_plural = "Inicjatywy"
        ordering = ['-created_at']