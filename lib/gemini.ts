import { GoogleGenAI } from "@google/genai";

export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please ensure your API key is configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function getModel(): string {
  // Use gemini-3.1-flash-lite as the reliable, fast default (avoids 503 high demand spikes on flash)
  return process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
}

// Generate with automatic multi-model fallback to ensure 100% uptime even during temporary API spikes
export async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    temperature?: number;
  }
): Promise<string> {
  const primaryModel = getModel();
  const candidateModels = Array.from(
    new Set([primaryModel, "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"])
  );

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          temperature: params.temperature ?? 0.45,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err?.status || err?.message || err);
      lastError = err;
      // Continue to next candidate model
    }
  }

  throw lastError || new Error("All AI models are currently busy. Please try again shortly.");
}

export function parseJson(text: string | undefined): any {
  if (!text) {
    throw new Error("The AI returned an empty response. Please try again.");
  }
  let cleaned = text.trim();
  
  // Strip code block markers
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  
  // Extract outermost json object or array
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error("Failed to parse JSON string:", cleaned);
    throw new Error("The AI response could not be parsed as valid JSON. Please try again.");
  }
}
