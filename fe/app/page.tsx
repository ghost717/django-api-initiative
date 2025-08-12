// app/page.tsx
import InitiativeDisplay from '@/components/InitiativeDisplay';
import { Initiative } from '@/components/InitiativeTable';
import Image from 'next/image'; // Krok 1: Import komponentu Image

// Funkcja getInitiatives pozostaje bez zmian...
async function getInitiatives(): Promise<Initiative[] | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        console.error('Błąd: Zmienna środowiskowa NEXT_PUBLIC_API_URL nie jest ustawiona.');
        return null;
    }

    try {
        const response = await fetch(`${apiUrl}/initiatives/`, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Błąd HTTP! Status: ${response.status}`);
        }

        const data: Initiative[] = await response.json();
        return data;
    } catch (error) {
        console.error('Nie udało się pobrać inicjatyw:', error);
        return null;
    }
}

export default async function Home() {
    const initiatives = await getInitiatives();

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 md:p-12 lg:p-16 bg-gray-50">
            <main className="w-full max-w-7xl flex flex-col items-center gap-8">

                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-y-6 md:gap-x-12 mb-4 w-full">
                    <Image
                        src="/logo_debuting.png"
                        alt="Logo projektu DEBUTING"
                        width={300}
                        height={150}
                        priority
                        className="h-16 w-auto" // Wysokość 64px
                    />
                    <Image
                        src="/logo_umwp.png"
                        alt="Logo Urzędu Marszałkowskiego Województwa Pomorskiego"
                        width={300}
                        height={150}
                        priority
                        className="h-14 w-auto" // Wysokość 56px (poprawiona z nieistniejącej h-15)
                    />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-4">
                    Lista Inicjatyw
                </h1>

                {initiatives === null ? (
                    <p className="text-center text-red-500">
                        Nie udało się załadować danych inicjatyw. Sprawdź połączenie z API lub spróbuj ponownie później.
                    </p>
                ) : initiatives.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">
                        Brak inicjatyw do wyświetlenia.
                    </p>
                    ) : (
                    <InitiativeDisplay initialInitiatives={initiatives} />
                )}
            </main>
        </div>
    );
}