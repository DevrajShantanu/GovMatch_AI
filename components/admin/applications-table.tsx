"use client";

import { useState, useEffect } from "react";
import { getAdminApplicationsAction, updateApplicationStatusAction, deleteApplicationAction } from "@/app/actions/applications";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, CheckCircle2, XCircle, Search, Mail, Trash2 } from "lucide-react";

export function ApplicationsTable() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, success, error: toastError } = useToast();
  
  // Dialog State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"Accepted" | "Rejected" | null>(null);
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    const res = await getAdminApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data);
    } else {
      setError(res.error || "Failed to load applications.");
    }
    setLoading(false);
  }

  const handleActionClick = (app: any, type: "Accepted" | "Rejected") => {
    setSelectedApp(app);
    setActionType(type);
    setJustification("");
  };

  const handleConfirmAction = async () => {
    if (!selectedApp || !actionType) return;
    if (!justification.trim()) {
      toastError("Please provide a justification for this decision.");
      return;
    }

    setIsSubmitting(true);
    const res = await updateApplicationStatusAction(selectedApp.id, actionType, justification);
    
    if (res.success) {
      success(`Application ${actionType.toLowerCase()} successfully. Notification sent!`, "Action Complete");
      setApplications(prev => prev.map(app => 
        app.id === selectedApp.id ? { ...app, status: actionType } : app
      ));
      setSelectedApp(null);
      setActionType(null);
    } else {
      toastError(res.error || "Failed to update status.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    
    try {
      const res = await deleteApplicationAction(appId);
      if (res.success) {
        success("Application deleted successfully", "Cleared");
        setApplications(prev => prev.filter(app => app.id !== appId));
      } else {
        toastError(res.error || "Failed to delete application");
      }
    } catch (e: any) {
      toastError(e.message);
    }
  };

  if (loading) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-on-surface-variant animate-pulse">
        <Search className="h-8 w-8 mb-4 text-slate-300" />
        <p>Loading candidate applications...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200">
        <p>{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface dark:text-white">Candidate Applications</h2>
          <p className="text-sm text-on-surface-variant dark:text-slate-400">Manage and review all submitted internship applications.</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Mail className="h-3.5 w-3.5" /> Email Notifications Active
        </Badge>
      </div>

      <Card className="overflow-x-auto border-outline-variant/40 dark:border-slate-800 shadow-sm rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container/50 dark:bg-slate-900/50 text-on-surface-variant dark:text-slate-400 font-semibold border-b border-outline-variant/40 dark:border-slate-800">
            <tr>
              <th className="p-4 rounded-tl-xl">Candidate</th>
              <th className="p-4">Internship / Department</th>
              <th className="p-4 text-center">AI Match</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 dark:divide-slate-800">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                  No applications found in the system.
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                // Handle Supabase join array vs single object
                const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                const internship = Array.isArray(app.internships) ? app.internships[0] : app.internships;
                const isPending = app.status === "Submitted" || app.status === "Pending" || app.status === "Under Review";

                return (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-on-surface dark:text-white">{profile?.full_name || "Unknown Candidate"}</p>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400">{profile?.email || "No email"}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-on-surface dark:text-slate-200">{internship?.title || "Unknown Role"}</p>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400">{internship?.organization}</p>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="ai" className="font-bold">{app.match_score ?? 0}%</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant={app.status === "Accepted" ? "default" : app.status === "Rejected" ? "destructive" : "outline"}
                        className={app.status === "Accepted" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {isPending ? (
                          <>
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50" onClick={() => handleActionClick(app, "Accepted")}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/50" onClick={() => handleActionClick(app, "Rejected")}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-on-surface-variant italic px-2">Decision Finalized</span>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30"
                          onClick={() => handleDeleteApp(app.id)}
                          title="Delete Application"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <div className="sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>
              Confirm {actionType === "Accepted" ? "Approval" : "Rejection"}
            </DialogTitle>
            <DialogDescription>
              Please provide a brief justification for this decision. This will be securely emailed to the candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full h-32 p-3 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="e.g., Your skills strongly align with our current public sector initiatives..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSelectedApp(null)} disabled={isSubmitting}>Cancel</Button>
            <Button 
              onClick={handleConfirmAction} 
              disabled={isSubmitting}
              className={actionType === "Accepted" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {isSubmitting ? "Processing..." : `Confirm ${actionType}`}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
