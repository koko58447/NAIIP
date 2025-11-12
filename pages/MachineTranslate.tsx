// pages/MachineTranslate.tsx
import React, { useState, useCallback } from 'react';
import { ArrowLeftIcon, LoaderIcon, SwitchIcon, CopyIcon, CheckIcon } from '../components/icons';
import { translateText, TranslateResponseBody } from '../services/translateService';
import { useTranslation } from '../contexts/LanguageContext';

interface MachineTranslateProps {
    onNavigateBack: () => void;
}

type Direction = 'my-en' | 'en-my';

const MachineTranslate: React.FC<MachineTranslateProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<TranslateResponseBody | null>(null);
    const [direction, setDirection] = useState<Direction>('my-en');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [justCopied, setJustCopied] = useState<boolean>(false);

    const myanmarExamples = [
      "မင်္ဂလာပါခင်ဗျာ။ ကြိုဆိုပါတယ်။",
      "ဒီပြဿနာကို ဖြေရှင်းဖို့ ဘယ်လိုနည်းလမ်းတွေရှိလဲ။",
      "ဒီနှစ်ရဲ့ရာသီဥတုက တော်တော်ပူတယ်။"
    ];

    const englishExamples = [
      "What is the capital city of Myanmar?",
      "Please close the door quietly when you leave.",
      "They will be arriving at the station tomorrow afternoon."
    ];

    const handleExampleClick = (text: string) => {
        setInputText(text);
        setResult(null);
        setError(null);
    };

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await translateText(inputText, direction);
            
            // Clean the translation response to ensure only text is shown.
            let cleanTranslation = response.translation;
            if (cleanTranslation && cleanTranslation.startsWith('{') && cleanTranslation.endsWith('}')) {
                try {
                    const parsed = JSON.parse(cleanTranslation);
                    if (parsed && typeof parsed === 'object') {
                        // Find the first string value in the object, assuming it's the translation.
                        const firstStringValue = Object.values(parsed).find(v => typeof v === 'string');
                        cleanTranslation = (firstStringValue as string) || '';
                    }
                } catch (e) {
                    // It wasn't valid JSON, so we'll just use the original string.
                }
            }
            
            setResult({ ...response, translation: cleanTranslation });

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, direction, isLoading]);

    const handleSwapLanguages = useCallback(() => {
        setDirection(prev => (prev === 'my-en' ? 'en-my' : 'my-en'));
        setInputText(result?.translation || '');
        setResult(inputText ? { translation: inputText } : null);
    }, [inputText, result]);
    
    const handleCopy = useCallback(() => {
        if (result?.translation) {
            navigator.clipboard.writeText(result.translation)
                .then(() => {
                    setJustCopied(true);
                    setTimeout(() => setJustCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    setError(t('mtCopyError'));
                });
        }
    }, [result, t]);

    const fromLanguage = direction === 'my-en' ? t('mtLangMy') : t('mtLangEn');
    const toLanguage = direction === 'my-en' ? t('mtLangEn') : t('mtLangMy');
    const outputText = result?.translation || '';

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                    <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToDashboard')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 p-3 to-teal-500">
                        {t('mtPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-2">{t('mtPageSubtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Input Area */}
                    <div className="w-full">
                        <label htmlFor="input-text" className="block text-sm font-medium text-gray-400 mb-2">{fromLanguage}</label>
                        <textarea
                            id="input-text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={direction === 'my-en' ? t('mtPlaceholderMy') : t('mtPlaceholderEn')}
                            className="w-full h-48 p-4 bg-gray-800/60 border border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                        />
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">{t('mtExampleText')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {(direction === 'my-en' ? myanmarExamples : englishExamples).map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleClick(example)}
                                        className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-cyan-600 hover:text-white transition-colors"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Output Area */}
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="output-text" className="block text-sm font-medium text-gray-400">{toLanguage}</label>
                            {outputText && (
                                <button
                                    onClick={handleCopy}
                                    title={t('mtCopy')}
                                    className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    aria-label={t('mtCopy')}
                                >
                                    {justCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                        <div className="w-full h-48 p-4 bg-gray-900/70 border border-gray-600 rounded-xl relative overflow-y-auto">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <LoaderIcon className="w-10 h-10 text-cyan-400" />
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{outputText || <span className="text-gray-500">{t('mtResultPlaceholder')}</span>}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                    <button
                        onClick={handleSwapLanguages}
                        className="p-3 rounded-full hover:bg-gray-700 transition-colors"
                        aria-label={t('mtSwap')}
                        title={t('mtSwap')}
                    >
                        <SwitchIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim()}
                        className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
                    >
                        {t('mtTranslateButton')}
                    </button>
                </div>

                {error && (
                    <div className="text-center p-4 text-red-300 bg-red-900/40 rounded-lg my-4 border border-red-700">
                        <h3 className="font-bold text-lg mb-1">{t('asrErrorOccurred')}</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </main>
             <footer className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
                <p>{t('mtFooter')}</p>
            </footer>
        </div>
    );
};

export default MachineTranslate;