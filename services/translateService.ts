// services/translateService.ts
interface TranslateRequestBody {
  text: string;
  which: 'my-en' | 'en-my';
  modeltype: string;
}

export interface TranslateResponseBody {
  translation: string;
  duration_seconds?: number;
}

export const translateText = async (
  text: string,
  direction: 'my-en' | 'en-my'
): Promise<TranslateResponseBody> => {
  const TRANSLATE_ENDPOINT_URL = "https://mllip.org:8012/translate";

  if (!text.trim()) {
    return { translation: '' };
  }

  const body: TranslateRequestBody = {
    text: text,
    which: direction,
    modeltype: ""
  };

  try {
    const response = await fetch(TRANSLATE_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMsg = `Server Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.error || JSON.stringify(errorData);
      } catch (e) {
         const textError = await response.text().catch(() => '');
         if (textError) errorMsg = textError;
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    
    // Assuming the API returns an object like { translation: "...", duration_seconds: 0.5 }
    if (typeof result === 'object' && result !== null && 'translation' in result) {
         return result;
    }

    // Fallback for unexpected response structures
    return { translation: JSON.stringify(result) };


  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to translate text: ${error.message}`);
    }
    throw new Error('An unknown error occurred during translation.');
  }
};