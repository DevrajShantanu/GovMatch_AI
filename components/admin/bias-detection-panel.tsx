"use client";

import { BiasMetric } from "@/lib/types";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChartContainer } from "../shared/chart-container";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { runFairnessAuditAction, DemographicData } from "@/app/actions/audit";

interface BiasDetectionPanelProps {
  initialMetrics: BiasMetric[];
  initialDemographics: DemographicData[];
}

const COLORS = ["#3b82f6", "#0ea5e9", "#6366f1", "#10b981"];

export function BiasDetectionPanel({ initialMetrics, initialDemographics }: BiasDetectionPanelProps) {
  const [metrics, setMetrics] = useState<BiasMetric[]>(initialMetrics);
  const [demographics, setDemographics] = useState<DemographicData[]>(initialDemographics);
  const [auditing, setAuditing] = useState(false);

  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const result = await runFairnessAuditAction();
      if (result.success) {
        setMetrics(result.metrics);
        setDemographics(result.demographics);
      }
    } catch (error) {
      console.error("Audit failed", error);
    } finally {
      setAuditing(false);
    }
  };

  const totalApplicants = demographics.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border-0 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="ai" className="bg-emerald-500 text-white border-0">
                <ShieldCheck className="h-3.5 w-3.5" /> Algorithmic Fairness Verified
              </Badge>
              <span className="text-xs text-slate-300">NITI Aayog & MeitY AI Ethics Framework</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Algorithmic Bias & Equity Monitor</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of recommendation distribution parity across regions, genders, and institutional tiers to prevent systemic bias.
            </p>
          </div>

          <Button
            variant="ai"
            onClick={handleRunAudit}
            disabled={auditing}
            className="gap-2 shrink-0 font-bold shadow-md"
          >
            <RefreshCw className={`h-4 w-4 ${auditing ? "animate-spin" : ""}`} />
            {auditing ? "Running Live Audit Simulation..." : "Re-Run Fairness Audit"}
          </Button>
        </div>
      </Card>

      {/* Fairness Metric Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.id} className="p-4 space-y-3 bg-white dark:bg-slate-900 border-outline-variant/50 dark:border-slate-800 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider line-clamp-1">
                {m.demographicGroup}
              </span>
              <Badge variant={m.status === "Optimal" ? "success" : "warning"} className="text-[10px]">
                {m.status}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-on-surface dark:text-white line-clamp-1">{m.metricName}</h4>
                <span className="text-lg font-black text-primary dark:text-blue-400">{(m.impactRatio * 100).toFixed(0)}%</span>
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-slate-400 leading-relaxed line-clamp-2">
                {m.auditNotes}
              </p>
            </div>

            <div className="pt-2 border-t border-outline-variant/30 dark:border-slate-800 flex justify-between items-center text-[11px] text-on-surface-variant dark:text-slate-400">
              <span>Threshold: <strong className="text-on-surface dark:text-white">{(m.threshold * 100)}%</strong></span>
              <span className={`font-semibold flex items-center gap-1 ${m.status === "Optimal" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {m.status === "Optimal" ? "Compliant" : "Review"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendation Rate by Institutional Category */}
        <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-outline-variant/50 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-on-surface dark:text-white">Institutional Parity Rate (%)</h3>
            <Badge variant="outline" className="text-[10px] text-slate-500 font-medium">Target: Equal distribution</Badge>
          </div>

          <ChartContainer height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} 
                  itemStyle={{ color: "#f8fafc", fontSize: "12px", fontWeight: "600" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}
                />
                <Bar dataKey="recommendationRate" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  <LabelList 
                    dataKey="recommendationRate" 
                    position="top" 
                    fill="#94a3b8" 
                    fontSize={11} 
                    fontWeight="bold"
                    formatter={(val: any) => `${val}%`} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Applicant Volume Share */}
        <Card className="p-6 space-y-4 bg-white dark:bg-slate-900 border-outline-variant/50 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-on-surface dark:text-white">Applicant Pool Demographic Share</h3>
            <Badge variant="outline" className="text-[10px] text-slate-500 font-medium">Total: {totalApplicants.toLocaleString()}</Badge>
          </div>

          <ChartContainer height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={demographics}
                  dataKey="count"
                  nameKey="group"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                  label={(props: any) => {
                    const { name, percent = 0, cx = 0, cy = 0, midAngle = 0, outerRadius = 0 } = props;
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="#94a3b8" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central" 
                        fontSize={10}
                        fontWeight="500"
                      >
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                >
                  {demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} 
                  itemStyle={{ color: "#f8fafc", fontSize: "12px", fontWeight: "600" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>
    </div>
  );
}
