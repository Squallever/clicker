
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { OracleMode } from "../types";

export async function getOracleWisdom(mode: OracleMode): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  switch (mode) {
    case OracleMode.WISDOM:
      prompt = "Give me a short, 1-sentence mystical and cute piece of wisdom from a Zen Master Cat. Keep it under 20 words.";
      break;
    case OracleMode.NAME:
      prompt = "Suggest a grand but cute mystical name for a cat hero, including a title (e.g., 'Luna, The Midnight Prowler'). Just the name, no extra text.";
      break;
    case OracleMode.STORY:
      prompt = "Tell a very short (2 sentences) legend about an ancient cat deity who protected the first clover. Be poetic and cute.";
      break;
    default:
      prompt = "Meow something mystical!";
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text?.trim() || "The spirits of the cat dimension are silent... Meow.";
  } catch (error) {
    console.error("Gemini Oracle Error:", error);
    return "A cloud of catnip obscures my vision... Try again later.";
  }
}
