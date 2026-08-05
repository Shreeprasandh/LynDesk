"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setToast({ id, message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-5 right-5 z-[9999] bg-bg-surface border border-border-main/80 text-txt-main shadow-2xl rounded-md px-3.5 py-2.5 flex items-center gap-2.5 font-mono text-xs animate-slide-in-right select-none"
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          ) : (
            <Info size={14} className="text-accent-main shrink-0" />
          )}
          <span className="leading-none text-txt-main font-medium">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
}
