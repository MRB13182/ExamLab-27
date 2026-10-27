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
  const envModel = process.env.GEMINI_MODEL;
  if (envModel) {
    if (envModel.includes("gemini-1.5") || envModel.includes("gemini-2.0")) {
      return "gemini-3.8-flash";
    }
    return envModel;
  }
  return "gemini-3.8-flash";
}

// Generate with automatic retry, exponential backoff, and multi-model fallback to prevent 503 temporary spike errors
export async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    temperature?: number;
  }
): Promise<string> {
  const primaryModel = getModel();
  const candidateModels = Array.from(
    new Set([primaryModel, "gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"])
  );

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            temperature: params.temperature ?? 0.4,
          },
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        const isTransient =
          status === 503 ||
          status === 429 ||
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("UNAVAILABLE");

        if (isTransient && attempt === 0) {
          // Wait 600ms before retrying with backoff
          await new Promise((resolve) => setTimeout(resolve, 600));
        } else {
          break; // Move to next candidate model
        }
      }
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
