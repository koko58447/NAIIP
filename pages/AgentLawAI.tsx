import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useTranslation } from '../contexts/LanguageContext';
import { ArrowLeftIcon, ScaleIcon } from '../components/icons';

interface Message {
    text: string;
    sender: 'user' | 'bot' | 'error';
}

const AgentLawAI: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([
        { text: t('agentLawAIWelcome'), sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    // Initialize the chat model
    useEffect(() => {
        const systemPrompt = "You are a legal assistant specializing in the laws of Myanmar. Your sole purpose is to answer questions strictly related to Myanmar's laws, legal procedures, and statutes. All of your responses must be in the Burmese (Myanmar) language. If a user asks a question that is not about Myanmar law, you must politely decline and state that you can only answer questions about Myanmar law. Do not answer any off-topic questions.";
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemPrompt,
                },
            });
        } catch (error) {
            console.error("Failed to initialize Gemini AI:", error);
            setMessages(prev => [...prev, { text: "Failed to initialize AI. Please check the API key.", sender: 'error' }]);
        }
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat window
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const sendMessage = useCallback(async () => {
        const userMessage = input.trim();
        if (userMessage === '' || isLoading || !chatRef.current) return;

        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage({ message: userMessage });
            const botMessage = result.text;
            setMessages(prev => [...prev, { text: botMessage, sender: 'bot' }]);
        } catch (error: any) {
            console.error("Error fetching Gemini response:", error);
            const errorMessage = `${t('agentLawAIError')}\nError: ${error.message || 'Unknown error'}`;
            setMessages(prev => [...prev, { text: errorMessage, sender: 'error' }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, t]);
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    };

    const TypingIndicator = () => (
        <div className="flex justify-start mb-4">
            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></span>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="relative text-center mb-4 w-full max-w-4xl">
                 <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToAgent')}>
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r p-3 from-emerald-500 to-teal-600">
                    <ScaleIcon className="inline-block w-8 h-8 mr-2" />
                    {t('agentLawAIPageTitle')}
                </h1>
            </div>

            <div className="w-full max-w-4xl h-[75vh] flex flex-col bg-white rounded-2xl shadow-lg border border-gray-700">
                <main ref={chatWindowRef} className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {messages.map((msg, index) => (
                         <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`p-3 rounded-lg max-w-lg text-sm shadow ${
                                    msg.sender === 'user' ? 'bg-emerald-600 text-white' :
                                    msg.sender === 'error' ? 'bg-red-200 text-gray-800' :
                                    'bg-gray-200 text-gray-800'
                                }`}
                                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}
                            />
                        </div>
                    ))}
                    {isLoading && <TypingIndicator />}
                </main>

                <footer className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm text-gray-800"
                            placeholder={t('agentLawAIPlaceholder')}
                            autoComplete="off"
                            disabled={isLoading}
                        />
                        <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform hover:scale-105">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AgentLawAI;