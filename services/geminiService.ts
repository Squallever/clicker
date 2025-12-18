import { GoogleGenAI } from "@google/genai";
import { OracleMode } from "../types";

// Safer access to process.env for browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  return '';
};

const apiKey = getApiKey();

// Initialize Gemini client only if key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getOracleWisdom = async (mode: OracleMode): Promise<string> => {
  if (!ai) {
    return "The Oracle is sleeping (Missing API Key).";
  }

  let prompt = "";
  let systemInstruction = "You are a mystical, wise, and slightly sassy cat oracle. You speak in cat puns and refer to humans as 'servants' or 'can openers'. Keep responses short (under 30 words).";

  switch (mode) {
    case OracleMode.WISDOM:
      prompt = "Give me a piece of profound cat wisdom or life advice based on cat behavior.";
      break;
    case OracleMode.NAME:
      prompt = "Generate a unique, cute, or funny name for a new kitten joining the colony.";
      break;
    case OracleMode.STORY:
      prompt = "Tell a very short (2 sentence) micro-story about a legendary cat hero.";
      break;
    default:
      prompt = "Meow.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
      }
    });

    return response.text || "Meow? (The spirits are silent)";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hiss! (The connection to the spirit realm failed)";
  }
};