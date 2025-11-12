import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingState } from '../types';
import { speechToSpeechTranslate, SpeechToSpeechResult } from '../services/geminiService';
import { MicIcon, StopIcon, UploadIcon, LoaderIcon, ArrowLeftIcon, SwitchIcon } from '../components/icons';
import { useTranslation } from '../contexts/LanguageContext';

type Direction = 'my-en' | 'en-my';

const AgentSpeechToSpeech: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [audioFile, setAudioFile] = useState<Blob | null>(null);
    const [result, setResult] = useState<SpeechToSpeechResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<Direction>('my-en');
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.INACTIVE);
    const [isDragging, setIsDragging] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (result?.audioUrl) {
                URL.revokeObjectURL(result.audioUrl);
            }
        };
    }, [result]);

    const handleProcessAudio = useCallback((file: Blob) => {
        setError(null);
        setResult(null);
        setAudioFile(file);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleProcessAudio(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleProcessAudio(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setRecordingState(RecordingState.RECORDING);
            setError(null);
            setResult(null);
            setAudioFile(null);
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

    const handleTranslate = useCallback(async () => {
        if (!audioFile) {
            setError('Please provide an audio file first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        const sourceLang = direction === 'my-en' ? 'Burmese' : 'English';
        const targetLang = direction === 'my-en' ? 'English' : 'Burmese';

        try {
            const response = await speechToSpeechTranslate(audioFile, sourceLang, targetLang);
            setResult(response);
            if(response.audioUrl && audioPlayerRef.current) {
                audioPlayerRef.current.src = response.audioUrl;
                audioPlayerRef.current.play();
            }
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during translation.');
        } finally {
            setIsLoading(false);
        }
    }, [audioFile, direction]);
    
    const handleSwapLanguages = () => {
        setDirection(prev => prev === 'my-en' ? 'en-my' : 'my-en');
        // Optionally clear results when swapping
        setResult(null);
        setAudioFile(null);
        setError(null);
    };

    const sourceLanguageLabel = direction === 'my-en' ? 'Myanmar (မြန်မာ)' : 'English';
    const targetLanguageLabel = direction === 'my-en' ? 'English' : 'Myanmar (မြန်မာ)';

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700" aria-label={t('backToAgent')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r p-3 from-purple-400 to-pink-500">
                        {t('agentS2sPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('agentS2sPageSubtitle')}</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                        <span>{sourceLanguageLabel}</span>
                        <button onClick={handleSwapLanguages} title="Swap Languages" className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <SwitchIcon className="w-6 h-6 text-cyan-400" />
                        </button>
                        <span>{targetLanguageLabel}</span>
                    </div>

                    <div
                        onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-600'}`}
                    >
                        <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="s2s-audio-upload" />
                        <label htmlFor="s2s-audio-upload" className="cursor-pointer">
                            <UploadIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                            <p className="font-semibold text-gray-300">{t('sttDropzonePrompt')}</p>
                            <p className="text-sky-400">{t('sttUpload')}</p>
                        </label>
                        <div className="my-2 text-gray-500">{t('asrOr')}</div>
                        <button
                            onClick={recordingState === 'INACTIVE' ? startRecording : stopRecording}
                            className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-110 ${recordingState === 'RECORDING' ? 'bg-red-600' : 'bg-green-600'}`}
                        >
                            {recordingState === 'RECORDING' ? <StopIcon className="w-8 h-8 text-white" /> : <MicIcon className="w-8 h-8 text-white" />}
                        </button>
                         {/* FIX: The 'Blob' type doesn't have a 'name' property. Cast to 'File' to access it, and fall back for recorded Blobs. */}
                         {audioFile && <p className="text-sm text-cyan-400 mt-3">Selected: {(audioFile as File).name || 'Recorded Audio'}</p>}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button onClick={handleTranslate} disabled={isLoading || !audioFile} className="flex items-center gap-3 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <LoaderIcon className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                        <span>{isLoading ? t('agentS2sProcessingButton') : t('agentS2sProcessButton')}</span>
                    </button>
                </div>
                
                {error && <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg border border-red-700">{error}</div>}

                {!isLoading && result && (
                    <div className="space-y-6 bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg">
                        <div>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">{t('agentS2sTranscription')}</h3>
                            <p className="p-4 bg-gray-900/60 rounded-lg border border-gray-600 min-h-[50px]">{result.transcription}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">{t('agentS2sTranslation')}</h3>
                            <p className="p-4 bg-gray-900/60 rounded-lg border border-gray-600 min-h-[50px]">{result.translation}</p>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">{t('agentS2sResultHeader')}</h3>
                            <audio ref={audioPlayerRef} src={result.audioUrl} controls autoPlay className="w-full h-12 rounded-lg" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AgentSpeechToSpeech;
