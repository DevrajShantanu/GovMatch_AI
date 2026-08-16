import { Internship, User, ResumeAnalysis, SkillGapAnalysis, BiasMetric, Application } from "./types";

export const MOCK_USER: User = {
  id: "usr_101",
  name: "Aarav Sharma",
  email: "aarav.sharma@iitd.ac.in",
  role: "STUDENT",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  college: "Indian Institute of Technology Delhi",
  degree: "B.Tech in Computer Science & Engineering",
  graduationYear: 2026,
  location: "New Delhi, India",
  bio: "Passionate about AI ethics, natural language processing, and public policy automation. Seeking high-impact government tech internships.",
  skills: [
    { id: "sk_1", name: "Python", category: "Technical", proficiency: "Expert", matchLevel: "Matched" },
    { id: "sk_2", name: "Next.js / React", category: "Technical", proficiency: "Advanced", matchLevel: "Matched" },
    { id: "sk_3", name: "Data Science & NLP", category: "Technical", proficiency: "Advanced", matchLevel: "Matched" },
    { id: "sk_4", name: "SQL & PostgreSQL", category: "Technical", proficiency: "Intermediate", matchLevel: "Matched" },
    { id: "sk_5", name: "Public Policy Basics", category: "Domain", proficiency: "Intermediate", matchLevel: "Matched" },
    { id: "sk_6", name: "Docker & Kubernetes", category: "Tool", proficiency: "Beginner", matchLevel: "Missing" },
  ],
  resumeUrl: "/resumes/aarav_sharma_cv.pdf",
  resumeScore: 88,
};

