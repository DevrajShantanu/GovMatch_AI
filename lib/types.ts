export type UserRole = "STUDENT" | "ADMIN" | "EMPLOYER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  location?: string;
  bio?: string;
  skills: Skill[];
  resumeUrl?: string;
  resumeScore?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: "Technical" | "Soft" | "Domain" | "Tool";
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  matchLevel?: "Matched" | "Missing" | "Partial";
}

export interface Internship {
  id: string;
  title: string;
  organization: string;
  ministryOrDepartment?: string;
  location: string;
  type: "Remote" | "On-site" | "Hybrid";
  stipend: number;
  stipendPeriod: "Monthly" | "Total";
  duration: string;
  postedDate: string;
  deadline: string;
  openings: number;
  category: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: Skill[];
  matchScore: number;
  matchBreakdown: {
    skillsMatch: number;
    academicMatch: number;
    locationMatch: number;
    domainMatch: number;
  };
  aiExplanation: string;
  status: "Open" | "Closing Soon" | "Applied" | "Saved";
}

export interface Recommendation {
  id: string;
  internship: Internship;
  matchScore: number;
  reasons: string[];
  userFeedback?: "INTERESTED" | "NOT_INTERESTED" | "BOOKMARKED";
  confidenceRating: "High" | "Medium" | "Moderate";
}

export interface ResumeAnalysis {
  overallScore: number;
  summary: string;
  extractedSkills: Skill[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  formatHealth: "Excellent" | "Good" | "Needs Attention";
  atsCompatibility: number;
}

export interface SkillGapAnalysis {
  targetRole: string;
  matchPercentage: number;
  possessedSkills: Skill[];
  gapSkills: Skill[];
  recommendedCourses: {
    title: string;
    provider: string;
    duration: string;
    level: string;
    linkUrl: string;
  }[];
}

export interface BiasMetric {
  id: string;
  metricName: string;
  fairnessScore: number;
  threshold: number;
  status: "Optimal" | "Warning" | "Critical";
  demographicGroup: string;
  impactRatio: number;
  auditNotes: string;
}

export interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  organization: string;
  appliedDate: string;
  status: "Submitted" | "Under Review" | "Shortlisted" | "Accepted" | "Rejected";
  matchScore: number;
}
