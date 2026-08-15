"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase";
import { StudyPath, StudyMistake, StudyStats, Lesson } from "./types";

import LearningPathsView from "../components/study-desk/LearningPathsView";
import ActivePathView from "../components/study-desk/ActivePathView";
import SessionPlayer from "../components/study-desk/SessionPlayer";
import AIPathStudioModal from "../components/study-desk/AIPathStudioModal";
import ProgressDashboardView from "../components/study-desk/ProgressDashboardView";
import ErrorBankModal from "../components/study-desk/ErrorBankModal";
import DSASystemMasteryView, { UserDSAProgressMap } from "../components/study-desk/DSASystemMasteryView";
import { DSA_TRACKS, DSAProblem } from "./dsaMasteryData";

const STORAGE_PATHS_KEY = "lyndesk_study_paths_cache";
const STORAGE_MISTAKES_KEY = "lyndesk_study_mistakes_cache";
const STORAGE_STATS_KEY = "lyndesk_study_stats_cache";
const STORAGE_ACTIVE_PATH_KEY = "lyndesk_active_study_path_id";
const STORAGE_DSA_PROGRESS_KEY = "lyndesk_dsa_progress_cache";

const calculateTotalDSAXp = (map: UserDSAProgressMap) => {
  let dsaXp = 0;
  DSA_TRACKS.forEach((track) => {
    track.steps.forEach((step) => {
      step.problems.forEach((prob) => {
        if (map[prob.id]?.status === "completed") {
          dsaXp += prob.difficulty === "Easy" ? 15 : prob.difficulty === "Medium" ? 25 : 40;
        }
      });
    });
  });
  return dsaXp;
};

