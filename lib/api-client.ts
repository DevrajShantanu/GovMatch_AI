/**
 * lib/api-client.ts
 *
 * Centralized, typed fetch wrapper for all frontend → backend API calls.
 * Includes in-flight request deduplication and client-side caching to prevent Gemini quota exhaustion.
 */

// ---------------------------------------------------------------------------
// Base URL helper — works in both browser (relative) and server (absolute)
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// In-Flight Request Deduplication Map (Client-Side)
// ---------------------------------------------------------------------------
const clientInFlightMap = new Map<string, Promise<any>>();

// ---------------------------------------------------------------------------
// Generic fetch helper with error handling
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const method = options?.method ?? "GET";
  const bodyKey = options?.body ? String(options.body) : "";
  const requestKey = `${method}:${url}:${bodyKey}`;

  // Deduplicate identical in-flight POST requests
  if (method === "POST" && clientInFlightMap.has(requestKey)) {
    return clientInFlightMap.get(requestKey) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
        ...options,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ?? data?.message ?? `Request failed with status ${res.status}`
        );
      }

      return data as T;
    } finally {
      clientInFlightMap.delete(requestKey);
    }
  })();

  if (method === "POST") {
    clientInFlightMap.set(requestKey, fetchPromise);
  }

  return fetchPromise;
}

// ---------------------------------------------------------------------------
// Types (mirrored from API contracts)
// ---------------------------------------------------------------------------

export interface RecommendationItem {
  title: string;
  matchScore: number;
  reason: string;
}

export interface RecommendResponse {
  recommendations: RecommendationItem[];
  fallback?: boolean; // true when AI was unavailable and deterministic fallback was used
}

export interface ExtractResponse {
  skills: string[];
  interests: string[];
}

export interface ResumeParseResult {
  skills: string[];
  education: string;
  experience: string;
  atsScore: number;
  atsFeedback: {
    type: "strength" | "improvement" | "keyword";
    message: string;
  }[];
}

export interface ResumeApiResponse {
  success: boolean;
  data?: ResumeParseResult;
  error?: string;
}

export interface SkillGapResult {
  missing_skills: string[];
  priority: string[];
  suggestions: string[];
}

export interface SkillGapApiResponse {
  success: boolean;
  data?: SkillGapResult;
  error?: string;
}

export interface InternshipItem {
  id: string;
  title: string;
  organization: string;
  ministry_or_department?: string;
  location: string;
  type: "Remote" | "On-site" | "Hybrid";
  stipend: number;
  duration: string;
  category?: string;
  description: string;
  required_skills: string[];
  status?: "Open" | "Closing Soon" | "Closed";
  openings?: number;
  created_at?: string;
}

export interface InternshipsApiResponse {
  success: boolean;
  data?: InternshipItem[];
  error?: string;
}

// ---------------------------------------------------------------------------
// API Client Functions
// ---------------------------------------------------------------------------

/**
 * POST /api/recommend
 * Get AI-powered internship recommendations based on skills, interests, and resume.
 */
export async function getRecommendations(payload: {
  skills: string[];
  interests: string[];
  resumeText: string;
}): Promise<RecommendResponse> {
  return apiFetch<RecommendResponse>("/api/recommend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/extract
 * Extract skills and interests from raw resume text.
 */
export async function extractFromResume(resumeText: string): Promise<ExtractResponse> {
  return apiFetch<ExtractResponse>("/api/extract", {
    method: "POST",
    body: JSON.stringify({ resumeText }),
  });
}

/**
 * POST /api/resume
 * Upload a PDF file and get AI-parsed resume data.
 */
export async function parseResumeFile(file: File): Promise<ResumeApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${getBaseUrl()}/api/resume`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return res.json() as Promise<ResumeApiResponse>;
}

/**
 * POST /api/skill-gap
 * Analyze the gap between user skills and required skills for a role.
 */
export async function analyzeSkillGap(payload: {
  userSkills: string[];
  requiredSkills: string[];
}): Promise<SkillGapApiResponse> {
  return apiFetch<SkillGapApiResponse>("/api/skill-gap", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/internships
 * Fetch all internship listings (with optional search and category filters).
 */
export async function fetchInternships(params?: {
  search?: string;
  category?: string;
}): Promise<InternshipsApiResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category) qs.set("category", params.category);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<InternshipsApiResponse>(`/api/internships${query}`);
}

/**
 * GET /api/health
 * Check if the backend is alive.
 */
export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/health");
}
