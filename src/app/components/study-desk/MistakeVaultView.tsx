"use client";

import React, { useState } from "react";
import { StudyMistake } from "../../study-desk/types";
import { 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RotateCcw, 
  Sparkles,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface MistakeVaultViewProps {
  mistakes: StudyMistake[];
  onClearMistake: (mistakeId: string) => void;
  onClearAllMistakes: () => void;
}

export default function MistakeVaultView({ mistakes, onClearMistake, onClearAllMistakes }: MistakeVaultViewProps) {
  const [filter, setFilter] = useState<"all" | "mcq" | "short_answer">("all");
  const [activeQuizMistake, setActiveQuizMistake] = useState<StudyMistake | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string>("");
  const [quizResult, setQuizResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === "mcq") return m.questionType === "mcq";
    if (filter === "short_answer") return m.questionType === "short_answer";
    return true;
  });

  const handleTestSubmit = () => {
    if (!activeQuizMistake) return;

    const isRight = quizAnswer.trim().toLowerCase() === activeQuizMistake.correctAnswer.trim().toLowerCase();

    if (isRight) {
      setQuizResult({
        isCorrect: true,
        feedback: "Mastered! Correct answer verified. Removed from Mistake Vault."
      });
      setTimeout(() => {
        onClearMistake(activeQuizMistake.id);
        setActiveQuizMistake(null);
        setQuizResult(null);
        setQuizAnswer("");
      }, 1500);
    } else {
      setQuizResult({
        isCorrect: false,
        feedback: `Incorrect. Correct answer: ${activeQuizMistake.correctAnswer}. ${activeQuizMistake.explanation || ""}`
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-left font-sans">
      {/* Header Banner */}
      <div className="border border-border-main/80 bg-bg-surface p-6 md:p-8 rounded-md space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider rounded inline-flex items-center gap-1.5">
              <AlertCircle size={12} /> Adaptive Mistake Vault
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-light text-txt-main">Mistake Vault & Retention Deck</h1>
            <p className="text-xs md:text-sm text-txt-sub font-light leading-relaxed">
              Review and re-test questions you missed during lessons to build long-term memory retention and 100% topic mastery.
            </p>
          </div>

          {mistakes.length > 0 && (
            <button
              onClick={onClearAllMistakes}
              className="px-3.5 py-1.5 bg-bg-card hover:bg-rose-500/10 border border-border-main/60 hover:border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase rounded cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Trash2 size={12} /> Clear Vault ({mistakes.length})
            </button>
          )}
        </div>

        {/* Filter Controls & Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                filter === "all" ? "bg-accent-main text-bg-base font-semibold" : "bg-bg-card text-txt-sub hover:text-txt-main"
              }`}
            >
              All ({mistakes.length})
            </button>
            <button
              onClick={() => setFilter("mcq")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                filter === "mcq" ? "bg-accent-main text-bg-base font-semibold" : "bg-bg-card text-txt-sub hover:text-txt-main"
              }`}
            >
              Multiple Choice ({mistakes.filter((m) => m.questionType === "mcq").length})
            </button>
            <button
              onClick={() => setFilter("short_answer")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                filter === "short_answer" ? "bg-accent-main text-bg-base font-semibold" : "bg-bg-card text-txt-sub hover:text-txt-main"
              }`}
            >
              Short Answer ({mistakes.filter((m) => m.questionType === "short_answer").length})
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredMistakes.length === 0 && (
        <div className="border border-border-main/70 bg-bg-surface p-12 rounded-md flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-4 my-8">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="font-display text-xl font-light text-txt-main">Vault Clean! No Open Mistakes</h3>
          <p className="text-xs text-txt-sub font-light max-w-sm">
            Great job! You have no recorded mistakes in your review vault. Complete more lessons to track your weak spots.
          </p>
        </div>
      )}

      {/* Mistakes Cards Grid */}
      {filteredMistakes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMistakes.map((m) => (
            <div key={m.id} className="border border-border-main/80 bg-bg-surface p-5 rounded-md space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-bg-card border border-border-main/60 font-mono text-[9px] uppercase tracking-wider text-txt-muted rounded">
                    {m.questionType === "mcq" ? "Multiple Choice" : "Short Answer"}
                  </span>
                  <button
                    onClick={() => onClearMistake(m.id)}
                    className="text-txt-muted hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="Remove from vault"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h4 className="font-display text-base font-normal text-txt-main">{m.questionPrompt}</h4>

                <div className="space-y-1.5 font-mono text-xs pt-1">
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-300">
                    <span className="text-[9px] uppercase font-bold text-rose-400 block">Your Response:</span>
                    {m.userAnswer || "(Empty)"}
                  </div>
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">Correct Model Answer:</span>
                    {m.correctAnswer}
                  </div>
                </div>

                {m.explanation && (
                  <p className="text-xs text-txt-sub font-light leading-relaxed pt-1">
                    <strong className="text-txt-main">Explanation:</strong> {m.explanation}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveQuizMistake(m);
                  setQuizAnswer("");
                  setQuizResult(null);
                }}
                className="w-full py-2 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center gap-1.5 mt-2"
              >
                <RotateCcw size={13} /> Re-Test This Question
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Re-Test Interactive Modal Popover */}
      {activeQuizMistake && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-md max-w-lg w-full p-6 border border-border-main/80 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                Mistake Retention Re-Test
              </span>
              <button
                onClick={() => setActiveQuizMistake(null)}
                className="text-txt-muted hover:text-txt-main cursor-pointer"
              >
                &times;
              </button>
            </div>

            <h3 className="font-display text-lg font-light text-txt-main">{activeQuizMistake.questionPrompt}</h3>

            {activeQuizMistake.questionType === "mcq" && activeQuizMistake.options && (
              <div className="space-y-2 pt-1">
                {activeQuizMistake.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswer(opt)}
                    className={`w-full p-3 rounded border text-left text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                      quizAnswer === opt
                        ? "bg-accent-main/10 border-accent-main text-accent-main font-semibold"
                        : "bg-bg-base border-border-main/70 text-txt-main hover:border-border-main"
                    }`}
                  >
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {activeQuizMistake.questionType === "short_answer" && (
              <textarea
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                placeholder="Type your model answer..."
                rows={3}
                className="w-full p-3 border border-border-main/80 bg-bg-base text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
              />
            )}

            {quizResult && (
              <div className={`p-3 rounded text-xs font-mono border ${
                quizResult.isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}>
                {quizResult.feedback}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveQuizMistake(null)}
                className="h-8 px-3 border border-border-main/80 text-txt-sub font-mono text-[10px] uppercase rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTestSubmit}
                disabled={!quizAnswer.trim()}
                className="h-8 px-4 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-[10px] uppercase font-semibold rounded cursor-pointer"
              >
                Submit & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
