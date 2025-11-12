// pages/Spellcheck.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeftIcon, LoaderIcon, LanguageIcon, CopyIcon, CheckIcon } from '../components/icons';
import { spellCheckText } from '../services/geminiService';
import { Correction } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface SpellcheckProps {
    onNavigateBack: () => void;
}

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

const Spellcheck: React.FC<SpellcheckProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [displayedText, setDisplayedText] = useState('');
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [justCopied, setJustCopied] = useState(false);

    const handleCorrect = useCallback(async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setCorrections([]);
        setDisplayedText(inputText);

        try {
            const correctionsResult = await spellCheckText(inputText);
            setCorrections(correctionsResult);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            setDisplayedText('');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading]);

    const handleCorrectionClick = useCallback((original: string, correction: string) => {
        setDisplayedText(prev => prev.split(original).join(correction));
        setCorrections(prev => prev.filter(c => c.original !== original));
    }, []);

    const handleCopy = useCallback(() => {
        if (displayedText) {
            navigator.clipboard.writeText(displayedText)
                .then(() => {
                    setJustCopied(true);
                    setTimeout(() => setJustCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    setError(t('mtCopyError'));
                });
        }
    }, [displayedText, t]);


    const renderedText = useMemo(() => {
        if (!displayedText) return null;
        if (corrections.length === 0) return displayedText;
        
        const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${corrections.map(c => escapeRegex(c.original)).join('|')})`, 'g');
        const parts = displayedText.split(regex).filter(part => part);

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
    }, [displayedText, corrections, handleCorrectionClick]);

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-3xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToAgent')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 p-3 to-pink-500">
                        {t('spellcheckPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('spellcheckPageSubtitle')}</p>
                </div>

                <div className="w-full space-y-4">
                    <label htmlFor="input-text" className="block text-lg font-medium text-gray-300">{t('spellcheckInputLabel')}</label>
                    <textarea
                        id="input-text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('spellcheckPlaceholder')}
                        className="w-full h-64 p-4 bg-gray-800/60 border border-gray-700 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors text-lg"
                    />
                </div>

                <div className="flex items-center justify-center">
                    <button
                        onClick={handleCorrect}
                        disabled={isLoading || !inputText.trim()}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
                    >
                        {isLoading ? <LoaderIcon className="w-6 h-6" /> : <LanguageIcon className="w-6 h-6" />}
                        <span>{t('spellcheckCheckButton')}</span>
                    </button>
                </div>

                {error && (
                    <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg my-4 border border-red-700">
                        <h3 className="font-bold text-lg mb-1">{t('asrErrorOccurred')}</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {isLoading && (
                     <div className="w-full min-h-[200px] flex flex-col items-center justify-center text-cyan-300">
                        <LoaderIcon className="w-12 h-12 mb-3" />
                        <p className="text-lg font-semibold">{t('spellcheckLoading')}</p>
                    </div>
                )}

                {!isLoading && displayedText && (
                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400">{t('spellcheckResultHeader')}</h2>
                            <button
                                onClick={handleCopy}
                                title={t('spellcheckCopy')}
                                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                aria-label={t('spellcheckCopy')}
                            >
                                {justCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="w-full min-h-[256px] p-4 bg-gray-900/70 border border-gray-600 rounded-xl text-lg leading-relaxed">
                           {renderedText}
                        </div>
                    </div>
                )}
            </main>
             <footer className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
                <p>{t('spellcheckFooter')}</p>
            </footer>
        </div>
    );
};

export default Spellcheck;