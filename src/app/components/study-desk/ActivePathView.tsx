"use client";

import React, { useState } from "react";
import { StudyPath, Lesson } from "../../study-desk/types";
import { 
  Check, 
  Lock, 
  Play, 
  Sparkles, 
  BookOpen, 
  X
} from "lucide-react";

interface ActivePathViewProps {
  path: StudyPath;
  onStartLesson: (lesson: Lesson) => void;
  onCreateNewPathClick: () => void;
}

export default function ActivePathView({ path, onStartLesson, onCreateNewPathClick }: ActivePathViewProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-8">
      {/* Path Header Banner */}
      <div className="border border-border-main/80 bg-bg-surface p-6 rounded-md space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 bg-accent-main/10 border border-accent-main/30 text-accent-main font-mono text-[9px] uppercase tracking-wider rounded">
            {path.depthMode ? `${path.depthMode.toUpperCase()} PATH` : "STANDARD PATH"}
          </span>
          <span className="px-2.5 py-0.5 bg-bg-card border border-border-main/60 font-mono text-[9px] uppercase text-txt-muted rounded">
            {path.sourceFiles?.length || 0} Source File(s)
          </span>
        </div>

        <div>
          <h1 className="font-display text-2xl font-light text-txt-main tracking-tight">{path.title}</h1>
          {path.description && <p className="text-xs text-txt-sub font-light mt-1">{path.description}</p>}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[10px] font-mono text-txt-muted uppercase">
            <span>Overall Progress</span>
            <span>
              {completedLessons}/{totalLessons} Lessons ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-bg-card border border-border-main/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-main rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Winding Zigzag Lesson Path */}
      <div className="space-y-10">
        {path.sections.map((section, secIdx) => (
          <div key={section.id || `sec_${secIdx}`} className="space-y-6">
            {/* Section Header Banner */}
            <div className="border border-border-main/70 bg-bg-surface/60 p-4 rounded-md flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                  Section {secIdx + 1}
                </span>
                <h2 className="font-display text-base font-light text-txt-main">{section.title}</h2>
                {section.description && <p className="text-[11px] text-txt-sub font-light">{section.description}</p>}
              </div>
              <div className="w-8 h-8 rounded border border-border-main/60 bg-bg-card text-txt-main font-mono text-xs font-bold flex items-center justify-center">
                0{secIdx + 1}
              </div>
            </div>

            {/* Zigzag Nodes Column */}
            <div className="flex flex-col items-center gap-6 py-2">
              {section.lessons?.map((lesson, lesIdx) => {
                const isCompleted = lesson.completed;
                let isUnlocked = false;

                if (isCompleted) {
                  isUnlocked = true;
                } else if (!foundFirstUnlocked) {
                  isUnlocked = true;
                  foundFirstUnlocked = true;
                }

                // Horizontal zigzag offset
                const offsetIdx = lesIdx % 4;
                let translateX = "translate-x-0";
                if (offsetIdx === 1) translateX = "-translate-x-10 sm:-translate-x-14";
                else if (offsetIdx === 2) translateX = "translate-x-0";
                else if (offsetIdx === 3) translateX = "translate-x-10 sm:translate-x-14";

                const isCurrentTarget = isUnlocked && !isCompleted;

                return (
                  <div
                    key={lesson.id || `les_${secIdx}_${lesIdx}`}
                    className={`relative flex flex-col items-center ${translateX} transition-transform duration-200`}
                  >
                    {/* Active Target Floating Badge */}
                    {isCurrentTarget && (
                      <div className="absolute -top-7 animate-bounce z-10">
                        <span className="px-2 py-0.5 bg-accent-main text-bg-base font-mono text-[9px] uppercase tracking-wider font-bold rounded shadow-sm">
                          START →
                        </span>
                      </div>
                    )}

                    {/* Circular Node Button */}
                    <button
                      onClick={() => isUnlocked && setSelectedLesson(lesson)}
                      disabled={!isUnlocked}
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-mono font-bold text-lg transition-all cursor-pointer border ${
                        isCompleted
                          ? "bg-accent-main text-bg-base border-accent-main hover:opacity-90 shadow-sm"
                          : isCurrentTarget
                          ? "bg-bg-surface text-accent-main border-2 border-accent-main ring-4 ring-accent-main/20 animate-pulse hover:bg-bg-card"
                          : "bg-bg-card border-border-main/40 text-txt-muted cursor-not-allowed opacity-50"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={24} />
                      ) : isCurrentTarget ? (
                        <Play size={20} className="fill-accent-main translate-x-0.5" />
                      ) : (
                        <Lock size={18} />
                      )}
                    </button>

                    {/* Lesson Label */}
                    <div className="mt-1.5 text-center max-w-[130px]">
                      <span className="text-[11px] font-medium text-txt-main block truncate">
                        {lesson.title}
                      </span>
                      <span className="font-mono text-[9px] text-txt-muted uppercase">
                        +{lesson.xpValue || 10} XP
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Milestone Node */}
              <div className="mt-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-md bg-bg-card border border-border-main/80 text-txt-main flex flex-col items-center justify-center shadow-sm">
                  <span className="font-mono text-[9px] uppercase font-bold text-accent-main">SECTION</span>
                  <span className="font-mono text-xs font-bold text-txt-main">{secIdx + 1}</span>
                </div>
                <span className="font-mono text-[9px] text-txt-muted uppercase tracking-wider mt-1">
                  Milestone
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lesson Details Modal Popover */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-bg-base/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-md max-w-md w-full p-6 border border-border-main/80 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold">
                Lesson Overview
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
              <p className="text-xs text-txt-sub font-light">{selectedLesson.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 bg-bg-card p-3 rounded border border-border-main/60 font-mono text-xs">
              <div>
                <span className="text-[9px] text-txt-muted uppercase block">XP Reward</span>
                <span className="text-accent-main font-bold">+{selectedLesson.xpValue || 10} XP</span>
              </div>
              <div>
                <span className="text-[9px] text-txt-muted uppercase block">Est. Time</span>
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
              {selectedLesson.completed ? "Practice Again" : "Start Lesson"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
