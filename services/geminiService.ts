import { GoogleGenAI, Type } from "@google/genai";
import { Correction } from '../types';

// Helper function to convert a File object to a base64 string and format for the API
// FIX: Changed type from File to Blob to allow for more flexible input, such as from MediaRecorder.
const fileToGenerativePart = async (file: Blob) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"), remove it.
                resolve(reader.result.split(',')[1]);
            } else {
                resolve(''); // Should not happen with readAsDataURL
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};


export const spellCheckText = async (text: string): Promise<Correction[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please correct the spelling and grammar of the following Burmese text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            original: {
                                type: Type.STRING,
                                description: 'The original word or phrase with the error.',
                            },
                            correction: {
                                type: Type.STRING,
                                description: 'The corrected version of the word or phrase.',
                            },
                            reason: {
                                type: Type.STRING,
                                description: 'A brief explanation of the correction.',
                            },
                        },
                        required: ["original", "correction"],
                    },
                },
                systemInstruction: "You are an expert in the Burmese language, specializing in spelling and grammar correction. Analyze the given text and identify any errors. For each error, provide the original text and the corrected version. You must respond ONLY with a valid JSON array of objects, following the provided schema. Do not add any introductory text, explanations, or code fences around the JSON."
            },
        });

        const jsonString = response.text.trim();
        const corrections: Correction[] = JSON.parse(jsonString);
        return corrections;

    } catch (error) {
        console.error("Error during spell check:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get spell check from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred during spell check.");
    }
};

export const summarizeText = async (text: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please provide a concise summary of the following Burmese text:\n\n"${text}"`,
            config: {
                systemInstruction: "You are an expert in the Burmese language, specializing in summarizing long texts. Your goal is to extract the key points and main ideas, presenting them in a clear and brief summary in Burmese. Do not add any extra commentary or introductory phrases. Respond only with the summarized text."
            },
        });

        const summary = response.text.trim();
        if (!summary) {
            throw new Error("The API returned an empty summary.");
        }
        return summary;

    } catch (error) {
        console.error("Error during summarization:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get summary from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred during summarization.");
    }
};

// FIX: Changed type from File to Blob to allow for more flexible input.
export const extractTextFromImage = async (imageFile: Blob): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePart = await fileToGenerativePart(imageFile);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    imagePart,
                    { text: "Extract all Burmese text from this image. If no text is found, return an empty response." }
                ]
            },
            config: {
                systemInstruction: "You are an expert OCR tool for the Burmese language. Your task is to accurately extract any and all text from the provided image and return only the extracted text."
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error during OCR with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to extract text from image: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image OCR.");
    }
};

export const translateTextGemini = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate the following text from ${sourceLang} to ${targetLang}:\n\n"${text}"`,
            config: {
                systemInstruction: `You are an expert translator. Your task is to accurately translate the given text. Do not add any extra commentary, explanations, or introductory phrases. Respond only with the translated text in ${targetLang}.`
            },
        });

        const translation = response.text.trim();
        if (!translation) {
            throw new Error("The API returned an empty translation.");
        }
        return translation;

    } catch (error) {
        console.error("Error during translation with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get translation from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred during translation.");
    }
};

export interface SpeechTranslationResult {
    transcription: string;
    translation: string;
}