export default function StudyDeskPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"progress" | "dsa_way" | "paths">("progress");

  // Synchronous 0ms local state initializers
  const [paths, setPaths] = useState<StudyPath[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_PATHS_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [mistakes, setMistakes] = useState<StudyMistake[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_MISTAKES_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_STATS_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {
      totalXp: 0,
      streakCount: 0,
      longestStreak: 0,
      lastStudiedDate: "",
      activeDays: [],
    };
  });

  const [dsaProgressMap, setDsaProgressMap] = useState<UserDSAProgressMap>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_DSA_PROGRESS_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {};
  });

  const [activePathId, setActivePathId] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedActive = localStorage.getItem(STORAGE_ACTIVE_PATH_KEY);
        if (cachedActive) return cachedActive;
      } catch {}
    }
    return paths.find((p) => p.isActive)?.id || paths[0]?.id;
  });

  // Modal Overlays
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showAIStudio, setShowAIStudio] = useState(false);
  const [showErrorBank, setShowErrorBank] = useState(false);

  // Sync state to local cache for 0ms loads
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PATHS_KEY, JSON.stringify(paths));
      } catch {}
    }
  }, [paths]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_MISTAKES_KEY, JSON.stringify(mistakes));
      } catch {}
    }
  }, [mistakes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
      } catch {}
    }
  }, [stats]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_DSA_PROGRESS_KEY, JSON.stringify(dsaProgressMap));
      } catch {}
    }
  }, [dsaProgressMap]);

  // Fetch Supabase data when logged in
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      if (!user) return;
      try {
        // 1. Fetch Study Paths
        const { data: cloudPaths } = await supabase
          .from("study_paths")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        let mappedPaths: StudyPath[] = [];
        if (cloudPaths && cloudPaths.length > 0) {
          mappedPaths = cloudPaths.map((cp: any) => ({
            id: cp.id,
            userId: cp.user_id,
            title: cp.title,
            description: cp.description || "",
            depthMode: cp.depth_mode || "standard",
            uploadMode: cp.upload_mode || "unified",
            sourceFiles: cp.source_files || [],
            sections: cp.sections || [],
            totalLessons: cp.total_lessons || 0,
            completedLessons: cp.completed_lessons || 0,
            xpEarned: cp.xp_earned || 0,
            isActive: cp.is_active || false,
            createdAt: cp.created_at,
            lastStudiedAt: cp.last_studied_at,
          }));
          setPaths(mappedPaths);
          if (!activePathId) {
            const active = mappedPaths.find((p) => p.isActive) || mappedPaths[0];
            if (active) setActivePathId(active.id);
          }
        }

        // 2. Fetch Mistakes
        const { data: cloudMistakes } = await supabase
          .from("study_mistakes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (cloudMistakes && cloudMistakes.length > 0) {
          const mappedM: StudyMistake[] = cloudMistakes.map((cm: any) => ({
            id: cm.id,
            pathId: cm.path_id,
            lessonId: cm.lesson_id,
            questionType: cm.question_type,
            questionPrompt: cm.question_prompt,
            options: cm.options,
            correctAnswer: cm.correct_answer,
            userAnswer: cm.user_answer,
            explanation: cm.explanation || "",
            createdAt: cm.created_at,
          }));
          setMistakes(mappedM);
        }

        // 3. Fetch User DSA Progress
        const { data: cloudDsa } = await supabase
          .from("user_dsa_progress")
          .select("*")
          .eq("user_id", user.id);

        let loadedDsaMap: UserDSAProgressMap = dsaProgressMap;
        if (cloudDsa && cloudDsa.length > 0) {
          const map: UserDSAProgressMap = {};
          cloudDsa.forEach((row: any) => {
            map[row.problem_id] = {
              status: row.status || "completed",
              isStarred: row.is_starred || false,
              notes: row.notes || "",
            };
          });
          loadedDsaMap = map;
          setDsaProgressMap(map);
        }

        // 4. Fetch Profile Stats with self-healing exact total XP verification
        const { data: profile } = await supabase
          .from("profiles")
          .select("study_xp, study_streak, study_longest_streak, study_last_date, study_active_days")
          .eq("id", user.id)
          .single();

        const pathXpSum = mappedPaths.reduce((acc, p) => acc + (p.xpEarned || 0), 0);
        const dsaXpSum = calculateTotalDSAXp(loadedDsaMap);
        const calculatedExactTotalXp = pathXpSum + dsaXpSum;

        const verifiedTotalXp = Math.max(profile?.study_xp || 0, calculatedExactTotalXp);

        if (profile) {
          setStats({
            totalXp: verifiedTotalXp,
            streakCount: profile.study_streak || 0,
            longestStreak: profile.study_longest_streak || 0,
            lastStudiedDate: profile.study_last_date || "",
            activeDays: profile.study_active_days || [],
          });
        }
      } catch {}
    }

    loadData();
  }, [user, activePathId]);

  const activePath = paths.find((p) => p.id === activePathId) || paths[0];

  // Path Handlers
  const handleSelectActivePath = (pathId: string) => {
    setActivePathId(pathId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ACTIVE_PATH_KEY, pathId);
      } catch {}
    }
    setPaths((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === pathId,
      }))
    );
    setActiveTab("paths");

    // Sync active state to Supabase if logged in
    if (user) {
      supabase.from("study_paths").update({ is_active: false }).eq("user_id", user.id);
      supabase.from("study_paths").update({ is_active: true }).eq("id", pathId);
    }
  };

  const handlePathCreated = async (newPath: StudyPath) => {
    const fullPath: StudyPath = {
      ...newPath,
      userId: user?.id || "guest",
    };

    setPaths((prev) => [fullPath, ...prev]);
    setActivePathId(fullPath.id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ACTIVE_PATH_KEY, fullPath.id);
      } catch {}
    }
    setShowAIStudio(false);
    setActiveTab("paths");

    // Persist to Supabase if logged in
    if (user) {
      try {
        await supabase.from("study_paths").insert({
          id: fullPath.id,
          user_id: user.id,
          title: fullPath.title,
          description: fullPath.description,
          depth_mode: fullPath.depthMode,
          upload_mode: fullPath.uploadMode,
          source_files: fullPath.sourceFiles,
          sections: fullPath.sections,
          total_lessons: fullPath.totalLessons,
          completed_lessons: 0,
          xp_earned: 0,
          is_active: true,
        });
      } catch {}
    }
  };

  const handleDeletePath = async (pathId: string) => {
    setPaths((prev) => prev.filter((p) => p.id !== pathId));
    if (activePathId === pathId) {
      const remaining = paths.filter((p) => p.id !== pathId);
      const nextId = remaining[0]?.id;
      setActivePathId(nextId);
      if (typeof window !== "undefined" && nextId) {
        try {
          localStorage.setItem(STORAGE_ACTIVE_PATH_KEY, nextId);
        } catch {}
      }
    }

    if (user) {
      try {
        await supabase.from("study_paths").delete().eq("id", pathId);
      } catch {}
    }
  };

  const handleDuplicatePath = async (pathId: string) => {
    const target = paths.find((p) => p.id === pathId);
    if (!target) return;

    const dupId = "path_" + Math.random().toString(36).substring(2, 9);
    
    // Deep clone sections and lessons with fresh unique IDs
    const clonedSections = (target.sections || []).map((sec, secIdx) => {
      const newSecId = `sec_${secIdx + 1}_${Math.random().toString(36).substring(2, 6)}`;
      const clonedLessons = (sec.lessons || []).map((les, lesIdx) => {
        const newLesId = `les_${secIdx + 1}_${lesIdx + 1}_${Math.random().toString(36).substring(2, 7)}`;
        return {
          ...les,
          id: newLesId,
          sectionId: newSecId,
          pathId: dupId,
          completed: false,
          score: undefined,
          completedAt: undefined,
        };
      });

      return {
        ...sec,
        id: newSecId,
        pathId: dupId,
        lessons: clonedLessons,
      };
    });

    const duplicated: StudyPath = {
      ...target,
      id: dupId,
      title: `${target.title} (Copy)`,
      sections: clonedSections,
      completedLessons: 0,
      xpEarned: 0,
      isActive: false,
      createdAt: new Date().toISOString(),
      lastStudiedAt: new Date().toISOString(),
    };

    setPaths((prev) => [duplicated, ...prev]);

    if (user) {
      try {
        await supabase.from("study_paths").insert({
          id: duplicated.id,
          user_id: user.id,
          title: duplicated.title,
          description: duplicated.description,
          depth_mode: duplicated.depthMode,
          upload_mode: duplicated.uploadMode,
          source_files: duplicated.sourceFiles,
          sections: duplicated.sections,
          total_lessons: duplicated.totalLessons,
          completed_lessons: 0,
          xp_earned: 0,
          is_active: false,
        });
      } catch {}
    }
  };

  const handleRenamePath = async (pathId: string, newTitle: string, newDescription?: string) => {
    setPaths((prev) =>
      prev.map((p) =>
        p.id === pathId ? { ...p, title: newTitle, description: newDescription ?? p.description } : p
      )
    );

    if (user) {
      try {
        await supabase
          .from("study_paths")
          .update({
            title: newTitle,
            description: newDescription,
            last_studied_at: new Date().toISOString(),
          })
          .eq("id", pathId);
      } catch {}
    }
  };

  // Lesson Completion Handler
  const handleLessonComplete = async (score: number, xpEarned: number, newMistakes: StudyMistake[]) => {
    if (!activeLesson) return;

    const targetPath = paths.find((p) => p.id === activeLesson.pathId) || activePath;
    if (!targetPath) return;

    // Update section/lesson completed status
    const updatedSections = targetPath.sections.map((sec) => ({
      ...sec,
      lessons: sec.lessons.map((les) =>
        les.id === activeLesson.id ? { ...les, completed: true, score } : les
      ),
    }));

    const newCompletedCount = updatedSections.reduce(
      (acc, sec) => acc + sec.lessons.filter((l) => l.completed).length,
      0
    );
    const newXpEarned = (targetPath.xpEarned || 0) + xpEarned;

    const updatedPath: StudyPath = {
      ...targetPath,
      sections: updatedSections,
      completedLessons: newCompletedCount,
      xpEarned: newXpEarned,
      lastStudiedAt: new Date().toISOString(),
    };

    setPaths((prev) => prev.map((p) => (p.id === updatedPath.id ? updatedPath : p)));

    // Streak & XP updates
    const todayStr = new Date().toISOString().split("T")[0];
    const activeDays = new Set(stats.activeDays || []);
    activeDays.add(todayStr);

    let newStreak = stats.streakCount;
    if (stats.lastStudiedDate !== todayStr) {
      newStreak = (stats.streakCount || 0) + 1;
    }
    const newLongest = Math.max(stats.longestStreak || 0, newStreak);
    const newTotalXp = (stats.totalXp || 0) + xpEarned;

    const newStats: StudyStats = {
      totalXp: newTotalXp,
      streakCount: newStreak,
      longestStreak: newLongest,
      lastStudiedDate: todayStr,
      activeDays: Array.from(activeDays),
    };
    setStats(newStats);

    // Save mistakes
    if (newMistakes.length > 0) {
      setMistakes((prev) => [...newMistakes, ...prev]);
    }

    setActiveLesson(null);

    // Persist to Supabase if logged in
    if (user) {
      try {
        await supabase
          .from("study_paths")
          .update({
            sections: updatedSections,
            completed_lessons: newCompletedCount,
            xp_earned: newXpEarned,
            last_studied_at: new Date().toISOString(),
          })
          .eq("id", updatedPath.id);

        await supabase
          .from("profiles")
          .update({
            study_xp: newTotalXp,
            study_streak: newStreak,
            study_longest_streak: newLongest,
            study_last_date: todayStr,
            study_active_days: Array.from(activeDays),
          })
          .eq("id", user.id);

        if (newMistakes.length > 0) {
          const insertM = newMistakes.map((m) => ({
            id: m.id,
            user_id: user.id,
            path_id: m.pathId,
            lesson_id: m.lessonId,
            question_type: m.questionType,
            question_prompt: m.questionPrompt,
            options: m.options,
            correct_answer: m.correctAnswer,
            user_answer: m.userAnswer,
            explanation: m.explanation,
          }));
          await supabase.from("study_mistakes").insert(insertM);
        }
      } catch {}
    }
  };

  const handleRemoveMistake = async (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
    if (user) {
      try {
        await supabase.from("study_mistakes").delete().eq("id", id);
      } catch {}
    }
  };

  // DSA Way Handlers
  const handleToggleDSAProblemCompleted = async (problem: DSAProblem, trackId: string) => {
    const current = dsaProgressMap[problem.id];
    const isCurrentlyDone = current?.status === "completed";
    const nextStatus = isCurrentlyDone ? "not_started" : "completed";

    const updated: UserDSAProgressMap = {
      ...dsaProgressMap,
      [problem.id]: {
        status: nextStatus,
        isStarred: current?.isStarred || false,
        notes: current?.notes || "",
      },
    };

    setDsaProgressMap(updated);

    const xpAmount = problem.difficulty === "Easy" ? 15 : problem.difficulty === "Medium" ? 25 : 40;
    const xpDelta = isCurrentlyDone ? -xpAmount : xpAmount;

    const todayStr = new Date().toISOString().split("T")[0];
    const activeDays = new Set(stats.activeDays || []);
    if (!isCurrentlyDone) {
      activeDays.add(todayStr);
    }

    let newStreak = stats.streakCount;
    if (!isCurrentlyDone && stats.lastStudiedDate !== todayStr) {
      newStreak = (stats.streakCount || 0) + 1;
    }
    const newLongest = Math.max(stats.longestStreak || 0, newStreak);
    const newTotalXp = Math.max(0, (stats.totalXp || 0) + xpDelta);

    const newStats: StudyStats = {
      totalXp: newTotalXp,
      streakCount: newStreak,
      longestStreak: newLongest,
      lastStudiedDate: !isCurrentlyDone ? todayStr : stats.lastStudiedDate,
      activeDays: Array.from(activeDays),
    };
    setStats(newStats);

    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({
            study_xp: newTotalXp,
            study_streak: newStreak,
            study_longest_streak: newLongest,
            study_last_date: !isCurrentlyDone ? todayStr : stats.lastStudiedDate,
            study_active_days: Array.from(activeDays),
          })
          .eq("id", user.id);
      } catch {}
    }

    if (user) {
      try {
        const rowId = `${user.id}_${problem.id}`;
        if (nextStatus === "completed" || current?.isStarred || current?.notes) {
          await supabase.from("user_dsa_progress").upsert({
            id: rowId,
            user_id: user.id,
            track_id: trackId,
            problem_id: problem.id,
            status: nextStatus,
            is_starred: current?.isStarred || false,
            notes: current?.notes || "",
            updated_at: new Date().toISOString(),
          });
        } else {
          await supabase.from("user_dsa_progress").delete().eq("id", rowId);
        }
      } catch {}
    }
  };

  const handleToggleDSAProblemStarred = async (problem: DSAProblem, trackId: string) => {
    const current = dsaProgressMap[problem.id];
    const nextStarred = !Boolean(current?.isStarred);

    const updated: UserDSAProgressMap = {
      ...dsaProgressMap,
      [problem.id]: {
        status: current?.status || "not_started",
        isStarred: nextStarred,
        notes: current?.notes || "",
      },
    };

    setDsaProgressMap(updated);

    if (nextStarred) {
      const revisionItem: StudyMistake = {
        id: "revision_" + problem.id,
        pathId: trackId,
        lessonId: problem.id,
        questionType: "short_answer",
        questionPrompt: `[Revision Queue] ${problem.title} (${problem.difficulty})`,
        correctAnswer: problem.keyTakeaway,
        userAnswer: "Flagged for Revision in DSA Way",
        explanation: problem.summary,
        createdAt: new Date().toISOString(),
      };
      setMistakes((prev) => [revisionItem, ...prev.filter((m) => m.id !== revisionItem.id)]);
    }

    if (user) {
      try {
        const rowId = `${user.id}_${problem.id}`;
        await supabase.from("user_dsa_progress").upsert({
          id: rowId,
          user_id: user.id,
          track_id: trackId,
          problem_id: problem.id,
          status: current?.status || "not_started",
          is_starred: nextStarred,
          notes: current?.notes || "",
          updated_at: new Date().toISOString(),
        });
      } catch {}
    }
  };

  const handleSaveDSAProblemNotes = async (problemId: string, notes: string) => {
    const current = dsaProgressMap[problemId];
    const updated: UserDSAProgressMap = {
      ...dsaProgressMap,
      [problemId]: {
        status: current?.status || "not_started",
        isStarred: current?.isStarred || false,
        notes,
      },
    };

    setDsaProgressMap(updated);

    if (user) {
      try {
        const rowId = `${user.id}_${problemId}`;
        await supabase.from("user_dsa_progress").upsert({
          id: rowId,
          user_id: user.id,
          track_id: "dsa_way",
          problem_id: problemId,
          status: current?.status || "not_started",
          is_starred: current?.isStarred || false,
          notes,
          updated_at: new Date().toISOString(),
        });
      } catch {}
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 pb-4 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-main/40 pb-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Engine</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Study Desk</h1>
            <p className="text-xs text-txt-sub">
              Adaptive AI study paths, bite-sized lessons, DSA curriculum roadmaps, and error bank review.
            </p>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex border border-border-main/80 rounded p-0.5 bg-bg-card/50 self-start font-mono text-[10px] tracking-wider uppercase flex-wrap gap-0.5">
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-3.5 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "progress" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Progress
            </button>

            <button
              onClick={() => setActiveTab("dsa_way")}
              className={`px-3.5 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "dsa_way" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              DSA Way
            </button>

            <button
              onClick={() => setActiveTab("paths")}
              className={`px-3.5 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "paths" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Learning Way
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === "paths" && (
          <LearningPathsView
            paths={paths}
            activePathId={activePathId}
            onSelectActivePath={handleSelectActivePath}
            onCreateNewPathClick={() => setShowAIStudio(true)}
            onDeletePath={handleDeletePath}
            onDuplicatePath={handleDuplicatePath}
            onRenamePath={handleRenamePath}
            onStartLesson={(lesson) => setActiveLesson(lesson)}
          />
        )}

        {activeTab === "dsa_way" && (
          <DSASystemMasteryView
            progressMap={dsaProgressMap}
            onToggleProblemCompleted={handleToggleDSAProblemCompleted}
            onToggleProblemStarred={handleToggleDSAProblemStarred}
            onSaveProblemNotes={handleSaveDSAProblemNotes}
            totalXpEarned={stats.totalXp}
          />
        )}

        {activeTab === "progress" && (
          <ProgressDashboardView
            stats={stats}
            paths={paths}
            mistakes={mistakes}
            onOpenErrorBank={() => setShowErrorBank(true)}
            onResumePath={handleSelectActivePath}
          />
        )}
      </main>

      {/* Modal Overlays */}
      {showAIStudio && (
        <AIPathStudioModal
          onClose={() => setShowAIStudio(false)}
          onPathCreated={handlePathCreated}
        />
      )}

      {activeLesson && (
        <SessionPlayer
          lesson={activeLesson}
          onComplete={handleLessonComplete}
          onExit={() => setActiveLesson(null)}
        />
      )}

      {showErrorBank && (
        <ErrorBankModal
          mistakes={mistakes}
          onRemoveMistake={handleRemoveMistake}
          onClose={() => setShowErrorBank(false)}
        />
      )}

      <Footer />
    </div>
  );
}
