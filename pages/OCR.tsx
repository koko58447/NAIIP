// pages/OCR.tsx
import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeftIcon, LoaderIcon, UploadIcon, DocumentScanIcon } from '../components/icons';
import { performOcr } from '../services/ocrService';
import { useTranslation } from '../contexts/LanguageContext';

interface OCRProps {
    onNavigateBack: () => void;
}

const OCR: React.FC<OCRProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((selectedFile: File | null) => {
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                setError(t('agentOcrErrorNotImage'));
                return;
            }
            setFile(selectedFile);
            setResultUrl(null); // Clear previous result
            setMessage(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, [t]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleClear = useCallback(() => {
        setFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setMessage(t('ocrClearedMessage'));
        setTimeout(() => setMessage(null), 3000);
    }, [t]);

    const handleOcr = useCallback(async () => {
        if (!file) {
            setError(t('ocrFileError'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setMessage(null);
        setResultUrl(null);

        try {
            const base64Image = await performOcr(file);
            setResultUrl(`data:image/jpeg;base64,${base64Image}`);
            setMessage(t('ocrSuccessMessage'));
        } catch (e: any) {
            setError(e.message || "An unknown error occurred during OCR.");
        } finally {
            setIsLoading(false);
        }
    }, [file, t]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0] || null;
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
        e.dataTransfer.clearData();
    };

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-5xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToDashboard')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 p-3 to-teal-500">
                        {t('ocrPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('ocrPageSubtitle')}</p>
                </div>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={`bg-gray-800/50 border-2 border-dashed rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm transition-colors duration-300 ${
                        isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-700'
                    }`}
                >
                    <div className="space-y-4 mb-8">
                        <label htmlFor="file-input" className="block text-gray-300 font-medium text-lg cursor-pointer">
                            {t('ocrDropzone')}
                        </label>
                        <input
                            ref={fileInputRef}
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-gray-300 border border-gray-600 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-cyan-400 hover:file:bg-gray-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-gray-300">{t('ocrOriginalHeader')}</h3>
                            <div className="bg-gray-900/70 border border-gray-600 rounded-xl w-full min-h-[250px] max-h-[400px] flex items-center justify-center p-2">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Original Preview" className="max-w-full max-h-[380px] object-contain rounded-md" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <UploadIcon className="w-12 h-12 mx-auto mb-2" />
                                        <p>{t('ocrOriginalPlaceholder')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-gray-300">{t('ocrResultHeader')}</h3>
                            <div className="bg-gray-900/70 border border-gray-600 rounded-xl w-full min-h-[250px] max-h-[400px] flex items-center justify-center p-2">
                                {resultUrl ? (
                                    <img src={resultUrl} alt="OCR Result" className="max-w-full max-h-[380px] object-contain rounded-md" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <DocumentScanIcon className="w-12 h-12 mx-auto mb-2" />
                                        <p>{t('ocrResultPlaceholder')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <button
                            onClick={handleOcr}
                            disabled={isLoading || !file}
                            className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50 flex items-center justify-center space-x-2 text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="w-6 h-6" />
                                    <span>{t('ocrProcessingButton')}</span>
                                </>
                            ) : (
                                <span>{t('ocrExtractButton')}</span>
                            )}
                        </button>
                        <button
                            onClick={handleClear}
                            className="w-full sm:w-auto px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 text-lg"
                        >
                            {t('ocrClearButton')}
                        </button>
                    </div>
                     
                    {error && (
                        <div className="mt-6 p-4 rounded-xl text-base text-center bg-red-900/40 text-red-300 border border-red-700">
                            {error}
                        </div>
                    )}
                    {message && !error && (
                         <div className="mt-6 p-4 rounded-xl text-base text-center bg-green-900/40 text-green-300 border border-green-700">
                            {message}
                        </div>
                    )}
                </div>
                 <footer className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
                    <p>{t('ocrFooter')}</p>
                </footer>
            </main>
        </div>
    );
};

export default OCR;