export const MOCK_INTERNSHIPS: Internship[] = [
  {
    id: "int_gov_01",
    title: "AI Policy & Governance Research Intern",
    organization: "NITI Aayog",
    ministryOrDepartment: "Frontier Technologies Vertical",
    location: "New Delhi",
    type: "Hybrid",
    stipend: 25000,
    stipendPeriod: "Monthly",
    duration: "6 Months",
    postedDate: "2026-08-01",
    deadline: "2026-08-25",
    openings: 5,
    category: "AI & Public Policy",
    description: "Work directly with government tech advisors on frameworks for ethical AI deployment, algorithmic fairness guidelines, and national AI benchmarks for public sector projects.",
    responsibilities: [
      "Analyze policy frameworks for generative AI models in e-governance.",
      "Conduct comparative studies on global AI safety standards.",
      "Draft policy briefs and evaluation rubrics for government AI adoption."
    ],
    requirements: [
      "Currently pursuing B.Tech/M.Tech in CS, AI, or Master's in Public Policy.",
      "Strong proficiency in Python and data analytics.",
      "Understanding of algorithmic bias, transparency, and data privacy laws."
    ],
    requiredSkills: [
      { id: "sk_1", name: "Python", category: "Technical", proficiency: "Advanced" },
      { id: "sk_3", name: "Data Science & NLP", category: "Technical", proficiency: "Advanced" },
      { id: "sk_5", name: "Public Policy Basics", category: "Domain", proficiency: "Intermediate" },
      { id: "sk_7", name: "Algorithmic Ethics", category: "Domain", proficiency: "Intermediate" },
    ],
    matchScore: 94,
    matchBreakdown: {
      skillsMatch: 95,
      academicMatch: 92,
      locationMatch: 96,
      domainMatch: 93,
    },
    aiExplanation: "High 94% match because your Python, NLP expertise, and Delhi location closely fit NITI Aayog's Frontier Tech requirements.",
    status: "Open"
  },
  {
    id: "int_gov_02",
    title: "Full-Stack E-Governance Platform Intern",
    organization: "Ministry of Electronics & IT (MeitY)",
    ministryOrDepartment: "Digital India Corporation",
    location: "New Delhi",
    type: "On-site",
    stipend: 30000,
    stipendPeriod: "Monthly",
    duration: "3 Months",
    postedDate: "2026-08-04",
    deadline: "2026-08-20",
    openings: 8,
    category: "Software Engineering",
    description: "Help build high-concurrency microservices and modern React dashboard frontends for citizen welfare distribution portals under Digital India.",
    responsibilities: [
      "Develop responsive Next.js frontend interfaces for citizen application portals.",
      "Integrate RESTful APIs and secure authentication flows.",
      "Collaborate with database engineers on query optimization for high traffic."
    ],
    requirements: [
      "Hands-on experience with Next.js, React, and TypeScript.",
      "Familiarity with Tailwind CSS and responsive design.",
      "Basic understanding of microservice API integration."
    ],
    requiredSkills: [
      { id: "sk_2", name: "Next.js / React", category: "Technical", proficiency: "Advanced" },
      { id: "sk_4", name: "SQL & PostgreSQL", category: "Technical", proficiency: "Intermediate" },
      { id: "sk_8", name: "TypeScript", category: "Technical", proficiency: "Advanced" },
    ],
    matchScore: 89,
    matchBreakdown: {
      skillsMatch: 90,
      academicMatch: 88,
      locationMatch: 95,
      domainMatch: 84,
    },
    aiExplanation: "Strong match based on your web engineering background and Next.js projects.",
    status: "Closing Soon"
  },
  {
    id: "int_gov_03",
    title: "Data Science & Citizen Analytics Intern",
    organization: "National Informatics Centre (NIC)",
    ministryOrDepartment: "Data & Analytics Division",
    location: "Remote",
    type: "Remote",
    stipend: 22000,
    stipendPeriod: "Monthly",
    duration: "4 Months",
    postedDate: "2026-08-02",
    deadline: "2026-08-30",
    openings: 12,
    category: "Data Science",
    description: "Extract actionable insights from multi-regional public feedback datasets using machine learning, sentiment analysis, and predictive modeling.",
    responsibilities: [
      "Perform sentiment analysis on citizen grievance submissions.",
      "Build interactive dashboard visualizations using Python & React.",
      "Ensure anonymization and privacy compliance across datasets."
    ],
    requirements: [
      "Proficiency in Python, Pandas, Scikit-Learn, and NLP techniques.",
      "Experience with data visualization libraries (Recharts, D3, Matplotlib).",
      "Knowledge of privacy-preserving machine learning is a plus."
    ],
    requiredSkills: [
      { id: "sk_1", name: "Python", category: "Technical", proficiency: "Expert" },
      { id: "sk_3", name: "Data Science & NLP", category: "Technical", proficiency: "Advanced" },
      { id: "sk_9", name: "Data Visualization", category: "Technical", proficiency: "Intermediate" },
    ],
    matchScore: 91,
    matchBreakdown: {
      skillsMatch: 94,
      academicMatch: 90,
      locationMatch: 100,
      domainMatch: 82,
    },
    aiExplanation: "Remote flexibility and high alignment with your NLP and Python skills.",
    status: "Open"
  },
  {
    id: "int_gov_04",
    title: "Cybersecurity & Anomaly Detection Intern",
    organization: "CERT-In",
    ministryOrDepartment: "Indian Computer Emergency Response Team",
    location: "New Delhi",
    type: "On-site",
    stipend: 28000,
    stipendPeriod: "Monthly",
    duration: "6 Months",
    postedDate: "2026-07-28",
    deadline: "2026-08-18",
    openings: 3,
    category: "Cybersecurity",
    description: "Assist threat hunting operational teams in training machine learning models to detect automated intrusion attempts in national digital infrastructure.",
    responsibilities: [
      "Analyze network traffic logs using anomaly detection scripts.",
      "Benchmark firewall threat classification models.",
      "Draft vulnerability assessment reports."
    ],
    requirements: [
      "Background in Computer Networks, Linux, and Machine Learning.",
      "Experience with Python scripting and packet analysis tools."
    ],
    requiredSkills: [
      { id: "sk_1", name: "Python", category: "Technical", proficiency: "Advanced" },
      { id: "sk_6", name: "Docker & Kubernetes", category: "Tool", proficiency: "Intermediate" },
      { id: "sk_10", name: "Network Security", category: "Technical", proficiency: "Intermediate" },
    ],
    matchScore: 76,
    matchBreakdown: {
      skillsMatch: 70,
      academicMatch: 85,
      locationMatch: 95,
      domainMatch: 60,
    },
    aiExplanation: "Moderate match. Skill gap detected in Network Security and Cloud containerization.",
    status: "Open"
  }
];

