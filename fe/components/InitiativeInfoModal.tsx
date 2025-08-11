// components/InitiativeInfoModal.tsx
'use client';

import React from 'react';
import { Initiative } from './InitiativeTable';
import { ApiTag } from './InitiativeModal';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InitiativeInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    initiative: Initiative;
    availableTags: ApiTag[];
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{children}</dd>
    </div>
);

const InitiativeInfoModal: React.FC<InitiativeInfoModalProps> = ({
    isOpen,
    onClose,
    initiative,
    availableTags,
}) => {
    if (!isOpen || !initiative) return null;

    const tagNames = initiative.tags.length
        ? initiative.tags
            .map(id => availableTags.find(t => t.id === id)?.name || `#${id}`)
            .join(', ')
        : 'Brak tagów';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* ZAKTUALIZOWANY Nagłówek */}
                <div className="flex justify-between items-center px-6 py-4 bg-[#273F96] text-white rounded-t-lg">
                    <h3 className="text-lg font-semibold">{initiative.name}</h3>
                    <button onClick={onClose} className="text-gray-300 hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* ZAKTUALIZOWANA Zawartość */}
                <div className="p-6 overflow-y-auto">
                    <dl className="divide-y divide-gray-200">
                        <InfoRow label="Akronim">{initiative.acronym || '-'}</InfoRow>
                        <InfoRow label="Podmiot wdrażający">{initiative.implementing_entity_name}</InfoRow>
                        <InfoRow label="Statut podmiotu">{initiative.entity_status_display}</InfoRow>
                        <InfoRow label="Obszar wdrażania">{initiative.implementation_area_display}</InfoRow>
                        <InfoRow label="Miejsce realizacji">{initiative.location_text || '-'}</InfoRow>
                        <InfoRow label="Termin realizacji">{initiative.timing || '-'}</InfoRow>
                        <InfoRow label="Źródło finansowania">{initiative.funding_source_display}</InfoRow>
                        <InfoRow label="Strona WWW">
                            {initiative.url ? (
                                <a href={initiative.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                    {initiative.url}
                                </a>
                            ) : '-'}
                        </InfoRow>
                        <InfoRow label="Opis">
                            <p className="whitespace-pre-wrap">{initiative.description || '-'}</p>
                        </InfoRow>
                        <InfoRow label="Tagi">{tagNames}</InfoRow>
                        <InfoRow label="Data utworzenia">{new Date(initiative.created_at).toLocaleString()}</InfoRow>
                        <InfoRow label="Ostatnia aktualizacja">{new Date(initiative.updated_at).toLocaleString()}</InfoRow>
                    </dl>
                </div>
                {/* ZAKTUALIZOWANA Stopka */}
                <div className="px-6 py-3 bg-gray-100 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InitiativeInfoModal;