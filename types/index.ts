// Types definition for SIH Internship Recommendation Platform Backend

export type UserRole = "STUDENT" | "ADMIN" | "EMPLOYER";

export interface Skill {
  id?: string;
  name: string;
  category?: "Technical" | "Soft" | "Domain" | "Tool";
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

// -----------------------------------------------------------------------------
// Supabase Database Table Schemas
// -----------------------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role?: UserRole;
  avatar_url?: string;
  college?: string;
  degree?: string;
  graduation_year?: number;
  location?: string;
  bio?: string;
  skills: string[];
  education?: string;
  experience?: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InternshipItem {
  id: string;
  title: string;
  organization: string;
  ministry_or_department?: string;
  location: string;
  type: "Remote" | "On-site" | "Hybrid";
  stipend: number;
  stipend_period?: "Monthly" | "Total";
  duration: string;
  category?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  required_skills: string[];
  status?: "Open" | "Closing Soon" | "Closed";
  openings?: number;
  created_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  internship_id: string;
  status: "Submitted" | "Under Review" | "Shortlisted" | "Accepted" | "Rejected";
  match_score?: number;
  applied_at?: string;
}

// -----------------------------------------------------------------------------
// API Request & Response Contracts
// -----------------------------------------------------------------------------

// Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Resume Parsing: /api/resume
export interface ResumeParseResult {
  skills: string[];
  education: string;
  experience: string;
  atsScore: number;
  atsFeedback: string[];
}

// Recommendations: /api/recommend
export interface RecommendRequest {
  userSkills: string[];
  internships?: Partial<InternshipItem>[];
}

export interface RecommendationResult {
  title: string;
  match_score: number;
  reason: string;
  missing_skills: string[];
  why_this_match: string;
}

// Skill Gap Analysis: /api/skill-gap
export interface SkillGapRequest {
  userSkills: string[];
  requiredSkills: string[];
}

export interface SkillGapResult {
  missing_skills: string[];
  priority: string[];
  suggestions: string[];
}

// Profile API: /api/profile
export interface UpdateProfileRequest {
  userId?: string;
  full_name?: string;
  email?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  college?: string;
  degree?: string;
  graduation_year?: number;
  location?: string;
  bio?: string;
  resume_url?: string;
}

// Internship API: /api/internships
export interface CreateInternshipRequest {
  title: string;
  organization: string;
  location: string;
  type: "Remote" | "On-site" | "Hybrid";
  stipend: number;
  duration: string;
  description: string;
  required_skills: string[];
  category?: string;
  openings?: number;
  ministry_or_department?: string;
}

// -----------------------------------------------------------------------------
// New AI Recommendation Engine API Contracts  (/api/recommend, /api/extract)
// -----------------------------------------------------------------------------

/** Single recommendation item returned by /api/recommend */
export interface RecommendationItem {
  title: string;
  matchScore: number;
  reason: string;
}

/** Request body for POST /api/recommend */
export interface RecommendEngineRequest {
  skills: string[];
  interests: string[];
  resumeText: string;
}

/** Response body for POST /api/recommend */
export interface RecommendEngineResponse {
  recommendations: RecommendationItem[];
}

/** Request body for POST /api/extract */
export interface ExtractRequest {
  resumeText: string;
}

/** Response body for POST /api/extract */
export interface ExtractResponse {
  skills: string[];
  interests: string[];
}
