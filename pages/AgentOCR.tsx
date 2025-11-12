// pages/AgentOCR.tsx
import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeftIcon, LoaderIcon, UploadIcon, DocumentScanIcon, CopyIcon, CheckIcon } from '../components/icons';
import { extractTextFromImage } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';

interface AgentOCRProps {
    onNavigateBack: () => void;
}

const AgentOCR: React.FC<AgentOCRProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [justCopied, setJustCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((selectedFile: File | null) => {
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                setError(t('agentOcrErrorNotImage'));
                return;
            }
            setFile(selectedFile);
            setExtractedText('');
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, [t]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files?.[0] || null);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files?.[0] || null);
    };
    
    const handleExtract = useCallback(async () => {
        if (!file) {
            setError(t('agentOcrErrorNoFile'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setExtractedText('');
        try {
            const text = await extractTextFromImage(file);
            setExtractedText(text);
        } catch (e: any) {
            setError(e.message || t('agentOcrErrorUnknown'));
        } finally {
            setIsLoading(false);
        }
    }, [file, t]);
    
    const handleCopy = useCallback(() => {
        if (extractedText) {
            navigator.clipboard.writeText(extractedText).then(() => {
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2000);
            });
        }
    }, [extractedText]);

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-5xl mx-auto space-y-8">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Back">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 p-3 to-pink-500">
                        {/* FIX: Use the new, non-conflicting translation key for the page title. */}
                        {t('agentOcrPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('agentOcrSubtitle')}</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">{t('agentOcrUploadImageLabel')}</h2>
                    <div
                        className={`w-full p-6 border-2 border-dashed rounded-xl transition-colors duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-600 hover:border-sky-500 hover:bg-gray-700/50'}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                    >
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                        <UploadIcon className="w-12 h-12 text-gray-500 mb-3"/>
                        <p className="text-gray-300 font-semibold">{t('agentOcrDropzonePrompt')}</p>
                        {file && <p className="text-sm text-cyan-400 mt-2">{t('agentOcrSelectedFile')} {file.name}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <button
                        onClick={handleExtract}
                        disabled={isLoading || !file}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400"
                    >
                        {isLoading ? <LoaderIcon className="w-6 h-6" /> : <DocumentScanIcon className="w-6 h-6" />}
                        <span>{isLoading ? t('agentOcrExtractingButton') : t('agentOcrExtractButton')}</span>
                    </button>
                </div>
                
                {error && <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg border border-red-700">{error}</div>}

                {(isLoading || extractedText || previewUrl) && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="w-full space-y-3">
                            <h3 className="text-lg font-bold text-gray-300">{t('agentOcrOriginalImageLabel')}</h3>
                            <div className="bg-gray-900/70 border border-gray-600 rounded-xl w-full min-h-[300px] flex items-center justify-center p-2">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[400px] object-contain rounded-md" />
                                ) : null}
                            </div>
                        </div>
                        <div className="w-full space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-300">{t('agentOcrExtractedTextLabel')}</h3>
                                {extractedText && (
                                    <button onClick={handleCopy} title={t('agentOcrCopyButtonTitle')} className="p-2 rounded-full text-gray-400 hover:bg-gray-700">
                                        {justCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                    </button>
                                )}
                            </div>
                            <div className="w-full min-h-[300px] max-h-[424px] p-4 bg-gray-900/70 border border-gray-600 rounded-xl text-lg leading-relaxed whitespace-pre-wrap overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-cyan-300">
                                    <LoaderIcon className="w-10 h-10" />
                                </div>
                            ) : (
                                extractedText || <span className="text-gray-500">{t('agentOcrPlaceholder')}</span>
                            )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AgentOCR;