// components/InitiativeTable.tsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'; // Potrzebne ikony

// Definicja typu dla inicjatywy (pozostaje bez zmian)
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
    tags: number[]; // Zakładamy, że API zwraca ID tagów
    thematic_category: string | null;
    created_at: string;
    updated_at: string;
}

// Nowy typ dla konfiguracji sortowania
export type SortConfig = {
    key: keyof Initiative | null; // Klucz, po którym sortujemy (musi być kluczem Initiative)
    direction: 'ascending' | 'descending';
} | null;

interface InitiativeTableProps {
    initiatives: Initiative[];
    requestSort: (key: keyof Initiative) => void; // Funkcja do żądania sortowania
    sortConfig: SortConfig; // Aktualna konfiguracja sortowania
}

const InitiativeTable: React.FC<InitiativeTableProps> = ({ initiatives, requestSort, sortConfig }) => {
    if (!initiatives || initiatives.length === 0) {
        return <p className="text-center text-gray-500 mt-4">Nie znaleziono inicjatyw pasujących do kryteriów.</p>;
    }

    // Funkcja pomocnicza do renderowania ikon sortowania
    const getSortIcon = (key: keyof Initiative) => {
        if (!sortConfig || sortConfig.key !== key) {
            // Mała, szara strzałka w górę/dół jako wskazówka, że można sortować
            return <span className="ml-1 inline-block w-4 h-4 text-gray-400">⇅</span>;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUpIcon className="ml-1 inline-block w-4 h-4 text-gray-700 dark:text-gray-300" />;
        }
        return <ArrowDownIcon className="ml-1 inline-block w-4 h-4 text-gray-700 dark:text-gray-300" />;
    };

    // Definicje kolumn - ułatwia zarządzanie
    const columns: { key: keyof Initiative; label: string; visible: string; sortable: boolean }[] = [
        { key: 'name', label: 'Nazwa', visible: 'table-cell', sortable: true },
        { key: 'person', label: 'Osoba', visible: 'hidden md:table-cell', sortable: true },
        { key: 'category', label: 'Kategoria', visible: 'hidden lg:table-cell', sortable: true },
        { key: 'thematic_category', label: 'Kat. Tematyczna', visible: 'hidden lg:table-cell', sortable: true },
        { key: 'region', label: 'Region', visible: 'hidden sm:table-cell', sortable: true },
        { key: 'place', label: 'Miejsce', visible: 'hidden xl:table-cell', sortable: true },
        { key: 'timing', label: 'Timing', visible: 'hidden xl:table-cell', sortable: false }, // Nie sortujemy po timingu np.
        { key: 'public', label: 'Publiczna', visible: 'hidden md:table-cell', sortable: true },
        { key: 'url', label: 'URL', visible: 'hidden lg:table-cell', sortable: false }, // Nie sortujemy po URL
        // Można dodać więcej kolumn np. 'created_at', 'funders' jeśli potrzeba
        // { key: 'created_at', label: 'Dodano', visible: 'hidden xl:table-cell', sortable: true },
    ];


    return (
        // Zwiększamy responsywność kontenera tabeli
        <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6 w-full">
            <table className="w-full min-w-[800px] text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} scope="col" className={`px-6 py-3 ${col.visible}`}>
                                {col.sortable ? (
                                    <button
                                        type="button"
                                        onClick={() => requestSort(col.key)}
                                        className="flex items-center uppercase font-semibold hover:text-gray-900 dark:hover:text-white focus:outline-none"
                                        aria-label={`Sortuj po ${col.label}`}
                                    >
                                        {col.label}
                                        {getSortIcon(col.key)}
                                    </button>
                                ) : (
                                    <span className="uppercase font-semibold">{col.label}</span>
                                )}
                            </th>
                        ))}
                        {/* Można dodać kolumnę akcji */}
                        {/* <th scope="col" className="px-6 py-3">Akcje</th> */}
                    </tr>
                </thead>
                <tbody>
                    {initiatives.map((initiative) => (
                        <tr key={initiative.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            {columns.map(col => (
                                <td key={`${initiative.id}-${col.key}`} className={`px-6 py-4 ${col.visible}`}>
                                    {col.key === 'public' ? (
                                        initiative.public ? 'Tak' : 'Nie'
                                    ) : col.key === 'url' ? (
                                        initiative.url ? (
                                            <a href={initiative.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 dark:text-blue-500 hover:underline truncate max-w-xs inline-block" title={initiative.url}>
                                                Link
                                            </a>
                                        ) : (
                                            '-'
                                            )
                                        ) : (
                                            String(initiative[col.key] ?? '-')
                                    )}
                                </td>
                            ))}
                            {/* <td className="px-6 py-4">
                                <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edytuj</a>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InitiativeTable;