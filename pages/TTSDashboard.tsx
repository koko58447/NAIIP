import React, { useState } from 'react';
import { ArrowLeftIcon } from '../components/icons';
import TTSModel1 from './TTSModel1';
import TTSModel2 from './TTSModel2';
import TTSModel3 from './TTSModel3';
import { useTranslation } from '../contexts/LanguageContext';

interface TTSDashboardProps {
    onNavigateBack: () => void;
}

type TTSModel = 'MODEL1' | 'MODEL2' | 'MODEL3' | 'NONE';

const TTSDashboard: React.FC<TTSDashboardProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [selectedModel, setSelectedModel] = useState<TTSModel>('NONE');
    
    const navigateToModel = (model: TTSModel) => setSelectedModel(model);
    const goBackToSelection = () => setSelectedModel('NONE');

    if (selectedModel !== 'NONE') {
        switch(selectedModel) {
            case 'MODEL1':
                return <TTSModel1 onNavigateBack={goBackToSelection} />;
            case 'MODEL2':
                return <TTSModel2 onNavigateBack={goBackToSelection} />;
            case 'MODEL3':
                return <TTSModel3 onNavigateBack={goBackToSelection} />;
            default:
                setSelectedModel('NONE');
                return null;
        }
    }

    return (
         <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-3xl mx-auto space-y-6">
                <div className="relative text-center mb-4">
                     <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToDashboard')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 p-3 to-teal-500">
                        {t('ttsDashboardTitle')}
                    </h1>
                     <p className="text-gray-400 mt-2">{t('ttsDashboardSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModelCard title={t('ttsCardModel1')} onClick={() => navigateToModel('MODEL1')} />
                    <ModelCard title={t('ttsCardModel2')} onClick={() => navigateToModel('MODEL2')} />
                    <ModelCard title={t('ttsCardModel3')} onClick={() => navigateToModel('MODEL3')} />
                </div>
            </main>
        </div>
    );
};

const ModelCard: React.FC<{ title: string; onClick: () => void }> = ({ title, onClick }) => {
    return (
        <button onClick={onClick} className="p-8 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/60 hover:border-cyan-500 transition-all text-center focus:outline-none focus:ring-2 focus:ring-cyan-400">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </button>
    )
}

export default TTSDashboard;
