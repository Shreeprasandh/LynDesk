"use client";

import React, { useState } from "react";
import { StudyPath, Lesson } from "../../study-desk/types";
import { 
  Check, 
  Lock, 
  Play, 
  Sparkles, 
  BookOpen, 
  X,
  Trophy,
  Award,
  ChevronRight,
  Clock,
  Zap,
  Target,
  FileText,
  Video
} from "lucide-react";
import CertificateModal from "./CertificateModal";

interface ActivePathViewProps {
  path: StudyPath;
  onStartLesson: (lesson: Lesson) => void;
  onCreateNewPathClick: () => void;
}

export default function ActivePathView({ path, onStartLesson, onCreateNewPathClick }: ActivePathViewProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const [isHydratingLesson, setIsHydratingLesson] = useState(false);
  const [hydratingLessonTitle, setHydratingLessonTitle] = useState("");

  const triggerBackgroundPrefetchNextLesson = (currentLesson: Lesson) => {
    let foundCurrent = false;
    let nextTarget: { lesson: Lesson; sectionTitle: string } | null = null;

    for (const sec of path.sections) {
      for (const les of sec.lessons) {
        if (foundCurrent && !nextTarget) {
          nextTarget = { lesson: les, sectionTitle: sec.title };
          break;
        }
        if (les.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }

    if (nextTarget && (!nextTarget.lesson.cards || nextTarget.lesson.cards.length < 2)) {
      const target = nextTarget;
      fetch("/api/study/hydrate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathTitle: path.title,
          sectionTitle: target.sectionTitle,
          lessonTitle: target.lesson.title,
          lessonDescription: target.lesson.description,
          depthMode: path.depthMode || "standard"
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.cards) {
            target.lesson.cards = data.cards;
            target.lesson.questions = data.questions;
            if (data.practiceProblems) target.lesson.practiceProblems = data.practiceProblems;
            if (data.videoResource) target.lesson.videoResource = data.videoResource;
          }
        })
        .catch(() => {});
    }
  };

  const handleSelectAndHydrateLesson = async (lesson: Lesson, sectionTitle: string) => {
    if (lesson.cards && lesson.cards.length >= 2) {
      setSelectedLesson(lesson);
      triggerBackgroundPrefetchNextLesson(lesson);
      return;
    }

    setIsHydratingLesson(true);
    setHydratingLessonTitle(lesson.title);

    try {
      const res = await fetch("/api/study/hydrate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathTitle: path.title,
          sectionTitle: sectionTitle,
          lessonTitle: lesson.title,
          lessonDescription: lesson.description,
          depthMode: path.depthMode || "standard"
        })
      });

      const data = await res.json();
      if (data.success && data.cards) {
        lesson.cards = data.cards;
        lesson.questions = data.questions;
        if (data.practiceProblems) lesson.practiceProblems = data.practiceProblems;
        if (data.videoResource) lesson.videoResource = data.videoResource;
      }
    } catch (err) {
      console.error("Single lesson hydration error:", err);
    } finally {
      setIsHydratingLesson(false);
      setSelectedLesson(lesson);
      triggerBackgroundPrefetchNextLesson(lesson);
    }
  };

  if (!path || !path.sections || path.sections.length === 0) {
    return (
      <div className="border border-border-main/70 bg-bg-surface p-8 sm:p-12 rounded-md flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-4 my-8">
        <div className="w-14 h-14 rounded-full bg-accent-main/10 border border-accent-main/30 flex items-center justify-center text-accent-main">
          <BookOpen size={24} />
        </div>
        <h2 className="font-display text-xl font-light text-txt-main">No Lessons Found</h2>
        <p className="text-xs text-txt-sub font-light max-w-sm">
          Upload your notes, PDFs, or lecture slides to generate your first adaptive study path!
        </p>
        <button
          onClick={onCreateNewPathClick}
          className="h-10 px-5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center gap-2"
        >
          <Sparkles size={14} /> Create Learning Path
        </button>
      </div>
    );
  }

  const totalLessons = path.totalLessons || 1;
  const completedLessons = path.completedLessons || 0;
  const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

  let foundFirstUnlocked = false;

  const scrollToSection = (secId: string) => {
    setActiveSectionId(secId);
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8 text-left">
      {/* Path Header Banner */}
      <div className="border border-border-main/80 bg-bg-surface p-6 md:p-8 rounded-md space-y-5 relative overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-main/40 pb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
              <Zap size={11} /> {path.depthMode ? `${path.depthMode.toUpperCase()} PATH` : "STANDARD PATH"}
            </span>
            <span className="px-3 py-1 bg-bg-card border border-border-main/60 font-mono text-[10px] uppercase text-txt-muted rounded flex items-center gap-1.5">
              <FileText size={12} />
              {path.sourceFiles?.length || 0} Source File(s)
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-txt-sub">
            <span className="flex items-center gap-1 text-accent-main font-bold">
              <Zap size={14} /> +{path.xpEarned || 0} XP Earned
            </span>
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl md:text-3xl font-light text-txt-main tracking-tight">
            {path.title}
          </h1>
          {path.description && (
            <p className="text-xs md:text-sm text-txt-sub font-light mt-1.5 leading-relaxed max-w-3xl">
              {path.description}
            </p>
          )}
        </div>

        {/* Overall Progress Bar & Meta */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono text-txt-muted uppercase">
            <span className="flex items-center gap-1.5 text-txt-main font-semibold">
              <Target size={14} className="text-accent-main" /> Path Mastery Progress
            </span>
            <span className="font-bold text-accent-main">
              {completedLessons} / {totalLessons} Lessons ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-bg-card border border-border-main/50 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-accent-main rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sticky Section Stepper & Path Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          {/* Section Stepper Card */}
          <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-txt-muted font-semibold">
                Curriculum Navigation
              </span>
              <span className="font-mono text-[10px] text-accent-main font-bold">
                {path.sections.length} Sections
              </span>
            </div>

            <div className="space-y-1.5">
              {path.sections.map((sec, idx) => {
                const secLessons = sec.lessons || [];
                const secCompleted = secLessons.filter((l) => l.completed).length;
                const isSecDone = secLessons.length > 0 && secCompleted === secLessons.length;
                const secId = sec.id || `sec_${idx + 1}`;
                const isSelected = activeSectionId === secId;

                return (
                  <button
                    key={secId}
                    onClick={() => scrollToSection(secId)}
                    className={`w-full p-3 rounded text-left transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? "bg-accent-main/10 border-accent-main text-txt-main shadow-xs"
                        : "bg-bg-card/40 border-border-main/50 hover:border-border-main text-txt-sub hover:text-txt-main"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                        isSecDone 
                          ? "bg-accent-main text-bg-base"
                          : "bg-bg-card border border-border-main text-txt-sub"
                      }`}>
                        {isSecDone ? "✓" : `0${idx + 1}`}
                      </span>
                      <span className="text-xs font-mono font-medium truncate">{sec.title}</span>
                    </div>

                    <span className="font-mono text-[9px] text-txt-muted shrink-0 ml-2">
                      {secCompleted}/{secLessons.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Path Trophy & Reward Summary Card */}
          <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-txt-muted" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-txt-main font-semibold">
                  Path Completion Rewards
                </span>
              </div>
            </div>
            <p className="text-xs text-txt-sub font-light leading-relaxed">
              Complete all sections and the final cumulative exam to earn your <strong className="text-txt-main">Path Master Badge</strong> and claim bonus XP.
            </p>
            <div className="pt-2 border-t border-border-main/40 flex items-center justify-between text-xs font-mono">
              <span className="text-txt-muted">Grand Certificate</span>
              <button
                type="button"
                onClick={() => setShowCertificate(true)}
                className="text-accent-main hover:underline text-[11px] font-semibold border border-accent-main/30 bg-accent-main/10 px-2.5 py-1 rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Award size={13} /> View Certificate
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Full Timeline Content Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {path.sections.map((section, secIdx) => {
            const secId = section.id || `sec_${secIdx + 1}`;
            const isGrandExamSection = section.title.toUpperCase().includes("GRAND PATH EXAM");
            const secLessons = section.lessons || [];
            const secCompletedCount = secLessons.filter((l) => l.completed).length;
            const isSectionFullyDone = secLessons.length > 0 && secCompletedCount === secLessons.length;

            return (
              <div
                key={secId}
                id={secId}
                className="space-y-4 scroll-mt-24"
              >
                {/* Section Header Card */}
                <div className="p-5 rounded-md border bg-bg-surface border-border-main/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded ${
                        isGrandExamSection 
                          ? "bg-accent-main/15 text-accent-main border border-accent-main/30" 
                          : "bg-bg-card text-txt-muted border border-border-main/60"
                      }`}>
                        {isGrandExamSection ? "FINAL MILESTONE" : `SECTION 0${secIdx + 1}`}
                      </span>
                      <span className="font-mono text-[10px] text-txt-muted">
                        {secCompletedCount}/{secLessons.length} Completed
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-light text-txt-main">{section.title}</h2>
                    {section.description && (
                      <p className="text-xs text-txt-sub font-light leading-relaxed">{section.description}</p>
                    )}
                  </div>

                  <div className="font-mono text-xs text-txt-muted shrink-0">
                    {secLessons.length} Lessons
                  </div>
                </div>

                {/* Lessons Timeline Cards List */}
                <div className="space-y-3 pl-2 border-l-2 border-border-main/40 ml-4">
                  {secLessons.map((lesson) => {
                    const isCompleted = lesson.completed;
                    let isUnlocked = false;

                    if (isCompleted) {
                      isUnlocked = true;
                    } else if (!foundFirstUnlocked) {
                      isUnlocked = true;
                      foundFirstUnlocked = true;
                    }

                    const isCurrentTarget = isUnlocked && !isCompleted;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-4 rounded-md border transition-all relative ml-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCompleted
                            ? "bg-bg-surface/80 border-border-main/60"
                            : isCurrentTarget
                            ? "bg-bg-surface border-2 border-accent-main ring-4 ring-accent-main/15 shadow-md"
                            : "bg-bg-card/40 border-border-main/40 opacity-60"
                        }`}
                      >
                        {/* Left Bullet Connector Node */}
                        <div className={`absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isCompleted
                            ? "bg-accent-main border-accent-main"
                            : isCurrentTarget
                            ? "bg-bg-surface border-accent-main ring-2 ring-accent-main/40"
                            : "bg-bg-base border-border-main"
                        }`}>
                          {isCompleted && <div className="w-1.5 h-1.5 bg-bg-base rounded-full" />}
                        </div>

                        {/* Lesson Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* YouTube Learn Button (Placed directly to the LEFT of the status indicator) */}
                            {(() => {
                              const cleanTopic = lesson.title
                                .replace(/^Lesson\s*\d+\s*[:\-]?\s*/gi, "")
                                .replace(/^\d+[\.\)]\s*/g, "")
                                .replace(/^Section\s*\d+\s*[:\-]?\s*/gi, "")
                                .replace(/Module\s*\d+/gi, "")
                                .replace(/\s+/g, " ")
                                .trim();

                              const videoUrl = lesson.videoResource?.url
                                ? lesson.videoResource.url
                                : `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic)}`;

                              if (!isUnlocked) {
                                return (
                                  <span
                                    className="px-2 py-0.5 bg-bg-card/30 border border-border-main/20 text-txt-muted/35 font-mono text-[9px] uppercase font-semibold rounded flex items-center gap-1 cursor-not-allowed select-none"
                                    title="Complete previous lessons to unlock video tutorial"
                                  >
                                    <Video size={10} /> Learn
                                  </span>
                                );
                              }

                              return (
                                <a
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400/40 hover:text-red-400 border border-red-500/10 font-mono text-[9px] uppercase font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
                                  title={`Watch YouTube tutorial for ${cleanTopic}`}
                                >
                                  <Video size={10} /> Learn
                                </a>
                              );
                            })()}

                            {/* Status Indicator */}
                            {isCompleted ? (
                              <span className="px-2 py-0.5 bg-emerald-500/[0.02] border border-emerald-500/10 text-emerald-400/40 font-mono text-[9px] font-bold uppercase rounded flex items-center gap-1">
                                <Check size={10} /> Completed
                              </span>
                            ) : isCurrentTarget ? (
                              <span className="px-2 py-0.5 bg-accent-main/90 text-bg-base font-mono text-[9px] font-bold uppercase rounded flex items-center gap-1">
                                <Zap size={10} /> Start Next
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-transparent border border-border-main/20 text-txt-muted/30 font-mono text-[9px] uppercase rounded flex items-center gap-1">
                                <Lock size={10} /> Locked
                              </span>
                            )}

                            <span className="font-mono text-[10px] text-accent-main font-bold">
                              +{lesson.xpValue || 10} XP
                            </span>
                            <span className="font-mono text-[10px] text-txt-muted flex items-center gap-1">
                              <Clock size={11} /> ~{lesson.estimatedMinutes || 5} mins
                            </span>
                          </div>

                          <h3 className="font-display text-base font-light text-txt-main">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-xs text-txt-sub font-light line-clamp-2">{lesson.description}</p>
                          )}
                        </div>

                        {/* Start / View Button */}
                        <button
                          onClick={() => isUnlocked && handleSelectAndHydrateLesson(lesson, section.title)}
                          disabled={!isUnlocked || isHydratingLesson}
                          className={`h-9 px-4 font-mono text-xs uppercase font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            isCompleted
                              ? "border border-border-main/80 hover:bg-bg-card text-txt-main"
                              : isCurrentTarget
                              ? "bg-accent-main hover:opacity-90 text-bg-base shadow-sm"
                              : "bg-bg-card border border-border-main/40 text-txt-muted cursor-not-allowed"
                          }`}
                        >
                          {isCompleted ? (
                            <span>Review →</span>
                          ) : isCurrentTarget ? (
                            <>
                              <Play size={12} className="fill-bg-base" />
                              <span>Start Lesson</span>
                            </>
                          ) : (
                            <span>Locked</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Section Milestone Banner */}
                <div className={`p-3.5 rounded-md border flex items-center justify-between text-[11px] font-mono ${
                  isSectionFullyDone 
                    ? "bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-300/70"
                    : "bg-bg-card/20 border-border-main/25 text-txt-muted/50"
                }`}>
                  <div className="flex items-center gap-2">
                    <Trophy size={13} className={isSectionFullyDone ? "text-emerald-400/70" : "text-txt-muted/40"} />
                    <span>
                      {isSectionFullyDone 
                        ? `Section 0${secIdx + 1} Milestone Cleared! +50 Bonus XP Unlocked`
                        : `Complete all lessons in Section 0${secIdx + 1} to clear this Milestone.`}
                    </span>
                  </div>
                  <span className="font-semibold text-[10px]">{isSectionFullyDone ? "100%" : `${secCompletedCount}/${secLessons.length}`}</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Lesson Details Popover Modal */}
      {selectedLesson && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLesson(null)}
        >
          <div 
            className="bg-bg-surface rounded-md max-w-md w-full p-6 border border-border-main/80 shadow-2xl relative space-y-4 text-left font-sans animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                Lesson Overview & Launch
              </span>
              <button
                onClick={() => setSelectedLesson(null)}
                className="w-7 h-7 rounded bg-bg-card hover:bg-border-main/30 text-txt-muted flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <h3 className="font-display text-xl font-light text-txt-main">{selectedLesson.title}</h3>
            {selectedLesson.description && (
              <p className="text-xs text-txt-sub font-light leading-relaxed">{selectedLesson.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 bg-bg-card p-3.5 rounded border border-border-main/60 font-mono text-xs">
              <div>
                <span className="text-[9px] text-txt-muted uppercase block">XP Reward</span>
                <span className="text-accent-main font-bold">+{selectedLesson.xpValue || 10} XP</span>
              </div>
              <div>
                <span className="text-[9px] text-txt-muted uppercase block">Estimated Time</span>
                <span className="text-txt-main font-bold">~{selectedLesson.estimatedMinutes || 5} Mins</span>
              </div>
            </div>

            <button
              onClick={() => {
                const target = selectedLesson;
                setSelectedLesson(null);
                onStartLesson(target);
              }}
              className="w-full py-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center gap-2"
            >
              <Play size={14} className="fill-bg-base" />
              {selectedLesson.completed ? "Review Lesson Again" : "Launch Interactive Lesson"}
            </button>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          path={path}
          userName="Sir"
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* On-Demand Single Lesson Hydration Overlay */}
      {isHydratingLesson && (
        <div className="fixed inset-0 bg-bg-base/95 backdrop-blur-md z-[10000] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-accent-main/10 border border-accent-main/30 flex items-center justify-center text-accent-main animate-pulse">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1.5 max-w-md">
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">
              Hydrating World-Class Lesson Architecture
            </span>
            <h3 className="font-display text-xl font-light text-txt-main">
              {hydratingLessonTitle || "Building Lesson Content"}
            </h3>
            <p className="text-xs text-txt-sub font-light leading-relaxed">
              Generating 6 deep teaching cards, runnable code syntax, Mermaid flowcharts, and targeted assessment questions...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
