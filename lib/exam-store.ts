import crypto from "crypto";
import fs from "fs";
import path from "path";

// In-memory exam session store for rapid access
interface StoredExam {
  exam: any;
  createdAt: number;
}

const globalStore = (globalThis as any).__hscExamStore || new Map<string, StoredExam>();
if (!(globalThis as any).__hscExamStore) {
  (globalThis as any).__hscExamStore = globalStore;
}

const DATA_DIR = path.resolve(process.cwd(), ".data", "exams");
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create .data/exams directory", e);
}

// Stable key derived from process secret or fallback
const SECRET = process.env.SESSION_SECRET || process.env.GEMINI_API_KEY || "hsc-2027-session-secret-salt-key-32b";
const CIPHER_KEY = crypto.createHash("sha256").update(SECRET).digest();

export function createSessionToken(payload: any): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", CIPHER_KEY, iv);
    const text = JSON.stringify(payload);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Failed to create session token:", err);
    return "";
  }
}

export function decryptSessionToken(token: string): any | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", CIPHER_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (err) {
    console.warn("Could not decrypt session token", err);
    return null;
  }
}

export function saveExam(id: string, exam: any): void {
  globalStore.set(id, { exam, createdAt: Date.now() });

  // Persist to disk so dev server restarts or worker reloads don't lose exams
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(exam), "utf8");
  } catch (e) {
    console.warn("Could not persist exam to disk", e);
  }

  // Keep in-memory store bounded
  if (globalStore.size > 200) {
    const oldestKey = globalStore.keys().next().value;
    if (oldestKey) {
      globalStore.delete(oldestKey);
    }
  }
}

export function getExam(id: string): any | null {
  if (!id) return null;

  // 1. Check in-memory store
  const item = globalStore.get(id);
  if (item && item.exam) return item.exam;

  // 2. Check disk persistence
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      globalStore.set(id, { exam: data, createdAt: Date.now() });
      return data;
    }
  } catch (e) {
    console.warn("Could not read exam from disk", e);
  }

  return null;
}
