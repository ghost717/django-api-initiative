// components/InitiativeModal.tsx
'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Initiative } from './InitiativeTable'; // Zakładamy, że Initiative jest w InitiativeTable

// Typ dla tagów pobranych z API
export interface ApiTag {
    id: number;
    name: string;
}

interface InitiativeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: Partial<Initiative>) => Promise<void>; // Zwraca Promise do obsługi isLoading
    initialData?: Initiative | null; // Dane do edycji
    isLoading: boolean; // Stan ładowania przekazywany z komponentu nadrzędnego
    availableTags: ApiTag[]; // Lista dostępnych tagów
}

// Inicjalny stan pustego formularza (używany do dodawania)
const initialFormState: Partial<Initiative> = {
    name: '',
    url: '',
    person: '',
    category: '',
    timing: '',
    public: true,
    funders: '',
    place: '',
    region: '',
    description: '',
    target: '',
    tags: [], // Będzie przechowywać tablicę ID tagów
    thematic_category: '',
};

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

    // Efekt do ustawienia danych formularza, gdy otwieramy modal w trybie edycji
    // lub resetowania formularza, gdy initialData staje się null (np. po zamknięciu)
    useEffect(() => {
        if (isEditMode && initialData) {
            // Upewnij się, że tags to tablica ID, a nie obiektów (jeśli API zwracałoby obiekty)
            const tagsAsIds = initialData.tags || [];
            setFormData({ ...initialData, tags: tagsAsIds });
        } else {
            setFormData(initialFormState);
        }
    }, [initialData, isEditMode, isOpen]); // Zależność od isOpen zapewnia reset przy ponownym otwarciu

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            // Specjalna obsługa dla checkboxa 'public'
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'tags') {
            // Specjalna obsługa dla multi-select tagów
            const selectedOptions = (e.target as HTMLSelectElement).selectedOptions;
            const selectedTagIds = Array.from(selectedOptions).map(option => parseInt(option.value, 10));
            setFormData(prev => ({ ...prev, tags: selectedTagIds }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Prosta walidacja - można dodać bardziej złożoną
        if (!formData.name?.trim()) {
            alert("Nazwa inicjatywy jest wymagana.");
            return;
        }
        await onSubmit(formData); // Wywołaj funkcję submit przekazaną z góry
        // Stan ładowania jest zarządzany w komponencie nadrzędnym
        // Zamknięcie modala też jest zarządzane w komponencie nadrzędnym po sukcesie onSubmit
    };

    return (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-gray-600 bg-opacity-75 transition-opacity">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Nagłówek Modala */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isEditMode ? 'Edytuj Inicjatywę' : 'Dodaj Nową Inicjatywę'}
                        </h3>
                    </div>

                    {/* Formularz (scrollable) */}
                    <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto flex-grow">
                        {/* Name (Required) */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa <span className="text-red-500">*</span></label>
                            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>

                        {/* URL */}
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
                            <input type="url" name="url" id="url" value={formData.url || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>

                        {/* Podziel na dwie kolumny dla lepszego układu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Person */}
                            <div>
                                <label htmlFor="person" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Osoba Kontaktowa</label>
                                <input type="text" name="person" id="person" value={formData.person || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategoria</label>
                                <input type="text" name="category" id="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>

                            {/* Timing */}
                            <div>
                                <label htmlFor="timing" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timing</label>
                                <input type="text" name="timing" id="timing" value={formData.timing || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>

                            {/* Thematic Category */}
                            <div>
                                <label htmlFor="thematic_category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategoria Tematyczna</label>
                                <input type="text" name="thematic_category" id="thematic_category" value={formData.thematic_category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>

                            {/* Region */}
                            <div>
                                <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                                <input type="text" name="region" id="region" value={formData.region || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>

                            {/* Place */}
                            <div>
                                <label htmlFor="place" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Miejsce</label>
                                <input type="text" name="place" id="place" value={formData.place || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>

                        {/* Funders */}
                        <div>
                            <label htmlFor="funders" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Finansujący</label>
                            <input type="text" name="funders" id="funders" value={formData.funders || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>

                        {/* Target */}
                        <div>
                            <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grupa Docelowa</label>
                            <input type="text" name="target" id="target" value={formData.target || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis</label>
                            <textarea name="description" id="description" rows={4} value={formData.description || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"></textarea>
                        </div>

                        {/* Tags (Multi-select) */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tagi</label>
                            <select
                                multiple // Umożliwia wielokrotny wybór
                                name="tags"
                                id="tags"
                                value={formData.tags?.map(String) || []} // Musi być tablica stringów dla <select multiple>
                                onChange={handleChange}
                                className="mt-1 block w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            >
                                {availableTags.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Przytrzymaj Ctrl (lub Cmd na Mac), aby wybrać wiele tagów.</p>
                        </div>

                        {/* Public (Checkbox) */}
                        <div className="flex items-center">
                            <input
                                id="public"
                                name="public"
                                type="checkbox"
                                checked={formData.public || false}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="public" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Inicjatywa Publiczna
                            </label>
                        </div>
                    </form>

                    {/* Stopka Modala z przyciskami */}
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit" // Powiązany z formularzem
                            form="initiative-form" // ID formularza (dodaj id do tagu <form>)
                            onClick={handleSubmit} // Można też użyć form.submit() ale tak jest czytelniej
                            disabled={isLoading}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? (isEditMode ? 'Zapisywanie...' : 'Dodawanie...') : (isEditMode ? 'Zapisz Zmiany' : 'Dodaj Inicjatywę')}
                        </button>
                    </div>

                    <script>
                        <form onSubmit={handleSubmit} id="initiative-form" className="px-6 py-4 space-y-4 overflow-y-auto flex-grow"></form>
                    </script>

                </div>
            </div>
        </div>
    );
};


export default InitiativeModal;