// app/page.tsx
import InitiativeDisplay from '@/components/InitiativeDisplay'; // Ścieżka do komponentu klienckiego
import { Initiative } from '@/components/InitiativeTable'; // Importuj typ Initiative

// Funkcja do pobierania danych - może być w osobnym pliku lib/api.ts
async function getInitiatives(): Promise<Initiative[] | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        console.error('Błąd: Zmienna środowiskowa NEXT_PUBLIC_API_URL nie jest ustawiona.');
        return null; // Zwróć null w przypadku braku URL
    }

    try {
        // Używamy { cache: 'no-store' } aby dane były zawsze świeże przy każdym żądaniu strony.
        // Możesz dostosować strategię cache'owania Next.js wg potrzeb (np. revalidate).
        const response = await fetch(`${apiUrl}/initiatives/`, { cache: 'no-store' });

        if (!response.ok) {
            // Rzucenie błędu spowoduje wyświetlenie najbliższego error.tsx lub domyślnej strony błędu Next.js
            throw new Error(`Błąd HTTP! Status: ${response.status}`);
        }

        const data: Initiative[] = await response.json();
        return data;
    } catch (error) {
        console.error('Nie udało się pobrać inicjatyw:', error);
        // W środowisku produkcyjnym możesz chcieć zalogować ten błąd inaczej
        // Rzucenie błędu tutaj też pokaże stronę błędu.
        // Alternatywnie, zwróć null i obsłuż to w komponencie poniżej.
        // throw error; // Rzuć błąd dalej, aby Next.js go obsłużył (np. przez error.js)
        return null; // Lub zwróć null i wyświetl komunikat o błędzie w komponencie
    }
}

// Komponent strony jest teraz asynchroniczny
export default async function Home() {
    // Pobierz dane na serwerze
    const initiatives = await getInitiatives();

    // Zastępujemy domyślną treść Next.js naszą strukturą
    return (
        // Dostosuj główny kontener, aby lepiej pasował do tabeli
        // Usunięto grid i specyficzne dla dema stylowanie
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 md:p-12 lg:p-16 bg-gray-50 dark:bg-gray-900">
            <main className="w-full max-w-7xl flex flex-col items-center gap-8"> {/* Ustaw max szerokość i wyśrodkuj */}
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-8 mb-4">
                    Lista Inicjatyw
                </h1>

                {/* Warunkowe renderowanie */}
                {initiatives === null ? (
                    // Wyświetl błąd, jeśli dane nie zostały pobrane
                    <p className="text-center text-red-500">
                        Nie udało się załadować danych inicjatyw. Sprawdź połączenie z API lub spróbuj ponownie później.
                    </p>
                ) : initiatives.length === 0 ? (
                    // Wyświetl komunikat, jeśli API zwróciło pustą listę
                    <p className="text-center text-gray-500 mt-4">
                        Brak inicjatyw do wyświetlenia.
                    </p>
                ) : (
                    // Przekaż pobrane dane do komponentu klienckiego
                    <InitiativeDisplay initialInitiatives={initiatives} />
                )}
            </main>
            {/* Możesz dodać stopkę lub inne elementy, jeśli potrzebujesz */}
            {/* <footer className="mt-16 text-center text-gray-500 text-sm">
         Stopka aplikacji
       </footer> */}
        </div>
    );
}