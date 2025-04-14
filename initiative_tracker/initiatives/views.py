# initiatives/views.py
import csv
import io # Do obsługi strumieni danych w pamięci
import openpyxl # Do obsługi plików XLSX
from django.db import transaction # Do atomowego zapisu wielu obiektów
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser # Do obsługi uploadu plików
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions

from .models import Initiative, Tag
from .serializers import InitiativeSerializer, TagSerializer

# ... (istniejące widoki TagViewSet i InitiativeViewSet) ...
class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tags to be viewed or edited.
    """
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class InitiativeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows initiatives to be viewed or edited.
    """
    queryset = Initiative.objects.all().order_by('-created_at')
    serializer_class = InitiativeSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# Nowy widok do importu
class InitiativeImportView(APIView):
    """
    API endpoint for importing initiatives from CSV or XLSX files.
    Expects a POST request with 'file' in form-data.
    """
    parser_classes = (MultiPartParser, FormParser) # Umożliwia przesyłanie plików
    # permission_classes = [permissions.IsAdminUser] # Opcjonalnie: Zabezpiecz endpoint

    # Zdefiniuj oczekiwane nagłówki kolumn (klucz: nagłówek w pliku, wartość: pole w modelu)
    # Upewnij się, że te nagłówki pasują do Twoich plików CSV/XLSX
    COLUMN_MAPPING = {
        'Nazwa': 'name',
        'URL': 'url',
        'Osoba Kontaktowa': 'person',
        'Kategoria': 'category',
        'Timing': 'timing',
        'Czy Publiczna (Tak/Nie)': 'public', # Specjalna obsługa dla boolean
        'Finansujący': 'funders',
        'Miejsce': 'place',
        'Region': 'region',
        'Opis': 'description',
        'Grupa Docelowa': 'target',
        'Tagi (oddzielone przecinkiem)': 'tags', # Specjalna obsługa dla tagów
        'Kategoria Tematyczna': 'thematic_category',
    }

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({'error': 'Nie znaleziono pliku w żądaniu.'}, status=status.HTTP_400_BAD_REQUEST)

        file_name = file_obj.name.lower()
        imported_count = 0
        skipped_rows = []
        errors = []

        try:
            # Użyj transaction.atomic, aby w razie błędu cofnąć wszystkie zmiany
            with transaction.atomic():
                if file_name.endswith('.csv'):
                    reader = self._read_csv(file_obj)
                elif file_name.endswith('.xlsx'):
                    reader = self._read_xlsx(file_obj)
                else:
                    return Response({'error': 'Nieobsługiwany format pliku. Dozwolone: CSV, XLSX.'}, status=status.HTTP_400_BAD_REQUEST)

                header = next(reader) # Odczytaj nagłówek
                expected_headers = list(self.COLUMN_MAPPING.keys())

                # Prosta walidacja nagłówków (można ulepszyć)
                if not all(h in header for h in expected_headers):
                     missing = [h for h in expected_headers if h not in header]
                     return Response({'error': f'Brakujące wymagane kolumny w pliku: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

                # Mapowanie indeksów kolumn na podstawie nagłówka pliku
                col_indices = {col_name: header.index(col_name) for col_name in expected_headers if col_name in header}


                for i, row in enumerate(reader, start=2): # Start=2 bo nagłówek to wiersz 1
                    initiative_data = {}
                    tags_to_add = []

                    # Mapuj dane z wiersza na pola modelu
                    for header_name, model_field in self.COLUMN_MAPPING.items():
                        try:
                            cell_value = row[col_indices[header_name]].strip() if col_indices[header_name] < len(row) else ''

                            # Konwersje specjalne
                            if model_field == 'public':
                                initiative_data[model_field] = cell_value.lower() == 'tak'
                            elif model_field == 'tags':
                                tag_names = [tag.strip() for tag in cell_value.split(',') if tag.strip()]
                                for tag_name in tag_names:
                                    tag, created = Tag.objects.get_or_create(name=tag_name)
                                    tags_to_add.append(tag)
                            elif cell_value: # Tylko jeśli wartość nie jest pusta
                                initiative_data[model_field] = cell_value
                            else:
                                # Ustaw null dla pól które mogą być null, jeśli komórka jest pusta
                                model_field_obj = Initiative._meta.get_field(model_field)
                                if model_field_obj.null:
                                     initiative_data[model_field] = None

                        except IndexError:
                            # Jeśli wiersz jest krótszy niż oczekiwano
                            skipped_rows.append({'row': i, 'reason': f'Brak danych w kolumnie "{header_name}" lub wiersz jest za krótki.'})
                            initiative_data = None # Oznacz ten wiersz jako błędny
                            break
                        except Exception as e:
                            skipped_rows.append({'row': i, 'reason': f'Błąd przetwarzania kolumny "{header_name}": {e}'})
                            initiative_data = None # Oznacz ten wiersz jako błędny
                            break

                    # Jeśli dane dla wiersza są poprawne, utwórz lub zaktualizuj inicjatywę
                    if initiative_data and 'name' in initiative_data and initiative_data['name']:
                        try:
                            # Tutaj można dodać logikę aktualizacji jeśli inicjatywa o tej nazwie już istnieje
                            # np. initiative, created = Initiative.objects.update_or_create(name=initiative_data['name'], defaults=initiative_data)
                            # Na razie prosty create:
                            initiative = Initiative.objects.create(**initiative_data)
                            if tags_to_add:
                                initiative.tags.set(tags_to_add) # Dodaj tagi
                            imported_count += 1
                        except Exception as e:
                            # Błąd zapisu do bazy (np. naruszenie unikalności, błąd walidacji modelu)
                            skipped_rows.append({'row': i, 'reason': f'Błąd zapisu do bazy: {e}'})
                    elif initiative_data: # Jeśli nie było błędu przetwarzania, ale brakuje nazwy
                         skipped_rows.append({'row': i, 'reason': 'Brak wymaganej nazwy inicjatywy.'})


        except Exception as e:
            # Ogólny błąd przetwarzania pliku
            errors.append(f'Wystąpił błąd podczas przetwarzania pliku: {e}')
            # Transakcja zostanie automatycznie wycofana

        if errors:
             return Response({'errors': errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'message': f'Import zakończony. Dodano {imported_count} inicjatyw.',
                'skipped_rows': skipped_rows
            }, status=status.HTTP_201_CREATED if imported_count > 0 else status.HTTP_200_OK)

    def _read_csv(self, file_obj):
        # Dekoduj plik jako tekst
        decoded_file = io.StringIO(file_obj.read().decode('utf-8')) # Załóż kodowanie UTF-8
        reader = csv.reader(decoded_file)
        return reader

    def _read_xlsx(self, file_obj):
        workbook = openpyxl.load_workbook(file_obj, read_only=True)
        sheet = workbook.active # Odczytaj pierwszy arkusz
        # Zwróć iterator wierszy (każdy wiersz jako lista wartości komórek)
        return ([cell.value if cell.value is not None else '' for cell in row] for row in sheet.iter_rows(values_only=True))