export const MOCK_RESUME_ANALYSIS: ResumeAnalysis = {
  overallScore: 88,
  summary: "Your resume presents a compelling technical profile with strong Python and NLP skills. Highlight quantitative impact metrics for government-related projects to boost ATS score above 92%.",
  extractedSkills: [
    { id: "sk_1", name: "Python", category: "Technical", proficiency: "Expert", matchLevel: "Matched" },
    { id: "sk_2", name: "Next.js / React", category: "Technical", proficiency: "Advanced", matchLevel: "Matched" },
    { id: "sk_3", name: "Data Science & NLP", category: "Technical", proficiency: "Advanced", matchLevel: "Matched" },
    { id: "sk_4", name: "SQL", category: "Technical", proficiency: "Intermediate", matchLevel: "Matched" },
    { id: "sk_5", name: "Git & GitHub", category: "Tool", proficiency: "Advanced", matchLevel: "Matched" },
  ],
  missingKeywords: [
    "Kubernetes Deployment",
    "CI/CD Pipeline Security",
    "Algorithmic Transparency Audit",
    "Public Sector Compliance"
  ],
  strengths: [
    "Strong technical stack aligned with AI & Web engineering roles.",
    "Clean project impact bullet points with clear technologies mentioned.",
    "Higher education standing at a premier institute (IIT Delhi)."
  ],
  improvements: [
    "Add certification or coursework link for AI Policy/Ethics.",
    "Specify dataset scale (e.g. 'Analyzed 50k+ citizen records').",
    "Include Docker containerization experience if available."
  ],
  formatHealth: "Excellent",
  atsCompatibility: 91,
};

export const MOCK_SKILL_GAP: SkillGapAnalysis = {
  targetRole: "AI Policy & Governance Lead Intern",
  matchPercentage: 78,
  possessedSkills: [
    { id: "sk_1", name: "Python & Data Science", category: "Technical", proficiency: "Expert", matchLevel: "Matched" },
    { id: "sk_2", name: "Natural Language Processing", category: "Technical", proficiency: "Advanced", matchLevel: "Matched" },
    { id: "sk_3", name: "Public Policy Fundamentals", category: "Domain", proficiency: "Intermediate", matchLevel: "Matched" },
  ],
  gapSkills: [
    { id: "sk_g1", name: "Algorithmic Fairness Audit", category: "Domain", proficiency: "Beginner", matchLevel: "Missing" },
    { id: "sk_g2", name: "Docker Containerization", category: "Tool", proficiency: "Beginner", matchLevel: "Missing" },
    { id: "sk_g3", name: "Data Privacy Regulation (DPDP Act)", category: "Domain", proficiency: "Beginner", matchLevel: "Missing" },
  ],
  recommendedCourses: [
    {
      title: "Ethical AI & Algorithmic Audit Certification",
      provider: "Digital India Academy / NPTEL",
      duration: "4 Weeks (12 hrs)",
      level: "Intermediate",
      linkUrl: "#",
    },
    {
      title: "India DPDP Act 2023 Compliance & Data Protection",
      provider: "Ministry of Law & Justice Portal",
      duration: "2 Weeks (6 hrs)",
      level: "Beginner",
      linkUrl: "#",
    },
    {
      title: "Docker & Container Basics for Government Developers",
      provider: "NIC Training Institute",
      duration: "3 Weeks (10 hrs)",
      level: "Beginner",
      linkUrl: "#",
    }
  ]
};

export const MOCK_BIAS_METRICS: BiasMetric[] = [
  {
    id: "bm_1",
    metricName: "Disparate Impact Ratio (Tier-2/3 Colleges)",
    fairnessScore: 0.94,
    threshold: 0.80,
    status: "Optimal",
    demographicGroup: "Regional Institution Applicants",
    impactRatio: 0.94,
    auditNotes: "AI model recommendation distribution passes the 80% legal rule; no systemic bias against non-tier 1 colleges."
  },
  {
    id: "bm_2",
    metricName: "Gender Parity Index in Tech Recommendations",
    fairnessScore: 0.98,
    threshold: 0.90,
    status: "Optimal",
    demographicGroup: "Female & Non-Binary Candidates",
    impactRatio: 0.98,
    auditNotes: "Recommendation rate between male and female applicants is virtually equal across CS roles."
  },
  {
    id: "bm_3",
    metricName: "Rural & Aspirational District Representation",
    fairnessScore: 0.76,
    threshold: 0.80,
    status: "Warning",
    demographicGroup: "Aspirational District Candidates",
    impactRatio: 0.76,
    auditNotes: "Slight recommendation disparity detected due to keyword density in rural university resume formats. Re-weighting applied."
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app_01",
    internshipId: "int_gov_01",
    internshipTitle: "AI Policy & Governance Research Intern",
    organization: "NITI Aayog",
    appliedDate: "2026-08-05",
    status: "Under Review",
    matchScore: 94,
  },
  {
    id: "app_02",
    internshipId: "int_gov_02",
    internshipTitle: "Full-Stack E-Governance Platform Intern",
    organization: "MeitY - Digital India",
    appliedDate: "2026-08-06",
    status: "Submitted",
    matchScore: 89,
  }
];
