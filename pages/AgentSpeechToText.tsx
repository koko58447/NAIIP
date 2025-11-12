import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingState } from '../types';
import { transcribeAudioGemini } from '../services/geminiService';
import { MicIcon, StopIcon, UploadIcon, LoaderIcon, CopyIcon, CheckIcon, ArrowLeftIcon } from '../components/icons';
import { useTranslation } from '../contexts/LanguageContext';

interface AgentSpeechToTextProps {
    onNavigateBack: () => void;
}

const StatusIndicator: React.FC<{ isLoading: boolean; error: string | null }> = ({ isLoading, error }) => {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 text-cyan-300 my-4">
                <LoaderIcon className="w-12 h-12 mb-3" />
                <p className="text-lg font-semibold">{t('agentSttLoading')}</p>
                <p className="text-sm text-gray-400">{t('agentSttLoadingWait')}</p>
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

export default function AgentSpeechToText({ onNavigateBack }: AgentSpeechToTextProps) {
    const { t } = useTranslation();
    const [transcription, setTranscription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.INACTIVE);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [justCopied, setJustCopied] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleTranscribe = useCallback(async (audioBlob: Blob) => {
        setIsLoading(true);
        setError(null);
        setTranscription('');
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(audioBlob));

        try {
            const result = await transcribeAudioGemini(audioBlob);
            setTranscription(result);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [audioUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleTranscribe(file);
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
                handleTranscribe(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setRecordingState(RecordingState.RECORDING);
            setError(null);
            setTranscription('');
            setAudioUrl(null);
        } catch (err) {
            setError(t('asrMicError'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setRecordingState(RecordingState.INACTIVE);
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
            handleTranscribe(file);
        } else {
            setError(t('asrFileError'));
        }
    };

    const handleCopy = useCallback(() => {
        if (transcription) {
            navigator.clipboard.writeText(transcription).then(() => {
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2000);
            });
        }
    }, [transcription]);

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-3xl mx-auto space-y-8">
                 <div className="relative text-center mb-4">
                     <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToAgent')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 p-3 to-pink-500">
                        {t('agentSttPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('agentSttPageSubtitle')}</p>
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
                    <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="audio-upload"/>
                    <label htmlFor="audio-upload" className="cursor-pointer text-gray-400 hover:text-sky-400 transition-colors w-full">
                        <UploadIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-lg">{t('agentSttDropzonePrompt')}</p>
                        <p className="text-sm">{t('asrOr')}</p>
                        <p className="text-sky-500 font-bold text-lg mt-1">{t('agentSttChooseFile')}</p>
                    </label>
                    <div className="text-gray-500 text-sm w-full flex items-center justify-center gap-4"><hr className="w-1/4 border-gray-600" /><span>{t('asrOr').toUpperCase()}</span><hr className="w-1/4 border-gray-600" /></div>
                    <button
                        onClick={recordingState === 'INACTIVE' ? startRecording : stopRecording}
                        disabled={isLoading}
                        className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 disabled:opacity-50 ${recordingState === 'RECORDING' ? 'bg-red-600' : 'bg-green-600'}`}
                    >
                        {recordingState === 'RECORDING' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        {recordingState === 'RECORDING' ? <StopIcon className="w-8 h-8 text-white" /> : <MicIcon className="w-8 h-8 text-white" />}
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm min-h-[350px]">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-bold text-cyan-400">{t('agentSttResultHeader')}</h2>
                         {transcription && (
                            <button onClick={handleCopy} title={t('asrCopyToClipboard')} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                                {justCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                     <div className="w-full bg-gray-900/70 rounded-lg min-h-[250px] text-gray-300 text-lg leading-relaxed border border-gray-600 flex flex-col">
                        {(isLoading || error) ? (
                             <div className="flex-grow flex items-center justify-center">
                                <StatusIndicator isLoading={isLoading} error={error} />
                            </div>
                        ) : (
                            <div className="w-full h-full flex-grow p-4 whitespace-pre-wrap">
                              {transcription || <span className="text-gray-500">{t('agentSttPlaceholder')}</span>}
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
        </div>
    );
}
