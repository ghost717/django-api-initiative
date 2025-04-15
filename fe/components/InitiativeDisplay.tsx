// components/InitiativeDisplay.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import InitiativeTable, { Initiative, SortConfig } from './InitiativeTable';
import InitiativeImportForm from './InitiativeImportForm';
import InitiativeModal, { ApiTag } from './InitiativeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface InitiativeDisplayProps {
    initialInitiatives: Initiative[]; // Dane inicjalne z serwera
}

const ITEMS_PER_PAGE = 10; // Liczba inicjatyw na stronę

const InitiativeDisplay: React.FC<InitiativeDisplayProps> = ({ initialInitiatives }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Pobierz URL API

    // Stany dla modali i operacji API
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isLoading, setIsLoading] = useState(false); // Ogólny stan ładowania API
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);

    // Stan dla dostępnych tagów
    const [availableTags, setAvailableTags] = useState<ApiTag[]>([]);

    // --- Memoizacja dla filtrowania, sortowania, paginacji ---

    const filteredInitiatives = useMemo(() => {
        if (!initialInitiatives) return [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerCaseSearchTerm) return initialInitiatives;

        return initialInitiatives.filter(initiative =>
            // Przeszukuj wszystkie pola tekstowe (uproszczone)
            Object.values(initiative).some(value =>
                value !== null && typeof value === 'string' && value.toLowerCase().includes(lowerCaseSearchTerm)
            )
            // Można dodać bardziej szczegółowe wyszukiwanie np. po nazwach tagów, jeśli są dostępne
        );
    }, [initialInitiatives, searchTerm]);

    const sortedInitiatives = useMemo(() => {
        let sortableItems = [...filteredInitiatives];
        if (sortConfig !== null && sortConfig.key) {
            sortableItems.sort((a, b) => {
                const keyA = a[sortConfig!.key!];
                const keyB = b[sortConfig!.key!];

                let comparison = 0;
                // Proste porównanie - można rozbudować (np. localeCompare dla stringów)
                if (keyA === null || keyA === undefined) comparison = -1; // Nulls first
                else if (keyB === null || keyB === undefined) comparison = 1;
                else if (keyA < keyB) comparison = -1;
                else if (keyA > keyB) comparison = 1;

                return sortConfig!.direction === 'ascending' ? comparison : comparison * -1;
            });
        }
        return sortableItems;
    }, [filteredInitiatives, sortConfig]);

    // Funkcja do obsługi żądania sortowania
    const requestSort = useCallback((key: keyof Initiative) => {
         let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
         setCurrentPage(1); // Resetuj paginację przy zmianie sortowania
     }, [sortConfig]); // Zależność od sortConfig

    const totalPages = Math.ceil(sortedInitiatives.length / ITEMS_PER_PAGE);

    const paginatedInitiatives = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sortedInitiatives.slice(startIndex, endIndex);
    }, [sortedInitiatives, currentPage]);

    // --- Obsługa paginacji ---
    const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }
    // Funkcja generująca numery stron (można ulepszyć dla wielu stron)
    const getPageNumbers = useCallback(() => {
        const delta = 1;
        const range = [];
        const rangeWithDots: (number | string)[] = [];
        let l: number | null = null;

        range.push(1);
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (totalPages > 1) range.push(totalPages);


        for (let i of range) {
            if (l !== null) {
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l > 2) rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    }, [currentPage, totalPages]);


    // --- Pobieranie tagów z API ---
    useEffect(() => {
        const fetchTags = async () => {
            if (!apiUrl) {
                console.error("API URL nie jest skonfigurowany.");
                return;
            }
            try {
                setIsLoading(true); // Pokaż ładowanie przy pobieraniu tagów
                const response = await fetch(`${apiUrl}/tags/`);
                if (!response.ok) throw new Error('Nie udało się pobrać tagów');
                const data: ApiTag[] = await response.json();
                setAvailableTags(data);
                setApiError(null); // Wyczyść poprzednie błędy
            } catch (error) {
                console.error("Błąd pobierania tagów:", error);
                setApiError("Nie udało się załadować listy tagów. Sprawdź połączenie z API.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTags();
    }, [apiUrl]);

    // --- Funkcje pomocnicze i handlery dla CRUD ---

    // Funkcja do odświeżania danych i resetowania komunikatów
    const refreshDataAndClearMessages = useCallback(() => {
        router.refresh(); // Odśwież dane z serwera używając Next.js router
        // Opcjonalne opóźnienie czyszczenia komunikatu sukcesu
        setTimeout(() => setApiSuccess(null), 4000);
        setApiError(null); // Wyczyść błąd od razu
        setIsModalOpen(false); // Zamknij modale
        setIsDeleteModalOpen(false);
        setSelectedInitiative(null); // Wyczyść zaznaczenie
    }, [router]);

    // Czyszczenie komunikatów przy zmianie filtra lub strony
    useEffect(() => {
        setApiError(null);
        setApiSuccess(null);
    }, [searchTerm, currentPage]);


    // Funkcje otwierające modale
    const handleAddClick = () => {
        setSelectedInitiative(null);
        setModalMode('add');
        setApiError(null);
        setApiSuccess(null);
        setIsModalOpen(true);
    };

    const handleEditClick = useCallback((initiative: Initiative) => {
        setSelectedInitiative(initiative);
        setModalMode('edit');
        setApiError(null);
        setApiSuccess(null);
        setIsModalOpen(true);
    }, []); // Pusta tablica zależności, bo funkcja nie zależy od stanu komponentu

    const handleDeleteClick = useCallback((initiative: Initiative) => {
        setSelectedInitiative(initiative);
        setApiError(null);
        setApiSuccess(null);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        // Nie czyścimy selectedInitiative tutaj, aby modal mógł go jeszcze użyć podczas zamykania animacji
        // Zostanie wyczyszczony w refreshDataAndClearMessages
    };

    // Funkcja obsługująca wysłanie formularza dodawania/edycji
    const handleModalSubmit = useCallback(async (formData: Partial<Initiative>) => {
        if (!apiUrl) {
            setApiError("Błąd konfiguracji: Brak URL API.");
            return;
        }
        setIsLoading(true);
        setApiError(null);
        setApiSuccess(null);

        const url = modalMode === 'add'
            ? `${apiUrl}/initiatives/`
            : `${apiUrl}/initiatives/${selectedInitiative?.id}/`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        // Przygotuj payload, upewniając się, że tagi to tablica ID
        const payload = {
            ...formData,
            tags: formData.tags || [], // Upewnij się, że tags jest tablicą
        };
        delete payload.id; // Usuń ID z payloadu, jest w URL dla PUT/PATCH
        delete payload.created_at;
        delete payload.updated_at;


        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { errorData = response.statusText; }
                throw new Error(`Błąd ${response.status}: ${JSON.stringify(errorData) || 'Nieznany błąd serwera'}`);
            }

            setApiSuccess(modalMode === 'add' ? 'Inicjatywa dodana!' : 'Inicjatywa zaktualizowana!');
            refreshDataAndClearMessages();

        } catch (error) {
            console.error(`Błąd API (${method} ${url}):`, error);
            setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, modalMode, selectedInitiative, refreshDataAndClearMessages]);

    // Funkcja obsługująca potwierdzenie usunięcia
    const handleConfirmDelete = useCallback(async () => {
        if (!selectedInitiative || !apiUrl) return;

        setIsLoading(true);
        setApiError(null);
        setApiSuccess(null);
        const url = `${apiUrl}/initiatives/${selectedInitiative.id}/`;

        try {
            const response = await fetch(url, { method: 'DELETE' });

            // DELETE często zwraca 204 No Content na sukces
            if (!response.ok && response.status !== 204) {
                throw new Error(`Błąd ${response.status}: ${response.statusText || 'Nie udało się usunąć inicjatywy'}`);
            }

            setApiSuccess('Inicjatywa usunięta!');
            refreshDataAndClearMessages();

        } catch (error) {
            console.error(`Błąd API (DELETE ${url}):`, error);
            setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas usuwania.");
            // Zamknij modal potwierdzenia tylko jeśli wystąpił błąd, bo przy sukcesie zamknie go refreshData...
            setIsDeleteModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, selectedInitiative, refreshDataAndClearMessages]);


    // Funkcja zwrotna dla formularza importu
    const handleImportSuccess = useCallback(() => {
        setApiSuccess("Import zakończony. Dane zostały odświeżone.");
        refreshDataAndClearMessages(); // Odśwież dane i wyczyść komunikaty
    }, [refreshDataAndClearMessages]);


    // --- Renderowanie Komponentu ---
    return (
        <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">

            {/* Wyświetlanie komunikatów globalnych */}
            <div className="w-full max-w-7xl my-4 space-y-2">
                {apiError && (
                    <div className="p-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <span className="font-medium">Błąd!</span> {apiError}
                    </div>
                )}
                {apiSuccess && (
                    <div className="p-4 text-sm text-green-800 rounded-lg bg-green-100 dark:bg-gray-800 dark:text-green-400" role="alert">
                        <span className="font-medium">Sukces!</span> {apiSuccess}
                    </div>
                )}
            </div>

            {/* Formularz importu */}
            <div className="w-full max-w-7xl">
                <InitiativeImportForm onImportSuccess={handleImportSuccess} apiUrl={apiUrl} />
            </div>


            {/* Pasek Akcji: Dodaj + Filtr */}
            <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center my-6 gap-4">
                <button
                    onClick={handleAddClick}
                    disabled={isLoading} // Wyłącz przycisk podczas ładowania tagów lub innych operacji
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Dodaj Inicjatywę
                </button>

                <div className="w-full md:w-1/2 lg:w-1/3">
                    <input
                        type="search" // Użyj type="search" dla lepszej semantyki i potencjalnych funkcji przeglądarki
                        placeholder="Filtruj po nazwie, opisie, regionie..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Tabela Inicjatyw */}
            <InitiativeTable
                initiatives={paginatedInitiatives}
                requestSort={requestSort}
                sortConfig={sortConfig}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />

            {/* Paginacja */}
            {totalPages > 1 && (
                <nav className="mt-6 flex items-center justify-between w-full max-w-7xl px-4 sm:px-0" aria-label="Paginacja">
                    {/* Informacja o wynikach */}
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                            Pokazano <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                            {' '}do{' '}
                            <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, sortedInitiatives.length)}</span>
                            {' '}z{' '}
                            <span className="font-medium">{sortedInitiatives.length}</span> wyników
                        </p>
                    </div>
                    {/* Przyciski nawigacyjne */}
                    <div className="flex flex-1 justify-between sm:justify-end">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1 || isLoading}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Poprzednia strona"
                        >
                            <ChevronLeftIcon className="h-5 w-5 mr-1" />
                            Poprzednia
                        </button>
                        {/* Numery stron (opcjonalnie, może być złożone) */}
                        <div className="hidden md:flex items-center mx-4 space-x-1">
                            {getPageNumbers().map((page, index) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={index}
                                        onClick={() => goToPage(page)}
                                         disabled={isLoading}
                                         className={`px-3 py-1.5 text-sm rounded-md ${currentPage === page ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} disabled:opacity-50`}
                                         aria-current={currentPage === page ? 'page' : undefined}
                                     >
                                         {page}
                                     </button>
                                 ) : (
                                     <span key={index} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                                         {page}
                                     </span>
                                 )
                             ))}
                        </div>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || isLoading}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ml-3"
                            aria-label="Następna strona"
                        >
                            Następna
                            <ChevronRightIcon className="h-5 w-5 ml-1" />
                        </button>
                    </div>
                </nav>
            )}

            {/* Modale (Renderowane na końcu, ale kontrolowane stanem) */}
            <InitiativeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                initialData={selectedInitiative}
                isLoading={isLoading}
                availableTags={availableTags} // Przekaż pobrane tagi
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                initiativeName={selectedInitiative?.name || ''}
                isLoading={isLoading}
            />

        </div>
    );
};

export default InitiativeDisplay;