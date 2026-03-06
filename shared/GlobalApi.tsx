import axios from "axios";
import { API_KEYS, getApiKey } from "./KeyManagement";

const DEFAULT_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const DEFAULT_EURON_KEY = process.env.EXPO_PUBLIC_KRAVIX_STUDIO_API_KEY; // Using existing env if available

/**
 * Detects if the prompt is requesting an image.
 */
const isImageRequest = (text: string): boolean => {
  const keywords = [
    "generate image",
    "create image",
    "draw",
    "picture of",
    "imagine",
    "show me a",
    "generate a photo",
    "generate an image",
  ];
  return keywords.some((keyword) => text.toLowerCase().includes(keyword));
};

/**
 * Text Generation using Gemini 2.0 Flash
 */
export const AIChatmodel = async (messages: any) => {
  try {
    const userKey = await getApiKey(API_KEYS.GOOGLE_AI);
    const apiKey = userKey || DEFAULT_GEMINI_KEY;

    if (!apiKey) throw new Error("Google AI API Key not found.");

    // Format messages for Gemini
    const formattedMessages = messages
      .filter((msg: any) => msg.role !== "system")
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const systemMessage = messages.find((msg: any) => msg.role === "system");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    const response = await axios.post(apiUrl, requestBody);
    const aiResponse =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    return {
      aiResponse,
      type: "text",
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Image Generation using Euron API
 */
export const GenerateImage = async (prompt: string) => {
  try {
    const userKey = await getApiKey(API_KEYS.EURON);
    const apiKey = userKey || DEFAULT_EURON_KEY;

    if (!apiKey) throw new Error("Euron API Key not found.");

    const response = await axios.post(
      "https://api.euron.one/api/v1/euri/images/generations",
      {
        prompt: prompt,
        model: "gemini-3-pro-image-preview", // or other supported model
        n: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    // Assuming the API returns a URL in data.data[0].url or similar
    const imageUrl = response.data?.data?.[0]?.url;

    return {
      aiResponse: imageUrl,
      type: "image",
    };
  } catch (error: any) {
    console.error(
      "Euron Image API Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Unified AI Interface with Intent Detection
 */
export const AIInterface = async (messages: any) => {
  const lastMessage = messages[messages.length - 1]?.content || "";

  if (isImageRequest(lastMessage)) {
    return await GenerateImage(lastMessage);
  } else {
    return await AIChatmodel(messages);
  }
};
