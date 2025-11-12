import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { RecordingState, Correction } from '../types';
import { transcribeAudio } from '../services/asrService';
import { spellCheckText } from '../services/geminiService';
import { MicIcon, StopIcon, UploadIcon, LoaderIcon, CopyIcon, CheckIcon, LanguageIcon, ArrowLeftIcon } from '../components/icons';
import { useTranslation } from '../contexts/LanguageContext';

interface ASRProps {
    onNavigateBack: () => void;
}

const StatusIndicator: React.FC<{ isLoading: boolean; error: string | null }> = ({ isLoading, error }) => {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 text-cyan-300 my-4">
                <LoaderIcon className="w-12 h-12 mb-3" />
                <p className="text-lg font-semibold">{t('asrLoading')}</p>
                <p className="text-sm text-gray-400">{t('asrPleaseWait')}</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg my-4 border border-red-700">
                <h3 className="font-bold text-lg mb-1">{t('asrErrorOccurred')}</h3>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    return null;
};

const CorrectionSpan: React.FC<{ word: string; correction: string; onClick: () => void; }> = ({ word, correction, onClick }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <span
            className="relative bg-yellow-500/30 cursor-pointer rounded px-1 py-0.5"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={onClick}
        >
            {word}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 shadow-lg z-10 border border-gray-600">
                    {correction}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                </div>
            )}
        </span>
    );
};


