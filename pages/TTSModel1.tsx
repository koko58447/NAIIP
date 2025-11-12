import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeftIcon, LoaderIcon, SoundIcon } from '../components/icons';
// FIX: Correctly import TTSResult type instead of non-existent TTSModel1Result.
import { generateSpeechModel1, TTSResult } from '../services/ttsService';
import { useTranslation } from '../contexts/LanguageContext';

interface TTSModel1Props {
    onNavigateBack: () => void;
}

const TTSModel1: React.FC<TTSModel1Props> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    // FIX: Use the correct TTSResult type for the result state.
    const [result, setResult] = useState<TTSResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // New state for controls
    const [removeSilence, setRemoveSilence] = useState(true);
    const [speed, setSpeed] = useState(1.0);
    const [phraseLimit, setPhraseLimit] = useState(50);
    
    const originalTextRef = useRef('');
    const modelDisplayName = t('ttsModel1Name');

    const handleGenerate = useCallback(async () => {
        if (!inputText.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setResult(null);
        
        originalTextRef.current = inputText;
        setInputText(t('ttsLoadingPlaceholder'));

        try {
            const params = {
                text: originalTextRef.current,
                remove_silence: removeSilence,
                speed: speed,
                phrase_limit: phraseLimit
            };
            const response = await generateSpeechModel1(params);
            setResult(response);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setInputText(originalTextRef.current);
        }
    }, [inputText, isLoading, removeSilence, speed, phraseLimit, t]);

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-3xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToTTS')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 leading-relaxed to-teal-500 pb-2">
                        {t('ttsModelTitlePrefix')} {modelDisplayName}
                    </h1>
                </div>
                <div className="w-full space-y-4">
                    <label htmlFor="tts-input" className="block text-lg font-medium text-gray-300">{t('ttsInputLabel')}</label>
                    <textarea
                        id="tts-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('ttsPlaceholder')}
                        className="w-full h-48 p-4 bg-gray-800/60 border border-gray-700 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors text-lg"
                        readOnly={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            id="remove-silence"
                            checked={removeSilence}
                            onChange={(e) => setRemoveSilence(e.target.checked)}
                            className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="remove-silence" className="ml-2 text-sm font-medium text-gray-300">{t('ttsRemoveSilence')}</label>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="speed-range" className="block text-sm font-medium text-gray-300 text-center">{t('ttsSpeed')} <span className="font-bold text-cyan-400">{speed.toFixed(1)}</span></label>
                        <input
                            type="range"
                            id="speed-range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                         <label htmlFor="phrase-limit" className="block text-sm font-medium text-gray-300 text-center">{t('ttsPhraseLimit')}</label>
                         <input
                            type="number"
                            id="phrase-limit"
                            min="1"
                            value={phraseLimit}
                            onChange={(e) => setPhraseLimit(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 text-center"
                         />
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !inputText.trim()}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
                    >
                        {isLoading ? <LoaderIcon className="w-6 h-6" /> : <SoundIcon className="w-6 h-6" />}
                        <span>{t('ttsGenerateButton')}</span>
                    </button>
                </div>
                 {error && (
                    <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg my-4 border border-red-700">
                        <h3 className="font-bold text-lg mb-1">{t('asrErrorOccurred')}</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {result && result.audio_url && (
                    <div className="w-full space-y-4 pt-4">
                         <h2 className="text-xl font-bold text-cyan-400">{t('ttsResultHeader')}</h2>
                        <audio controls autoPlay src={result.audio_url} className="w-full h-12 rounded-lg">
                            {t('asrAudioError')}
                        </audio>
                    </div>
                )}
            </main>
        </div>
    );
};
export default TTSModel1;
