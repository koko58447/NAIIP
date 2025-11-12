import React, { useState } from 'react';
import { SettingsIcon, GlobeIcon, AIIcon } from './icons';
import { Page } from '../App';
import { useTranslation } from '../contexts/LanguageContext';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const { language, setLanguage, t } = useTranslation();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
            <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <button onClick={() => onNavigate('DASHBOARD')} className="flex items-center space-x-3 group">
                        <AIIcon className="h-10 w-10 text-cyan-400" />
                        <h1 className="text-2xl font-bold text-gray-200 group-hover:text-white transition-colors">{t('headerTitle')}</h1>
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('settingsAriaLabel')}>
                        <SettingsIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                            className="p-2 rounded-full hover:bg-gray-700 transition-colors" 
                            aria-label={t('languageAriaLabel')}
                        >
                            <GlobeIcon className="w-6 h-6 text-gray-400" />
                        </button>
                        {isLangMenuOpen && (
                             <div 
                                className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20"
                                onMouseLeave={() => setIsLangMenuOpen(false)}
                            >
                                <button
                                    onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${language === 'en' ? 'text-white bg-cyan-600' : 'text-gray-300 hover:bg-gray-700'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => { setLanguage('my'); setIsLangMenuOpen(false); }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${language === 'my' ? 'text-white bg-cyan-600' : 'text-gray-300 hover:bg-gray-700'}`}
                                >
                                    Myanmar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;