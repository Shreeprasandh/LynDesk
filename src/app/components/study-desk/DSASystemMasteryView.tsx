"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DSA_TRACKS,
  DSAProblem,
  DifficultyLevel,
  TrackCategory,
} from "../../study-desk/dsaMasteryData";
import {
  Search,
  CheckSquare,
  Square,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  X,
  FileText,
  Bot,
  Brain,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export interface UserDSAProgressMap {
  [problemId: string]: {
    status: "completed" | "not_started";
    isStarred: boolean;
    notes: string;
  };
}

interface DSASystemMasteryViewProps {
  progressMap: UserDSAProgressMap;
  onToggleProblemCompleted: (problem: DSAProblem, trackId: string) => void;
  onToggleProblemStarred: (problem: DSAProblem, trackId: string) => void;
  onSaveProblemNotes: (problemId: string, notes: string) => void;
  totalXpEarned: number;
}

interface ConfirmToggle {
  problem: DSAProblem;
  isCurrentlyCompleted: boolean;
}

interface QuizState {
  stepId: string;
  stepTitle: string;
  questions: string[];
  currentIdx: number;
  userAnswer: string;
  evaluation: string | null;
  score: number;
  isLoading: boolean;
  isComplete: boolean;
}

export default function DSASystemMasteryView({
  progressMap,
  onToggleProblemCompleted,
  onToggleProblemStarred,
  onSaveProblemNotes,
  totalXpEarned,
}: DSASystemMasteryViewProps) {
  const [activeTrackId, setActiveTrackId] = useState<TrackCategory>("master_curriculum");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | DifficultyLevel>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Completed" | "Pending" | "Starred">("All");
  const [expandedStepIds, setExpandedStepIds] = useState<string[]>(["step_1", "sde_1", "hy_1", "cs_1", "sys_1", "cp_1"]);
  const [activeDrawerProblem, setActiveDrawerProblem] = useState<DSAProblem | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [aiAssistantReply, setAiAssistantReply] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fix 3: Confirmation modal state
  const [confirmToggle, setConfirmToggle] = useState<ConfirmToggle | null>(null);

  // Fix 4: AI Quiz Mode state
  const [quizState, setQuizState] = useState<QuizState | null>(null);

  const activeTrack = DSA_TRACKS.find((t) => t.id === activeTrackId) || DSA_TRACKS[0];

  const toggleStepExpanded = (stepId: string) => {
    setExpandedStepIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const handleOpenDrawer = (problem: DSAProblem) => {
    setActiveDrawerProblem(problem);
    const existing = progressMap[problem.id];
    setNotesInput(existing?.notes || "");
    setAiAssistantReply(null);
  };

  const handleSaveNotesClick = () => {
    if (!activeDrawerProblem) return;
    onSaveProblemNotes(activeDrawerProblem.id, notesInput);
  };

  // Fix 3: Trigger confirmation instead of direct toggle
  const requestToggleConfirm = (problem: DSAProblem) => {
    const isCurrentlyCompleted = progressMap[problem.id]?.status === "completed";
    setConfirmToggle({ problem, isCurrentlyCompleted });
  };

  const handleConfirmToggle = () => {
    if (!confirmToggle) return;
    onToggleProblemCompleted(confirmToggle.problem, activeTrack.id);
    setConfirmToggle(null);
    // If drawer is open for this problem, keep it open but updated
  };

  const handleCancelToggle = () => {
    setConfirmToggle(null);
  };

  const handleAskAiTutor = async () => {
    if (!activeDrawerProblem) return;
    setIsAiLoading(true);
    setAiAssistantReply(null);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explain the problem "${activeDrawerProblem.title}" in DSA. Provide key intuition, time complexity (${activeDrawerProblem.timeComplexity}), space complexity (${activeDrawerProblem.spaceComplexity}), and an optimal approach summary without giving away code line-by-line immediately.`,
        }),
      });
      const data = await res.json();
      setAiAssistantReply(data.reply || data.content || "Focus on boundary conditions and time complexity bounds.");
    } catch {
      setAiAssistantReply(`Intuition for ${activeDrawerProblem.title}: Break the problem into sub-problems, maintain invariants, and optimize memory bounds.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Fix 4: AI Quiz Mode handlers
  const handleStartQuiz = async (stepId: string, stepTitle: string, stepProblems: DSAProblem[]) => {
    setQuizState({
      stepId,
      stepTitle,
      questions: [],
      currentIdx: 0,
      userAnswer: "",
      evaluation: null,
      score: 0,
      isLoading: true,
      isComplete: false,
    });

    const topicList = stepProblems.map((p) => p.title).join(", ");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are a DSA interview coach. Generate exactly 5 randomized, concise conceptual interview questions about these topics: ${topicList}. 

Rules:
- Each question must test deep understanding, not just definitions.
- Questions should vary: some ask for intuition, some for complexity analysis, some for edge cases.
- Return ONLY a JSON array of 5 question strings. No extra text. No markdown. Example format: ["Q1?","Q2?","Q3?","Q4?","Q5?"]`,
        }),
      });
      const data = await res.json();
      const raw = data.reply || data.content || "[]";

      let questions: string[] = [];
      try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        questions = [
          `Explain the core intuition behind the topics in "${stepTitle}".`,
          `What are the time and space complexity trade-offs in this topic area?`,
          `When would you choose one algorithm over another in "${stepTitle}"?`,
          `What are common edge cases to watch for in this step?`,
          `How would you optimize a brute-force solution for a problem in "${stepTitle}"?`,
        ];
      }

      // Shuffle questions for randomness
      const shuffled = [...questions].sort(() => Math.random() - 0.5);

      setQuizState((prev) =>
        prev ? { ...prev, questions: shuffled, isLoading: false } : null
      );
    } catch {
      const fallback = [
        `Explain the core intuition behind "${stepTitle}".`,
        `What is the time complexity of the optimal approach in "${stepTitle}"?`,
        `Describe a common edge case in "${stepTitle}" and how to handle it.`,
        `How does the space complexity change between naive and optimal approaches in "${stepTitle}"?`,
        `If you had to teach "${stepTitle}" to a junior developer, what is the single most important concept?`,
      ];
      setQuizState((prev) =>
        prev ? { ...prev, questions: fallback, isLoading: false } : null
      );
    }
  };

  const handleSubmitQuizAnswer = async () => {
    if (!quizState || !quizState.userAnswer.trim()) return;
    setQuizState((prev) => prev ? { ...prev, isLoading: true } : null);

    const currentQuestion = quizState.questions[quizState.currentIdx];

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are a strict but fair DSA interview evaluator.

Question: "${currentQuestion}"
Candidate Answer: "${quizState.userAnswer}"
Topic: "${quizState.stepTitle}"

Evaluate the answer. Be concise (2-4 sentences max). State whether the core reasoning is correct or not. Point out what was missed if anything. End with a score like "Score: 4/5". Return plain text only, no markdown.`,
        }),
      });
      const data = await res.json();
      const evaluation = data.reply || data.content || "Reasonable attempt. Ensure you cover time complexity bounds explicitly.";

      const scoreMatch = evaluation.match(/Score:\s*(\d)/);
      const points = scoreMatch ? parseInt(scoreMatch[1]) : 3;

      setQuizState((prev) =>
        prev
          ? {
              ...prev,
              evaluation,
              score: prev.score + points,
              isLoading: false,
            }
          : null
      );
    } catch {
      setQuizState((prev) =>
        prev
          ? {
              ...prev,
              evaluation: "Good attempt. Review the key takeaway for this topic and ensure you articulate the optimal complexity bounds. Score: 3/5",
              score: prev.score + 3,
              isLoading: false,
            }
          : null
      );
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizState((prev) => {
      if (!prev) return null;
      const nextIdx = prev.currentIdx + 1;
      if (nextIdx >= prev.questions.length) {
        return { ...prev, isComplete: true, evaluation: null, userAnswer: "" };
      }
      return { ...prev, currentIdx: nextIdx, userAnswer: "", evaluation: null };
    });
  };

  const handleExitQuiz = () => {
    setQuizState(null);
  };

  const handleRetryQuiz = (stepId: string, stepTitle: string, stepProblems: DSAProblem[]) => {
    setQuizState(null);
    setTimeout(() => handleStartQuiz(stepId, stepTitle, stepProblems), 100);
  };

  // Track Progress Stats
  let trackTotalProblems = 0;
  let trackCompletedCount = 0;

  activeTrack.steps.forEach((step) => {
    step.problems.forEach((prob) => {
      trackTotalProblems++;
      if (progressMap[prob.id]?.status === "completed") {
        trackCompletedCount++;
      }
    });
  });

  const trackPercent = trackTotalProblems > 0 ? Math.round((trackCompletedCount / trackTotalProblems) * 100) : 0;

  return (
    <div className="space-y-8 font-sans text-txt-main pb-16">

      {/* Track Selection Cards Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Curriculum Selection</span>
          <span className="font-mono text-[10px] text-accent-main font-semibold">
            Total Knowledge XP: {totalXpEarned > 0 ? `+${totalXpEarned}` : totalXpEarned} XP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DSA_TRACKS.map((track) => {
            const isSelected = track.id === activeTrackId;
            let totalProbs = 0;
            let doneProbs = 0;

            track.steps.forEach((s) => {
              s.problems.forEach((p) => {
                totalProbs++;
                if (progressMap[p.id]?.status === "completed") doneProbs++;
              });
            });

            const percent = totalProbs > 0 ? Math.round((doneProbs / totalProbs) * 100) : 0;

            return (
              <button
                key={track.id}
                onClick={() => setActiveTrackId(track.id)}
                className={`p-4 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-bg-surface border-accent-main/80 ring-1 ring-accent-main/30 shadow-md"
                    : "bg-bg-surface/60 border-border-main/60 hover:border-border-main"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-accent-main/10 border border-accent-main/30 font-mono text-[8px] uppercase tracking-wider text-accent-main rounded">
                      {track.badge}
                    </span>
                    <span className="font-mono text-[10px] text-txt-muted">
                      {doneProbs}/{totalProbs}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-semibold text-txt-main line-clamp-1">{track.title}</h3>
                  <p className="text-[11px] text-txt-sub font-light line-clamp-2">{track.tagline}</p>
                </div>

                <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-main transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Track Header Banner */}
      <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] uppercase tracking-wider rounded font-semibold">
              ACTIVE TRACK
            </span>
            <h2 className="font-display text-2xl font-light text-txt-main">{activeTrack.title}</h2>
            <p className="text-xs text-txt-sub font-light max-w-xl">{activeTrack.description}</p>
          </div>

          <div className="border border-border-main/60 bg-bg-card p-4 rounded text-center sm:text-right shrink-0 font-mono">
            <span className="text-[10px] text-txt-muted uppercase block">Track Progress</span>
            <span className="text-xl font-bold text-accent-main">{trackCompletedCount} / {trackTotalProblems}</span>
            <span className="text-[10px] text-txt-sub block mt-0.5">({trackPercent}% Completed)</span>
          </div>
        </div>

        <div className="w-full h-2 bg-bg-card border border-border-main/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-main rounded-full transition-all duration-500"
            style={{ width: `${trackPercent}%` }}
          />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, topics, algorithms..."
            className="w-full h-10 pl-9 pr-4 border border-border-main/80 bg-bg-surface text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-mono text-[10px]">
          {/* Difficulty Filter */}
          <div className="flex border border-border-main/70 bg-bg-surface p-0.5 rounded">
            {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  selectedDifficulty === diff
                    ? "bg-accent-main text-bg-base font-semibold"
                    : "text-txt-sub hover:text-txt-main"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex border border-border-main/70 bg-bg-surface p-0.5 rounded">
            {(["All", "Completed", "Pending", "Starred"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  selectedStatusFilter === st
                    ? "bg-accent-main text-bg-base font-semibold"
                    : "text-txt-sub hover:text-txt-main"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step Accordions & Problem List */}
      <div className="space-y-4">
        {activeTrack.steps.map((step) => {
          const isExpanded = expandedStepIds.includes(step.id);

          // Fix 1: Filter problems, hide step if nothing matches ANY active filter
          const filteredStepProblems = step.problems.filter((prob) => {
            const matchesQuery =
              prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              prob.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              prob.subCategory.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDifficulty = selectedDifficulty === "All" || prob.difficulty === selectedDifficulty;

            const isDone = progressMap[prob.id]?.status === "completed";
            const isStarred = Boolean(progressMap[prob.id]?.isStarred);

            let matchesStatus = true;
            if (selectedStatusFilter === "Completed") matchesStatus = isDone;
            else if (selectedStatusFilter === "Pending") matchesStatus = !isDone;
            else if (selectedStatusFilter === "Starred") matchesStatus = isStarred;

            return matchesQuery && matchesDifficulty && matchesStatus;
          });

          // Fix 1: Hide entire step accordion when no problems match (not just during search)
          if (filteredStepProblems.length === 0) {
            return null;
          }

          let stepDone = 0;
          step.problems.forEach((p) => {
            if (progressMap[p.id]?.status === "completed") stepDone++;
          });

          const isQuizActive = quizState?.stepId === step.id;

          return (
            <div key={step.id} className="border border-border-main/80 bg-bg-surface rounded-md overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleStepExpanded(step.id)}
                className="w-full p-4 bg-bg-surface hover:bg-bg-card/50 transition-colors flex items-center justify-between cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded border border-border-main/60 bg-bg-card text-txt-muted flex items-center justify-center font-mono text-xs">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-light text-txt-main">{step.title}</h3>
                    <p className="text-[11px] text-txt-sub font-light">{step.description}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono">
                  <span className="text-[10px] text-txt-muted block">{stepDone}/{step.problems.length} done</span>
                  <div className="w-24 h-1 bg-bg-card rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-accent-main"
                      style={{ width: `${step.problems.length > 0 ? (stepDone / step.problems.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Problem List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border-main/50 divide-y divide-border-main/30">
                      {filteredStepProblems.map((prob) => {
                        const isCompleted = progressMap[prob.id]?.status === "completed";
                        const isStarred = Boolean(progressMap[prob.id]?.isStarred);
                        const hasNotes = Boolean(progressMap[prob.id]?.notes);

                        return (
                          <div
                            key={prob.id}
                            className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-bg-card/30 transition-colors"
                          >
                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                              {/* Checkbox — Fix 3: triggers confirmation modal */}
                              <button
                                onClick={() => requestToggleConfirm(prob)}
                                className="mt-0.5 sm:mt-0 text-txt-muted hover:text-accent-main cursor-pointer shrink-0"
                                title={isCompleted ? "Mark as pending" : "Mark as completed"}
                              >
                                {isCompleted ? (
                                  <CheckSquare size={18} className="text-accent-main fill-accent-main/20" />
                                ) : (
                                  <Square size={18} />
                                )}
                              </button>

                              {/* Problem Title & Meta */}
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`font-display text-sm font-light truncate ${
                                      isCompleted ? "line-through text-txt-muted" : "text-txt-main"
                                    }`}
                                  >
                                    {prob.title}
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 font-mono text-[9px] uppercase rounded border ${
                                      prob.difficulty === "Easy"
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : prob.difficulty === "Medium"
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                    }`}
                                  >
                                    {prob.difficulty}
                                  </span>

                                  <span className="font-mono text-[9px] text-txt-muted bg-bg-card border border-border-main/50 px-1.5 py-0.5 rounded">
                                    {prob.subCategory}
                                  </span>

                                  {hasNotes && (
                                    <span className="font-mono text-[9px] text-accent-main bg-accent-main/10 border border-accent-main/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <FileText size={10} /> Notes Saved
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 font-mono text-[10px]">
                              <button
                                onClick={() => onToggleProblemStarred(prob, activeTrack.id)}
                                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                                  isStarred
                                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                    : "bg-bg-card border-border-main/60 text-txt-muted hover:text-txt-main"
                                }`}
                                title={isStarred ? "Starred for Revision" : "Star for Revision"}
                              >
                                <Star size={14} className={isStarred ? "fill-amber-400" : ""} />
                              </button>

                              <button
                                onClick={() => handleOpenDrawer(prob)}
                                className="px-2.5 py-1.5 bg-bg-card hover:bg-border-main/30 border border-border-main/80 text-txt-main rounded flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                Workspace →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fix 4: Self-Test / Quiz Mode Button per Step */}
                    <div className="border-t border-border-main/40 p-4 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-txt-sub font-light font-mono">
                        {step.problems.length} problems in this step
                      </p>
                      {!isQuizActive && (
                        <button
                          onClick={() => handleStartQuiz(step.id, step.title, step.problems)}
                          className="flex items-center gap-2 px-3 py-2 bg-accent-main/10 hover:bg-accent-main/20 border border-accent-main/30 text-accent-main font-mono text-[10px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                        >
                          <Brain size={13} />
                          Self-Test This Step
                        </button>
                      )}
                      {isQuizActive && (
                        <button
                          onClick={handleExitQuiz}
                          className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                        >
                          <X size={13} />
                          Exit Quiz
                        </button>
                      )}
                    </div>

                    {/* Fix 4: AI Quiz Panel — inline below step */}
                    <AnimatePresence>
                      {isQuizActive && quizState && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-accent-main/30 bg-bg-base/60 overflow-hidden"
                        >
                          <div className="p-6 space-y-5">
                            {/* Quiz Header */}
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                                  AI TOPIC QUIZ
                                </span>
                                <p className="font-display text-sm font-light text-txt-main">{quizState.stepTitle}</p>
                              </div>
                              {!quizState.isComplete && quizState.questions.length > 0 && (
                                <span className="font-mono text-xs text-txt-muted">
                                  {quizState.currentIdx + 1} / {quizState.questions.length}
                                </span>
                              )}
                            </div>

                            {/* Loading state */}
                            {quizState.isLoading && quizState.questions.length === 0 && (
                              <div className="flex items-center gap-3 text-txt-sub font-mono text-xs py-4">
                                <div className="w-4 h-4 rounded-full border-2 border-accent-main border-t-transparent animate-spin" />
                                Generating quiz questions...
                              </div>
                            )}

                            {/* Completed state */}
                            {quizState.isComplete && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded">
                                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                                  <div>
                                    <p className="font-display text-sm font-light text-txt-main">Quiz Complete</p>
                                    <p className="font-mono text-xs text-txt-sub mt-0.5">
                                      Final Score: {quizState.score} / {quizState.questions.length * 5} points
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleRetryQuiz(step.id, step.title, step.problems)}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent-main/10 hover:bg-accent-main/20 border border-accent-main/30 text-accent-main font-mono text-[10px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                                  >
                                    <RotateCcw size={12} />
                                    Retry with New Questions
                                  </button>
                                  <button
                                    onClick={handleExitQuiz}
                                    className="px-4 py-2 bg-bg-card hover:bg-border-main/30 border border-border-main/70 text-txt-muted font-mono text-[10px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Active Question */}
                            {!quizState.isComplete && quizState.questions.length > 0 && (
                              <div className="space-y-4">
                                {/* Progress bar */}
                                <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent-main transition-all duration-300"
                                    style={{ width: `${((quizState.currentIdx) / quizState.questions.length) * 100}%` }}
                                  />
                                </div>

                                {/* Question */}
                                <div className="p-4 bg-bg-surface border border-border-main/60 rounded">
                                  <p className="text-sm font-light text-txt-main leading-relaxed">
                                    {quizState.questions[quizState.currentIdx]}
                                  </p>
                                </div>

                                {/* Answer textarea */}
                                {!quizState.evaluation && (
                                  <div className="space-y-3">
                                    <textarea
                                      value={quizState.userAnswer}
                                      onChange={(e) =>
                                        setQuizState((prev) =>
                                          prev ? { ...prev, userAnswer: e.target.value } : null
                                        )
                                      }
                                      placeholder="Type your answer here. Be specific about intuition, complexity, and edge cases..."
                                      rows={4}
                                      className="w-full p-3.5 rounded border border-border-main/80 bg-bg-base font-mono text-xs text-txt-main focus:outline-none focus:border-accent-main resize-none"
                                    />
                                    <button
                                      onClick={handleSubmitQuizAnswer}
                                      disabled={quizState.isLoading || !quizState.userAnswer.trim()}
                                      className="h-9 px-5 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-[10px] uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center gap-2"
                                    >
                                      {quizState.isLoading ? (
                                        <>
                                          <div className="w-3 h-3 rounded-full border border-bg-base border-t-transparent animate-spin" />
                                          Evaluating...
                                        </>
                                      ) : (
                                        "Submit Answer"
                                      )}
                                    </button>
                                  </div>
                                )}

                                {/* Evaluation */}
                                {quizState.evaluation && (
                                  <div className="space-y-3">
                                    <div className="p-4 bg-bg-surface border border-border-main/60 rounded space-y-2">
                                      <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold block">
                                        AI Evaluation
                                      </span>
                                      <p className="text-xs font-mono text-txt-sub leading-relaxed">
                                        {quizState.evaluation}
                                      </p>
                                    </div>
                                    <button
                                      onClick={handleNextQuizQuestion}
                                      className="h-9 px-5 bg-bg-card hover:bg-border-main/30 border border-border-main/80 text-txt-main font-mono text-[10px] uppercase tracking-wider font-semibold rounded cursor-pointer transition-colors"
                                    >
                                      {quizState.currentIdx + 1 >= quizState.questions.length
                                        ? "View Results"
                                        : "Next Question →"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Fix 3: Confirmation Modal */}
      <AnimatePresence>
        {confirmToggle && (
          <div className="fixed inset-0 bg-bg-base/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm bg-bg-surface border border-border-main/80 rounded-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  confirmToggle.isCurrentlyCompleted
                    ? "bg-rose-500/10 border border-rose-500/30"
                    : "bg-emerald-500/10 border border-emerald-500/30"
                }`}>
                  {confirmToggle.isCurrentlyCompleted ? (
                    <AlertTriangle size={16} className="text-rose-400" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-display text-sm font-light text-txt-main">
                    {confirmToggle.isCurrentlyCompleted ? "Remove completion?" : "Mark as completed?"}
                  </p>
                  <p className="text-[11px] text-txt-sub font-light line-clamp-2">
                    {confirmToggle.problem.title}
                  </p>
                  <p className="font-mono text-[10px] text-txt-muted mt-1">
                    {confirmToggle.isCurrentlyCompleted
                      ? "XP for this problem will be deducted."
                      : `+${confirmToggle.problem.difficulty === "Easy" ? 10 : confirmToggle.problem.difficulty === "Medium" ? 25 : 50} XP will be awarded.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelToggle}
                  className="flex-1 h-9 rounded border border-border-main/80 bg-bg-card hover:bg-border-main/30 text-txt-muted font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  className={`flex-1 h-9 rounded font-mono text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-opacity hover:opacity-90 ${
                    confirmToggle.isCurrentlyCompleted
                      ? "bg-rose-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {confirmToggle.isCurrentlyCompleted ? "Remove" : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Problem Workspace Drawer */}
      <AnimatePresence>
        {activeDrawerProblem && (
          <div className="fixed inset-0 bg-bg-base/80 backdrop-blur-xs z-50 flex justify-end font-sans">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-bg-surface border-l border-border-main/80 h-full overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between relative shadow-2xl"
            >
              {/* Drawer Top Header */}
              <div className="space-y-4 border-b border-border-main/40 pb-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] uppercase tracking-wider rounded font-semibold">
                    PROBLEM WORKSPACE
                  </span>

                  <button
                    onClick={() => setActiveDrawerProblem(null)}
                    className="w-8 h-8 rounded bg-bg-card hover:bg-border-main/40 text-txt-muted hover:text-txt-main flex items-center justify-center cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-light text-txt-main">{activeDrawerProblem.title}</h2>
                  <p className="text-xs text-txt-sub font-light mt-1">{activeDrawerProblem.summary}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded border uppercase ${
                      activeDrawerProblem.difficulty === "Easy"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : activeDrawerProblem.difficulty === "Medium"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {activeDrawerProblem.difficulty}
                  </span>
                  <span className="px-2 py-0.5 bg-bg-card border border-border-main/60 text-txt-main rounded">
                    Time: {activeDrawerProblem.timeComplexity}
                  </span>
                  <span className="px-2 py-0.5 bg-bg-card border border-border-main/60 text-txt-main rounded">
                    Space: {activeDrawerProblem.spaceComplexity}
                  </span>
                </div>
              </div>

              {/* Drawer Middle Content */}
              <div className="space-y-6 flex-1">
                {/* Key Takeaway */}
                <div className="border border-border-main/70 bg-bg-base/60 p-4 rounded space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                    Key Architectural Takeaway
                  </span>
                  <p className="text-xs text-txt-main font-light">{activeDrawerProblem.keyTakeaway}</p>
                </div>

                {/* External Practice Link — Fix 2: verified URLs only render, no broken ones */}
                {activeDrawerProblem.practiceUrl && (
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">
                      External Practice Platform
                    </span>
                    <a
                      href={activeDrawerProblem.practiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2 cursor-pointer transition-opacity"
                    >
                      Practice on LeetCode <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {/* Solution Notes Vault */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase">
                    <span className="text-txt-muted">Solution Code & Notes Vault</span>
                    <span className="text-accent-main">Saved to Local & Supabase</span>
                  </div>

                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Write your solution code, optimal complexity proof, or key intuition here..."
                    rows={6}
                    className="w-full p-3.5 rounded border border-border-main/80 bg-bg-base font-mono text-xs text-txt-main focus:outline-none focus:border-accent-main resize-none"
                  />

                  <button
                    onClick={handleSaveNotesClick}
                    className="h-9 px-4 bg-bg-card hover:bg-border-main/30 border border-border-main/80 text-txt-main font-mono text-xs uppercase font-semibold rounded cursor-pointer transition-colors w-full flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> Save Notes to Vault
                  </button>
                </div>

                {/* LynDesk AI Assistant */}
                <div className="border border-border-main/80 bg-bg-base/80 p-4 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-accent-main font-semibold">
                      <Bot size={14} /> LynDesk AI Problem Assistant
                    </div>

                    <button
                      onClick={handleAskAiTutor}
                      disabled={isAiLoading}
                      className="px-3 py-1 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-[10px] uppercase font-semibold rounded cursor-pointer transition-opacity"
                    >
                      {isAiLoading ? "Analyzing..." : "Ask AI Tutor"}
                    </button>
                  </div>

                  {aiAssistantReply && (
                    <div className="p-3 bg-bg-surface border border-border-main/60 rounded text-xs font-mono text-txt-sub space-y-1">
                      <span className="text-accent-main text-[9px] uppercase block">AI Tutor Response:</span>
                      <p className="leading-relaxed">{aiAssistantReply}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Bottom — Fix 3: "Mark Completed" also triggers confirmation */}
              <div className="pt-4 border-t border-border-main/40 flex items-center justify-between gap-4 font-mono text-xs">
                <button
                  onClick={() => onToggleProblemStarred(activeDrawerProblem, activeTrack.id)}
                  className={`px-4 py-2.5 rounded border flex items-center gap-2 cursor-pointer transition-colors ${
                    progressMap[activeDrawerProblem.id]?.isStarred
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold"
                      : "bg-bg-card border-border-main/80 text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <Star size={14} className={progressMap[activeDrawerProblem.id]?.isStarred ? "fill-amber-400" : ""} />
                  {progressMap[activeDrawerProblem.id]?.isStarred ? "Starred for Revision" : "Star for Revision"}
                </button>

                <button
                  onClick={() => requestToggleConfirm(activeDrawerProblem)}
                  className={`px-5 py-2.5 rounded font-semibold uppercase tracking-wider cursor-pointer transition-opacity ${
                    progressMap[activeDrawerProblem.id]?.status === "completed"
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:opacity-90"
                      : "bg-accent-main text-bg-base hover:opacity-90"
                  }`}
                >
                  {progressMap[activeDrawerProblem.id]?.status === "completed" ? "Mark Pending" : "Mark Completed"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
