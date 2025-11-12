import React from 'react';
import { MicIcon, LanguageIcon, SpellCheckIcon, SoundIcon, DocumentScanIcon, CpuChipIcon } from '../components/icons';
import { Page } from '../App';
import ServiceCard from '../components/ServiceCard';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardProps {
    onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                     <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 leading-normal p-3 to-teal-500">
                        {t('dashboardTitle')}
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg">{t('dashboardSubtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ServiceCard 
                        title={t('asrTitle')}
                        description={t('asrDescription')}
                        icon={<MicIcon className="w-8 h-8 text-cyan-400" />}
                        onClick={() => onNavigate('ASR')}
                    />
                     <ServiceCard 
                        title={t('translateTitle')}
                        description={t('translateDescription')}
                        icon={<LanguageIcon className="w-8 h-8 text-cyan-400" />}
                        onClick={() => onNavigate('TRANSLATE')}
                    />
                     <ServiceCard 
                        title={t('ttsTitle')}
                        description={t('ttsDescription')}
                        icon={<SoundIcon className="w-8 h-8 text-cyan-400" />}
                        onClick={() => onNavigate('TTS')}
                    />
                    <ServiceCard 
                        title={t('ocrTitle')}
                        description={t('ocrDescription')}
                        icon={<DocumentScanIcon className="w-8 h-8 text-cyan-400" />}
                        onClick={() => onNavigate('OCR')}
                    />
                    <ServiceCard 
                        title={t('spellcheckTitle')}
                        description={t('spellcheckDescription')}
                        icon={<SpellCheckIcon className="w-8 h-8 text-cyan-400" />}
                        onClick={() => onNavigate('OLD_SPELLCHECK')}
                    />
                    <ServiceCard
                        title={t('agentTitle')}
                        description={t('agentDescription')}
                        icon={<CpuChipIcon className="w-8 h-8 text-cyan-400" />}
                        onClick={() => onNavigate('AGENT')}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
