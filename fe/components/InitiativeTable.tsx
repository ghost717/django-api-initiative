// components/InitiativeTable.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// Interfejsy (Initiative, SortConfig) pozostają bez zmian
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
        return sortConfig.direction === 'ascending' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    };

    const columns = [
        { key: 'name', label: 'Nazwa', sortable: true, width: 'w-3/12' },
        { key: 'implementing_entity_name', label: 'Podmiot Wdrażający', sortable: true, width: 'w-3/12' },
        { key: 'entity_status_display', label: 'Statut Podmiotu', sortable: true, width: 'w-3/12' },
        { key: 'implementation_area_display', label: 'Obszar', sortable: true, width: 'w-1/12' },
        { key: 'location_text', label: 'Miejsce', sortable: true, width: 'w-1/12' },
        { key: 'funding_source_display', label: 'Finansowanie', sortable: true, width: 'w-1/12' },
        // { key: 'actions', label: 'Akcje', sortable: false, width: 'w-2/12' },
    ];

    return (
        <div className="w-full shadow-lg rounded-lg overflow-hidden overflow-x-auto">
            <table id="initiative-table" className="min-w-full table-fixed">
                <thead className="bg-[#273F96]">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={col.key}
                                scope="col"
                                // Używamy szerokości z definicji kolumn
                                className={`px-6 py-3 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider ${col.width}`}
                            >
                                {col.sortable ? (
                                    <button
                                        type="button"
                                        onClick={() => requestSort(col.key.toString().replace('_display', '') as keyof Initiative)}
                                        className="flex items-center focus:outline-none text-gray-200 hover:text-white"
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
                <tbody className="bg-white">
                    {initiatives.map(initiative => (
                        <tr
                            key={initiative.id}
                            className="bg-[#C1D0F1] hover:bg-[#DBEAFE] cursor-pointer border-b border-white/75 transition-colors duration-150"
                            onClick={() => onRowClick?.(initiative)}
                        >
                            {columns.map(col => {
                                if (col.key === 'actions') {
                                    return (
                                        <td key={`${initiative.id}-actions`} className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={e => { e.stopPropagation(); onEdit(initiative); }}
                                                    className="flex items-center text-blue-700 hover:text-blue-900"
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
                                    // ZAKTUALIZOWANE: break-words pozwala na zawijanie tekstu
                                    <td key={`${initiative.id}-${col.key}`} className="px-6 py-4 text-sm text-gray-800 break-words">
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