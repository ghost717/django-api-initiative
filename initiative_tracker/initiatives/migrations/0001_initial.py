# Generated by Django 5.1.7 on 2025-04-13 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Initiative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Nazwa inicjatywy')),
                ('url', models.URLField(blank=True, max_length=500, null=True, verbose_name='URL')),
                ('person', models.CharField(blank=True, max_length=255, null=True, verbose_name='Osoba kontaktowa')),
                ('category', models.CharField(blank=True, max_length=100, null=True, verbose_name='Kategoria')),
                ('timing', models.CharField(blank=True, max_length=255, null=True, verbose_name='Czas realizacji / Timing')),
                ('public', models.BooleanField(default=True, verbose_name='Publiczna?')),
                ('funders', models.CharField(blank=True, max_length=500, null=True, verbose_name='Finansujący')),
                ('place', models.CharField(blank=True, max_length=255, null=True, verbose_name='Miejsce')),
                ('region', models.CharField(blank=True, max_length=100, null=True, verbose_name='Region')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Opis')),
                ('target', models.CharField(blank=True, max_length=255, null=True, verbose_name='Grupa docelowa')),
                ('thematic_category', models.CharField(blank=True, max_length=100, null=True, verbose_name='Kategoria tematyczna')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('tags', models.ManyToManyField(blank=True, related_name='initiatives', to='initiatives.tag', verbose_name='Tagi')),
            ],
            options={
                'verbose_name': 'Inicjatywa',
                'verbose_name_plural': 'Inicjatywy',
                'ordering': ['-created_at'],
            },
        ),
    ]
