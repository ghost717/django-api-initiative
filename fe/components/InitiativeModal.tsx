// components/InitiativeModal.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// Importuj zaktualizowany interfejs Initiative i ApiTag
import { Initiative } from './InitiativeTable';
export interface ApiTag { id: number; name: string; }


interface InitiativeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: Partial<Initiative>) => Promise<void>;
    initialData?: Initiative | null;
    isLoading: boolean;
    availableTags: ApiTag[];
}

// Zaktualizowany initialFormState
const initialFormState: Partial<Initiative> = {
    name: '',
    acronym: '',
    implementing_entity_name: '',
    entity_status: 'NGO', // Domyślna wartość klucza
    implementation_area: 'LOCAL', // Domyślna wartość klucza
    location_text: '',
    implementing_entity_url: '',
    description: '',
    timing: '',
    funding_source: 'PUBLIC', // Domyślna wartość klucza
    url: '',
    tags: [],
};

// Stałe dla opcji select - powinny pasować do kluczy w models.py
// W idealnym świecie te opcje powinny być pobierane z API
const ENTITY_STATUS_OPTIONS = [
    { value: 'NGO', label: 'Organizacja pozarządowa (NGO)' },
    { value: 'BUSINESS', label: 'Przedsiębiorstwo' },
    { value: 'UNIVERSITY', label: 'Uczelnia' },
    { value: 'LOCAL_GOVT', label: 'Jednostka samorządu terytorialnego (JST)' },
    { value: 'OTHER', label: 'Inne' },
];

const IMPLEMENTATION_AREA_OPTIONS = [
    { value: 'INTERNATIONAL', label: 'Międzynarodowy' },
    { value: 'NATIONAL', label: 'Krajowy' },
    { value: 'REGIONAL', label: 'Regionalny' },
    { value: 'LOCAL', label: 'Lokalny' },
];

const FUNDING_SOURCE_OPTIONS = [
    { value: 'PUBLIC', label: 'Publiczne' },
    { value: 'PRIVATE', label: 'Prywatne' },
];


