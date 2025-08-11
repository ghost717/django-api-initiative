// components/InitiativeDisplay.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Importuj zaktualizowany interfejs Initiative i inne komponenty
import InitiativeTable, { Initiative, SortConfig } from './InitiativeTable';
import InitiativeImportForm from './InitiativeImportForm';
import InitiativeModal, { ApiTag } from './InitiativeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import InitiativeInfoModal from './InitiativeInfoModal';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface InitiativeDisplayProps {
    initialInitiatives: Initiative[];
}

const ITEMS_PER_PAGE = 10;

const InitiativeDisplay: React.FC<InitiativeDisplayProps> = ({ initialInitiatives }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<ApiTag[]>([]);

    // --- Filtrowanie, Sortowanie, Paginacja ---
    const filteredInitiatives = useMemo(() => {
        if (!initialInitiatives) return [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerCaseSearchTerm) return initialInitiatives;

        return initialInitiatives.filter(initiative =>
            // Dostosuj wyszukiwanie do nowych pól
            initiative.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (initiative.acronym && initiative.acronym.toLowerCase().includes(lowerCaseSearchTerm)) ||
            initiative.implementing_entity_name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (initiative.location_text && initiative.location_text.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (initiative.description && initiative.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
            initiative.entity_status_display.toLowerCase().includes(lowerCaseSearchTerm) || // Wyszukuj po wyświetlanej wartości
            initiative.implementation_area_display.toLowerCase().includes(lowerCaseSearchTerm) ||
            initiative.funding_source_display.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [initialInitiatives, searchTerm]);

    const sortedInitiatives = useMemo(() => {
        let sortableItems = [...filteredInitiatives];
        if (sortConfig !== null && sortConfig.key) {
            // Logika sortowania - bez zmian, działa na kluczach Initiative
            sortableItems.sort((a, b) => {
                const keyA = a[sortConfig!.key!];
                const keyB = b[sortConfig!.key!];
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

    const requestSort = useCallback((key: keyof Initiative) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        // Upewnij się, że sortujesz po kluczu danych, a nie display (chociaż nazwy się zgadzają po usunięciu _display)
        setSortConfig({ key: key, direction });
        setCurrentPage(1);
    }, [sortConfig]);

    const totalPages = Math.ceil(sortedInitiatives.length / ITEMS_PER_PAGE);
    const paginatedInitiatives = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedInitiatives.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedInitiatives, currentPage]);

    const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
    const goToPage = (pageNumber: number) => { if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber); }
    // const getPageNumbers = useCallback(() => { /* ... logika bez zmian ... */ return []; }, [currentPage, totalPages]);
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

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // --- Pobieranie tagów (bez zmian) ---
    useEffect(() => {
        const fetchTags = async () => {
            if (!apiUrl) return;
            setIsLoading(true);
            try {
                const response = await fetch(`${apiUrl}/tags/`);
                if (!response.ok) throw new Error('Nie udało się pobrać tagów');
                setAvailableTags(await response.json());
                setApiError(null);
            } catch (error: any) {
                console.error("Błąd pobierania tagów:", error);
                setApiError("Nie udało się załadować listy tagów.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTags();
    }, [apiUrl]);


    // --- Pobierz tagi ---
    useEffect(() => {
        if (!apiUrl) return;
        setIsLoading(true);
        fetch(`${apiUrl}/tags/`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then((data: ApiTag[]) => setAvailableTags(data))
            .catch(() => setApiError('Nie udało się załadować tagów'))
            .finally(() => setIsLoading(false));
    }, [apiUrl]);

    // --- Handlery CRUD (logika API bez zmian, ale payload będzie inny) ---
    const refreshDataAndClearMessages = useCallback(() => {
        router.refresh();
        setTimeout(() => setApiSuccess(null), 4000);
        setApiError(null);
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedInitiative(null);
    }, [router]);

    const handleRowClick = useCallback((initiative: Initiative) => {
        setSelectedInitiative(initiative);
        setIsInfoModalOpen(true);
    }, []);

    useEffect(() => { setApiError(null); setApiSuccess(null); }, [searchTerm, currentPage]);

    const handleAddClick = () => { setSelectedInitiative(null); setModalMode('add'); setApiError(null); setApiSuccess(null); setIsModalOpen(true); };
    const handleEditClick = useCallback((initiative: Initiative) => { setSelectedInitiative(initiative); setModalMode('edit'); setApiError(null); setApiSuccess(null); setIsModalOpen(true); }, []);
    const handleDeleteClick = useCallback((initiative: Initiative) => { setSelectedInitiative(initiative); setApiError(null); setApiSuccess(null); setIsDeleteModalOpen(true); }, []);
    const handleCloseModal = () => { setIsModalOpen(false); setIsDeleteModalOpen(false); setIsInfoModalOpen(false); };

    // Submit Modal (Dodaj/Edytuj)
    const handleModalSubmit = useCallback(async (formData: Partial<Initiative>) => {
        if (!apiUrl) { setApiError("Brak URL API."); return; }
        setIsLoading(true); setApiError(null); setApiSuccess(null);

        const url = modalMode === 'add' ? `${apiUrl}/initiatives/` : `${apiUrl}/initiatives/${selectedInitiative?.id}/`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        // Payload jest już przygotowany w InitiativeModal (bez pól _display)
        const payload = formData;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                let errorData; try { errorData = await response.json(); } catch { errorData = response.statusText; }
                throw new Error(`Błąd ${response.status}: ${JSON.stringify(errorData) || 'Błąd serwera'}`);
            }
            setApiSuccess(modalMode === 'add' ? 'Dodano!' : 'Zaktualizowano!');
            refreshDataAndClearMessages();
        } catch (error: any) {
            console.error(`Błąd API (${method} ${url}):`, error);
            setApiError(error.message);
        } finally { setIsLoading(false); }
    }, [apiUrl, modalMode, selectedInitiative, refreshDataAndClearMessages]);

    // Potwierdź Usunięcie
    const handleConfirmDelete = useCallback(async () => {
        if (!selectedInitiative || !apiUrl) return;
        setIsLoading(true); setApiError(null); setApiSuccess(null);
        const url = `${apiUrl}/initiatives/${selectedInitiative.id}/`;
        try {
            const response = await fetch(url, { method: 'DELETE' });
             if (!response.ok && response.status !== 204) { throw new Error(`Błąd ${response.status}`); }
             setApiSuccess('Usunięto!');
             refreshDataAndClearMessages();
         } catch (error: any) {
             console.error(`Błąd API (DELETE ${url}):`, error);
             setApiError(error.message);
             setIsDeleteModalOpen(false); // Zamknij tylko przy błędzie
         } finally { setIsLoading(false); }
    }, [apiUrl, selectedInitiative, refreshDataAndClearMessages]);

    // Import Sukces
    const handleImportSuccess = useCallback(() => {
        setApiSuccess("Import zakończony. Dane odświeżone.");
        refreshDataAndClearMessages();
    }, [refreshDataAndClearMessages]);


    // --- Renderowanie ---
    return (
        <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">
            {/* Komunikaty */}
            <div className="w-full max-w-7xl my-4 space-y-2">
                {apiError && <div className="alert-error">{apiError}</div>}
                {apiSuccess && <div className="alert-success">{apiSuccess}</div>}
            </div>

            {/* Import */}
            <div className="w-full max-w-7xl">
                {/* <InitiativeImportForm onImportSuccess={handleImportSuccess} apiUrl={apiUrl} /> */}
            </div>

            {/* Pasek Akcji */}
            <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center my-6 gap-4">
                <button
                    onClick={handleAddClick}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Dodaj Inicjatywę
                </button>
                <div className="w-full md:w-auto">
                    <input
                        type="search"
                        placeholder="Filtruj..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-64 px-3 py-2 text-sm border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                    />
                </div>
            </div>

            {/* Tabela */}
            <InitiativeTable
                initiatives={paginatedInitiatives}
                requestSort={requestSort}
                sortConfig={sortConfig}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onRowClick={handleRowClick}
            />

            {/* Paginacja */}
            {totalPages > 1 && (
                <nav className="mt-6 flex items-center justify-between w-full max-w-7xl px-4 sm:px-0" aria-label="Paginacja">
                    <div className="hidden sm:block"> <p className="text-sm text-gray-700 dark:text-gray-400"> Pokazano ... </p> </div>
                    <div className="flex flex-1 justify-between sm:justify-end">
                        <button onClick={goToPreviousPage} disabled={currentPage === 1 || isLoading} className="btn-pagination"> <ChevronLeftIcon className="h-5 w-5 mr-1" /> Poprzednia </button>
                        {/* Numery stron */}
                        <div className="hidden md:flex items-center mx-4 space-x-1">
                            {getPageNumbers().map((page, index) => typeof page === 'number' ? <button key={index} onClick={() => goToPage(page)} disabled={isLoading} className={`btn-page ${currentPage === page ? 'active' : ''}`}> {page} </button> : <span key={index} className="btn-page-dots">...</span>)}
                        </div>
                        <button onClick={goToNextPage} disabled={currentPage === totalPages || isLoading} className="btn-pagination ml-3"> Następna <ChevronRightIcon className="h-5 w-5 ml-1" /> </button>
                    </div>
                </nav>
            )}

            {/* Modale */}
            <InitiativeInfoModal
                isOpen={isInfoModalOpen}
                onClose={handleCloseModal}
                initiative={selectedInitiative!}
                availableTags={availableTags}
            />
            <InitiativeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                initialData={selectedInitiative}
                availableTags={availableTags}
                isLoading={isLoading}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                initiativeName={selectedInitiative?.name || ''}
                isLoading={isLoading}
            />
            {/* <InitiativeModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleModalSubmit} initialData={selectedInitiative} isLoading={isLoading} availableTags={availableTags} />
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmDelete} initiativeName={selectedInitiative?.name || ''} isLoading={isLoading} /> */}

            {/* Proste style dla alertów i paginacji - dodaj do <style jsx> lub globalnego CSS */}
            <style jsx>{`
                .alert-error { padding: 0.75rem 1rem; font-size: 0.875rem; color: #991B1B; border-radius: 0.5rem; background-color: #FEE2E2; } /* text-red-800 bg-red-100 */
                .dark .alert-error { color: #FCA5A5; background-color: #450A0A; } /* dark:text-red-400 dark:bg-red-900 */
                .alert-success { padding: 0.75rem 1rem; font-size: 0.875rem; color: #166534; border-radius: 0.5rem; background-color: #DCFCE7; } /* text-green-800 bg-green-100 */
                .dark .alert-success { color: #86EFAC; background-color: #14532D; } /* dark:text-green-400 dark:bg-green-900 */
                .btn-pagination { position: relative; display: inline-flex; align-items: center; padding: 0.5rem 1rem; border: 1px solid #D1D5DB; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; color: #374151; background-color: white; }
                .dark .btn-pagination { border-color: #4B5563; color: #D1D5DB; background-color: #374151; }
                .btn-pagination:hover { background-color: #F9FAFB; }
                .dark .btn-pagination:hover { background-color: #4B5563; }
                .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-page { padding: 0.5rem 0.75rem; font-size: 0.875rem; border-radius: 0.375rem; color: #4B5563; }
                .dark .btn-page { color: #D1D5DB; }
                .btn-page:hover { background-color: #F3F4F6; }
                .dark .btn-page:hover { background-color: #4B5563; }
                .btn-page.active { background-color: #DBEAFE; color: #1D4ED8; font-weight: 600; }
                .dark .btn-page.active { background-color: #1E3A8A; color: white; }
                .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-page-dots { padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #6B7280; }
                .dark .btn-page-dots { color: #9CA3AF; }
                /* Użyj definicji z InitiativeModal dla input-field, btn-primary itp. */
             `}</style>

        </div>
    );
};

export default InitiativeDisplay;