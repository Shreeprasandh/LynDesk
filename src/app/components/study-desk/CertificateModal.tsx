"use client";

import React from "react";
import { StudyPath } from "../../study-desk/types";
import { Award, Printer, CheckCircle, Sparkles, Zap } from "lucide-react";

interface CertificateModalProps {
  path: StudyPath;
  userName?: string;
  onClose: () => void;
}

export default function CertificateModal({ path, userName = "Sir", onClose }: CertificateModalProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-bg-surface border-2 border-accent-main/60 max-w-2xl w-full p-8 md:p-10 rounded-lg shadow-2xl space-y-6 relative text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-txt-muted hover:text-txt-main text-xl cursor-pointer"
        >
          &times;
        </button>

        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-double border-accent-main/40 p-6 md:p-8 rounded bg-bg-base/80 space-y-5">
          <div className="flex items-center justify-center gap-2 text-accent-main">
            <Award size={36} />
            <Sparkles size={20} />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent-main font-bold block">
              OFFICIAL CERTIFICATE OF MASTERY
            </span>
            <h1 className="font-display text-3xl font-light text-txt-main tracking-tight">
              LynDesk Learning Mastery
            </h1>
          </div>

          <p className="text-xs text-txt-sub font-light uppercase tracking-wider">
            This certificate is proudly awarded to
          </p>

          <div className="py-2 border-b-2 border-accent-main/50 max-w-md mx-auto">
            <h2 className="font-display text-2xl font-normal text-accent-main tracking-wide">
              {userName}
            </h2>
          </div>

          <p className="text-xs text-txt-sub font-light leading-relaxed max-w-md mx-auto">
            For successfully completing all adaptive curriculum modules, interactive assessments, and the final milestone exam for:
          </p>

          <div className="p-3 bg-bg-card border border-border-main/70 rounded max-w-lg mx-auto">
            <h3 className="font-display text-lg font-medium text-txt-main">{path.title}</h3>
            <span className="font-mono text-[10px] text-accent-main font-semibold uppercase flex items-center justify-center gap-1 mt-0.5">
              <Zap size={11} /> {path.totalLessons} Total Lessons Mastered • +{path.xpEarned || 0} XP Earned
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between text-left text-xs font-mono text-txt-muted border-t border-border-main/40">
            <div>
              <span className="text-[9px] uppercase block text-txt-muted">Issue Date</span>
              <span className="font-bold text-txt-main">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase block text-txt-muted">Verification Seal</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle size={12} /> Verified by LynDesk
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 border border-border-main/80 text-txt-sub font-mono text-xs uppercase rounded cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase font-semibold rounded cursor-pointer flex items-center gap-2"
          >
            <Printer size={14} /> Download / Print Certificate
          </button>
        </div>

      </div>
    </div>
  );
}
