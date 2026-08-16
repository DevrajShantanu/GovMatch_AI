import Link from "next/link";
import Image from "next/image";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/40 dark:border-slate-800 bg-surface-container-low/60 dark:bg-slate-950 py-12 text-on-surface-variant dark:text-slate-400 text-sm transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 dark:bg-blue-500/20 blur-md rounded-full group-hover:bg-primary/40 dark:group-hover:bg-blue-500/40 transition-colors duration-500" />
                <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[0.85rem] bg-white dark:bg-slate-900 shadow-xl shadow-primary/30 dark:shadow-blue-500/30 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:shadow-primary/40 transition-all duration-500 overflow-hidden border border-white dark:border-slate-800">
                  <Image 
                    src="/logo.png" 
                    alt="GovMatch AI Logo" 
                    fill
                    sizes="44px"
                    priority={true}
                    loading="eager"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300">
                  GovMatch <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-fixed dark:bg-blue-900/60 text-primary dark:text-blue-300 font-bold border border-primary/20 dark:border-blue-700/50">AI</span>
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest group-hover:text-primary/70 transition-colors">
                  National Portal
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-on-surface-variant dark:text-slate-400">
              Empowering India’s youth through AI-driven, fair, and transparent government internship matching.
            </p>
          </div>

          {/* Nav Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-on-surface dark:text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/internships" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Browse Internships</Link></li>
              <li><Link href="/resume" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Resume AI Analyzer</Link></li>
              <li><Link href="/skill-gap" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Skill Matrix</Link></li>
            </ul>
          </div>

          {/* Governance Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-on-surface dark:text-white text-xs uppercase tracking-wider">Governance</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/admin" className="hover:text-primary dark:hover:text-blue-400 transition-colors">AI Bias & Transparency</Link></li>
              <li><span className="text-on-surface-variant/70 dark:text-slate-500">Fairness Benchmark</span></li>
              <li><span className="text-on-surface-variant/70 dark:text-slate-500">Demographic Audit</span></li>
            </ul>
          </div>

          {/* Compliance Badge */}
          <div className="space-y-3">
            <div className="rounded-xl p-3.5 bg-white dark:bg-slate-900 border border-outline-variant/50 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Verified Public Sector AI
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                Compliant with NITI Aayog Ethical AI and DPDP Act data privacy standards.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/30 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-4">
          <div className="space-y-1">
            <p className="font-medium">© {new Date().getFullYear()} GovMatch AI Portal. Built for SIH Public Sector Initiative.</p>
            <p className="text-slate-500 dark:text-slate-500">
              Developed by <span className="font-semibold text-slate-700 dark:text-slate-300">Shantanu Sarkar</span> • <a href="mailto:shantanu.sarkar3391@gmail.com" className="hover:text-primary dark:hover:text-blue-400 transition-colors">shantanu.sarkar3391@gmail.com</a>
            </p>
          </div>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Ethical Framework</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
