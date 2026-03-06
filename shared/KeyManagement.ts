import * as SecureStore from "expo-secure-store";

export const API_KEYS = {
  GOOGLE_AI: "google_ai_key",
  EURON: "euron_key",
  OPENROUTER: "openrouter_key",
  MISTRAL: "mistral_key",
  OPENAI: "openai_key",
};

export const saveApiKey = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    return false;
  }
};

export const getApiKey = async (key: string) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error("Error getting API key:", error);
    return null;
  }
};

export const deleteApiKey = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error("Error deleting API key:", error);
    return false;
  }
};
