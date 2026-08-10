"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Lesson, StudyMistake } from "../../study-desk/types";
import { 
  X, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Video,
  ExternalLink,
  Code2,
  Layers,
  Volume2,
  VolumeX,
  Bot,
  Send
} from "lucide-react";
import CodeIDEEditor from "./CodeIDEEditor";
import MermaidVisualRenderer from "./MermaidVisualRenderer";

interface SessionPlayerProps {
  lesson: Lesson;
  onComplete: (score: number, xpEarned: number, mistakes: StudyMistake[]) => void;
  onExit: () => void;
}

export default function SessionPlayer({ lesson, onComplete, onExit }: SessionPlayerProps) {
  const totalCards = lesson.cards?.length || 0;
  const totalQuestions = lesson.questions?.length || 0;
  const totalSteps = totalCards + totalQuestions;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState("");

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  const [hearts, setHearts] = useState(5);
  const [mistakesList, setMistakesList] = useState<StudyMistake[]>([]);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [retryCorrectCount, setRetryCorrectCount] = useState(0);
  const [failedQuestionIndices, setFailedQuestionIndices] = useState<Set<number>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [cardPaceTimeLeft, setCardPaceTimeLeft] = useState(0);
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Audio Speech Narrator State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Study Coach State
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiCoachPrompt, setAICoachPrompt] = useState("");
  const [aiCoachResponse, setAICoachResponse] = useState("");
  const [aiCoachLoading, setAICoachLoading] = useState(false);

  // Human Conversational Speech Queue & Breath Pause Engine
  const toggleSpeech = (textToRead: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();

      // Clean text formatting for natural human reading flow
      const cleanText = textToRead
        .replace(/[*#`_\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Break text into natural conversational sentence chunks
      const sentences = cleanText.match(/[^.!?:]+[.!?:]+/g) || [cleanText];
      const voices = window.speechSynthesis.getVoices();

      // Find highest quality human neural voice
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Online") ||
            v.name.includes("Google") ||
            v.name.includes("Neural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Jenny") ||
            v.name.includes("Aria") ||
            v.name.includes("Guy"))
      ) || voices.find((v) => v.lang.startsWith("en"));

      setIsSpeaking(true);

      // Speak sentences sequentially with natural human micro-pauses
      let currentIdx = 0;

      const speakNextSentence = () => {
        if (currentIdx >= sentences.length) {
          setIsSpeaking(false);
          return;
        }

        const sentence = sentences[currentIdx].trim();
        if (!sentence) {
          currentIdx++;
          speakNextSentence();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentence);
        if (preferredVoice) utterance.voice = preferredVoice;

        // Human conversational pitch & cadence variation
        if (currentIdx === 0) {
          utterance.rate = 0.92; // Slightly slower, engaging opening
          utterance.pitch = 1.04;
        } else if (currentIdx === sentences.length - 1) {
          utterance.rate = 0.88; // Thoughtful, deliberate conclusion
          utterance.pitch = 0.96;
        } else {
          utterance.rate = 0.94; // Conversational body pace
          utterance.pitch = 1.0;
        }

        utterance.onend = () => {
          currentIdx++;
          // Insert 180ms conversational breath pause between sentences
          setTimeout(speakNextSentence, 180);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextSentence();
    }
  };

  // Lock background body scroll and mark lesson active while player is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-lesson-active", "true");

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.removeAttribute("data-lesson-active");
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStepIndex]);

  const handleAskAICoach = async () => {
    if (!aiCoachPrompt.trim()) return;
    setAICoachLoading(true);
    setAICoachResponse("");

    try {
      const res = await fetch("/api/study/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionPrompt: `Student is asking about lesson "${lesson.title}": ${currentCard ? currentCard.title + " - " + currentCard.content : currentQuestion?.prompt}`,
          userAnswer: aiCoachPrompt,
          modelAnswer: "Provide a friendly, helpful, simple 2-3 sentence explanation to help the student understand."
        }),
      });
      const data = await res.json();
      setAICoachResponse(data.feedback || "Focus on the core mechanics and trace your variables step-by-step.");
    } catch {
      setAICoachResponse("Key Insight: Break down the problem step-by-step and test with simple sample inputs!");
    } finally {
      setAICoachLoading(false);
    }
  };

  // Reset Learn More drawer state on step change
  useEffect(() => {
    setShowLearnMore(false);
  }, [currentStepIndex]);

  // Enforce anti-spam card reading pace delay (5 seconds per card)
  useEffect(() => {
    if (currentStepIndex < totalCards) {
      setCardPaceTimeLeft(5);
      const interval = setInterval(() => {
        setCardPaceTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCardPaceTimeLeft(0);
    }
  }, [currentStepIndex, totalCards]);

  useEffect(() => {
    if (isFinished) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"],
      });
    }
  }, [isFinished]);

  const currentCard = currentStepIndex < totalCards ? lesson.cards[currentStepIndex] : null;
  const currentQuestionIndex = currentStepIndex - totalCards;
  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < totalQuestions
      ? lesson.questions[currentQuestionIndex]
      : null;

  const progressPercent = Math.round(((currentStepIndex + (isFinished ? 1 : 0)) / Math.max(1, totalSteps)) * 100);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setIsAnswerChecked(false);
      setSelectedMcqOption(null);
      setShortAnswerInput("");
    }
  };

  const handleCheckMcq = () => {
    if (!currentQuestion || selectedMcqOption === null) return;

    const rawOpts = currentQuestion.options || [];
    const safeOpts = rawOpts.length > 0 ? rawOpts : [
      currentQuestion.correctAnswerText || currentQuestion.correctAnswer || "Primary Core Concept",
      "Secondary Mechanism",
      "External Parameter",
      "Administrative Bound"
    ];

    const selectedText = safeOpts[selectedMcqOption] || "";
    const correctIdx = currentQuestion.correctAnswerIndex ?? 0;
    const targetCorrectText = currentQuestion.correctAnswerText || currentQuestion.correctAnswer || safeOpts[correctIdx] || safeOpts[0];

    const isRight = selectedMcqOption === correctIdx || selectedText.trim().toLowerCase() === targetCorrectText.trim().toLowerCase();

    const isFirstAttempt = !failedQuestionIndices.has(currentQuestionIndex);

    setIsCorrectAnswer(isRight);
    setIsAnswerChecked(true);

    if (isRight) {
      if (isFirstAttempt) {
        setFirstTryCorrectCount((prev) => prev + 1);
      } else {
        setRetryCorrectCount((prev) => prev + 1);
      }
      setAnswerFeedback(currentQuestion.explanation || "Excellent response!");
    } else {
      if (isFirstAttempt) {
        setFailedQuestionIndices((prev) => new Set(prev).add(currentQuestionIndex));
      }
      setHearts((prev) => Math.max(0, prev - 1));
      setAnswerFeedback(`Correct Answer: ${targetCorrectText}. ${currentQuestion.explanation || ""}`);

      const mistake: StudyMistake = {
        id: "mistake_" + Math.random().toString(36).substring(2, 9),
        pathId: lesson.pathId,
        lessonId: lesson.id,
        questionPrompt: currentQuestion.prompt,
        questionType: "mcq",
        options: safeOpts,
        correctAnswer: targetCorrectText,
        userAnswer: safeOpts[selectedMcqOption] || "",
        explanation: currentQuestion.explanation || "",
        createdAt: new Date().toISOString(),
      };
      setMistakesList((prev) => [...prev, mistake]);
    }
  };

  const handleCheckShortAnswer = async () => {
    if (!currentQuestion || !shortAnswerInput.trim()) return;

    setIsGrading(true);

    try {
      const res = await fetch("/api/study/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionPrompt: currentQuestion.prompt,
          modelAnswer: currentQuestion.modelAnswer,
          keywords: currentQuestion.keywords,
          userAnswer: shortAnswerInput,
        }),
      });

      const data = await res.json();
      const isRight = Boolean(data.isCorrect);
      const isFirstAttempt = !failedQuestionIndices.has(currentQuestionIndex);

      setIsCorrectAnswer(isRight);
      setAnswerFeedback(data.feedback || (isRight ? "Well explained!" : `Model Answer: ${currentQuestion.modelAnswer || ""}`));
      setIsAnswerChecked(true);

      if (isRight) {
        if (isFirstAttempt) {
          setFirstTryCorrectCount((prev) => prev + 1);
        } else {
          setRetryCorrectCount((prev) => prev + 1);
        }
      } else {
        if (isFirstAttempt) {
          setFailedQuestionIndices((prev) => new Set(prev).add(currentQuestionIndex));
        }
        setHearts((prev) => Math.max(0, prev - 1));
        const mistake: StudyMistake = {
          id: "mistake_" + Math.random().toString(36).substring(2, 9),
          pathId: lesson.pathId,
          lessonId: lesson.id,
          questionPrompt: currentQuestion.prompt,
          questionType: "short_answer",
          correctAnswer: currentQuestion.modelAnswer || "",
          userAnswer: shortAnswerInput,
          explanation: data.feedback || "",
          createdAt: new Date().toISOString(),
        };
        setMistakesList((prev) => [...prev, mistake]);
      }
    } catch {
      setIsCorrectAnswer(true);
      setAnswerFeedback("Good effort!");
      setIsAnswerChecked(true);
    } finally {
      setIsGrading(false);
    }
  };

  const handleNextStep = () => {
    setIsAnswerChecked(false);
    setSelectedMcqOption(null);
    setShortAnswerInput("");
    setAnswerFeedback("");

    if (currentStepIndex + 1 >= totalSteps) {
      setIsFinished(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleRetryQuestion = () => {
    setIsAnswerChecked(false);
    setSelectedMcqOption(null);
    setShortAnswerInput("");
    setAnswerFeedback("");
  };

  const calculateAccuracy = (): number => {
    if (totalQuestions === 0) return 100;

    // First-try correct = 1.0 weight (100%)
    // Retry correct = 0.75 weight (75%) — generous reward for learning & mastering!
    const weightedScore = (firstTryCorrectCount * 1.0) + (retryCorrectCount * 0.75);
    const rawPct = (weightedScore / totalQuestions) * 100;

    return Math.min(100, Math.max(0, Math.round(rawPct)));
  };

  const handleFinishLesson = () => {
    const accuracy = calculateAccuracy();
    const bonusXp = accuracy >= 80 ? 5 : 0;
    const finalXp = (lesson.xpValue || 10) + bonusXp;

    onComplete(accuracy, finalXp, mistakesList);
  };

  return (
    <div className="fixed inset-0 bg-bg-base/98 backdrop-blur-md z-[10000] flex flex-col justify-between overflow-hidden font-sans text-txt-main">
      {/* Top Header Navigation */}
      <div className="max-w-3xl w-full mx-auto px-6 py-4 flex items-center gap-4 border-b border-border-main/50">
        <button
          onClick={onExit}
          className="w-9 h-9 rounded-md bg-bg-surface hover:bg-bg-card border border-border-main/70 text-txt-sub flex items-center justify-center cursor-pointer transition-colors"
          title="Exit Lesson"
        >
          <X size={18} />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-3 bg-bg-card border border-border-main/60 rounded-full overflow-hidden p-0.5">
          <motion.div
            className="h-full bg-accent-main rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Audio Narrator Toggle */}
        {currentCard && (
          <button
            onClick={() => toggleSpeech(`${currentCard.title}. ${currentCard.content}. ${currentCard.keyTakeaway || ''}`)}
            className={`h-8 px-2.5 rounded border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors ${
              isSpeaking
                ? "bg-accent-main text-bg-base border-accent-main font-semibold"
                : "bg-bg-surface hover:bg-bg-card border-border-main/70 text-txt-sub"
            }`}
            title="Listen Card Audio"
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span className="hidden sm:inline text-[10px] uppercase font-bold">{isSpeaking ? "Mute" : "Listen"}</span>
          </button>
        )}

        {/* Ask LynAI Tutor Button */}
        {!isFinished && hearts > 0 && (
          <button
            onClick={() => setShowAICoach(!showAICoach)}
            className="h-8 px-2.5 rounded bg-accent-main/10 hover:bg-accent-main/20 border border-accent-main/30 text-accent-main font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Ask LynAI Tutor"
          >
            <Bot size={14} />
            <span className="hidden sm:inline">Ask LynAI</span>
          </button>
        )}

        {/* Hearts Life Counter */}
        {!isFinished && hearts > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded font-mono text-xs text-rose-400 font-semibold">
            <Heart size={14} className="fill-rose-500 text-rose-500" />
            <span>{hearts}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 overflow-y-auto font-sans">
        <div className="min-h-full flex flex-col justify-center py-6 space-y-6">
          <AnimatePresence mode="wait">
          {hearts <= 0 ? (
            /* Out of Hearts Review Screen */
            <motion.div
              key="out-of-hearts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                <Heart size={28} className="fill-rose-500 text-rose-500" />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-rose-400 font-bold">Out of Hearts (0/5)</span>
                <h2 className="font-display text-2xl font-light text-txt-main">Let's Review the Key Concepts</h2>
                <p className="text-xs text-txt-sub font-light max-w-md mx-auto leading-relaxed">
                  You ran out of lives on this lesson. Review the teaching cards carefully to absorb the material, then retry the assessment!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setHearts(5);
                  setCurrentStepIndex(0);
                  setIsAnswerChecked(false);
                  setSelectedMcqOption(null);
                  setShortAnswerInput("");
                }}
                className="w-full max-w-md py-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer mx-auto block"
              >
                Review Lesson Cards ↺
              </button>
            </motion.div>
          ) : isFinished ? (
            /* Celebration Screen */
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-accent-main/10 border border-accent-main/30 rounded-full flex items-center justify-center text-accent-main mx-auto">
                <Sparkles size={28} />
              </div>

              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">Lesson Complete</span>
                <h2 className="font-display text-2xl font-light text-txt-main tracking-tight mt-1">
                  Mastered {lesson.title}
                </h2>
                <p className="text-xs text-txt-sub font-light mt-1">Great job advancing your study path goals.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-bg-surface border border-border-main/70 rounded-md p-4 text-center">
                  <div className="text-[9px] font-mono uppercase text-txt-muted mb-1">XP Earned</div>
                  <div className="text-2xl font-mono font-bold text-accent-main flex items-center justify-center gap-1">
                    <Sparkles size={16} /> +{lesson.xpValue || 10}
                  </div>
                </div>

                <div className="bg-bg-surface border border-border-main/70 rounded-md p-4 text-center">
                  <div className="text-[9px] font-mono uppercase text-txt-muted mb-1">Accuracy</div>
                  <div className="text-2xl font-mono font-bold text-txt-main">
                    {calculateAccuracy()}%
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishLesson}
                className="w-full max-w-md py-3.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity mx-auto block"
              >
                Continue to Path →
              </button>
            </motion.div>
          ) : currentCard ? (
            /* Teaching Card Screen */
            <motion.div
              key={`card-${currentStepIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              {/* Main Hero Teaching Card */}
              <div className="bg-bg-surface border border-border-main/80 rounded-md p-6 md:p-8 space-y-5 shadow-xs">
                {currentCard.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] uppercase tracking-wider rounded">
                    <Sparkles size={12} /> {currentCard.badge}
                  </span>
                )}

                <h2 className="font-display text-2xl md:text-3xl font-normal text-txt-main tracking-tight">
                  {currentCard.title}
                </h2>

                <p className="text-sm md:text-base text-txt-main font-normal leading-relaxed tracking-normal">
                  {currentCard.content}
                </p>

                {currentCard.keyTakeaway && (
                  <div className="border-l-3 border-accent-main pl-4 py-2 text-xs md:text-sm text-txt-sub font-normal leading-relaxed bg-accent-main/5 rounded-r space-y-1">
                    <span className="font-mono text-[10px] uppercase text-accent-main font-bold block tracking-wider">Key Takeaway</span>
                    <p className="text-txt-main font-medium">{currentCard.keyTakeaway}</p>
                  </div>
                )}

                {/* Interactive Visual Architecture Diagram / Flowchart */}
                {currentCard.diagramMermaid && (
                  <div className="pt-2">
                    <MermaidVisualRenderer code={currentCard.diagramMermaid} />
                  </div>
                )}

                {/* Practical Example / Code Implementation Block */}
                {currentCard.example && (
                  (() => {
                    const isCode = /class\s|void\s|int\s|public\s|private\s|def\s|return\s|import\s|#include|function\s|\{|\}/i.test(currentCard.example);
                    return isCode ? (
                      <div className="border border-border-main/80 bg-bg-base rounded-md overflow-hidden space-y-1 mt-3">
                        <div className="bg-bg-surface px-4 py-2 border-b border-border-main/60 flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase text-accent-main font-bold flex items-center gap-1.5">
                            <Code2 size={12} /> Executable Code & Syntax Implementation
                          </span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-txt-main overflow-x-auto whitespace-pre leading-relaxed bg-black/40">
                          <code>{currentCard.example}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="border-l-3 border-border-main/80 pl-4 py-2 text-xs md:text-sm text-txt-sub font-mono leading-relaxed bg-bg-card/50 rounded-r space-y-1">
                        <span className="font-mono text-[10px] uppercase text-txt-muted font-bold block tracking-wider">Practical Example</span>
                        <p className="text-txt-main text-xs md:text-sm">{currentCard.example}</p>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Subtle Low-Opacity Learn More Reveal Button - Rendered ONLY if card has coding practice lab */}
              {(() => {
                const isCodingSubject = /coding|program|software|algorithm|data structure|leetcode|python|javascript|typescript|c\+\+|java|sql|react|node|operating system/i.test(
                  lesson.title + " " + (currentCard.badge || "")
                );

                if (!isCodingSubject) return null;

                return (
                  <>
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => setShowLearnMore(!showLearnMore)}
                        className="px-4 py-1.5 bg-bg-surface/50 hover:bg-bg-card border border-border-main/50 text-txt-sub/70 hover:text-txt-main font-mono text-[11px] uppercase tracking-wider rounded flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer shadow-xs"
                      >
                        <span>{showLearnMore ? "Learn More ↑" : "Learn More ↓"}</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showLearnMore && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden pt-2"
                        >
                          {(() => {
                            const isCodingSubject = /coding|program|software|algorithm|data structure|leetcode|python|javascript|typescript|c\+\+|java|sql|react|node|operating system/i.test(
                              lesson.title + " " + (currentCard.badge || "")
                            );

                            if (!isCodingSubject) return null;

                            const practiceList = (lesson.practiceProblems && lesson.practiceProblems.length > 0)
                              ? lesson.practiceProblems
                              : [
                                  {
                                    title: `Target Practice Challenge: ${lesson.title}`,
                                    url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(lesson.title)}`,
                                    platform: "LeetCode",
                                    difficulty: "Medium"
                                  }
                                ];

                            return (
                              <div className="border border-border-main/80 bg-bg-surface p-4 rounded-md space-y-3 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <Code2 size={16} className="text-accent-main" />
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-txt-main font-semibold">
                                    Coding Practice Lab & Problem Challenges
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {practiceList.map((prob, pIdx) => (
                                    <div key={pIdx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-bg-card/50 p-3 rounded border border-border-main/50 text-xs gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 font-mono text-[9px] uppercase font-bold rounded ${
                                          prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                          prob.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                        }`}>
                                          {prob.difficulty || 'Practice'}
                                        </span>
                                        <span className="text-txt-main font-medium">{prob.title}</span>
                                      </div>
                                      <a
                                        href={prob.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent-main font-mono text-[10px] uppercase font-semibold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                                      >
                                        <span>Solve on {prob.platform || 'LeetCode'}</span>
                                        <ExternalLink size={11} />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}
            </motion.div>
          ) : currentQuestion ? (
            /* Assessment Question Screen */
            <motion.div
              key={`question-${currentStepIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-bg-card border border-border-main/60 font-mono text-[10px] uppercase tracking-wider text-txt-muted rounded font-semibold">
                  {currentQuestion.type === "mcq" ? "Multiple Choice" : "Written / Code Exercise"}
                </span>
              </div>

              <h2 className="font-display text-lg md:text-xl font-normal text-txt-main leading-relaxed">
                {currentQuestion.prompt}
              </h2>

              {currentQuestion.type === "mcq" && (
                <div className="space-y-3 pt-2">
                  {(() => {
                    const rawOpts = currentQuestion.options || [];
                    const filteredOpts = rawOpts.filter((o) => typeof o === "string" && o.trim().length > 0);
                    const safeMcqOptions = filteredOpts.length > 0
                      ? filteredOpts
                      : [
                          currentQuestion.correctAnswerText || currentQuestion.correctAnswer || "Primary Core Concept",
                          "Secondary Mechanism",
                          "External Parameter",
                          "Administrative Bound"
                        ];

                    return safeMcqOptions.map((option, idx) => {
                      const isSelected = selectedMcqOption === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => !isAnswerChecked && setSelectedMcqOption(idx)}
                          disabled={isAnswerChecked}
                          className={`w-full p-4 rounded border text-left text-sm font-normal transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-accent-main/10 border-accent-main text-accent-main font-medium"
                              : "bg-bg-surface border-border-main/70 text-txt-main hover:border-border-main"
                          }`}
                        >
                          <span className="text-sm font-normal leading-normal">{option}</span>
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[11px] shrink-0 ml-3 ${
                              isSelected
                                ? "bg-accent-main text-bg-base border-accent-main font-bold"
                                : "border-border-main text-txt-muted"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}

              {currentQuestion.type === "short_answer" && (
                <div className="pt-2">
                  {(() => {
                    const isCodingExercise = Boolean(
                      (currentQuestion as any).type === "code" ||
                        /code|write|implement|function|program|script|class|java|python|javascript|typescript|c\+\+|java|sql|dsa|algorithm|stack|queue|array|linked list|tree|graph/i.test(
                          currentQuestion.prompt + " " + lesson.title
                        )
                    );

                    if (isCodingExercise) {
                      return (
                        <CodeIDEEditor
                          value={shortAnswerInput}
                          onChange={setShortAnswerInput}
                          disabled={isAnswerChecked}
                          placeholder="// Write your code solution here... (Tab key indents, {} [] () auto-close)"
                        />
                      );
                    }

                    return (
                      <textarea
                        value={shortAnswerInput}
                        onChange={(e) => setShortAnswerInput(e.target.value)}
                        disabled={isAnswerChecked}
                        placeholder="Type your detailed explanation or answer here..."
                        rows={4}
                        className="w-full p-4 rounded border border-border-main/80 bg-bg-surface text-sm font-normal text-txt-main focus:outline-none focus:border-accent-main placeholder:text-txt-muted/50 leading-relaxed font-sans"
                      />
                    );
                  })()}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action Footer */}
      {!isFinished && hearts > 0 && (
        <div
          className={`border-t py-4 px-6 transition-colors ${
            isAnswerChecked
              ? isCorrectAnswer
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-bg-surface border-border-main/50"
          }`}
        >
          <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-4">
            {isAnswerChecked ? (
              <div className="flex items-start gap-3 flex-1">
                {isCorrectAnswer ? (
                  <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={22} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-mono text-xs uppercase font-bold">
                    {isCorrectAnswer ? "Excellent!" : "Incorrect"}
                  </div>
                  <div className="text-xs font-light text-txt-sub mt-0.5">{answerFeedback}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-border-main/80 hover:bg-bg-card text-txt-sub font-mono text-xs uppercase rounded cursor-pointer transition-colors"
                  >
                    ← Previous
                  </button>
                )}
                <span className="text-[10px] font-mono uppercase text-txt-muted tracking-wider hidden sm:inline">
                  {currentCard ? "Read lesson card & proceed" : "Select or type your answer"}
                </span>
              </div>
            )}

            {currentCard ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={cardPaceTimeLeft > 0}
                className="px-6 py-2.5 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center gap-1.5"
              >
                {cardPaceTimeLeft > 0 ? `Pacing (${cardPaceTimeLeft}s)...` : "Got It →"}
              </button>
            ) : isAnswerChecked ? (
              isCorrectAnswer ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-emerald-500 hover:opacity-90 font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer text-bg-base transition-opacity"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRetryQuestion}
                  className="px-6 py-2.5 bg-rose-500 hover:opacity-90 font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer text-bg-base transition-opacity flex items-center gap-1.5"
                >
                  <span>Try Question Again</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={currentQuestion?.type === "mcq" ? handleCheckMcq : handleCheckShortAnswer}
                disabled={
                  (currentQuestion?.type === "mcq" && selectedMcqOption === null) ||
                  (currentQuestion?.type === "short_answer" && !shortAnswerInput.trim()) ||
                  isGrading
                }
                className="px-6 py-2.5 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center gap-2"
              >
                {isGrading ? "Checking..." : "Check"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ask LynAI Tutor Drawer Modal */}
      {showAICoach && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-end p-4">
          <div className="bg-bg-surface border border-border-main/80 rounded-md max-w-md w-full h-[520px] p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-accent-main" />
                <span className="font-mono text-xs uppercase font-bold text-txt-main">LynAI 1-on-1 Study Tutor</span>
              </div>
              <button
                onClick={() => setShowAICoach(false)}
                className="text-txt-muted hover:text-txt-main cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="p-3 bg-bg-card/70 border border-border-main/50 rounded text-txt-sub leading-relaxed">
                Hello Sir! I am your LynAI Study Coach for <strong className="text-txt-main">{lesson.title}</strong>. Ask me anything about this card or question!
              </div>

              {aiCoachResponse && (
                <div className="p-3 bg-accent-main/10 border border-accent-main/30 rounded text-txt-main leading-relaxed space-y-1">
                  <span className="text-[9px] uppercase font-bold text-accent-main block">LynAI Explanation:</span>
                  <p className="text-xs font-sans text-txt-main leading-relaxed">{aiCoachResponse}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border-main/40">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiCoachPrompt}
                  onChange={(e) => setAICoachPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAICoach()}
                  placeholder="Ask a question about this card..."
                  className="flex-1 h-9 px-3 border border-border-main/80 bg-bg-base text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
                />
                <button
                  onClick={handleAskAICoach}
                  disabled={!aiCoachPrompt.trim() || aiCoachLoading}
                  className="h-9 px-3 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center"
                >
                  {aiCoachLoading ? "..." : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
