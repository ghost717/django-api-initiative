// components/InitiativeTable.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// Definicja interfejsu Initiative pozostaje bez zmian
export interface Initiative {
    id: number; name: string; acronym: string | null; implementing_entity_name: string;
    entity_status: string; entity_status_display: string; implementation_area: string;
    implementation_area_display: string; location_text: string | null;
    implementing_entity_url: string | null; description: string | null; timing: string | null;
    funding_source: string; funding_source_display: string; url: string | null;
    tags: number[]; created_at: string; updated_at: string;
}

export type SortConfig = {
    key: keyof Initiative | null;
    direction: 'ascending' | 'descending';
} | null;

interface InitiativeTableProps {
    initiatives: Initiative[];
    requestSort: (key: keyof Initiative) => void;
    sortConfig: SortConfig;
    onEdit: (initiative: Initiative) => void;
    onDelete: (initiative: Initiative) => void;
    onRowClick?: (initiative: Initiative) => void;
}

const InitiativeTable: React.FC<InitiativeTableProps> = ({
    initiatives,
    requestSort,
    sortConfig,
    onEdit,
    onDelete,
    onRowClick,
}) => {

    const getSortIcon = (key: keyof Initiative) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="ml-1 text-gray-400">↑↓</span>;
        }
        if (sortConfig.direction === 'ascending') {
            return <span className="ml-1">↑</span>;
        }
        return <span className="ml-1">↓</span>;
    };

    // Zdefiniowane kolumny zgodne ze zrzutem ekranu
    const columns = [
        { key: 'name', label: 'Nazwa', sortable: true },
        { key: 'implementing_entity_name', label: 'Podmiot Wdrażający', sortable: true },
        { key: 'entity_status_display', label: 'Statut Podmiotu', sortable: true },
        { key: 'implementation_area_display', label: 'Obszar', sortable: true },
        { key: 'location_text', label: 'Miejsce', sortable: true },
        { key: 'funding_source_display', label: 'Finansowanie', sortable: true },
        { key: 'actions', label: 'Akcje', sortable: false },
    ];

    return (
        <div className="overflow-x-auto w-full shadow-lg rounded-lg">
            <table id="initiative-table" className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={col.key}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                            >
                                {col.sortable ? (
                                    <button
                                        type="button"
                                        onClick={() => requestSort(col.key.toString().replace('_display', '') as keyof Initiative)}
                                        className="flex items-center focus:outline-none"
                                    >
                                        {col.label}
                                        {getSortIcon(col.key as keyof Initiative)}
                                    </button>
                                ) : (
                                    col.label
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {initiatives.map(initiative => (
                        <tr
                            key={initiative.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => onRowClick?.(initiative)}
                        >
                            {columns.map(col => {
                                if (col.key === 'actions') {
                                    return (
                                        <td key={`${initiative.id}-actions`} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={e => { e.stopPropagation(); onEdit(initiative); }}
                                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                                                    Edytuj
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); onDelete(initiative); }}
                                                    className="flex items-center text-red-600 hover:text-red-800"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-1" />
                                                    Usuń
                                                </button>
                                            </div>
                                        </td>
                                    );
                                }
                                const displayValue = initiative[col.key as keyof Initiative];
                                const isNameColumn = col.key === 'name';

                                return (
                                    <td key={`${initiative.id}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        <span className={isNameColumn ? 'font-semibold text-gray-900' : ''}>
                                            {String(displayValue ?? '-')}
                                        </span>
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