const InitiativeModal: React.FC<InitiativeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
    availableTags,
}) => {
    const [formData, setFormData] = useState<Partial<Initiative>>(initialFormState);
    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode && initialData) {
            // Upewnij się, że przekazujesz klucze dla pól select
            setFormData({
                ...initialData,
                entity_status: initialData.entity_status || initialFormState.entity_status,
                implementation_area: initialData.implementation_area || initialFormState.implementation_area,
                funding_source: initialData.funding_source || initialFormState.funding_source,
                tags: initialData.tags || [],
            });
        } else {
            setFormData(initialFormState);
        }
    }, [initialData, isEditMode, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'tags') {
        // Obsługa multi-select tagów
            const selectedOptions = (e.target as HTMLSelectElement).selectedOptions;
            const selectedTagIds = Array.from(selectedOptions).map(option => parseInt(option.value, 10));
            setFormData(prev => ({ ...prev, tags: selectedTagIds }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            alert("Nazwa inicjatywy jest wymagana.");
            return;
        }
        if (formData.description && formData.description.length > 1000) {
            alert("Opis nie może przekraczać 1000 znaków.");
            return;
        }
        // Usuwamy pola *_display przed wysłaniem, API oczekuje kluczy
        const payload = { ...formData };
        delete (payload as any).entity_status_display;
        delete (payload as any).implementation_area_display;
        delete (payload as any).funding_source_display;
        // delete (payload as any).tags_display; // Jeśli było dodane

        await onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-gray-600 bg-opacity-75 transition-opacity">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Nagłówek */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isEditMode ? 'Edytuj Inicjatywę' : 'Dodaj Nową Inicjatywę'}
                        </h3>
                    </div>

                    {/* Formularz */}
                    <form onSubmit={handleSubmit} id="initiative-form" className="px-6 py-4 space-y-4 overflow-y-auto flex-grow">
                        {/* Sekcja: Informacje ogólne */}
                        <h4 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200 border-b pb-1">Informacje Ogólne</h4>
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa inicjatywy <span className="text-red-500">*</span></label>
                            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        {/* Akronim */}
                        <div>
                            <label htmlFor="acronym" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Akronim (jeśli dotyczy)</label>
                            <input type="text" name="acronym" id="acronym" value={formData.acronym || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        {/* Podmiot wdrażający */}
                        <div>
                            <label htmlFor="implementing_entity_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa podmiotu wdrażającego</label>
                            <input type="text" name="implementing_entity_name" id="implementing_entity_name" value={formData.implementing_entity_name || ''} onChange={handleChange} required className="mt-1 input-field" />
                        </div>
                        {/* Statut podmiotu */}
                        <div>
                            <label htmlFor="entity_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut podmiotu</label>
                            <select name="entity_status" id="entity_status" value={formData.entity_status || ''} onChange={handleChange} required className="mt-1 select-field">
                                {ENTITY_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        {/* Obszar wdrażania */}
                        <div>
                            <label htmlFor="implementation_area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Obszar wdrażania</label>
                            <select name="implementation_area" id="implementation_area" value={formData.implementation_area || ''} onChange={handleChange} required className="mt-1 select-field">
                                {IMPLEMENTATION_AREA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        {/* Miejsce realizacji */}
                        <div>
                            <label htmlFor="location_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Miejsce realizacji (kraj/region/miejscowość)</label>
                            <input type="text" name="location_text" id="location_text" value={formData.location_text || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        {/* Strona WWW podmiotu */}
                        <div>
                            <label htmlFor="implementing_entity_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strona WWW podmiotu wdrażającego</label>
                            <input type="url" name="implementing_entity_url" id="implementing_entity_url" value={formData.implementing_entity_url || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>

                        {/* Sekcja: Szczegółowe informacje */}
                        <h4 className="text-md font-semibold mb-2 pt-4 text-gray-800 dark:text-gray-200 border-b pb-1">Szczegółowe Informacje</h4>
                        {/* Opis */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis inicjatywy</label>
                            <textarea name="description" id="description" rows={5} value={formData.description || ''} onChange={handleChange} maxLength={1000} className="mt-1 input-field"></textarea>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maksymalnie 1000 znaków. Pozostało: {1000 - (formData.description?.length || 0)}</p>
                        </div>
                        {/* Termin realizacji */}
                        <div>
                            <label htmlFor="timing" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Termin realizacji</label>
                            <input type="text" name="timing" id="timing" value={formData.timing || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        {/* Źródło finansowania */}
                        <div>
                            <label htmlFor="funding_source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Źródło finansowania</label>
                            <select name="funding_source" id="funding_source" value={formData.funding_source || ''} onChange={handleChange} required className="mt-1 select-field">
                                {FUNDING_SOURCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        {/* Strona inicjatywy */}
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strona internetowa inicjatywy (jeśli dotyczy)</label>
                            <input type="url" name="url" id="url" value={formData.url || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        {/* Tagi */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tagi</label>
                            <select multiple name="tags" id="tags" value={formData.tags?.map(String) || []} onChange={handleChange} className="mt-1 select-field h-32">
                                {availableTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Przytrzymaj Ctrl (lub Cmd na Mac), aby wybrać wiele tagów.</p>
                        </div>

                    </form> {/* Koniec formularza */}

                    {/* Stopka Modala */}
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary"> Anuluj </button>
                        <button type="submit" form="initiative-form" disabled={isLoading} className="btn-primary">
                            {isLoading ? (isEditMode ? 'Zapisywanie...' : 'Dodawanie...') : (isEditMode ? 'Zapisz Zmiany' : 'Dodaj Inicjatywę')}
                        </button>
                    </div>
                </div>
            </div>
            {/* Dodaj style dla .input-field, .select-field, .btn-primary, .btn-secondary w pliku CSS lub użyj klas Tailwind */}
            <style jsx>{`
                .input-field, .select-field {
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border-width: 1px;
                    border-color: #D1D5DB; /* gray-300 */
                    border-radius: 0.375rem; /* rounded-md */
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
                    font-size: 0.875rem; /* sm:text-sm */
                    line-height: 1.25rem;
                }
                .dark .input-field, .dark .select-field {
                    border-color: #4B5563; /* dark:border-gray-600 */
                    background-color: #374151; /* dark:bg-gray-700 */
                    color: white;
                }
                .input-field:focus, .select-field:focus {
                    outline: none;
                    border-color: #3B82F6; /* focus:border-blue-500 */
                    box-shadow: 0 0 0 2px #BFDBFE; /* focus:ring-blue-200 approximation */
                }
                .btn-primary {
                    padding: 0.5rem 1rem;
                    border-width: 1px;
                    border-color: transparent;
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: white;
                    background-color: #2563EB; /* bg-blue-600 */
                }
                .btn-primary:hover { background-color: #1D4ED8; /* hover:bg-blue-700 */ }
                .btn-primary:focus { outline: none; box-shadow: 0 0 0 3px #BFDBFE; /* focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 */ }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                 .btn-secondary {
                    padding: 0.5rem 1rem;
                    border-width: 1px;
                    border-color: #D1D5DB; /* border-gray-300 */
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #1F2937; /* text-gray-700 */
                    background-color: white;
                }
                 .dark .btn-secondary {
                    border-color: #4B5563; /* dark:border-gray-500 */
                    color: #D1D5DB; /* dark:text-gray-200 */
                    background-color: #4B5563; /* dark:bg-gray-600 */
                 }
                .btn-secondary:hover { background-color: #F9FAFB; /* hover:bg-gray-50 */ }
                .dark .btn-secondary:hover { background-color: #6B7280; /* dark:hover:bg-gray-500 */ }
                .btn-secondary:focus { outline: none; box-shadow: 0 0 0 3px #DBEAFE; /* focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 */ }
                .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
             `}</style>
        </div>
    );
};

export default InitiativeModal;