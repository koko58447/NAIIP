import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ASR from './pages/ASR';
import MachineTranslate from './pages/MachineTranslate';
import Spellcheck from './pages/Spellcheck';
import TTSDashboard from './pages/TTSDashboard';
import OCR from './pages/OCR';
import AIAgent from './pages/AIAgent';
import OldSpellcheck from './pages/OldSpellcheck';
import Summarize from './pages/Summarize';
import AgentOCR from './pages/AgentOCR';
import AgentMachineTranslation from './pages/AgentMachineTranslation';
import SpeechTranslate from './pages/SpeechTranslate';
import AgentSpeechToText from './pages/AgentSpeechToText';
import AgentTextToSpeech from './pages/AgentTextToSpeech';
import AgentNaming from './pages/AgentNaming';
import AgentPdfExtractor from './pages/AgentPdfExtractor';
import AgentLawAI from './pages/AgentLawAI';
import AgentSpeechToSpeech from './pages/AgentSpeechToSpeech';
import { LanguageProvider } from './contexts/LanguageContext';

export type Page = 'DASHBOARD' | 'ASR' | 'TRANSLATE' | 'OLD_SPELLCHECK' | 'TTS' | 'OCR' | 'AGENT' | 'GEMINI_SPELLCHECK' | 'SUMMARIZE' | 'AGENT_OCR' | 'AGENT_TRANSLATE' | 'SPEECH_TRANSLATE' | 'AGENT_SPEECH_TO_TEXT' | 'AGENT_TEXT_TO_SPEECH' | 'AGENT_NAMING' | 'AGENT_PDF_EXTRACTOR' | 'AGENT_LAW_AI' | 'AGENT_SPEECH_TO_SPEECH';

export default function App() {
    const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');

    const navigateTo = (page: Page) => setCurrentPage(page);
    const navigateBack = () => setCurrentPage('DASHBOARD');

    const renderPage = () => {
        switch (currentPage) {
            case 'ASR':
                return <ASR onNavigateBack={navigateBack} />;
            case 'TRANSLATE':
                return <MachineTranslate onNavigateBack={navigateBack} />;
            case 'GEMINI_SPELLCHECK':
                return <Spellcheck onNavigateBack={() => navigateTo('AGENT')} />;
            case 'OLD_SPELLCHECK':
                return <OldSpellcheck onNavigateBack={navigateBack} />;
            case 'TTS':
                return <TTSDashboard onNavigateBack={navigateBack} />;
            case 'OCR':
                return <OCR onNavigateBack={navigateBack} />;
            case 'SUMMARIZE':
                return <Summarize onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_OCR':
                return <AgentOCR onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_TRANSLATE':
                return <AgentMachineTranslation onNavigateBack={() => navigateTo('AGENT')} />;
            case 'SPEECH_TRANSLATE':
                return <SpeechTranslate onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_SPEECH_TO_TEXT':
                return <AgentSpeechToText onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_TEXT_TO_SPEECH':
                return <AgentTextToSpeech onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_NAMING':
                return <AgentNaming onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_PDF_EXTRACTOR':
                return <AgentPdfExtractor onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_LAW_AI':
                return <AgentLawAI onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT_SPEECH_TO_SPEECH':
                return <AgentSpeechToSpeech onNavigateBack={() => navigateTo('AGENT')} />;
            case 'AGENT':
                return <AIAgent onNavigateBack={navigateBack} onNavigate={navigateTo} />;
            case 'DASHBOARD':
            default:
                return <Dashboard onNavigate={navigateTo} />;
        }
    };

    return (
        <LanguageProvider>
            <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
                <Header onNavigate={navigateTo} />
                <div className="container mx-auto pt-20">
                    {renderPage()}
                </div>
            </div>
        </LanguageProvider>
    );
}