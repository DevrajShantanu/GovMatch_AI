import { BiasDetectionPanel } from "@/components/admin/bias-detection-panel";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Users, Briefcase, Activity } from "lucide-react";
import { runFairnessAuditAction } from "@/app/actions/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Strict Hardcoded Security Constraint
  if (!user || user.email !== "shantanu.sarkar3391@gmail.com") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center animate-fade-in p-6">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Access Denied</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            You do not have the required administrative privileges to view this dashboard. This area is strictly restricted to authorized GovMatch administrators.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch Real Platform Statistics from Database bypassing RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ count: userCount }, { count: appCount }] = await Promise.all([
    adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
    adminSupabase.from("applications").select("*", { count: "exact", head: true })
  ]);

  // Fetch dynamic simulated audit data from the server
  const auditResult = await runFairnessAuditAction();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="ai" className="gap-1 bg-emerald-600 text-xs shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Super Admin Authorized
          </Badge>
          <span className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Demographic Equity & Audit</span>
        </div>
        <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight mt-2">Admin Dashboard & Analytics</h1>
        <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-1">
          Real-time platform statistics and algorithmic fairness monitoring for government equity compliance.
        </p>
      </div>

      {/* Real-Time Database Analytics */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
          Live Platform Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border-outline-variant/40 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex justify-between items-start">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </span>
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 text-[10px]">Active</Badge>
            </div>
            <div>
              <p className="text-3xl font-black text-on-surface dark:text-white mt-2">{userCount || 0}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered Candidates</p>
            </div>
          </Card>

          <Card className="p-5 space-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border-outline-variant/40 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex justify-between items-start">
              <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Briefcase className="h-5 w-5" />
              </span>
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 text-[10px]">Processing</Badge>
            </div>
            <div>
              <p className="text-3xl font-black text-on-surface dark:text-white mt-2">{appCount || 0}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Internship Applications</p>
            </div>
          </Card>

          <Card className="p-5 space-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border-outline-variant/40 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex justify-between items-start">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-5 w-5" />
              </span>
              <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 text-[10px]">Healthy</Badge>
            </div>
            <div>
              <p className="text-3xl font-black text-on-surface dark:text-white mt-2">100%</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">System Uptime & Stability</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8" />

      {/* Bias Detection Component */}
      <BiasDetectionPanel 
        initialMetrics={auditResult.metrics} 
        initialDemographics={auditResult.demographics} 
      />

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8" />

      {/* Applications Management Table */}
      <ApplicationsTable />
    </div>
  );
}
