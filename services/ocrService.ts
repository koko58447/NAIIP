// services/ocrService.ts

interface OcrApiResponse {
    image_data?: string;
    image?: string;
    output_image?: string;
    // other potential fields...
}

export const performOcr = async (file: File): Promise<string> => {
    let ocrApiUrl: string;
    if (window.location.hostname === "192.168.200.199") {
        ocrApiUrl = "https://192.168.200.199:8002/predict?return_type=json";
    } else {
        ocrApiUrl = "https://mllip.org:8002/predict?return_type=json";
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(ocrApiUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `HTTP Error: ${response.statusText} (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch {
                // Non-JSON error, use the original message.
            }
            throw new Error(errorMessage);
        }

        const result: OcrApiResponse = await response.json();
        const imageBase64Data = result?.image_data || result?.image || result?.output_image;

        if (imageBase64Data) {
            return imageBase64Data;
        } else {
            console.error("API Response did not contain image data:", result);
            throw new Error("API response is missing the 'image_data', 'image', or 'output_image' key.");
        }
    } catch (error) {
        console.error("OCR Service Error:", error);
        if (error instanceof Error) {
            throw error; // Re-throw the original error
        }
        throw new Error("An unknown error occurred during the OCR process.");
    }
};
