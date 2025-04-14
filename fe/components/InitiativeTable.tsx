// components/InitiativeTable.tsx
import React from 'react';

// Definicja typu dla inicjatywy (ważne przy TypeScript)
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

interface InitiativeTableProps {
    initiatives: Initiative[];
}

const InitiativeTable: React.FC<InitiativeTableProps> = ({ initiatives }) => {
    if (!initiatives || initiatives.length === 0) {
        return <p className="text-center text-gray-500 mt-4">Nie znaleziono inicjatyw.</p>;
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Nazwa
                        </th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell"> {/* Ukryte na małych ekranach */}
                            Osoba
                        </th>
                        <th scope="col" className="px-6 py-3 hidden lg:table-cell"> {/* Ukryte na małych/średnich ekranach */}
                            Kategoria
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Region
                        </th>
                        <th scope="col" className="px-6 py-3 hidden sm:table-cell"> {/* Ukryte na bardzo małych ekranach */}
                            Publiczna
                        </th>
                        <th scope="col" className="px-6 py-3 hidden xl:table-cell"> {/* Ukryte do XL */}
                            URL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {initiatives.map((initiative) => (
                        <tr key={initiative.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {initiative.name}
                            </th>
                            <td className="px-6 py-4 hidden md:table-cell">
                                {initiative.person || '-'}
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                                {initiative.category || '-'}
                            </td>
                            <td className="px-6 py-4">
                                {initiative.region || '-'}
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                                {initiative.public ? 'Tak' : 'Nie'}
                            </td>
                            <td className="px-6 py-4 hidden xl:table-cell">
                                {initiative.url ? (
                                    <a href={initiative.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                        Link
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InitiativeTable;

// Jeśli nie używasz TypeScript, usuń : React.FC<...>, InitiativeTableProps, Initiative i interface Initiative