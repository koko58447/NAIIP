import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeftIcon } from '../components/icons';
import { useTranslation } from '../contexts/LanguageContext';

const AgentTextToSpeech: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const [text, setText] = useState('မင်္ဂလာပါ။ အသံထွက် စမ်းသပ်မှု။');
    const [voice, setVoice] = useState('my-MM-ThihaNeural');
    const [rate, setRate] = useState(0);
    const [pitch, setPitch] = useState(0);
    const [volume, setVolume] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [audioUrl, setAudioUrl] = useState('');

    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    const textExamples = [
        "မြန်မာနိုင်ငံ၏ ရာသီဥတုနှင့် ပတ်သက်သည့် သတင်းအချက်အလက်များကို ရှာဖွေနိုင်ပါသည်။",
        "စစ်တောင်းမြစ်သည် မြန်မာနိုင်ငံရှိ အဓိကမြစ်ကြီးတစ်ခုဖြစ်ပါသည်။",
        "ယနေ့ ကမ္ဘာပေါ်တွင် ဖြစ်ပေါ်နေသည့် နည်းပညာ တိုးတက်မှုများအကြောင်း ဆွေးနွေးကြပါစို့။",
        "ကဗျာကို ညီညာပြေပြစ်သော အသံဖြင့် ဖတ်ပြပေးပါ။",
        "ငါးဖယ်ခြောက် ငါးခြောက်တွေကို ဈေးသည်များက စျေးဆိုင်တွေရဲ့ အရှေ့မှာ တွဲလောင်းချိတ်ထားကြတယ်။",
        "မြန်မာ့ယဉ်ကျေးမှုနှင့် အနုပညာအကြောင်းကို လေ့လာရန် စိတ်ဝင်စားပါသည်။",
        "ဗုဒ္ဓဘာသာ၏ သမိုင်းနှင့် အခြေခံသဘောတရားများကို ရှင်းပြပါ။",
    ];

    const handleExampleClick = (exampleText: string) => {
        setText(exampleText);
        setAudioUrl('');
        setStatus('');
    };

    const handleGenerate = useCallback(async () => {
        if (!text.trim()) {
            setStatus(t('agentTtsError'));
            return;
        }

        setIsLoading(true);
        setStatus(t('agentTtsLoading'));
        setAudioUrl('');

        try {
            let API_URL;
            if (window.location.hostname === "192.168.200.199") {
                API_URL = "https://192.168.200.199:8004/generate-audio";
            } else {
                API_URL = "https://mllip.org:8004/generate-audio";
            }

            const payload: any = { text, voice };
            if (rate !== 0) payload.rate = (rate >= 0 ? "+" : "") + rate + "%";
            if (pitch !== 0) payload.pitch = (pitch >= 0 ? "+" : "") + pitch + "Hz";
            if (volume !== 0) payload.volume = (volume >= 0 ? "+" : "") + volume + "%";

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Server error: ${response.status} - ${errorData.error || "Unknown"}`);
            }

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setStatus('');

        } catch (error: any) {
            console.error("Fetch Error:", error);
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [text, voice, rate, pitch, volume, t]);

    useEffect(() => {
        if (audioUrl && audioPlayerRef.current) {
            audioPlayerRef.current.play();
        }
    }, [audioUrl]);


    return (
        <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
        <main className="w-full max-w-4xl mx-auto space-y-6">
             <div className="relative text-center mb-4">
                 <button onClick={onNavigateBack} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('backToAgent')}>
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 p-3 to-pink-500">
                    {t('agentTtsPageTitle')}
                </h1>
                <p className="text-gray-400 mt-2">{t('agentTtsPageSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <label htmlFor="textToSpeak" className="block text-xl font-semibold text-gray-300 mb-2">
                        {t('agentTtsInputLabel')}
                    </label>
                    <textarea
                        id="textToSpeak"
                        className="w-full min-h-[350px] p-4 bg-gray-800/60 border border-gray-700 rounded-lg text-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none resize-y"
                        placeholder={t('agentTtsPlaceholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-5 h-full">
                        <h3 className="text-xl font-semibold text-gray-300 mb-4">{t('agentTtsSettingsHeader')}</h3>
                        <div>
                            <label htmlFor="voiceSelect" className="block text-lg font-semibold text-gray-400 mb-2">
                                {t('agentTtsVoiceLabel')}
                            </label>
                            <select id="voiceSelect" value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-gray-200 text-lg outline-none focus:ring-2 focus:ring-cyan-500">
                                <option value="my-MM-ThihaNeural">{t('agentTtsVoiceMale')}</option>
                                <option value="my-MM-NilarNeural">{t('agentTtsVoiceFemale')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="rateSlider" className="block text-lg font-semibold text-gray-400 mb-2">{t('ttsSpeed')} <span className="font-bold text-cyan-400">{(rate >= 0 ? "+" : "") + rate}%</span></label>
                            <input type="range" id="rateSlider" min="-100" max="100" value={rate} onChange={e => setRate(parseInt(e.target.value))} className="w-full cursor-pointer" />
                        </div>
                        <div>
                            <label htmlFor="pitchSlider" className="block text-lg font-semibold text-gray-400 mb-2">Pitch: <span className="font-bold text-cyan-400">{(pitch >= 0 ? "+" : "") + pitch}Hz</span></label>
                            <input type="range" id="pitchSlider" min="-50" max="50" value={pitch} onChange={e => setPitch(parseInt(e.target.value))} className="w-full cursor-pointer" />
                        </div>
                        <div>
                            <label htmlFor="volumeSlider" className="block text-lg font-semibold text-gray-400 mb-2">Volume: <span className="font-bold text-cyan-400">{(volume >= 0 ? "+" : "") + volume}%</span></label>
                            <input type="range" id="volumeSlider" min="-100" max="100" value={volume} onChange={e => setVolume(parseInt(e.target.value))} className="w-full cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">{t('agentTtsExamplesHeader')}</h3>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-800/50 border border-gray-700 rounded-xl max-h-[150px] overflow-y-auto">
                    {textExamples.map((ex, i) => (
                        <button key={i} onClick={() => handleExampleClick(ex)} className="px-3 py-1.5 bg-gray-700 text-gray-200 border border-gray-600 rounded-full cursor-pointer text-sm transition-colors hover:bg-cyan-600 hover:border-cyan-500">
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="pt-4">
                <button onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('agentTtsGenerateButton')}
                </button>
            </div>

            <div className="space-y-4">
                {status && <div className="text-center text-lg text-gray-400">{status}</div>}
                {audioUrl && (
                    <div>
                        <label className="block text-xl font-semibold text-gray-300 mb-2">{t('agentTtsResultHeader')}</label>
                        <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full" />
                    </div>
                )}
            </div>
        </main>
        </div>
    );
};

export default AgentTextToSpeech;
