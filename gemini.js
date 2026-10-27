import { GoogleGenAI } from "@google/genai";

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to .env.local and restart the dev server.");
  return new GoogleGenAI({ apiKey });
}

export function getModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export function parseJson(text) {
  if (!text) throw new Error("The AI returned an empty response. Please try again.");
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try { return JSON.parse(cleaned); }
  catch { throw new Error("The AI response could not be parsed. Please try again."); }
}
