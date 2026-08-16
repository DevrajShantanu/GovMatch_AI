"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: { title?: string; message: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = "info", duration = 4000 }: { title?: string; message: string; type?: ToastType; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => addToast({ message, title, type: "success" }), [addToast]);
  const error = useCallback((message: string, title?: string) => addToast({ message, title, type: "error", duration: 5000 }), [addToast]);
  const info = useCallback((message: string, title?: string) => addToast({ message, title, type: "info" }), [addToast]);
  const warning = useCallback((message: string, title?: string) => addToast({ message, title, type: "warning" }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const typeIcons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
            info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
          };

          const typeBorders = {
            success: "border-emerald-200 dark:border-emerald-800 bg-white/95 dark:bg-slate-900/95 text-on-surface dark:text-slate-100 shadow-emerald-500/10",
            error: "border-rose-200 dark:border-rose-800 bg-white/95 dark:bg-slate-900/95 text-on-surface dark:text-slate-100 shadow-rose-500/10",
            warning: "border-amber-200 dark:border-amber-800 bg-white/95 dark:bg-slate-900/95 text-on-surface dark:text-slate-100 shadow-amber-500/10",
            info: "border-sky-200 dark:border-sky-800 bg-white/95 dark:bg-slate-900/95 text-on-surface dark:text-slate-100 shadow-sky-500/10",
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-right ${
                typeBorders[t.type || "info"]
              }`}
            >
              {typeIcons[t.type || "info"]}
              <div className="flex-1 text-xs space-y-0.5 min-w-0">
                {t.title && <p className="font-bold text-on-surface dark:text-white text-[13px]">{t.title}</p>}
                <p className="text-on-surface-variant dark:text-slate-300 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-on-surface-variant/50 dark:text-slate-400 hover:text-on-surface dark:hover:text-white p-1 transition-colors rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
