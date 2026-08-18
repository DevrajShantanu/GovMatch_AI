import { InternshipItem } from "./types";

export const REAL_INTERNSHIPS: Omit<InternshipItem, "id" | "created_at">[] = [
  {
    title: "Software Engineering Intern - PMIS",
    organization: "Tata Consultancy Services (TCS)",
    ministry_or_department: "Prime Minister's Internship Scheme",
    location: "Bengaluru",
    type: "On-site",
    stipend: 5000,
    stipend_period: "Monthly",
    duration: "12 Months",
    category: "Software Engineering",
    description: "Join TCS under the Prime Minister's Internship Scheme to work on next-generation enterprise software solutions.\n\nResponsibilities:\n- Assist in backend development using Java and Spring Boot.\n- Write unit tests and participate in code reviews.\n- Collaborate with cross-functional agile teams.\n\nRequirements:\n- Indian citizens aged 21–24 not in full-time employment.\n- B.Tech/B.E in Computer Science or IT.",
    required_skills: [
      "Java",
      "Spring Boot",
      "SQL",
      "Software Testing"
    ],
    status: "Open",
    openings: 150
  },
  {
    title: "Manufacturing & Operations Intern - PMIS",
    organization: "Tata Motors",
    ministry_or_department: "Prime Minister's Internship Scheme",
    location: "Pune",
    type: "On-site",
    stipend: 5000,
    stipend_period: "Monthly",
    duration: "12 Months",
    category: "Manufacturing & Engineering",
    description: "Gain hands-on experience on the assembly line and supply chain operations at India's largest automotive manufacturer.\n\nResponsibilities:\n- Monitor assembly line efficiency and document standard operating procedures (SOPs).\n- Assist in quality control checks for EV battery placement.\n- Manage inventory tracking logs.\n\nRequirements:\n- Indian citizens aged 21–24 not in full-time employment.\n- Diploma or ITI in Mechanical/Automobile Engineering.",
    required_skills: [
      "Mechanical Engineering",
      "Operations",
      "Quality Control",
      "CAD"
    ],
    status: "Open",
    openings: 80
  },
  {
    title: "Retail Supply Chain Intern - PMIS",
    organization: "Reliance Retail",
    ministry_or_department: "Prime Minister's Internship Scheme",
    location: "Mumbai",
    type: "Hybrid",
    stipend: 5000,
    stipend_period: "Monthly",
    duration: "12 Months",
    category: "Logistics & Supply Chain",
    description: "Work with Reliance Retail's nationwide logistics network to optimize inventory flow and warehouse management.\n\nResponsibilities:\n- Track shipment delays and optimize route planning using data dashboards.\n- Conduct inventory audits at regional hubs.\n- Assist the procurement team with vendor management.\n\nRequirements:\n- Indian citizens aged 21–24 not in full-time employment.\n- Graduates in B.Com, BBA, or Logistics Management.",
    required_skills: [
      "Supply Chain Management",
      "Data Entry",
      "Logistics",
      "Communication"
    ],
    status: "Open",
    openings: 200
  },
  {
    title: "Financial Analyst Intern - PMIS",
    organization: "HDFC Bank",
    ministry_or_department: "Prime Minister's Internship Scheme",
    location: "New Delhi",
    type: "On-site",
    stipend: 5000,
    stipend_period: "Monthly",
    duration: "12 Months",
    category: "Finance & Accounting",
    description: "An opportunity to learn retail banking operations, credit analysis, and financial reporting at India's leading private bank.\n\nResponsibilities:\n- Assist in retail loan document verification and credit scoring.\n- Prepare monthly financial summaries using Excel.\n- Shadow branch managers in customer relationship management.\n\nRequirements:\n- Indian citizens aged 21–24 not in full-time employment.\n- Graduates in Commerce, Finance, or Economics.",
    required_skills: [
      "Accounting",
      "Financial Analysis",
      "Microsoft Excel",
      "Customer Service"
    ],
    status: "Open",
    openings: 50
  },
  {
    title: "IT Infrastructure & Support Intern - PMIS",
    organization: "Infosys",
    ministry_or_department: "Prime Minister's Internship Scheme",
    location: "Hyderabad",
    type: "Hybrid",
    stipend: 5000,
    stipend_period: "Monthly",
    duration: "12 Months",
    category: "IT Support",
    description: "Support global IT infrastructure operations, networking, and cloud services under the PMIS initiative at Infosys.\n\nResponsibilities:\n- Provide L1 technical support for internal enterprise tools.\n- Assist in network troubleshooting and server maintenance.\n- Document IT infrastructure diagrams and topologies.\n\nRequirements:\n- Indian citizens aged 21–24 not in full-time employment.\n- Diploma or Degree in Computer Applications (BCA) or Electronics.",
    required_skills: [
      "Networking",
      "Linux",
      "IT Support",
      "Troubleshooting"
    ],
    status: "Open",
    openings: 120
  }
];
