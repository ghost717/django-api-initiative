// components/InitiativeModal.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Initiative } from './InitiativeTable';
import { XMarkIcon } from '@heroicons/react/24/outline';
export interface ApiTag { id: number; name: string; }

interface InitiativeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: Partial<Initiative>) => Promise<void>;
    initialData?: Initiative | null;
    isLoading: boolean;
    availableTags: ApiTag[];
}

// Komponent pomocniczy do tworzenia wierszy formularza, inspirowany InfoRow
const FormRow: React.FC<{ label: string; htmlFor: string; required?: boolean; children: React.ReactNode }> = ({ label, htmlFor, required, children }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1 sm:mt-0 sm:col-span-2">
            {children}
        </div>
    </div>
);


const initialFormState: Partial<Initiative> = { name: '', acronym: '', implementing_entity_name: '', entity_status: 'NGO', implementation_area: 'LOCAL', location_text: '', implementing_entity_url: '', description: '', timing: '', funding_source: 'PUBLIC', url: '', tags: [], };
const ENTITY_STATUS_OPTIONS = [{ value: 'NGO', label: 'Organizacja pozarządowa (NGO)' }, { value: 'BUSINESS', label: 'Przedsiębiorstwo' }, { value: 'UNIVERSITY', label: 'Uczelnia' }, { value: 'LOCAL_GOVT', label: 'Jednostka samorządu terytorialnego (JST)' }, { value: 'OTHER', label: 'Inne' },];
const IMPLEMENTATION_AREA_OPTIONS = [{ value: 'INTERNATIONAL', label: 'Międzynarodowy' }, { value: 'NATIONAL', label: 'Krajowy' }, { value: 'REGIONAL', label: 'Regionalny' }, { value: 'LOCAL', label: 'Lokalny' },];
const FUNDING_SOURCE_OPTIONS = [{ value: 'PUBLIC', label: 'Publiczne' }, { value: 'PRIVATE', label: 'Prywatne' },];

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
            setFormData({ ...initialData, entity_status: initialData.entity_status || initialFormState.entity_status, implementation_area: initialData.implementation_area || initialFormState.implementation_area, funding_source: initialData.funding_source || initialFormState.funding_source, tags: initialData.tags || [], });
        } else {
            setFormData(initialFormState);
        }
    }, [initialData, isEditMode, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            const selectedOptions = (e.target as HTMLSelectElement).selectedOptions;
            const selectedTagIds = Array.from(selectedOptions).map(option => parseInt(option.value, 10));
            setFormData(prev => ({ ...prev, tags: selectedTagIds }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const payload = { ...formData };
        delete (payload as any).entity_status_display;
        delete (payload as any).implementation_area_display;
        delete (payload as any).funding_source_display;
        await onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black bg-opacity-60 transition-opacity">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center px-6 py-4 bg-[#273F96] text-white rounded-t-lg">
                        <h3 className="text-lg font-semibold">
                            {isEditMode ? 'Edytuj Inicjatywę' : 'Dodaj Nową Inicjatywę'}
                        </h3>
                        <button onClick={onClose} className="text-gray-300 hover:text-white">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} id="initiative-form" className="p-6 overflow-y-auto flex-grow">
                        <dl className="divide-y divide-gray-200">
                            <FormRow label="Nazwa inicjatywy" htmlFor="name" required>
                                <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="form-input" />
                            </FormRow>
                            <FormRow label="Akronim" htmlFor="acronym">
                                <input type="text" name="acronym" id="acronym" value={formData.acronym || ''} onChange={handleChange} className="form-input" />
                            </FormRow>
                            <FormRow label="Podmiot wdrażający" htmlFor="implementing_entity_name" required>
                                <input type="text" name="implementing_entity_name" id="implementing_entity_name" value={formData.implementing_entity_name || ''} onChange={handleChange} required className="form-input" />
                            </FormRow>
                            <FormRow label="Statut podmiotu" htmlFor="entity_status" required>
                                <select name="entity_status" id="entity_status" value={formData.entity_status || ''} onChange={handleChange} required className="form-select">
                                    {ENTITY_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </FormRow>
                            <FormRow label="Obszar wdrażania" htmlFor="implementation_area" required>
                                <select name="implementation_area" id="implementation_area" value={formData.implementation_area || ''} onChange={handleChange} required className="form-select">
                                    {IMPLEMENTATION_AREA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </FormRow>
                            <FormRow label="Miejsce realizacji" htmlFor="location_text">
                                <input type="text" name="location_text" id="location_text" value={formData.location_text || ''} onChange={handleChange} className="form-input" />
                            </FormRow>
                            <FormRow label="Termin realizacji" htmlFor="timing">
                                <input type="text" name="timing" id="timing" value={formData.timing || ''} onChange={handleChange} className="form-input" />
                            </FormRow>
                            <FormRow label="Źródło finansowania" htmlFor="funding_source" required>
                                <select name="funding_source" id="funding_source" value={formData.funding_source || ''} onChange={handleChange} required className="form-select">
                                    {FUNDING_SOURCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </FormRow>
                            <FormRow label="Strona WWW" htmlFor="url">
                                <input type="url" name="url" id="url" value={formData.url || ''} onChange={handleChange} className="form-input" placeholder="https://example.com" />
                            </FormRow>
                            <FormRow label="Opis" htmlFor="description">
                                <textarea name="description" id="description" rows={5} value={formData.description || ''} onChange={handleChange} maxLength={1000} className="form-input"></textarea>
                            </FormRow>
                            <FormRow label="Tagi" htmlFor="tags">
                                <select multiple name="tags" id="tags" value={formData.tags?.map(String) || []} onChange={handleChange} className="form-select h-32">
                                    {availableTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                                </select>
                            </FormRow>
                        </dl>
                    </form>

                    <div className="px-6 py-3 bg-gray-100 border-t flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                            Anuluj
                        </button>
                        <button type="submit" form="initiative-form" disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#273F96] hover:bg-blue-800 disabled:opacity-50">
                            {isLoading ? 'Zapisywanie...' : (isEditMode ? 'Zapisz Zmiany' : 'Dodaj Inicjatywę')}
                        </button>
                    </div>
                </div>
            </div>
            {/* Style dla pól formularza, umieszczone tutaj dla porządku */}
            <style jsx>{`
                .form-input, .form-select {
                    @apply block w-full text-gray-900 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
                }
            `}</style>
        </div>
    );
};

export default InitiativeModal;