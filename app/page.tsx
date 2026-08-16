import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/shared/footer";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Building2,
  ArrowRight,
  Zap,
  FileText,
  CheckCircle2,
  GraduationCap,
  Target,
  Award,
  Globe,
  Compass,
  Layers,
  Search,
  Check,
  DollarSign,
  MapPin,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  const ministryList = [
    "NITI Aayog",
    "MeitY Digital India",
    "National Informatics Centre (NIC)",
    "CERT-In Cybersecurity",
    "ISRO Frontier Technology",
    "Reserve Bank Innovation Hub",
    "Ministry of Statistics & PI",
    "DRDO Research Laboratories",
    "Ministry of Electronics & IT",
    "Digital India Corporation",
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden transition-colors">
      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Background Gradients & Dynamic Glowing Orbs with Smooth Floating Physics */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40" />
        <div className="absolute top-1/4 right-1/4 w-[550px] h-[550px] bg-primary/10 dark:bg-blue-500/20 blur-[130px] pointer-events-none rounded-full animate-float-slow" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[350px] bg-sky-400/15 dark:bg-sky-500/20 blur-[110px] pointer-events-none rounded-full animate-float-reverse" />
        
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Top Pill Tag with Animated Pulse */}
            <div className="animate-fade-in">
              <Badge variant="ai" className="gap-2 px-4 py-1.5 text-xs shadow-md shadow-primary/20 dark:shadow-blue-500/20 hover:scale-105 transition-transform">
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                Gemini Powered · India&apos;s National Public Sector Internship Portal
              </Badge>
            </div>

            {/* Main Title & Subtitle */}
            <div className="animate-fade-in-up animation-delay-100 space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Find Your Perfect{" "}
                <span className="hero-gradient-animated drop-shadow-xs">Government Internship</span>
                {" "}with AI
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
                GovMatch AI transparently matches students with prestigious ministry projects—
                analyzing your verified competencies, removing systemic bias, and bridging learning gaps in real time.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="animate-fade-in-up animation-delay-200 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="ai"
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 text-sm sm:text-base font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 px-7 py-3.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" /> Get Matched with AI
                </Button>
              </Link>
              <Link href="/internships" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 text-sm sm:text-base font-bold bg-white/90 dark:bg-slate-900 border-2 border-primary/30 dark:border-blue-500/40 text-primary dark:text-blue-300 hover:bg-primary hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:border-primary dark:hover:border-blue-600 shadow-md transition-all duration-300 hover:-translate-y-0.5 px-7 py-3.5 cursor-pointer"
                >
                  <Compass className="h-4 w-4" /> Browse Internships <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="animate-fade-in-up animation-delay-300 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Free for students</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> No resume needed to begin</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Algorithmic bias audited</span>
            </div>

            {/* Interactive Simulated Live Match Card Preview with Light Sweep */}
            <div className="animate-fade-in-up animation-delay-300 w-full max-w-3xl pt-2">
              <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-primary/20 dark:border-blue-500/30 shadow-2xl backdrop-blur-xl p-5 sm:p-6 text-left space-y-4 group">
                {/* Glowing Aura Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                
                {/* Shimmer Light Sweep */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-blue-400/10 to-transparent pointer-events-none animate-sweep" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-ai-gradient text-white flex items-center justify-center font-bold text-base shadow-md">
                      AS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Shantanu Sarkar</span>
                        <Badge variant="secondary" className="text-[10px] py-0 px-2">Live Candidate</Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">B.Tech Computer Science & AI · Class of 2026</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl shadow-xs">
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">98% Precision Match</span>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary dark:text-blue-400" />
                      <span className="text-xs font-bold text-primary dark:text-blue-400">NITI Aayog · Frontier Tech Division</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">₹35,000 / month</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    AI Research Fellow — National LLM Policy & Evaluation
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Python", "NLP", "PyTorch", "Large Language Models", "Public Policy"].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:scale-105 transition-transform"
                      >
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="animate-fade-in-up animation-delay-400 w-full max-w-4xl pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-md">
                {[
                  { value: "500+", label: "Ministry Opportunities", icon: Building2, color: "text-blue-600 dark:text-blue-400" },
                  { value: "96%", label: "AI Match Precision", icon: Target, color: "text-emerald-600 dark:text-emerald-400" },
                  { value: "100%", label: "Fairness Audited", icon: ShieldCheck, color: "text-indigo-600 dark:text-indigo-400" },
                  { value: "₹25K", label: "Monthly Avg. Stipend", icon: Award, color: "text-amber-600 dark:text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold text-center leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Moving Marquee Partner Ministries ─────────────────────────────── */}
      <section className="py-8 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors shadow-2xs">
        <div className="text-center space-y-4 mb-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Official Participating Government Organizations & Research Wings
          </p>
        </div>

        {/* Continuous Animated Moving Marquee */}
        <div className="relative w-full overflow-hidden mask-gradient">
          <div className="animate-marquee flex items-center gap-8 md:gap-12">
            {[...ministryList, ...ministryList].map((org, idx) => (
              <span
                key={`${org}-${idx}`}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors shrink-0 group cursor-default"
              >
                <Building2 className="h-4 w-4 text-primary/70 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0" /> {org}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-bold">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">From Profile to Placement in 3 Steps</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">No lengthy paperwork. No black-box algorithms. Just transparent, explainable AI recommendation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20 dark:from-blue-600/20 dark:via-blue-500/60 dark:to-blue-600/20" />

            {[
              {
                step: "01",
                icon: GraduationCap,
                title: "1. Create Student Profile",
                desc: "Enter your degree, university, and technical competencies. Or upload a PDF resume for 1-click automatic extraction.",
                color: "bg-primary-fixed dark:bg-blue-900/60 text-primary dark:text-blue-300",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "2. Live AI Matching",
                desc: "Gemini Flash AI analyzes your profile against active ministry postings and assigns transparent match percentages.",
                color: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
              },
              {
                step: "03",
                icon: Target,
                title: "3. Apply & Fill Gaps",
                desc: "Review detailed match reasoning, bridge missing skills with free certified NPTEL courses, and submit with a single click.",
                color: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center gap-4 animate-fade-in-up group p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="relative">
                  <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary dark:bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Pillars ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-bold">Platform Capabilities</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Designed for Fairness, Speed & Relevance</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Every recommendation is backed by explainable AI scoring and audited against demographic bias.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                color: "bg-primary-fixed dark:bg-blue-950/60 text-primary dark:text-blue-300",
                title: "Explainable AI Scoring",
                desc: "Clear transparency into why each internship was recommended — breaking down skill match, domain relevance, and academic alignment.",
                link: "/internships",
                linkText: "Explore Recommendations",
              },
              {
                icon: TrendingUp,
                color: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
                title: "Skill Gap Matrix & Bridge",
                desc: "Identifies missing competencies for your target role and prescribes free certified courses from NPTEL & iGOT Karmayogi.",
                link: "/skill-gap",
                linkText: "View Skill Matrix",
              },
              {
                icon: ShieldCheck,
                color: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
                title: "Algorithmic Bias Guard",
                desc: "Built-in audit dashboard monitoring disparate impact ratios, guaranteeing equal opportunity regardless of college tier or region.",
                link: "/admin",
                linkText: "Open AI Audit Panel",
              },
              {
                icon: FileText,
                color: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
                title: "AI Resume Parser",
                desc: "Upload your PDF resume and let Gemini AI automatically extract skills, experience, and education to build your profile instantly.",
                link: "/resume",
                linkText: "Try Resume Analysis",
              },
              {
                icon: Globe,
                color: "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300",
                title: "500+ Live Openings",
                desc: "Real-time database of government internship openings across NITI Aayog, MeitY, ISRO, NIC, CERT-In, and more ministries.",
                link: "/internships",
                linkText: "Browse All Openings",
              },
              {
                icon: Award,
                color: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
                title: "Merit-First Selection",
                desc: "AI evaluates only skill and academic fit — never geography, college brand, or socio-economic background. True meritocracy.",
                link: "/signup",
                linkText: "Get Your Score",
              },
            ].map((feat) => (
              <Card
                key={feat.title}
                className="p-6 space-y-4 bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 card-hover-lift transition-all shadow-xs group"
              >
                <div className={`h-12 w-12 rounded-xl ${feat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{feat.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
                <Link
                  href={feat.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-blue-400 hover:underline pt-1"
                >
                  {feat.linkText} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        {/* Dark Royal Obsidian Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/25 dark:bg-blue-500/25 blur-[120px] pointer-events-none rounded-full animate-glow-pulse" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <Badge className="bg-white/15 text-white border-white/25 gap-1.5 px-3 py-1 text-xs backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Start Your Public Sector Journey in 60 Seconds
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Work on India&apos;s Next Big Public Initiative?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Upload your resume or enter your skills to get instant, transparent government internship recommendations powered by Gemini Flash AI.
            </p>
          </div>

          {/* High Contrast CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                variant="ai"
                size="lg"
                className="w-full sm:w-auto gap-2.5 font-bold shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 hover:-translate-y-0.5 text-base px-8 py-3.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Create Free Profile <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/internships" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2.5 font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:via-indigo-500 hover:to-sky-400 border border-white/30 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 hover:-translate-y-0.5 text-base px-8 py-3.5 cursor-pointer"
              >
                <Compass className="h-4 w-4" /> Browse All Internships <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            100% Free for Students · Government-Grade Data Privacy · DPDP Act Compliant
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
