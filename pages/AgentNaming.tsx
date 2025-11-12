import React, { useState, useCallback } from 'react';
import { ArrowLeftIcon } from '../components/icons';
import { generateMyanmarNames } from '../services/geminiService';
import { useTranslation } from '../contexts/LanguageContext';

const AgentNaming: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [nameCount, setNameCount] = useState('');
    const [names, setNames] = useState<string[]>([]);
    const [myanmarDay, setMyanmarDay] = useState('');
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getMyanmarDay = (dateString: string): string => {
        const date = new Date(dateString);
        const dayIndex = date.getDay();
        const myanmarDays = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
        return myanmarDays[dayIndex];
    };

    const handleGenerate = useCallback(async () => {
        const nameCountValue = parseInt(nameCount, 10);
        if (!birthDate || !gender || !nameCountValue || nameCountValue < 1) {
            setMessage({ text: t('agentNameErrorPrompt'), isError: true });
            return;
        }

        setIsLoading(true);
        setNames([]);
        setMyanmarDay(t('agentNameWaiting'));
        setMessage(null);
        
        const myanmarDayValue = getMyanmarDay(birthDate);

        try {
            const generatedNames = await generateMyanmarNames(gender, myanmarDayValue, nameCountValue);
            setNames(generatedNames);
            setMyanmarDay(myanmarDayValue);
            setMessage({ text: t('agentNameSuccess'), isError: false });
        } catch (error: any) {
            setNames([]);
            setMyanmarDay('');
            setMessage({ text: `${t('agentNameErrorApi')} ${error.message || 'An unknown error occurred.'}`, isError: true });
        } finally {
            setIsLoading(false);
        }
    }, [birthDate, gender, nameCount, t]);

    const handleClean = () => {
        setBirthDate('');
        setGender('');
        setNameCount('');
        setNames([]);
        setMyanmarDay('');
        setMessage(null);
    };

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="relative text-center mb-4">
                     <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700" aria-label={t('back')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 p-3 to-pink-500">
                        {t('agentNameTitle')}
                    </h1>
                    <p className="mt-2 text-base text-gray-400 max-w-xl mx-auto">
                        {t('agentNameSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="birth-date" className="block text-gray-300 font-medium mb-2 text-base">{t('agentNameDobLabel')}</label>
                            <input type="date" id="birth-date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-gray-300 font-medium mb-2 text-base">{t('agentNameGenderLabel')}</label>
                            <select id="gender" value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-gray-200">
                                <option value="">{t('agentNameGenderSelect')}</option>
                                <option value="male">{t('agentNameGenderMale')}</option>
                                <option value="female">{t('agentNameGenderFemale')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="name-count" className="block text-gray-300 font-medium mb-2 text-base">{t('agentNameSyllableLabel')}</label>
                            <input type="number" id="name-count" min="1" value={nameCount} onChange={e => setNameCount(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-gray-200" placeholder={t('agentNameSyllablePlaceholder')} />
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed">
                                <i className="fas fa-user-plus mr-2"></i>
                                <span>{isLoading ? t('agentNameLoading') : t('agentNameGenerateButton')}</span>
                            </button>
                            <button onClick={handleClean} className="btn-secondary px-6 py-3 bg-gray-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-base flex items-center justify-center">
                                <i className="fas fa-trash-alt mr-2"></i>
                                <span>{t('agentNameClearButton')}</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="myanmar-name" className="block text-gray-300 font-medium mb-2 text-base">{t('agentNameResultHeader')}</label>
                            <ul id="myanmar-name" className="p-4 border border-gray-600 rounded-lg bg-gray-900/50 min-h-[200px] max-h-[300px] overflow-y-auto text-sm list-decimal list-inside">
                                {isLoading && !names.length && <li>{t('agentNameWaiting')}</li>}
                                {!isLoading && names.length === 0 && <span className="text-gray-500 italic">{t('agentNameResultPlaceholder')}</span>}
                                {names.map((name, index) => <li key={index} className="py-1 text-gray-200">{name}</li>)}
                            </ul>
                        </div>
                        <div>
                            <label htmlFor="myanmar-day" className="block text-gray-300 font-medium mb-2 text-base">{t('agentNameDayLabel')}</label>
                            <input type="text" id="myanmar-day" value={myanmarDay} readOnly className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200" placeholder={t('agentNameDayPlaceholder')} />
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.isError ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'}`}>
                        {message.text}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AgentNaming;