export default function ASR({ onNavigateBack }: ASRProps) {
    const { t } = useTranslation();
    const [transcription, setTranscription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.INACTIVE);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [justCopied, setJustCopied] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [isCheckingSpelling, setIsCheckingSpelling] = useState<boolean>(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        // Cleanup audio object URL to prevent memory leaks
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);


    const handleTranscribe = useCallback(async (audioBlob: Blob) => {
        setIsLoading(true);
        setError(null);
        setTranscription('');
        setCorrections([]);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(URL.createObjectURL(audioBlob));


        const onChunk = (chunk: string) => {
            setTranscription(prev => prev + chunk);
        };

        const onComplete = () => {
            setIsLoading(false);
        };

        const onError = (e: Error) => {
            setError(e.message || 'An unexpected error occurred.');
            setIsLoading(false);
        };

        await transcribeAudio(audioBlob, onChunk, onComplete, onError);
    }, [audioUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleTranscribe(file);
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleTranscribe(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setRecordingState(RecordingState.RECORDING);
            setError(null);
            setTranscription('');
            setCorrections([]);
            setAudioUrl(null);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError(t('asrMicError'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setRecordingState(RecordingState.INACTIVE);
        }
    };

    const toggleRecording = () => {
        if (recordingState === RecordingState.INACTIVE) {
            startRecording();
        } else {
            stopRecording();
        }
    };
    
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

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const audioFile = files[0];
            if (audioFile.type.startsWith('audio/')) {
                handleTranscribe(audioFile);
            } else {
                setError(t('asrFileError'));
            }
            e.dataTransfer.clearData();
        }
    };

    const handleCopy = useCallback(() => {
        if (transcription) {
            navigator.clipboard.writeText(transcription)
                .then(() => {
                    setJustCopied(true);
                    setTimeout(() => setJustCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    setError(t('mtCopyError'));
                });
        }
    }, [transcription, t]);

    const handleSpellCheck = useCallback(async () => {
        if (!transcription || isCheckingSpelling) return;
        setIsCheckingSpelling(true);
        setError(null);
        try {
            const result = await spellCheckText(transcription);
            setCorrections(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsCheckingSpelling(false);
        }
    }, [transcription, isCheckingSpelling]);
    
    const handleCorrectionClick = useCallback((original: string, correction: string) => {
        // FIX: Use `split` and `join` to ensure all instances of an error are corrected, not just the first one, for wider compatibility.
        setTranscription(prev => prev.split(original).join(correction));
        setCorrections(prev => prev.filter(c => c.original !== original));
    }, []);

    const renderedText = useMemo(() => {
        if (corrections.length === 0) return transcription;
        
        const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${corrections.map(c => escapeRegex(c.original)).join('|')})`, 'g');
        const parts = transcription.split(regex).filter(part => part);

        return parts.map((part, index) => {
            const correction = corrections.find(c => c.original === part);
            if (correction) {
                return (
                    <CorrectionSpan
                        key={`${part}-${index}`}
                        word={part}
                        correction={correction.correction}
                        onClick={() => handleCorrectionClick(part, correction.correction)}
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    }, [transcription, corrections, handleCorrectionClick]);


    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-3xl mx-auto space-y-8">
                 <div className="relative text-center mb-4">
                     <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToDashboard')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 pb-2 to-teal-500">
                        {t('asrPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('asrPageSubtitle')}</p>
                </div>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={`relative bg-gray-800/50 border-2 border-dashed rounded-2xl p-6 shadow-2xl backdrop-blur-sm transition-colors duration-300 flex flex-col items-center justify-center text-center space-y-6 min-h-[250px] ${
                        isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-700'
                    }`}
                >
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer text-gray-400 hover:text-sky-400 transition-colors w-full">
                        <UploadIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-lg">{t('asrDropzonePrompt')}</p>
                        <p className="text-sm">{t('asrOr')}</p>
                        <p className="text-sky-500 font-bold text-lg mt-1">{t('asrBrowse')}</p>
                    </label>

                    <div className="text-gray-500 text-sm w-full flex items-center justify-center gap-4">
                        <hr className="w-1/4 border-gray-600" />
                        <span>{t('asrOr')}</span>
                        <hr className="w-1/4 border-gray-600" />
                    </div>

                    <button
                        onClick={toggleRecording}
                        disabled={isLoading}
                        className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                            recordingState === RecordingState.RECORDING
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-400'
                        }`}
                        aria-label={recordingState === RecordingState.RECORDING ? t('asrStopRecording') : t('asrStartRecording')}
                    >
                        {recordingState === RecordingState.RECORDING && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        )}
                        {recordingState === RecordingState.RECORDING ? (
                            <StopIcon className="w-8 h-8 text-white" />
                        ) : (
                            <MicIcon className="w-8 h-8 text-white" />
                        )}
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm min-h-[350px]">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-bold text-cyan-400">{t('asrResultHeader')}</h2>
                         {transcription && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleSpellCheck}
                                    title={t('asrSpellCheck')}
                                    disabled={isCheckingSpelling || corrections.length > 0}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={t('asrSpellCheck')}
                                >
                                    {isCheckingSpelling ? <LoaderIcon className="w-5 h-5" /> : <LanguageIcon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleCopy}
                                    title={t('asrCopyToClipboard')}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    aria-label="Copy text"
                                >
                                    {justCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                     <div className="w-full bg-gray-900/70 rounded-lg min-h-[250px] text-gray-300 text-lg leading-relaxed border border-gray-600 flex flex-col">
                        {(isLoading && !transcription) || error ? (
                             <div className="flex-grow flex items-center justify-center">
                                <StatusIndicator isLoading={isLoading && !transcription} error={error} />
                            </div>
                        ) : (
                            <div className="w-full h-full flex-grow appearance-none resize-none border-none focus:outline-none focus:ring-0 text-gray-300 text-lg leading-relaxed p-4 whitespace-pre-wrap">
                              {transcription ? renderedText : <span className="text-gray-500">{t('asrPlaceholder')}</span>}
                            </div>
                        )}
                    </div>
                     {audioUrl && !isLoading && (
                        <div className="mt-4">
                            <audio controls src={audioUrl} className="w-full h-10 rounded-lg">
                                {t('asrAudioError')}
                            </audio>
                        </div>
                    )}
                </div>
            </main>
             <footer className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
                <p>{t('asrFooter')}</p>
            </footer>
        </div>
    );
}
