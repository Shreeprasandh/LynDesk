"use client";

import React, { useState } from "react";
import { StudyMistake } from "../../study-desk/types";
import { X, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface ErrorBankModalProps {
  mistakes: StudyMistake[];
  onRemoveMistake: (id: string) => void;
  onClose: () => void;
}

export default function ErrorBankModal({ mistakes, onRemoveMistake, onClose }: ErrorBankModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMcq, setSelectedMcq] = useState<string | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (mistakes.length === 0) {
    return (
      <div className="fixed inset-0 bg-bg-base/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-txt-main">
        <div className="bg-bg-surface rounded-md max-w-md w-full p-6 text-center space-y-4 border border-border-main/80 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-accent-main/10 border border-accent-main/30 text-accent-main flex items-center justify-center text-xl mx-auto">
            ✓
          </div>
          <h3 className="font-display text-xl font-light">No Mistakes Queued</h3>
          <p className="text-xs text-txt-sub font-light">
            You’ve successfully cleared all your past mistakes. Outstanding accuracy!
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity"
          >
            Return to Study Desk
          </button>
        </div>
      </div>
    );
  }

  const current = mistakes[currentIndex] || mistakes[0];

  const handleCheck = () => {
    let right = false;
    if (current.questionType === "mcq") {
      const selNorm = (selectedMcq || "").trim().toLowerCase();
      const ansNorm = (current.correctAnswer || "").trim().toLowerCase();
      
      right = selNorm === ansNorm;
      if (!right && current.options && current.options.length > 0) {
        const selIdx = current.options.findIndex((opt) => opt.trim().toLowerCase() === selNorm);
        const ansIdx = current.options.findIndex((opt) => opt.trim().toLowerCase() === ansNorm);
        if (selIdx !== -1 && ansIdx !== -1 && selIdx === ansIdx) {
          right = true;
        }
      }
    } else {
      const lower = shortAnswerInput.toLowerCase();
      const lowerCorrect = current.correctAnswer.toLowerCase();
      right = lower.includes(lowerCorrect.slice(0, 10)) || lowerInputMatches(lower, lowerCorrect);
    }

    setIsCorrect(right);
    setIsAnswerChecked(true);

    if (right) {
      onRemoveMistake(current.id);
    }
  };

  const lowerInputMatches = (input: string, correct: string) => {
    const words = correct.split(" ").filter((w) => w.length > 3);
    const matches = words.filter((w) => input.includes(w));
    return matches.length >= Math.max(1, Math.floor(words.length / 2));
  };

  const handleNext = () => {
    setIsAnswerChecked(false);
    setSelectedMcq(null);
    setShortAnswerInput("");

    if (currentIndex + 1 >= mistakes.length) {
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-base/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-txt-main">
      <div className="bg-bg-surface rounded-md max-w-lg w-full p-6 border border-border-main/80 shadow-2xl relative space-y-5">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-accent-main/10 border border-accent-main/30 font-mono text-[9px] uppercase tracking-wider text-accent-main font-bold rounded flex items-center gap-1">
            <RotateCcw size={12} /> ERROR REVIEW ({currentIndex + 1}/{mistakes.length})
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-bg-card hover:bg-border-main/30 text-txt-muted flex items-center justify-center cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <h3 className="font-display text-lg font-light text-txt-main">{current.questionPrompt}</h3>

        {current.questionType === "mcq" && current.options ? (
          <div className="space-y-2">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !isAnswerChecked && setSelectedMcq(opt)}
                disabled={isAnswerChecked}
                className={`w-full p-3.5 rounded border text-left text-xs font-light transition-all cursor-pointer ${
                  selectedMcq === opt
                    ? "bg-accent-main/10 border-accent-main text-accent-main font-medium"
                    : "bg-bg-base border-border-main/70 text-txt-main hover:border-border-main"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={shortAnswerInput}
            onChange={(e) => setShortAnswerInput(e.target.value)}
            disabled={isAnswerChecked}
            placeholder="Type your corrected explanation..."
            rows={3}
            className="w-full p-3.5 rounded border border-border-main/80 bg-bg-base text-xs font-mono text-txt-main focus:outline-none focus:border-accent-main"
          />
        )}

        {isAnswerChecked && (
          <div
            className={`p-4 rounded font-mono text-xs ${
              isCorrect
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2 font-bold uppercase mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" /> Corrected! Removed from queue.
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-rose-400" /> Not quite yet.
                </>
              )}
            </div>
            <div className="text-[11px] font-light">Correct Answer: {current.correctAnswer}</div>
          </div>
        )}

        {isAnswerChecked ? (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-emerald-500 hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity"
          >
            Continue ({currentIndex + 1}/{mistakes.length}) →
          </button>
        ) : (
          <button
            onClick={handleCheck}
            disabled={
              (current.questionType === "mcq" && !selectedMcq) ||
              (current.questionType === "short_answer" && !shortAnswerInput.trim())
            }
            className="w-full py-3 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity"
          >
            Check Correction
          </button>
        )}
      </div>
    </div>
  );
}
