// components/InitiativeDisplay.tsx
'use client'; // Kluczowe dla użycia hooków (useState, useMemo) i interaktywności

import React, { useState, useMemo } from 'react';
import InitiativeTable, { Initiative } from './InitiativeTable'; // Importuj tabelę i typ

interface InitiativeDisplayProps {
    initialInitiatives: Initiative[]; // Dane przekazane z Server Component (page.tsx)
}

const InitiativeDisplay: React.FC<InitiativeDisplayProps> = ({ initialInitiatives }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrowanie odbywa się po stronie klienta na podstawie danych początkowych
    const filteredInitiatives = useMemo(() => {
        // Jeśli nie ma danych początkowych, zwróć pustą tablicę
        if (!initialInitiatives) return [];

        // Jeśli nie ma terminu wyszukiwania, zwróć wszystkie dane
        if (!searchTerm) {
            return initialInitiatives;
        }

        // Logika filtrowania (taka sama jak poprzednio)
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return initialInitiatives.filter(initiative =>
            initiative.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (initiative.description && initiative.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (initiative.region && initiative.region.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (initiative.place && initiative.place.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (initiative.person && initiative.person.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (initiative.category && initiative.category.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (initiative.thematic_category && initiative.thematic_category.toLowerCase().includes(lowerCaseSearchTerm))
            // Można dodać wyszukiwanie po ID tagów, jeśli API je zwraca i masz mapowanie ID->nazwa
        );
    }, [initialInitiatives, searchTerm]);

    return (
        // Używamy fragmentu, aby nie dodawać niepotrzebnego diva
        <>
            {/* Pasek wyszukiwania */}
            <div className="mb-6 w-full max-w-2xl"> {/* Ogranicz szerokość paska */}
                <input
                    type="text"
                    placeholder="Szukaj wg nazwy, opisu, regionu, miejsca, osoby..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
            </div>

            {/* Tabela Inicjatyw */}
            <InitiativeTable initiatives={filteredInitiatives} />
        </>
    );
};

export default InitiativeDisplay;