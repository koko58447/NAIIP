export const transcribeAudio = async (
  audioBlob: Blob,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  let ASR_ENDPOINT_URL;
  if (window.location.hostname === "192.168.200.199") {
    ASR_ENDPOINT_URL = "https://192.168.200.209:8031/transcribe-general-model";
  } else {
    ASR_ENDPOINT_URL = "https://mllip.org:8031/transcribe-general-model";
  }

  const token = ""; // As per user request, token is empty.
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  
  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(ASR_ENDPOINT_URL, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok || !response.body) {
      let errorMsg = `Server Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        const textError = await response.text().catch(() => '');
        if (textError) {
          errorMsg = textError;
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onComplete();
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      const cleanedChunk = chunk.replace(/\uFFFD/g, ""); // Remove replacement characters
      onChunk(cleanedChunk);
    }
  } catch (error) {
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error('An unknown error occurred during transcription.'));
    }
  }
};
