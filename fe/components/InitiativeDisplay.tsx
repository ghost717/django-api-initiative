// components/InitiativeDisplay.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Importuj useRouter
import InitiativeTable, { Initiative, SortConfig } from './InitiativeTable';
import InitiativeImportForm from './InitiativeImportForm';
// Importuj ikony, jeśli jeszcze nie masz react-icons lub heroicons
// np. import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface InitiativeDisplayProps {
    initialInitiatives: Initiative[];
}

const ITEMS_PER_PAGE = 20; // Ile inicjatyw na stronę

const InitiativeDisplay: React.FC<InitiativeDisplayProps> = ({ initialInitiatives }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null); // Stan sortowania
    const [currentPage, setCurrentPage] = useState(1); // Stan paginacji
    const router = useRouter();

    // Krok 1: Filtrowanie
    const filteredInitiatives = useMemo(() => {
        if (!initialInitiatives) return [];
        if (!searchTerm) return initialInitiatives;

        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerCaseSearchTerm) return initialInitiatives; // Jeśli search term jest pusty po trim()

        return initialInitiatives.filter(initiative =>
            Object.values(initiative).some(value =>
                value !== null && // Sprawdź czy wartość nie jest null
                typeof value === 'string' && // Sprawdź czy jest stringiem
                value.toLowerCase().includes(lowerCaseSearchTerm)
            )
            // Można dodać bardziej specyficzne warunki jeśli potrzeba np. dla tagów
            // || initiative.tags.some(tagId => /* logika mapowania tagId na nazwę i porównanie */)
        );
    }, [initialInitiatives, searchTerm]);

    // Krok 2: Sortowanie (na podstawie przefiltrowanych danych)
    const sortedInitiatives = useMemo(() => {
        let sortableItems = [...filteredInitiatives]; // Kopia przefiltrowanych danych
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                // Używamy '!' bo sprawdziliśmy że sortConfig nie jest null
                const keyA = a[sortConfig!.key!];
                const keyB = b[sortConfig!.key!];

                // Proste porównanie - można rozbudować o localeCompare dla stringów, obsługę nulli itp.
                let comparison = 0;
                if (keyA === null || keyA === undefined) comparison = -1;
                else if (keyB === null || keyB === undefined) comparison = 1;
                else if (keyA < keyB) comparison = -1;
                else if (keyA > keyB) comparison = 1;

                return sortConfig!.direction === 'ascending' ? comparison : comparison * -1;
            });
        }
        return sortableItems;
    }, [filteredInitiatives, sortConfig]);

    // Funkcja do obsługi żądania sortowania (przekazana do tabeli)
    const requestSort = (key: keyof Initiative) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        // Jeśli kliknięto ten sam klucz, zmień kierunek
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Zresetuj paginację po zmianie sortowania
    };

    // Krok 3: Paginacja (na podstawie posortowanych danych)
    const totalPages = Math.ceil(sortedInitiatives.length / ITEMS_PER_PAGE);
    const paginatedInitiatives = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sortedInitiatives.slice(startIndex, endIndex);
    }, [sortedInitiatives, currentPage]);

    // Funkcje do zmiany strony
    const goToNextPage = () => {
        setCurrentPage((page) => Math.min(page + 1, totalPages));
    };
    const goToPreviousPage = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }

    // Generowanie numerów stron (uproszczone)
    const getPageNumbers = () => {
        const delta = 2; // Ile numerów wokół bieżącej strony
        const left = currentPage - delta;
        const right = currentPage + delta + 1;
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];
        let l: number | null = null;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i < right)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i as number;
        }
        return rangeWithDots;
    }

    const handleImportSuccess = () => {
        console.log("Import successful, refreshing data...");
        // router.refresh() ponownie uruchomi pobieranie danych w Server Component (page.tsx)
        // i zaktualizuje UI bez pełnego przeładowania strony.
        router.refresh();
        // Opcjonalnie: resetuj filtry/sortowanie/paginację w komponencie klienckim
        // setSearchTerm('');
        // setSortConfig(null);
        // setCurrentPage(1);
    };

    // Pobierz URL API ze zmiennych środowiskowych (upewnij się, że jest dostępny po stronie klienta)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    return (
        // Szerokość kontenera dla spójności
        <div className="w-full flex flex-col items-center">
            <InitiativeImportForm onImportSuccess={handleImportSuccess} apiUrl={apiUrl || ''} />

            {/* Pasek wyszukiwania */}
            <div className="mb-6 w-full max-w-2xl">
                <input
                    type="text"
                    placeholder="Filtruj inicjatywy..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Zresetuj paginację przy zmianie filtra
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    suppressHydrationWarning={true}
                />
            </div>

            {/* Tabela Inicjatyw - przekazujemy paginowane dane i funkcje sortowania */}
            <InitiativeTable
                initiatives={paginatedInitiatives}
                requestSort={requestSort}
                sortConfig={sortConfig}
            />

            {/* Paginacja */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between w-full px-4">
                    {/* Informacja o wynikach */}
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Pokazano <span className="font-semibold">{paginatedInitiatives.length}</span> z <span className="font-semibold">{sortedInitiatives.length}</span> inicjatyw
                        (Strona <span className="font-semibold">{currentPage}</span> z <span className="font-semibold">{totalPages}</span>)
                    </span>

                    {/* Przyciski nawigacyjne */}
                    <div className="inline-flex rounded-md shadow-sm -space-x-px" role="group">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:disabled:bg-gray-800"
                            aria-label="Poprzednia strona"
                        >
                            {/* Można użyć ikony ChevronLeftIcon */}
                            Poprzednia
                        </button>
                        {/* Dynamiczne numery stron */}
                        {getPageNumbers().map((page, index) => (
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-2 text-sm font-medium border border-gray-300 ${currentPage === page ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={index} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                                    {page}
                                </span>
                            )
                        ))}
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:disabled:bg-gray-800"
                            aria-label="Następna strona"
                        >
                            {/* Można użyć ikony ChevronRightIcon */}
                            Następna
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InitiativeDisplay;