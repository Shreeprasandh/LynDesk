"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Check,
  PenLine
} from "lucide-react";
import { 
  WallEvent, 
  fetchWallCalendarEvents, 
  addWallCalendarEvent, 
  deleteWallCalendarEvent 
} from "../lib/wallCalendarSync";
import { MONTH_IMAGES, MONTH_NAMES } from "../lib/monthImages";

interface WallCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface CalendarCell {
  date: Date;
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number;
}

const WEEKDAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const CATEGORY_COLORS: Record<WallEvent["category"], { bg: string; text: string; border: string }> = {
  contest: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  deadline: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  study: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  opportunity: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  reminder: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30" },
};

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const monthFlipVariants = {
  enter: (direction: "next" | "prev") => ({
    rotateX: direction === "next" ? -20 : 20,
    y: direction === "next" ? 20 : -20,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    rotateX: 0,
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: "next" | "prev") => ({
    rotateX: direction === "next" ? 20 : -20,
    y: direction === "next" ? -20 : 20,
    opacity: 0,
    scale: 0.98,
  }),
};

export default function WallCalendarModal({ isOpen, onClose, userId }: WallCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [navDirection, setNavDirection] = useState<"next" | "prev">("next");
  const [events, setEvents] = useState<WallEvent[]>([]);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [monthlyMemo, setMonthlyMemo] = useState<string>("");

  // Add Event Form Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [newCategory, setNewCategory] = useState<WallEvent["category"]>("reminder");
  const [newDescription, setNewDescription] = useState("");

  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthHeroImage = MONTH_IMAGES[currentMonthIndex];

  const loadEvents = React.useCallback(async () => {
    const loaded = await fetchWallCalendarEvents(userId);
    setEvents(loaded);
  }, [userId]);

  // Preload all 12 month images into RAM for 0ms fetch latency
  useEffect(() => {
    if (typeof window !== "undefined") {
      MONTH_IMAGES.forEach((img) => {
        const i = new window.Image();
        i.src = img.src;
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      loadEvents();
    });

    // Load monthly memo from local storage (scoped per user) — Fix #5: separate from loadEvents microtask
    if (typeof window !== "undefined") {
      try {
        const userPrefix = userId || "guest";
        const key = `ldk_wall_calendar_memo_${userPrefix}_${currentYear}_${currentMonthIndex}`;
        const storedMemo = localStorage.getItem(key) || localStorage.getItem(`ldk_wall_calendar_memo_${currentYear}_${currentMonthIndex}`);
        // Use separate queueMicrotask (not nested) to satisfy lint & avoid cascading renders
        const memo = storedMemo || "";
        queueMicrotask(() => setMonthlyMemo(memo));
      } catch {}
    }

    const handleUpdate = () => loadEvents();
    window.addEventListener("ldk_wall_calendar_update", handleUpdate);
    return () => window.removeEventListener("ldk_wall_calendar_update", handleUpdate);
  }, [isOpen, loadEvents, currentMonthIndex, currentYear, userId]);

  const handleMonthlyMemoChange = (text: string) => {
    setMonthlyMemo(text);
    if (typeof window !== "undefined") {
      try {
        const userPrefix = userId || "guest";
        const key = `ldk_wall_calendar_memo_${userPrefix}_${currentYear}_${currentMonthIndex}`;
        localStorage.setItem(key, text);
      } catch {}
    }
  };

  const handlePrevMonth = () => {
    setNavDirection("prev");
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDirection("next");
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const handleJumpMonth = (idx: number) => {
    setNavDirection(idx > currentMonthIndex ? "next" : "prev");
    setCurrentDate(new Date(currentYear, idx, 1));
  };

  const handleToday = () => {
    setNavDirection("next");
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(toDateString(today));
  };

  const handleOpenAddModal = (dateStr?: string) => {
    setNewTitle("");
    setNewDate(dateStr || selectedDateStr || toDateString(new Date()));
    setNewTime("12:00");
    setNewCategory("reminder");
    setNewDescription("");
    setIsAddModalOpen(true);
  };

  const handleCellClick = (cellDateStr: string) => {
    // Fix #2 & #6: toggle selection only — do not auto-open add modal
    setSelectedDateStr((prev) => (prev === cellDateStr ? null : cellDateStr));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    await addWallCalendarEvent(
      {
        title: newTitle.trim(),
        date: newDate,
        time: newTime || undefined,
        category: newCategory,
        description: newDescription.trim() || undefined,
        source_type: "custom",
      },
      userId
    );

    setIsAddModalOpen(false);
    loadEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteWallCalendarEvent(id, userId);
    loadEvents();
  };

  // Generate 42-day calendar matrix (6 weeks layout, Monday start)
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  let dayOfWeek = firstDayOfMonth.getDay() - 1;
  if (dayOfWeek < 0) dayOfWeek = 6;

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - dayOfWeek);

  const todayStr = toDateString(new Date());
  const calendarMatrix: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = toDateString(d);

    calendarMatrix.push({
      date: d,
      dateStr,
      dayNum: d.getDate(),
      isCurrentMonth: d.getMonth() === currentMonthIndex,
      isToday: dateStr === todayStr,
      dayOfWeek: d.getDay(),
    });
  }

  // Group events by date & filter by active category
  const filteredEvents = useMemo(() => {
    if (categoryFilter === "all") return events;
    return events.filter((e) => e.category === categoryFilter);
  }, [events, categoryFilter]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, WallEvent[]> = {};
    filteredEvents.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [filteredEvents]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Wall Calendar"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Physical Calendar Card Wrapper with Proportional Scaling */}
      <div 
        className="relative z-10 w-full max-w-[820px] scale-[0.88] sm:scale-[0.94] md:scale-100 origin-center bg-bg-surface border border-border-main/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto transition-transform"
        style={{ perspective: "1500px" }}
      >
        {/* Top Metallic Binder-Ring Bar */}
        <div className="bg-bg-card/90 border-b border-border-main/60 py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CalendarIcon size={14} className="text-accent-main" />
            <span className="font-display text-xs font-semibold text-txt-main">
              Wall<span className="opacity-60 font-normal">Calendar</span>
            </span>
          </div>

          {/* 12 Interactive Binder Rings */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {Array.from({ length: 12 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleJumpMonth(idx)}
                title={`Jump to ${MONTH_NAMES[idx]}`}
                aria-label={`Jump to ${MONTH_NAMES[idx]}`}
                className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-border-main transition-all cursor-pointer ${
                  currentMonthIndex === idx
                    ? "bg-accent-main border-accent-main shadow-xs scale-110"
                    : "bg-bg-base hover:border-txt-main/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 3D Page-Flip Month Animator */}
        <AnimatePresence mode="popLayout" initial={false} custom={navDirection}>
          <motion.div
            key={`${currentYear}-${currentMonthIndex}`}
            custom={navDirection}
            variants={monthFlipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{ 
              transformOrigin: "top center", 
              width: "100%",
              willChange: "transform, opacity",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
              
              {/* Left-Side Month Hero Artwork Panel (4 cols) */}
              <div className="md:col-span-4 relative min-h-[180px] md:min-h-[440px] overflow-hidden border-b md:border-b-0 md:border-r border-border-main/50">
                <Image
                  src={monthHeroImage.src}
                  alt={monthHeroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
                {/* Hero Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Curved Chevron Wave SVG Overlay */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                  <svg
                    viewBox="0 0 340 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto block opacity-90"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 45 L120 10 L200 45 L340 5 L340 70 L0 70 Z"
                      fill="#121212"
                      fillOpacity="0.8"
                    />
                    <path
                      d="M0 55 L100 20 L200 55 L340 15 L340 70 L0 70 Z"
                      fill="#18181b"
                      fillOpacity="0.95"
                    />
                  </svg>
                </div>

                {/* Month & Year Typography Tag */}
                <div className="absolute bottom-4 right-4 text-right z-10">
                  <span className="font-mono text-xs text-white/70 block tracking-widest">
                    {currentYear}
                  </span>
                  <span className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-wide block uppercase drop-shadow-md">
                    {MONTH_NAMES[currentMonthIndex]}
                  </span>
                </div>
              </div>

              {/* Right-Side Interactive Calendar Grid & Notes (8 cols) */}
              <div className="md:col-span-8 p-5 md:p-6 flex flex-col justify-between space-y-4">
                
                {/* Top Controls Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border-main/40">
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 rounded border border-border-main/70 hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <h3 className="font-display text-base font-semibold text-txt-main">
                      {MONTH_NAMES[currentMonthIndex]} {currentYear}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 rounded border border-border-main/70 hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToday}
                      className="px-2.5 py-1 bg-bg-card hover:bg-border-main/30 border border-border-main text-txt-main font-mono text-[10px] uppercase font-semibold rounded cursor-pointer transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleOpenAddModal()}
                      className="px-3 py-1 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] uppercase font-semibold rounded cursor-pointer transition-opacity flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Event
                    </button>
                  </div>
                </div>

                {/* Category Filter Badges */}
                <div className="flex flex-wrap gap-1 font-mono text-[9px] uppercase tracking-wider">
                  {["all", "contest", "deadline", "opportunity", "study", "reminder"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer border ${
                        categoryFilter === cat
                          ? "bg-accent-main text-bg-base font-bold border-accent-main"
                          : "bg-bg-base text-txt-muted border-border-main/50 hover:text-txt-main"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Weekday Labels Header */}
                <div className="grid grid-cols-7 text-center font-mono text-[9px] uppercase tracking-wider text-txt-muted pb-1 border-b border-border-main/20">
                  {WEEKDAY_NAMES.map((w, idx) => (
                    <span key={w} className={idx >= 5 ? "text-accent-main font-semibold" : ""}>
                      {w}
                    </span>
                  ))}
                </div>

                {/* 42-Cell Physical Paper Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-fr gap-1 flex-1 relative">
                  {calendarMatrix.map((cell: CalendarCell) => {
                    const dayEvts = eventsByDate[cell.dateStr] || [];
                    const isHovered = hoveredDateStr === cell.dateStr;
                    const isSelected = selectedDateStr === cell.dateStr;

                    return (
                      <div
                        key={cell.dateStr}
                        onMouseEnter={() => setHoveredDateStr(cell.dateStr)}
                        onMouseLeave={() => setHoveredDateStr(null)}
                        onClick={() => handleCellClick(cell.dateStr)}
                        className={`min-h-[50px] md:min-h-[56px] p-1.5 border rounded flex flex-col justify-between transition-all cursor-pointer relative ${
                          cell.isToday
                            ? "border-accent-main bg-accent-main/10 font-bold shadow-xs"
                            : isSelected
                            ? "border-txt-main/70 bg-bg-card ring-1 ring-txt-main/20"
                            : cell.isCurrentMonth
                            ? "border-border-main/40 bg-bg-base/60 hover:bg-bg-card hover:border-border-main"
                            : "border-border-main/20 bg-bg-base/20 opacity-30"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className={cell.isToday ? "text-accent-main font-bold" : "text-txt-main"}>
                            {cell.dayNum}
                          </span>
                          {dayEvts.length > 0 && (
                            <span className="text-[8px] bg-accent-main text-bg-base px-1.5 py-0.2 rounded font-bold font-mono">
                              {dayEvts.length}
                            </span>
                          )}
                        </div>

                        {/* Day Event Dots / Small Badges */}
                        <div className="space-y-0.5 mt-0.5 overflow-hidden">
                          {dayEvts.slice(0, 2).map((evt) => {
                            const style = CATEGORY_COLORS[evt.category];
                            return (
                              <div
                                key={evt.id}
                                className={`px-1 py-0.2 rounded text-[8px] font-mono truncate border ${style.bg} ${style.text} ${style.border}`}
                              >
                                {evt.title}
                              </div>
                            );
                          })}
                          {dayEvts.length > 2 && (
                            <div className="text-[7px] font-mono text-txt-muted pl-0.5">
                              +{dayEvts.length - 2} more
                            </div>
                          )}
                        </div>

                        {/* Hover: "+" quick-add button — Fix #2: only way to open add modal per-cell */}
                        {isHovered && cell.isCurrentMonth && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddModal(cell.dateStr);
                            }}
                            className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-accent-main text-bg-base rounded-full opacity-90 hover:opacity-100 transition-opacity z-20"
                            title={`Add event on ${cell.dateStr}`}
                          >
                            <Plus size={9} />
                          </button>
                        )}

                        {/* Hover Inspector Tooltip Popover */}
                        {isHovered && dayEvts.length > 0 && (
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-52 bg-bg-surface border border-border-main/90 p-2.5 rounded-md shadow-2xl space-y-1.5 pointer-events-none animate-fade-in">
                            <div className="font-mono text-[9px] text-accent-main uppercase font-bold border-b border-border-main/30 pb-1">
                              {cell.dateStr} ({dayEvts.length} scheduled)
                            </div>
                            <div className="space-y-1 max-h-36 overflow-y-auto">
                              {dayEvts.map((e) => (
                                <div key={e.id} className="text-[11px] space-y-0.5 border-b border-border-main/20 pb-1 last:border-0">
                                  <span className="font-semibold text-txt-main block">{e.title}</span>
                                  {e.time && (
                                    <span className="text-[9px] text-txt-muted font-mono block">Time: {e.time}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Monthly Memo Pad & Active Day List */}
                <div className="pt-3 border-t border-border-main/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-txt-sub flex items-center gap-1 font-semibold">
                      <PenLine size={12} className="text-accent-main" /> Monthly Memo & Notes
                    </span>
                    {selectedDateStr && (
                      <span className="font-mono text-[9px] text-accent-main font-bold">
                        Selected: {selectedDateStr}
                      </span>
                    )}
                  </div>

                  {selectedDateStr && (eventsByDate[selectedDateStr] || []).length > 0 ? (
                    <div className="p-2.5 border border-border-main/60 bg-bg-base/70 rounded-md space-y-1.5 max-h-28 overflow-y-auto font-mono text-xs">
                      {(eventsByDate[selectedDateStr] || []).map((evt) => (
                        <div key={evt.id} className="flex items-center justify-between border-b border-border-main/30 pb-1 last:border-0">
                          <span className="text-txt-main font-semibold truncate">{evt.title}</span>
                          {!evt.isAutoSynced && (
                            <button
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="text-txt-muted hover:text-rose-400 p-0.5 cursor-pointer shrink-0"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={monthlyMemo}
                      onChange={(e) => handleMonthlyMemoChange(e.target.value)}
                      placeholder="Type monthly memo notes here..."
                      className="w-full p-2 bg-bg-base/60 border border-border-main/60 rounded text-xs text-txt-main focus:border-accent-main focus:outline-hidden font-sans resize-none"
                    />
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Schedule Event Form Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-main/90 rounded-md p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-accent-main" />
                <h3 className="font-display text-lg font-normal text-txt-main">Schedule New Event</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-txt-muted hover:text-txt-main p-1 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Codeforces Global Round 28"
                  className="w-full px-3 py-2 bg-bg-base border border-border-main/80 rounded text-xs text-txt-main focus:border-accent-main focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-base border border-border-main/80 rounded text-xs text-txt-main focus:border-accent-main focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-base border border-border-main/80 rounded text-xs text-txt-main focus:border-accent-main focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as WallEvent["category"])}
                  className="w-full px-3 py-2 bg-bg-base border border-border-main/80 rounded text-xs text-txt-main focus:border-accent-main focus:outline-hidden font-mono"
                >
                  <option value="reminder">Personal Reminder</option>
                  <option value="contest">Coding Contest</option>
                  <option value="deadline">Academic Deadline</option>
                  <option value="study">Study Session</option>
                  <option value="opportunity">Job / Internship Opportunity</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-txt-muted font-bold block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Additional notes or link details..."
                  className="w-full px-3 py-2 bg-bg-base border border-border-main/80 rounded text-xs text-txt-main focus:border-accent-main focus:outline-hidden font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase font-semibold rounded cursor-pointer transition-opacity flex items-center gap-1.5"
                >
                  <Check size={14} /> Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
