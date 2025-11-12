// services/ttsService.ts

// New code for Model 1 & 2
const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

const pcmToWav = (floatData: number[], sampleRate: number): Blob => {
    const bitDepth = 16;
    const numChannels = 1;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = floatData.length * bytesPerSample;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");

    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // Audio format 1 (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < floatData.length; i++, offset += bytesPerSample) {
        const s = Math.max(-1, Math.min(1, floatData[i]));
        const val = s < 0 ? s * 0x8000 : s * 0x7fff;
        view.setInt16(offset, val, true);
    }

    return new Blob([view], { type: "audio/wav" });
};

export interface TTSAdvancedRequestParams {
    text: string;
    remove_silence: boolean;
    speed: number;
    phrase_limit: number;
}

interface TTSApiResponseSuccess {
    status: "success";
    audio: number[];
    sample_rate: number;
    message?: string;
}

interface TTSApiResponseError {
    status: string;
    message: string;
    detail?: string;
    error?: string;
}

type TTSApiResponse = TTSApiResponseSuccess | TTSApiResponseError;

export interface TTSResult {
    audio_url: string;
}

export const generateSpeechModel1 = async (params: TTSAdvancedRequestParams): Promise<TTSResult> => {
    let ttsUrl;
    if (window.location.hostname === "192.168.200.199") {
        ttsUrl = "https://192.168.200.208:8020/tts-1";
    } else {
        ttsUrl = "https://mllip.org:8020/tts-1";
    }

    if (!params.text.trim()) {
        throw new Error("Input text cannot be empty.");
    }
    
    try {
        const response = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.error || errorMsg;
            } catch (e) { /* Response was not JSON */ }
            throw new Error(errorMsg);
        }

        const data: TTSApiResponse = await response.json();

        if (data.status !== "success" || !('audio' in data) || !('sample_rate' in data)) {
            const errorMessage = (data as TTSApiResponseError).message || "API did not return successful audio data.";
            throw new Error(errorMessage);
        }

        const audioBlob = pcmToWav(data.audio, data.sample_rate);
        const audioUrl = URL.createObjectURL(audioBlob);

        return { audio_url: audioUrl };

    } catch (error) {
        console.error("TTS generation error:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate speech: ${error.message}`);
        }
        throw new Error('An unknown error occurred during TTS generation.');
    }
};

export const generateSpeechModel2 = async (params: TTSAdvancedRequestParams): Promise<TTSResult> => {
    let ttsUrl;
    if (window.location.hostname === "192.168.200.199") {
        ttsUrl = "https://192.168.200.208:8020/tts-2";
    } else {
        ttsUrl = "https://mllip.org:8020/tts-2";
    }

    if (!params.text.trim()) {
        throw new Error("Input text cannot be empty.");
    }
    
    try {
        const response = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.error || errorMsg;
            } catch (e) { /* Response was not JSON */ }
            throw new Error(errorMsg);
        }

        const data: TTSApiResponse = await response.json();

        if (data.status !== "success" || !('audio' in data) || !('sample_rate' in data)) {
            const errorMessage = (data as TTSApiResponseError).message || "API did not return successful audio data.";
            throw new Error(errorMessage);
        }

        const audioBlob = pcmToWav(data.audio, data.sample_rate);
        const audioUrl = URL.createObjectURL(audioBlob);

        return { audio_url: audioUrl };

    } catch (error) {
        console.error("TTS generation error:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate speech: ${error.message}`);
        }
        throw new Error('An unknown error occurred during TTS generation.');
    }
};

export type Gender = 'male' | 'female';
export interface TTSModel3And4RequestParams extends TTSAdvancedRequestParams {
    gender: Gender;
}

export const generateSpeechModel3And4 = async (params: TTSModel3And4RequestParams): Promise<TTSResult> => {
    const endpoint = params.gender === 'male' ? 'tts-3' : 'tts-4';
    let ttsUrl;
    if (window.location.hostname === "192.168.200.199") {
        ttsUrl = `https://192.168.200.208:8020/${endpoint}`;
    } else {
        ttsUrl = `https://mllip.org:8020/${endpoint}`;
    }

    if (!params.text.trim()) {
        throw new Error("Input text cannot be empty.");
    }

    const { gender, ...apiParams } = params;
    
    try {
        const response = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiParams),
        });

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.error || errorMsg;
            } catch (e) { /* Response was not JSON */ }
            throw new Error(errorMsg);
        }

        const data: TTSApiResponse = await response.json();

        if (data.status !== "success" || !('audio' in data) || !('sample_rate' in data)) {
            const errorMessage = (data as TTSApiResponseError).message || "API did not return successful audio data.";
            throw new Error(errorMessage);
        }

        const audioBlob = pcmToWav(data.audio, data.sample_rate);
        const audioUrl = URL.createObjectURL(audioBlob);

        return { audio_url: audioUrl };

    } catch (error) {
        console.error("TTS generation error:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate speech: ${error.message}`);
        }
        throw new Error('An unknown error occurred during TTS generation.');
    }
};
