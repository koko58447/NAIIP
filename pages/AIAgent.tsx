import React from 'react';
import {
    PencilSquareIcon,
    SpellCheckIcon,
    AcademicCapIcon,
    SoundIcon,
    ArrowLeftIcon,
    DocumentScanIcon,
    LanguageIcon,
    MicIcon,
    ClipboardDocumentListIcon
} from '../components/icons';
import ServiceCard from '../components/ServiceCard';
import { Page } from '../App';
import { useTranslation } from '../contexts/LanguageContext';

interface AIAgentProps {
    onNavigateBack: () => void;
    onNavigate: (page: Page) => void;
}

const AIAgent: React.FC<AIAgentProps> = ({ onNavigateBack, onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="relative text-center mb-12">
                     <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToDashboard')}>
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {t('agentPageTitle')}
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg">{t('agentPageSubtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ServiceCard 
                        title={t('agentSummarizeTitle')}
                        description={t('agentSummarizeDesc')}
                        icon={<PencilSquareIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('SUMMARIZE')}
                    />
                     <ServiceCard 
                        title={t('agentOcrTitle')}
                        description={t('agentOcrDesc')}
                        icon={<DocumentScanIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('AGENT_OCR')}
                    />
                     <ServiceCard 
                        title={t('agentTranslateTitle')}
                        description={t('agentTranslateDesc')}
                        icon={<LanguageIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('AGENT_TRANSLATE')}
                    />
                     <ServiceCard 
                        title={t('agentSpeechTranslateTitle')}
                        description={t('agentSpeechTranslateDesc')}
                        icon={<MicIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('SPEECH_TRANSLATE')}
                    />
                    <ServiceCard 
                        title={t('agentSpellcheckTitle')}
                        description={t('agentSpellcheckDesc')}
                        icon={<SpellCheckIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('GEMINI_SPELLCHECK')}
                    />
                    <ServiceCard
                        title={t('agentSttTitle')}
                        description={t('agentSttDesc')}
                        icon={<MicIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('AGENT_SPEECH_TO_TEXT')}
                    />
                    <ServiceCard
                        title={t('agentTtsTitle')}
                        description={t('agentTtsDesc')}
                        icon={<SoundIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('AGENT_TEXT_TO_SPEECH')}
                    />
                    <ServiceCard
                        title={t('agentNamingTitle')}
                        description={t('agentNamingDesc')}
                        icon={<AcademicCapIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('AGENT_NAMING')}
                    />
                    <ServiceCard
                        title={t('agentPdfTitle')}
                        description={t('agentPdfDesc')}
                        icon={<ClipboardDocumentListIcon className="w-8 h-8 text-purple-400" />}
                        onClick={() => onNavigate('AGENT_PDF_EXTRACTOR')}
                    />
                </div>
            </div>
        </div>
    );
};

export default AIAgent;
