import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftIcon } from '../components/icons';
import { processPdfWithGemini, PdfProcessingParams } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';

type ProcessingMode = 'full' | 'summarize' | 'keypoints';

const AgentPdfExtractor: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [mode, setMode] = useState<ProcessingMode>('full');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        setStatus('');
        if (selectedFile && selectedFile.type === 'application/pdf') {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setStatus(t('agentPdfErrorSize'));
                setFileName('');
                setFile(null);
            } else {
                setFile(selectedFile);
                setFileName(`${t('agentPdfSelectedFile')} ${selectedFile.name}`);
            }
        } else if (selectedFile) {
            setStatus(t('agentPdfErrorType'));
            setFileName('');
            setFile(null);
        }
    };

    const handleExtract = useCallback(async () => {
        if (!file) {
            setStatus(t('agentPdfErrorSelect'));
            return;
        }
        
        setIsLoading(true);
        setOutput('');
        setStatus('');

        try {
            const params: PdfProcessingParams = { pdfFile: file, mode };
            const result = await processPdfWithGemini(params);
            setOutput(result);
            setStatus(t('agentPdfStatusComplete'));
        } catch (error: any) {
            setOutput(`An error occurred: ${error.message}`);
            setStatus(t('agentPdfStatusFailed'));
        } finally {
            setIsLoading(false);
        }
    }, [file, mode, t]);
    
    const handleDownload = () => {
        if (!output) {
            setStatus(t('agentPdfStatusNoDownload'));
            return;
        }
        const blob = new Blob([output], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `burmese_extraction_${Date.now()}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus(t('agentPdfStatusDownloaded'));
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files?.[0] || null);
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="relative text-center mb-10">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700" aria-label={t('back')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-4xl font-extrabold text-white mb-2 p-3">
                        {/* FIX: Use the new, non-conflicting translation key for the page title. */}
                        <span className="text-indigo-500">AI</span> {t('agentPdfPageTitle')}
                    </h1>
                    <p className="text-gray-400">{t('agentPdfSubtitle')}</p>
                </header>

                <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700">
                    <div className="mb-6 space-y-4">
                        <label className="block text-sm font-medium text-gray-300">{t('agentPdfUploadLabel')}</label>
                        <input type="file" ref={fileInputRef} onChange={e => handleFileSelect(e.target.files?.[0] || null)} accept=".pdf" className="hidden" />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-xl cursor-pointer transition duration-200 h-40 ${isDragging ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'}`}
                        >
                            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4v2a1 1 0 01-1 1h-1a1 1 0 00-1 1v3m-3-3l3 3m-3-3l-3-3"></path></svg>
                            <p className="text-lg font-semibold text-gray-300">{t('agentPdfDropzone')}</p>
                            <p className="text-sm text-gray-500 mt-1">{fileName}</p>
                        </div>
                        <div className="text-sm text-red-400 min-h-[1.5rem] mt-2">{status}</div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('agentPdfModeLabel')}</label>
                        <div className="flex flex-wrap gap-4">
                            {(['full', 'summarize', 'keypoints'] as ProcessingMode[]).map(m => (
                                <label key={m} className="flex items-center text-gray-300 cursor-pointer">
                                    <input type="radio" name="processingMode" value={m} checked={mode === m} onChange={() => setMode(m)} className="h-4 w-4 text-indigo-500 border-gray-600 focus:ring-indigo-500 bg-gray-700"/>
                                    <span className="ml-2 capitalize">{t(`agentPdfMode${m.charAt(0).toUpperCase() + m.slice(1)}` as any)} {m !== 'full' && '✨'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                        <button onClick={handleExtract} disabled={isLoading || !file} className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold shadow-lg shadow-indigo-500/50 hover:bg-indigo-600 transition duration-200 disabled:opacity-50 flex items-center justify-center">
                            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isLoading ? t('agentPdfProcessing') : t('agentPdfExtractButton')}
                        </button>
                        <button onClick={handleDownload} disabled={isLoading || !output} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-green-500/50 hover:bg-green-700 transition duration-200 disabled:opacity-50 flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            {t('agentPdfDownloadButton')}
                        </button>
                    </div>

                    <label htmlFor="output" className="block text-sm font-medium text-gray-300 mb-2">{t('agentOcrExtractedTextLabel')}</label>
                    <textarea id="output" rows={15} readOnly value={output} placeholder={t('agentPdfResultPlaceholder')} className="w-full p-4 rounded-lg bg-gray-900/70 text-gray-50 border border-gray-600 resize-none"></textarea>
                </div>
            </div>
        </div>
    );
};

export default AgentPdfExtractor;