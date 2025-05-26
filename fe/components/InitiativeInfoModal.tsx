// components/InitiativeInfoModal.tsx
'use client';

import React from 'react';
import { Initiative } from './InitiativeTable';
import { ApiTag } from './InitiativeModal';

interface InitiativeInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    initiative: Initiative;
    availableTags: ApiTag[];
}

const InitiativeInfoModal: React.FC<InitiativeInfoModalProps> = ({
    isOpen,
    onClose,
    initiative,
    availableTags,
}) => {
    if (!isOpen) return null;

    const tagNames = initiative.tags.length
        ? initiative.tags
            .map(id => availableTags.find(t => t.id === id)?.name || `#${id}`)
            .join(', ')
        : '-';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{initiative.name}</h3>
                <hr /><br />
                <dl className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2"><dt className="font-bold dark:text-white uppercase">Akronim:</dt><dd>{initiative.acronym || '-'}</dd></div>
                        <div className="w-50"><dt className="font-bold dark:text-white uppercase">Podmiot wdrażający:</dt><dd>{initiative.implementing_entity_name}</dd></div>
                        <div className="w-50"><dt className="font-bold dark:text-white uppercase">Statut:</dt><dd>{initiative.entity_status_display}</dd></div>
                        <div className="w-50"><dt className="font-bold dark:text-white uppercase">Obszar:</dt><dd>{initiative.implementation_area_display}</dd></div>
                        <div className="w-50"><dt className="font-bold dark:text-white uppercase">Miejsce:</dt><dd>{initiative.location_text || '-'}</dd></div>
                        <div><dt className="font-bold dark:text-white uppercase">Termin:</dt><dd>{initiative.timing || '-'}</dd></div>
                        <div><dt className="font-bold dark:text-white uppercase">Finansowanie:</dt><dd>{initiative.funding_source_display}</dd></div>
                        <dt className="font-bold dark:text-white uppercase">Strona:</dt>
                        <div><br /><br /><br /></div>
                        <div><dt className="font-bold dark:text-white uppercase">Opis:</dt><dd>{initiative.description || '-'}</dd></div>
                        <div>
                            <dd>
                                {initiative.url
                                    ? <a href={initiative.url} target="_blank" className="underline text-blue-600 dark:text-blue-400">{initiative.url}</a>
                                    : '-'}
                            </dd>
                        </div>
                        <div><dt className="font-bold dark:text-white uppercase">Tagi (ID):</dt><dd>{tagNames}</dd></div>

                    </div>
                    <div className="flex">
                        <div className="w-50"><dt className="font-bold dark:text-white uppercase">Utworzono:</dt><dd>{new Date(initiative.created_at).toLocaleString()}</dd></div>
                        <div className="w-50"><dt className="font-bold dark:text-white uppercase">Aktualizowano:</dt><dd>{new Date(initiative.updated_at).toLocaleString()}</dd></div>
                    </div>

                </dl>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 btn-secondary">Zamknij</button>
                </div>
            </div>
        </div>
    );
};

export default InitiativeInfoModal;
