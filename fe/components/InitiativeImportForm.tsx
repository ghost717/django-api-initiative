// components/InitiativeImportForm.tsx
'use client'; // Ten komponent potrzebuje interaktywności klienta

import React, { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'; // Ikona do przycisku

// Typ dla odpowiedzi z backendu (dostosuj, jeśli Twoja odpowiedź jest inna)
interface ImportResponse {
    message: string;
    imported_count?: number; // Opcjonalne, jeśli API zwraca
    skipped_rows?: Array<{ row: number; reason: string }>;
    errors?: string[]; // Dla ogólnych błędów
    error?: string; // Dla prostszych błędów
}

interface InitiativeImportFormProps {
    onImportSuccess: () => void; // Funkcja zwrotna po udanym imporcie (do odświeżenia danych)
    apiUrl: string; // Przekazujemy URL API jako prop
}

const InitiativeImportForm: React.FC<InitiativeImportFormProps> = ({ onImportSuccess, apiUrl }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [skippedRows, setSkippedRows] = useState<Array<{ row: number; reason: string }> | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            // Resetuj status przy wyborze nowego pliku
            setUploadStatus('idle');
            setFeedbackMessage(null);
            setSkippedRows(null);
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Zapobiegaj standardowemu wysłaniu formularza

        if (!selectedFile) {
            setFeedbackMessage("Proszę wybrać plik do importu.");
            setUploadStatus('error');
            return;
        }

        if (!apiUrl) {
            setFeedbackMessage("Błąd konfiguracji: Brak URL API.");
            setUploadStatus('error');
            return;
        }

        setUploadStatus('uploading');
        setFeedbackMessage("Przesyłanie i przetwarzanie pliku...");
        setSkippedRows(null);

        const formData = new FormData();
        formData.append('file', selectedFile); // Klucz 'file' musi pasować do oczekiwanego przez backend (parser MultiPartParser)

        try {
            const response = await fetch(`${apiUrl}/initiatives/import/`, {
                method: 'POST',
                body: formData,
                // Nie ustawiaj nagłówka 'Content-Type', przeglądarka zrobi to poprawnie dla FormData (włączając boundary)
                // Możesz dodać nagłówki autoryzacji, jeśli są wymagane np.
                // headers: { 'Authorization': `Bearer ${your_token}` }
            });

            const result: ImportResponse = await response.json();

            if (response.ok) {
                setUploadStatus('success');
                setFeedbackMessage(result.message || "Import zakończony pomyślnie.");
                setSkippedRows(result.skipped_rows || null);
                setSelectedFile(null); // Wyczyść wybór pliku po sukcesie
                // @ts-ignore - reset input value so the same file can be selected again
                event.target.reset();
                onImportSuccess(); // Wywołaj funkcję zwrotną (np. do odświeżenia tabeli)
            } else {
                // Spróbuj wyciągnąć błąd z różnych możliwych pól
                const errorMessage = result.error || (result.errors ? result.errors.join(', ') : `Błąd serwera: ${response.statusText} (Status: ${response.status})`);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Błąd importu:', error);
            setUploadStatus('error');
            setFeedbackMessage(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas importu.");
            setSkippedRows(null);
        }
    };

    return (
        <div className="w-full max-w-xl p-6 my-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Importuj Inicjatywy z Pliku</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Wybierz plik (.csv lub .xlsx)
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" // Mime types dla xlsx i csv
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        aria-describedby="file_input_help"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">
                        Dozwolone formaty: CSV (UTF-8), XLSX. Upewnij się, że plik ma poprawne nagłówki kolumn.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={!selectedFile || uploadStatus === 'uploading'}
                    className={`inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {uploadStatus === 'uploading' ? (
                        <>
                            <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5424 39.6781 93.9676 39.0409Z" fill="currentColor" />
                            </svg>
                            Przetwarzanie...
                        </>
                    ) : (
                        <>
                            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                            Importuj Plik
                        </>
                    )}
                </button>
            </form>

            {/* Wyświetlanie informacji zwrotnej */}
            {feedbackMessage && (
                <div className={`mt-4 p-4 text-sm rounded-lg ${uploadStatus === 'success' ? 'text-green-800 bg-green-50 dark:bg-gray-700 dark:text-green-400' : ''
                    } ${uploadStatus === 'error' ? 'text-red-800 bg-red-50 dark:bg-gray-700 dark:text-red-400' : ''
                    } ${uploadStatus === 'uploading' ? 'text-blue-800 bg-blue-50 dark:bg-gray-700 dark:text-blue-400' : ''
                    }`} role="alert">
                    <span className="font-medium">{
                        uploadStatus === 'success' ? 'Sukces!' :
                            uploadStatus === 'error' ? 'Błąd!' :
                                'Informacja:'
                    }</span> {feedbackMessage}
                </div>
            )}

            {/* Wyświetlanie pominiętych wierszy */}
            {skippedRows && skippedRows.length > 0 && (
                <div className="mt-4 p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-700 dark:text-yellow-300" role="alert">
                    <span className="font-medium">Uwaga!</span> Niektóre wiersze zostały pominięte:
                    <ul className="mt-1.5 list-disc list-inside">
                        {skippedRows.map((skip, index) => (
                            <li key={index}>Wiersz {skip.row}: {skip.reason}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InitiativeImportForm;