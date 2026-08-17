import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------------
// Singleton AI client — instantiated once, reused across requests
// ---------------------------------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "[lib/ai] WARNING: GEMINI_API_KEY is not set. AI calls will fail at runtime."
  );
}

const ai = new GoogleGenAI({
  apiKey: apiKey ?? "",
});

// Model to use across the entire backend
export const AI_MODEL = "gemini-3.5-flash-lite";

// ---------------------------------------------------------------------------
// In-memory Cache & In-Flight Request Deduplication (Prevents Quota Exhaustion)
// ---------------------------------------------------------------------------
interface CacheEntry {
  response: string;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const cacheMap = new Map<string, CacheEntry>();
const inFlightMap = new Map<string, Promise<string>>();

function getCacheKey(prompt: string): string {
  // Simple fast hash / normalized key
  return prompt.trim().replace(/\s+/g, " ");
}

// ---------------------------------------------------------------------------
// Retry helper: sleep
// ---------------------------------------------------------------------------
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Core helper: generateAIResponse (with cache, deduplication & retry on 429)
// ---------------------------------------------------------------------------

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 10_000; // 10 s

export async function generateAIResponse(prompt: string, bypassCache = false): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not configured. " +
        "Add it to your .env.local file."
    );
  }

  const cacheKey = getCacheKey(prompt);

  // 1. Check in-memory cache
  if (!bypassCache) {
    const cached = cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.response;
    }
  }

  // 2. Check in-flight requests to deduplicate concurrent identical calls
  const inFlight = inFlightMap.get(cacheKey);
  if (inFlight && !bypassCache) {
    return inFlight;
  }

  // 3. Execute request and store in flight promise
  const executePromise = (async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: AI_MODEL,
          contents: prompt,
        });

        const responseText = response.text;

        if (!responseText || responseText.trim() === "") {
          throw new Error(
            "Gemini returned an empty response. The prompt may have triggered a safety filter."
          );
        }

        const cleanText = responseText.trim();

        // Store in cache
        cacheMap.set(cacheKey, {
          response: cleanText,
          timestamp: Date.now(),
        });

        return cleanText;
      } catch (err: any) {
        const message = err?.message ?? "Unknown error from Gemini API";
        const isRateLimit =
          message.includes("429") ||
          message.includes("RESOURCE_EXHAUSTED") ||
          message.includes("quota") ||
          message.includes("503") ||
          message.includes("UNAVAILABLE") ||
          message.includes("high demand");

        if (isRateLimit && attempt < MAX_RETRIES) {
          const retryAfterMatch = message.match(/retry in (\d+)/i);
          const retryMs = retryAfterMatch
            ? parseInt(retryAfterMatch[1], 10) * 1000 + 1000
            : BASE_DELAY_MS * (attempt + 1);

          console.warn(
            `[lib/ai] Rate limited (429). Retrying attempt ${attempt + 1}/${MAX_RETRIES} after ${Math.round(retryMs / 1000)}s...`
          );
          await sleep(retryMs);
          continue;
        }

        console.error("[lib/ai] generateAIResponse error:", message);
        lastError = new Error(`Gemini API call failed: ${message}`);
        break;
      }
    }

    throw lastError ?? new Error("Gemini API call failed after retries.");
  })();

  inFlightMap.set(cacheKey, executePromise);

  try {
    const result = await executePromise;
    return result;
  } finally {
    inFlightMap.delete(cacheKey);
  }
}

// ---------------------------------------------------------------------------
// JSON-safe wrapper: generateAIJSON
// ---------------------------------------------------------------------------

export async function generateAIJSON(prompt: string, bypassCache = false): Promise<string> {
  const raw = await generateAIResponse(prompt, bypassCache);

  // Strip optional markdown code-fence wrappers that models sometimes add
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

// ---------------------------------------------------------------------------
// Vector Embeddings & Similarity Engine
// ---------------------------------------------------------------------------

export async function embedText(text: string): Promise<number[]> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

  if (!response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
    throw new Error("Failed to generate embeddings from Gemini API.");
  }

  return response.embeddings[0].values;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be of the same length.");
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

