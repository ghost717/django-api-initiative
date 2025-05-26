// components/InitiativeTable.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

// Zaktualizowany interfejs Initiative
export interface Initiative {
    id: number;
    name: string;
    acronym: string | null;
    implementing_entity_name: string;
    entity_status: string;
    entity_status_display: string;
    implementation_area: string;
    implementation_area_display: string;
    location_text: string | null;
    implementing_entity_url: string | null;
    description: string | null;
    timing: string | null;
    funding_source: string;
    funding_source_display: string;
    url: string | null;
    tags: number[];
    created_at: string;
    updated_at: string;
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
            return <span className="ml-1 inline-block w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity">⇅</span>;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUpIcon className="ml-1 inline-block w-4 h-4 text-gray-700 dark:text-gray-300" />;
        }
        return <ArrowDownIcon className="ml-1 inline-block w-4 h-4 text-gray-700 dark:text-gray-300" />;
    };

    const columns: { key: keyof Initiative | 'actions'; label: string; visible: string; sortable: boolean }[] = [
        { key: 'name', label: 'Nazwa', visible: 'table-cell', sortable: true },
        { key: 'implementing_entity_name', label: 'Podmiot Wdrażający', visible: 'hidden md:table-cell', sortable: true },
      { key: 'entity_status_display', label: 'Statut Podmiotu', visible: 'hidden lg:table-cell', sortable: true },
      { key: 'implementation_area_display', label: 'Obszar', visible: 'hidden sm:table-cell', sortable: true },
      { key: 'location_text', label: 'Miejsce', visible: 'hidden xl:table-cell', sortable: true },
      { key: 'funding_source_display', label: 'Finansowanie', visible: 'hidden md:table-cell', sortable: true },
      { key: 'actions', label: 'Akcje', visible: 'table-cell', sortable: false },
  ];

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6 w-full">
          <table className="w-full min-w-[1000px] text-sm text-left text-gray-500 dark:text-gray-400">{/* Zwiększono min-width */}
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                      {columns.map(col => (
                          <th key={col.key} scope="col" className={`px-6 py-3 ${col.visible}`}>
                              {col.sortable ? (
                        <button
                            type="button"
                            onClick={() => requestSort((col.key.toString().replace('_display', '') as keyof Initiative))}
                            className="group flex items-center uppercase font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors"
                            aria-label={`Sortuj po ${col.label}`}
                        >
                            {col.label}
                            {getSortIcon((col.key.toString().replace('_display', '') as keyof Initiative))}
                        </button>
                    ) : (
                        <span className="uppercase font-semibold text-gray-600 dark:text-gray-300">{col.label}</span>
                    )}
                </th>
            ))}
                  </tr>
              </thead><tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {initiatives.map(initiative => (
                      <tr
                          key={initiative.id}
                          className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => onRowClick?.(initiative)}
                      >
                          {columns.map(col => {
                              if (col.key === 'actions') {
                                  return (
                                      <td key={`${initiative.id}-actions`} className={`px-6 py-4 ${col.visible} space-x-3 whitespace-nowrap`}>
                            <button
                                onClick={e => { e.stopPropagation(); onEdit(initiative); }}
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                            >
                                <PencilSquareIcon className="h-4 w-4 mr-1" /> Edytuj
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); onDelete(initiative); }}
                                className="inline-flex items-center text-red-600 hover:text-red-900"
                            >
                                <TrashIcon className="h-4 w-4 mr-1" /> Usuń
                            </button>
                        </td>
                    );
                }
                  const displayValue = initiative[col.key as keyof Initiative];
                  return (
                      <td key={`${initiative.id}-${col.key}`} className={`px-6 py-4 ${col.visible} text-gray-800 dark:text-gray-200`}>
                          <span className={col.key === 'name' ? 'font-medium' : ''} title={typeof displayValue === 'string' ? displayValue : undefined}>
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
