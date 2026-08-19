"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Bell, CheckCircle2, Briefcase, TrendingUp, Clock, X, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "AI_UPDATE" | "RECOMMENDATION" | "SKILL_GAP" | "APPLICATION";
  read: boolean;
  rawStatus?: string;
  rawTime?: string;
  hash: string;
}

const TYPE_ICON = {
  AI_UPDATE: Sparkles,
  RECOMMENDATION: Bell,
  SKILL_GAP: TrendingUp,
  APPLICATION: Briefcase,
};

const TYPE_COLOR = {
  AI_UPDATE: "bg-primary dark:bg-blue-600",
  RECOMMENDATION: "bg-sky-500 dark:bg-sky-600",
  SKILL_GAP: "bg-amber-500 dark:bg-amber-600",
  APPLICATION: "bg-emerald-500 dark:bg-emerald-600",
};

const WELCOME_NOTIFICATION: Notification = {
  id: "welcome_1",
  title: "Welcome to GovMatch AI Portal! 🚀",
  message: "We're thrilled to have you! Upload your resume, complete your profile, and let our AI find the perfect public sector internships for you.",
  time: "Just now",
  type: "AI_UPDATE",
  read: false,
  hash: "welcome_1_initial",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { info, toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const getHiddenNotifs = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("govmatch_hidden_notifs") || "[]");
    } catch {
      return [];
    }
  };

  const getReadNotifs = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(localStorage.getItem("govmatch_read_notifs") || "[]");
      if (Array.isArray(parsed)) return parsed;
      // Migration from old object format
      return Object.values(parsed);
    } catch {
      return [];
    }
  };

  const setReadNotif = (hash: string) => {
    if (typeof window === "undefined") return;
    const read = getReadNotifs();
    if (!read.includes(hash)) {
      read.push(hash);
      localStorage.setItem("govmatch_read_notifs", JSON.stringify(read));
    }
  };

  const loadApplicationNotifs = useCallback(async () => {
    if (!user) return;
    setLoadingApps(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("applications")
        .select("id, status, internship_id, applied_at, notes, internships (title)")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false })
        .limit(10);

      const hiddenIds = getHiddenNotifs();
      const allNotifs: Notification[] = [];

      // Add welcome greeting if it hasn't been deleted
      if (!hiddenIds.includes(WELCOME_NOTIFICATION.id)) {
        // Only set time dynamically if we want, but "Just now" is fine for the demo greeting
        allNotifs.push(WELCOME_NOTIFICATION);
      }

      const readNotifs = getReadNotifs();

      if (data && data.length > 0) {
        const appNotifs: Notification[] = data.map((app: any) => {
          const internshipTitle = (Array.isArray(app.internships) ? app.internships[0]?.title : app.internships?.title) || "Internship";
          let messageText = `Your application for "${internshipTitle}" (ID: ${app.internship_id.slice(0, 8)}…) is currently marked as ${app.status}.`;
          
          if (app.notes && (app.status === "Accepted" || app.status === "Rejected")) {
            messageText += `\n\nAdmin Remarks: "${app.notes}"`;
          }

          return {
            id: `app_${app.id}`,
            title: `Application ${app.status === "Pending" ? "Submitted" : app.status}`,
            message: messageText,
            time: new Date(app.applied_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "APPLICATION" as const,
            rawStatus: app.status,
            rawTime: app.applied_at,
            hash: `app_${app.id}_${app.status}_${app.applied_at}`,
            read: readNotifs.includes(`app_${app.id}_${app.status}_${app.applied_at}`),
          };
        });
        
        allNotifs.push(...appNotifs.filter(n => !hiddenIds.includes(n.hash)));
      }
      
      setNotifications(allNotifs);
    } catch {
      // Fallback
    } finally {
      setLoadingApps(false);
    }
  }, [user]);

  useEffect(() => {
    loadApplicationNotifs();
  }, [loadApplicationNotifs]);

  // Realtime subscription on applications table
  useEffect(() => {
    if (!user?.id) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`realtime-notifs-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadApplicationNotifs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadApplicationNotifs]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const notif = prev.find(n => n.id === id);
      if (notif) {
        setReadNotif(notif.hash);
      }
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      prev.forEach(n => {
        setReadNotif(n.hash);
      });
      return prev.map((n) => ({ ...n, read: true }));
    });
    info("All notifications marked as read.");
  };

  const deleteNotification = (n: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    const hidden = getHiddenNotifs();
    hidden.push(n.hash);
    localStorage.setItem("govmatch_hidden_notifs", JSON.stringify(hidden));

    setNotifications((prev) => prev.filter((notif) => notif.id !== n.id));
    
    // Dispatch custom event to update navbar
    window.dispatchEvent(new Event("govmatch_notifications_updated"));
    toast({
      title: "Notification deleted",
      message: "This notification has been permanently removed.",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-on-surface dark:text-white">Notifications Center</h1>
            {unreadCount > 0 && (
              <Badge variant="ai" className="gap-1 animate-scale-in text-xs px-2.5 py-0.5">
                <Bell className="h-3 w-3" /> {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-on-surface-variant dark:text-slate-400">
            Live updates on your application status, new government postings, and AI competency suggestions.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="gap-1.5 text-xs shrink-0 hover:bg-primary/5 hover:border-primary/40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Mark all as read
          </Button>
        )}
      </div>

      {loadingApps && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-slate-400 animate-fade-in">
          <Clock className="h-3.5 w-3.5 animate-spin text-primary dark:text-blue-400" /> Syncing live notifications from database...
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = TYPE_ICON[n.type] || Bell;
          const colorClass = TYPE_COLOR[n.type] || "bg-primary dark:bg-blue-600";
          return (
            <Card
              key={n.id}
              className={`p-4 border-outline-variant/50 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer animate-fade-in-up shadow-xs ${
                n.read
                  ? "bg-surface-container-low/60 dark:bg-slate-900/50 opacity-75"
                  : "bg-white dark:bg-slate-900"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => markAsRead(n.id)}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm ${
                    n.read ? "bg-on-surface-variant/40 dark:bg-slate-700" : colorClass
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4
                        className={`text-sm font-bold truncate ${
                          n.read ? "text-on-surface-variant dark:text-slate-400 font-semibold" : "text-on-surface dark:text-white"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary dark:bg-blue-400 shrink-0 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">{n.time}</span>
                      <button
                        onClick={(e) => deleteNotification(n, e)}
                        className="text-on-surface-variant hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="text-[11px] text-primary dark:text-blue-400 font-bold hover:underline mt-1 inline-block"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {notifications.length > 0 && notifications.every((n) => n.read) && (
        <div className="text-center py-12 text-on-surface-variant dark:text-slate-400 text-sm animate-scale-in bg-white dark:bg-slate-900 rounded-xl border border-outline-variant/40 dark:border-slate-800 shadow-xs">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
          <p className="font-bold text-on-surface dark:text-white">All caught up!</p>
          <p className="text-xs mt-1 text-on-surface-variant dark:text-slate-400">No unread notifications at this time.</p>
        </div>
      )}
    </div>
  );
}
