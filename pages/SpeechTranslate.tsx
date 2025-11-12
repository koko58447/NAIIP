// pages/SpeechTranslate.tsx
import React, { useState, useRef, useCallback } from 'react';
import { RecordingState } from '../types';
import { transcribeAndTranslateAudio, SpeechTranslationResult } from '../services/geminiService';
import { MicIcon, StopIcon, UploadIcon, LoaderIcon, CopyIcon, CheckIcon, ArrowLeftIcon } from '../components/icons';
import { useTranslation } from '../contexts/LanguageContext';

interface SpeechTranslateProps {
    onNavigateBack: () => void;
}

const SpeechTranslate: React.FC<SpeechTranslateProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [result, setResult] = useState<SpeechTranslationResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.INACTIVE);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [justCopied, setJustCopied] = useState<'transcription' | 'translation' | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProcessAudio = useCallback(async (audioBlob: Blob) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            // For now, target language is hardcoded to English. Can be extended with a dropdown.
            const response = await transcribeAndTranslateAudio(audioBlob, 'English');
            setResult(response);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleProcessAudio(file);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleProcessAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setRecordingState(RecordingState.RECORDING);
            setError(null);
            setResult(null);
        } catch (err) {
            setError(t('sttMicError'));
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setRecordingState(RecordingState.INACTIVE);
    };

    const handleCopy = (text: string, type: 'transcription' | 'translation') => {
        navigator.clipboard.writeText(text).then(() => {
            setJustCopied(type);
            setTimeout(() => setJustCopied(null), 2000);
        });
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith('audio/')) {
            handleProcessAudio(file);
        } else {
            setError(t('sttFileError'));
        }
    };

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700" aria-label={t('back')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r p-3 from-purple-400 to-pink-500">
                        {t('sttPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('sttPageSubtitle')}</p>
                </div>
                
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={`relative bg-gray-800/50 border-2 border-dashed rounded-2xl p-6 shadow-lg transition-colors duration-300 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px] ${isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-700'}`}
                >
                    <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="audio-upload-translate" />
                    <label htmlFor="audio-upload-translate" className="cursor-pointer text-gray-400 hover:text-sky-400 transition-colors w-full">
                        <UploadIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-lg">{t('sttDropzonePrompt')}</p>
                        <p className="text-sm">{t('sttUpload')}</p>
                    </label>
                    <div className="text-gray-500 text-sm">{t('sttRecord')}</div>
                    <button
                        onClick={recordingState === 'INACTIVE' ? startRecording : stopRecording}
                        className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-110 ${recordingState === 'RECORDING' ? 'bg-red-600' : 'bg-green-600'}`}
                    >
                         {recordingState === 'RECORDING' ? <StopIcon className="w-8 h-8 text-white" /> : <MicIcon className="w-8 h-8 text-white" />}
                    </button>
                </div>
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-cyan-300 my-4">
                        <LoaderIcon className="w-12 h-12 mb-3" />
                        <p className="text-lg font-semibold">{t('sttLoading')}</p>
                    </div>
                )}
                
                {error && <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg border border-red-700">{error}</div>}

                {!isLoading && result && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="w-full space-y-2">
                             <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-cyan-400">{t('sttResultTranscription')}</h3>
                                <button onClick={() => handleCopy(result.transcription, 'transcription')} className="p-2 rounded-full hover:bg-gray-700">
                                    {justCopied === 'transcription' ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                                </button>
                             </div>
                             <div className="p-4 rounded-lg bg-gray-800/60 border border-gray-700 min-h-[150px] whitespace-pre-wrap">{result.transcription}</div>
                        </div>
                        <div className="w-full space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-cyan-400">{t('sttResultTranslation')}</h3>
                                <button onClick={() => handleCopy(result.translation, 'translation')} className="p-2 rounded-full hover:bg-gray-700">
                                    {justCopied === 'translation' ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                                </button>
                             </div>
                             <div className="p-4 rounded-lg bg-gray-800/60 border border-gray-700 min-h-[150px] whitespace-pre-wrap">{result.translation}</div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SpeechTranslate;
