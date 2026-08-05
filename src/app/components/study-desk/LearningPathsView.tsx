"use client";

import React, { useState } from "react";
import { StudyPath } from "../../study-desk/types";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  MoreVertical,
  Play
} from "lucide-react";

interface LearningPathsViewProps {
  paths: StudyPath[];
  activePathId?: string;
  onSelectActivePath: (pathId: string) => void;
  onCreateNewPathClick: () => void;
  onDeletePath: (pathId: string) => void;
  onDuplicatePath: (pathId: string) => void;
}

export default function LearningPathsView({
  paths,
  activePathId,
  onSelectActivePath,
  onCreateNewPathClick,
  onDeletePath,
  onDuplicatePath,
}: LearningPathsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredPaths = paths.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Search & Create Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning paths..."
            className="w-full h-10 pl-9 pr-4 border border-border-main/80 bg-bg-surface text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
          />
        </div>

        <button
          onClick={onCreateNewPathClick}
          className="w-full sm:w-auto h-10 px-5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={14} /> New Learning Path
        </button>
      </div>

      {/* Grid of Learning Paths */}
      {filteredPaths.length === 0 ? (
        <div className="border border-border-main/70 bg-bg-surface p-10 rounded-md flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bg-card border border-border-main/60 flex items-center justify-center text-txt-muted">
            <BookOpen size={20} />
          </div>
          <h3 className="font-display text-lg font-light text-txt-main">No Learning Paths Found</h3>
          <p className="text-xs text-txt-sub font-light max-w-sm">
            {searchQuery ? "No paths match your search term." : "Upload notes or slides to generate your first AI study path."}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNewPathClick}
              className="mt-2 h-9 px-4 bg-accent-main text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer"
            >
              + Create Learning Path
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPaths.map((path) => {
            const isActive = path.id === activePathId;
            const percent =
              path.totalLessons > 0 ? Math.round((path.completedLessons / path.totalLessons) * 100) : 0;

            return (
              <div
                key={path.id}
                className={`border bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-4 transition-all relative ${
                  isActive ? "border-accent-main/80 ring-1 ring-accent-main/30" : "border-border-main/70 hover:border-border-main"
                }`}
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-accent-main/10 border border-accent-main/30 font-mono text-[9px] text-accent-main uppercase rounded">
                        {path.depthMode || "STANDARD"}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 font-mono text-[9px] text-emerald-400 uppercase rounded">
                          ACTIVE PATH
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-light text-txt-main line-clamp-1">{path.title}</h3>
                    {path.description && (
                      <p className="text-xs text-txt-sub font-light line-clamp-2">{path.description}</p>
                    )}
                  </div>

                  {/* Options Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === path.id ? null : path.id)}
                      className="p-1 text-txt-muted hover:text-txt-main cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {menuOpenId === path.id && (
                      <div className="absolute right-0 top-6 w-36 bg-bg-surface border border-border-main/80 rounded shadow-xl py-1 z-20 font-mono text-[10px]">
                        <button
                          onClick={() => {
                            onDuplicatePath(path.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-txt-main hover:bg-bg-card flex items-center gap-2 cursor-pointer"
                        >
                          <Copy size={12} /> Duplicate
                        </button>

                        <button
                          onClick={() => {
                            onDeletePath(path.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-3 pt-2 border-t border-border-main/40">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-txt-muted uppercase">
                      <span>Progress ({path.completedLessons}/{path.totalLessons})</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-card border border-border-main/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-main rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-accent-main font-semibold">
                      ⚡ +{path.xpEarned || 0} XP
                    </span>

                    <button
                      onClick={() => onSelectActivePath(path.id)}
                      className="h-8 px-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase font-semibold rounded flex items-center gap-1 cursor-pointer transition-opacity"
                    >
                      <Play size={10} className="fill-bg-base" /> {isActive ? "Resume Path" : "Set Active"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