// FIX: Changed type from File to Blob to resolve type mismatch from MediaRecorder.
export const transcribeAndTranslateAudio = async (audioFile: Blob, targetLang: string): Promise<SpeechTranslationResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const audioPart = await fileToGenerativePart(audioFile);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    audioPart,
                    { text: `First, transcribe the spoken text in this audio file. Second, translate the transcription into ${targetLang}.` }
                ]
            },
            config: {
                systemInstruction: `You are a multilingual expert in speech transcription and translation. Your task is to accurately transcribe the audio and then translate it. Respond ONLY with a valid JSON object containing two keys: "transcription" and "translation".`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        transcription: {
                            type: Type.STRING,
                            description: 'The transcribed text from the audio in its original language.',
                        },
                        translation: {
                            type: Type.STRING,
                            description: `The translated text in ${targetLang}.`,
                        },
                    },
                    required: ["transcription", "translation"],
                },
            },
        });

        const jsonString = response.text.trim();
        const result: SpeechTranslationResult = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error during speech to translate with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to process audio: ${error.message}`);
        }
        throw new Error("An unknown error occurred during audio processing.");
    }
};

export const transcribeAudioGemini = async (audioFile: Blob): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const audioPart = await fileToGenerativePart(audioFile);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    audioPart,
                    { text: "Transcribe the spoken Burmese text in this audio file. Respond only with the transcription." }
                ]
            },
            config: {
                systemInstruction: "You are an expert in Burmese speech transcription. Your task is to accurately transcribe the audio and return only the transcribed text."
            }
        });

        const transcription = response.text.trim();
        if (!transcription) {
            throw new Error("The API returned an empty transcription.");
        }
        return transcription;

    } catch (error) {
        console.error("Error during speech transcription with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
        throw new Error("An unknown error occurred during audio transcription.");
    }
};

export const generateMyanmarNames = async (gender: string, myanmarDay: string, nameCount: number): Promise<string[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            Based on the gender "${gender === 'male' ? 'male' : 'female'}" and the Myanmar day of the week "${myanmarDay}", generate exactly 10 beautiful, culturally appropriate Myanmar names with exactly ${nameCount} syllables each. The names must start with the appropriate consonant based on the day of the week according to Myanmar naming traditions:

            - တနင်္လာ: Start with 'က,ခ,ဂ,ဃ,င' (examples: ငြိမ်းချမ်း, ကောင်းမြတ်, ချမ်းအေးကို, ဂျိုးလေ, ချမ်းငြိမ်းသူ)
            - အင်္ဂါ: Start with 'စ,ဆ,ဇ,ဈ,ည' (examples: စည်သူအောင်, စိုးပြည့်သဇင်, ဇင်မာဦး, ညိုမြင့်အောင်, ညိုမာလွင်အေး)
            - ဗုဒ္ဓဟူး: Start with 'ရ,ယ,လ,ဝ' (examples: ရီရီထွန်း, ရည်မွန်ရွှေစင်, လဲ့လဲ့ဝင်း, ဝါဝါအောင်)
            - ကြာသပတေး: Start with 'ပ,ဖ,ဘ,မ' (examples: ပပဝင်းခင်, ဖိုးသား, ဖိုးသာထူး, ဘိုးသီဟ, မိုးမိုး, မိုးအေးအောင်)
            - သောကြာ: Start with 'သ,ဟ' (examples: သီဟ, သီသီအောင်, ဟိန်းထွန်း, ဟန်းထွန်းအောင်, ဟန်မိုးအေး, ဟန်သီ)
            - စနေ: Start with 'တ,ထ,ဒ,န' (examples: တင်ဘုန်းကျော်, တင်ဖုန်းကျော်, ထွန်းထွန်း, ထူးအောင်, နိုင်ခင်အောင်, နိုင်ဇော်အောင်, ဒိုးလေ)
            - တနင်္ဂနွေ: Start with 'အ,ဩ' (examples: အိန္ဒာကျော့, အိန္ဒြေမာလာ, ဩမင်းသန့်, ဩလေး, အိန္ဒြေရှင်မလေး)

            The name should have exactly ${nameCount} syllables (e.g., for 2 syllables: ငြိမ်းချမ်း (ငြိမ်း=1, ချမ်း=1); for 3 syllables: သီဟအောင် (သီ=1, ဟ=1, အောင်=1)). Format the response as a numbered list:
            1. [generated Myanmar name]
            2. [generated Myanmar name]
            ...
            10. [generated Myanmar name]
            Provide only the numbered list without additional comments.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const fullResponse = response.text.trim();
        const names = fullResponse.split('\n')
            .map(line => line.trim())
            .filter(line => line.match(/^\d+\.\s*.+/))
            .map(line => line.replace(/^\d+\.\s*/, ''));

        if (names.length === 0) {
            throw new Error('No valid names were generated by the AI.');
        }

        return names;
    } catch (error) {
        console.error("Error generating names:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate names from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred during name generation.");
    }
};

export interface PdfProcessingParams {
    pdfFile: Blob;
    mode: 'full' | 'summarize' | 'keypoints';
}

export const processPdfWithGemini = async ({ pdfFile, mode }: PdfProcessingParams): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const pdfPart = await fileToGenerativePart(pdfFile);

        let userQuery = "";
        let systemInstruction = "";

        const baseSystemPrompt = "You are an expert document analysis and summarization tool. Your primary language for output is Burmese (Myanmar). Carefully analyze the provided PDF content. Follow the user's extraction instruction, and provide the resulting summary or data in clear, accurate Burmese. Maintain the formatting (like paragraphs, bullet points) from the original text where appropriate.";

        switch (mode) {
            case 'full':
                userQuery = "Extract all text content from this document and reformat it cleanly using the Burmese language, maintaining original paragraph structure.";
                systemInstruction = baseSystemPrompt;
                break;
            case 'summarize':
                userQuery = "Analyze the text content of this PDF and generate a concise, high-level summary of the entire document (around 3-5 sentences). The summary must be output entirely in the Burmese language.";
                systemInstruction = "You are an expert summarization tool. Your primary language for output is Burmese (Myanmar). Generate a concise, single-paragraph, high-level summary. The summary must be professional and accurate, based only on the provided PDF content.";
                break;
            case 'keypoints':
                userQuery = "Analyze the text content of this PDF and generate a bulleted list (using Markdown hyphens -) of 5 to 7 most important key takeaways or main points from the entire document. The output must be entirely in the Burmese language.";
                systemInstruction = "You are an expert information extractor. Your primary language for output is Burmese (Myanmar). Generate a bulleted list of 5 to 7 key takeaways or main points. The points must be accurate and derived directly from the provided PDF content.";
                break;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: userQuery }, pdfPart] },
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const text = response.text.trim();
        if (!text) {
            throw new Error("The API returned an empty response.");
        }
        return text;

    } catch (error) {
        console.error("Error during PDF processing with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to process PDF: ${error.message}`);
        }
        throw new Error("An unknown error occurred during PDF processing.");
    }
};