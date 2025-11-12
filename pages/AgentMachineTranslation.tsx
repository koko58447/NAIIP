// pages/AgentMachineTranslation.tsx
import React, { useState, useCallback } from 'react';
import { ArrowLeftIcon, LoaderIcon, SwitchIcon, CopyIcon, CheckIcon, LanguageIcon } from '../components/icons';
import { translateTextGemini } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';

interface AgentMachineTranslationProps {
    onNavigateBack: () => void;
}

type Language = 'Burmese' | 'English';

const AgentMachineTranslation: React.FC<AgentMachineTranslationProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState<Language>('Burmese');
    const [targetLang, setTargetLang] = useState<Language>('English');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [justCopied, setJustCopied] = useState(false);

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setTranslatedText('');
        try {
            const response = await translateTextGemini(inputText, sourceLang, targetLang);
            setTranslatedText(response);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, sourceLang, targetLang, isLoading]);

    const handleSwapLanguages = useCallback(() => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText(translatedText);
        setTranslatedText(inputText);
    }, [sourceLang, targetLang, inputText, translatedText]);
    
    const handleCopy = useCallback(() => {
        if (translatedText) {
            navigator.clipboard.writeText(translatedText).then(() => {
                setJustCopied(true);
                setTimeout(() => setJustCopied(false), 2000);
            });
        }
    }, [translatedText]);

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700" aria-label={t('back')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {t('agentMtTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('agentMtSubtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{sourceLang === 'Burmese' ? t('agentMtLangBurmese') : t('agentMtLangEnglish')}</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={sourceLang === 'Burmese' ? t('agentMtPlaceholderBurmese') : t('agentMtPlaceholderEnglish')}
                            className="w-full h-48 p-4 bg-gray-800/60 border border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-400">{targetLang === 'Burmese' ? t('agentMtLangBurmese') : t('agentMtLangEnglish')}</label>
                            {translatedText && (
                                <button onClick={handleCopy} title={t('mtCopy')} className="p-1.5 rounded-full hover:bg-gray-700">
                                    {justCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                        <div className="w-full h-48 p-4 bg-gray-900/70 border border-gray-600 rounded-xl overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <LoaderIcon className="w-10 h-10 text-cyan-400" />
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{translatedText || <span className="text-gray-500">{t('agentMtResultPlaceholder')}</span>}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                    <button onClick={handleSwapLanguages} className="p-3 rounded-full hover:bg-gray-700" title={t('mtSwap')}>
                        <SwitchIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim()}
                        className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LanguageIcon className="w-6 h-6"/>
                        <span>{t('mtTranslateButton')}</span>
                    </button>
                </div>

                {error && <p className="text-center text-red-400 mt-4">{error}</p>}
            </main>
        </div>
    );
};

export default AgentMachineTranslation;
