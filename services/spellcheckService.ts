// services/spellcheckService.ts

interface SpellcheckRequestBody {
  text: string;
}

export interface SpellcheckResponseBody {
  original_text: string;
  corrected_text: string;
}

export const correctText = async (text: string): Promise<SpellcheckResponseBody> => {
  const SPELLCHECK_ENDPOINT_URL = "https://mllip.org:8030/correct";

  if (!text.trim()) {
    return { original_text: text, corrected_text: text };
  }

  const body: SpellcheckRequestBody = { text };

  try {
    const response = await fetch(SPELLCHECK_ENDPOINT_URL, {
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

    const result: SpellcheckResponseBody = await response.json();
    return result;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to correct text: ${error.message}`);
    }
    throw new Error('An unknown error occurred during spell check.');
  }
};