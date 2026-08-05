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
  XCircle
} from "lucide-react";

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
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

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

  const handleCheckMcq = () => {
    if (!currentQuestion || selectedMcqOption === null) return;

    const correctIdx = currentQuestion.correctAnswerIndex ?? 0;
    const isRight = selectedMcqOption === correctIdx;

    setIsCorrectAnswer(isRight);
    setIsAnswerChecked(true);

    const correctOptionText = currentQuestion.options?.[correctIdx] || currentQuestion.correctAnswerText || "";

    if (isRight) {
      setCorrectAnswersCount((prev) => prev + 1);
      setAnswerFeedback(currentQuestion.explanation || "Excellent response!");
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
      setAnswerFeedback(`Correct Answer: ${correctOptionText}. ${currentQuestion.explanation || ""}`);

      const mistake: StudyMistake = {
        id: "mistake_" + Math.random().toString(36).substring(2, 9),
        pathId: lesson.pathId,
        lessonId: lesson.id,
        questionPrompt: currentQuestion.prompt,
        questionType: "mcq",
        options: currentQuestion.options,
        correctAnswer: correctOptionText,
        userAnswer: currentQuestion.options?.[selectedMcqOption] || "",
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

      setIsCorrectAnswer(isRight);
      setAnswerFeedback(data.feedback || (isRight ? "Well explained!" : `Model Answer: ${currentQuestion.modelAnswer || ""}`));
      setIsAnswerChecked(true);

      if (isRight) {
        setCorrectAnswersCount((prev) => prev + 1);
      } else {
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

  const handleFinishLesson = () => {
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 100;
    const bonusXp = accuracy >= 80 ? 5 : 0;
    const finalXp = (lesson.xpValue || 10) + bonusXp;

    onComplete(accuracy, finalXp, mistakesList);
  };

  return (
    <div className="fixed inset-0 bg-bg-base/98 backdrop-blur-md z-50 flex flex-col justify-between overflow-hidden font-sans text-txt-main">
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

        {/* Hearts Life Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded font-mono text-xs text-rose-400 font-semibold">
          <Heart size={14} className="fill-rose-500 text-rose-500" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-6 overflow-y-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isFinished ? (
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
                    {totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 100}%
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
              {currentCard.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] uppercase tracking-wider rounded">
                  <Sparkles size={12} /> {currentCard.badge}
                </span>
              )}

              <h2 className="font-display text-2xl font-light text-txt-main tracking-tight">
                {currentCard.title}
              </h2>

              <div className="bg-bg-surface border border-border-main/80 rounded-md p-6 space-y-4">
                <p className="text-xs text-txt-main font-light leading-relaxed">
                  {currentCard.content}
                </p>

                {currentCard.keyTakeaway && (
                  <div className="border-l-2 border-accent-main pl-3.5 py-1 text-xs text-txt-sub font-light bg-accent-main/5 rounded-r">
                    <span className="font-mono text-[9px] uppercase text-accent-main font-bold block mb-0.5">Key Takeaway</span>
                    {currentCard.keyTakeaway}
                  </div>
                )}

                {currentCard.example && (
                  <div className="border-l-2 border-border-main pl-3.5 py-1 text-xs text-txt-sub font-light bg-bg-card/50 rounded-r">
                    <span className="font-mono text-[9px] uppercase text-txt-muted font-bold block mb-0.5">Practical Example</span>
                    {currentCard.example}
                  </div>
                )}
              </div>
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
                <span className="px-3 py-1 bg-bg-card border border-border-main/60 font-mono text-[9px] uppercase tracking-wider text-txt-muted rounded">
                  {currentQuestion.type === "mcq" ? "Multiple Choice" : "Short Answer"}
                </span>
              </div>

              <h2 className="font-display text-xl font-light text-txt-main">
                {currentQuestion.prompt}
              </h2>

              {currentQuestion.type === "mcq" && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options?.map((option, idx) => {
                    const isSelected = selectedMcqOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => !isAnswerChecked && setSelectedMcqOption(idx)}
                        disabled={isAnswerChecked}
                        className={`w-full p-4 rounded border text-left text-xs font-light transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-accent-main/10 border-accent-main text-accent-main font-medium"
                            : "bg-bg-surface border-border-main/70 text-txt-main hover:border-border-main"
                        }`}
                      >
                        <span>{option}</span>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] ${
                            isSelected
                              ? "bg-accent-main text-bg-base border-accent-main font-bold"
                              : "border-border-main text-txt-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "short_answer" && (
                <div className="pt-2">
                  <textarea
                    value={shortAnswerInput}
                    onChange={(e) => setShortAnswerInput(e.target.value)}
                    disabled={isAnswerChecked}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full p-4 rounded border border-border-main/80 bg-bg-surface text-xs font-mono text-txt-main focus:outline-none focus:border-accent-main placeholder:text-txt-muted/50"
                  />
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Bottom Action Footer */}
      {!isFinished && (
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
              <div className="text-[10px] font-mono uppercase text-txt-muted tracking-wider">
                {currentCard ? "Read lesson card & proceed" : "Select or type your answer"}
              </div>
            )}

            {currentCard ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity"
              >
                Got It →
              </button>
            ) : isAnswerChecked ? (
              <button
                onClick={handleNextStep}
                className={`px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer text-bg-base transition-opacity ${
                  isCorrectAnswer ? "bg-emerald-500 hover:opacity-90" : "bg-rose-500 hover:opacity-90"
                }`}
              >
                Continue →
              </button>
            ) : (
              <button
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
    </div>
  );
}
