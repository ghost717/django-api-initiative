// components/InitiativeTable.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

// Definicja typu dla inicjatywy (może być w osobnym pliku types.ts)
export interface Initiative {
    id: number;
    name: string;
    url: string | null;
    person: string | null;
    category: string | null;
    timing: string | null;
    public: boolean;
    funders: string | null;
    place: string | null;
    region: string | null;
    description: string | null;
    target: string | null;
    tags: number[]; // Przechowuje ID tagów
    thematic_category: string | null;
    created_at: string;
    updated_at: string;
}

// Typ dla konfiguracji sortowania
export type SortConfig = {
    key: keyof Initiative | null;
    direction: 'ascending' | 'descending';
} | null;

interface InitiativeTableProps {
    initiatives: Initiative[]; // Dane do wyświetlenia (już przefiltrowane/posortowane/spaginowane)
    requestSort: (key: keyof Initiative) => void; // Funkcja do żądania zmiany sortowania
    sortConfig: SortConfig; // Aktualna konfiguracja sortowania
    onEdit: (initiative: Initiative) => void; // Funkcja wywoływana przy kliknięciu "Edytuj"
    onDelete: (initiative: Initiative) => void; // Funkcja wywoływana przy kliknięciu "Usuń"
}

const InitiativeTable: React.FC<InitiativeTableProps> = ({
    initiatives,
    requestSort,
    sortConfig,
    onEdit,
    onDelete,
}) => {

    // Funkcja pomocnicza do renderowania ikon sortowania
    const getSortIcon = (key: keyof Initiative) => {
        if (!sortConfig || sortConfig.key !== key) {
            // Wskazówka, że można sortować
            return <span className="ml-1 inline-block w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity">⇅</span>;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUpIcon className="ml-1 inline-block w-4 h-4 text-gray-700 dark:text-gray-300" />;
        }
        return <ArrowDownIcon className="ml-1 inline-block w-4 h-4 text-gray-700 dark:text-gray-300" />;
    };

    // Definicje kolumn dla łatwiejszego zarządzania
    // Klucz 'actions' jest specjalny i nie odpowiada bezpośrednio polu w Initiative
    const columns: { key: keyof Initiative | 'actions'; label: string; visible: string; sortable: boolean }[] = [
        { key: 'name', label: 'Nazwa', visible: 'table-cell', sortable: true },
        { key: 'person', label: 'Osoba', visible: 'hidden md:table-cell', sortable: true },
        { key: 'category', label: 'Kategoria', visible: 'hidden lg:table-cell', sortable: true },
        { key: 'thematic_category', label: 'Kat. Tematyczna', visible: 'hidden lg:table-cell', sortable: true },
        { key: 'region', label: 'Region', visible: 'hidden sm:table-cell', sortable: true },
        { key: 'place', label: 'Miejsce', visible: 'hidden xl:table-cell', sortable: true },
        { key: 'public', label: 'Publiczna', visible: 'hidden md:table-cell', sortable: true },
        { key: 'actions', label: 'Akcje', visible: 'table-cell', sortable: false }, // Kolumna Akcji
    ];

    // Komunikat, jeśli nie ma danych do wyświetlenia
    if (!initiatives || initiatives.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Nie znaleziono inicjatyw pasujących do kryteriów.</p>;
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6 w-full">
            <table className="w-full min-w-[900px] text-sm text-left text-gray-500 dark:text-gray-400"> {/* Minimalna szerokość dla lepszej obsługi przewijania */}
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} scope="col" className={`px-6 py-3 ${col.visible}`}>
                                {col.sortable ? (
                                    // Używamy grupy dla hover efektu na ikonie
                                    <button
                                        type="button"
                                        onClick={() => requestSort(col.key as keyof Initiative)}
                                        className="group flex items-center uppercase font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors"
                                        aria-label={`Sortuj po ${col.label}`}
                                    >
                                        {col.label}
                                        {getSortIcon(col.key as keyof Initiative)}
                                    </button>
                                ) : (
                                        // Nagłówki niesortowalne (np. Akcje)
                                        <span className="uppercase font-semibold text-gray-600 dark:text-gray-300">{col.label}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {initiatives.map((initiative) => (
                        <tr key={initiative.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            {columns.map(col => {
                                // Specjalna obsługa dla kolumny Akcje
                                if (col.key === 'actions') {
                                    return (
                                        <td key={`${initiative.id}-actions`} className={`px-6 py-4 ${col.visible} space-x-3 whitespace-nowrap`}>
                                            <button
                                                onClick={() => onEdit(initiative)}
                                                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded"
                                                aria-label={`Edytuj ${initiative.name}`}
                                            >
                                                <PencilSquareIcon className="h-4 w-4 mr-1" /> Edytuj
                                            </button>
                                            <button
                                                onClick={() => onDelete(initiative)}
                                                className="inline-flex items-center text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 rounded"
                                                aria-label={`Usuń ${initiative.name}`}
                                            >
                                                <TrashIcon className="h-4 w-4 mr-1" /> Usuń
                                            </button>
                                        </td>
                                    );
                                }

                                // Renderowanie pozostałych komórek
                                const value = initiative[col.key as keyof Initiative];
                                return (
                                    <td key={`${initiative.id}-${col.key}`} className={`px-6 py-4 ${col.visible} text-gray-800 dark:text-gray-200`}>
                                        {col.key === 'public' ? (
                                            // Wyświetlanie Tak/Nie dla boolean
                                            initiative.public ? 'Tak' : 'Nie'
                                        ) : (
                                            // Wyświetl wartość lub '-' jeśli jest null/undefined
                                            // Dodajemy 'truncate' dla potencjalnie długich nazw
                                            <span className={col.key === 'name' ? 'font-medium truncate' : ''} title={typeof value === 'string' ? value : undefined}>
                                                {String(value ?? '-')}
                                            </span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InitiativeTable;