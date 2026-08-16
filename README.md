# 🇮🇳 GovMatch AI — National Public Sector Internship Portal

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-8E75B2?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **GovMatch AI** is a state-of-the-art, AI-powered matchmaking and recommendation platform designed for national public sector internship allocations in India. Built for fair, transparent, and skill-first meritocracy.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Resume Parsing & Skill Extraction
- Automated PDF extraction using high-efficiency serverless parsing (`unpdf`).
- Google Gemini AI extracts structured competencies, education, experience, and domain strengths.

### 2. 🎯 Intelligent Internship Matching & Scoring
- Multi-dimensional candidate-to-internship scoring engine with real-time match percentages.
- Contextual explanations ("Why you matched") explaining exact alignment with ministry requirements.

### 3. 📊 Interactive Skill Gap Matrix
- Visual skill comparison breakdown against required qualifications.
- Actionable, personalized learning recommendations to bridge domain gaps for public sector roles.

### 4. ⚖️ Fair Allocation & Bias-Detection Dashboard
- Comprehensive administrative monitoring panel.
- Real-time fairness metrics, demographic distributions, and allocation equity visualization powered by `Recharts`.

### 5. 🛡️ Enterprise-Grade Security & Role Management
- Supabase Authentication with server-side middleware and Row-Level Security (RLS).
- Dedicated Admin portal with candidate registry management and secure database-level account deletion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16 (App Router)](https://nextjs.org/), [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/) |
| **Backend & APIs** | Next.js Server Actions, Route Handlers, [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) |
| **Database & Auth** | [Supabase PostgreSQL](https://supabase.com/) with Row-Level Security (RLS) & Secure Admin Service Role |
| **Artificial Intelligence** | [Google Gemini 2.0 / GenAI SDK](https://github.com/google-gemini/generative-ai-js), [unpdf](https://github.com/unjs/unpdf) |

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/govmatch-ai.git
cd govmatch-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 👨‍💻 Developer & Author

* **Shantanu Sarkar**
  * 📧 Email: [shantanu.sarkar3391@gmail.com](mailto:shantanu.sarkar3391@gmail.com)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
