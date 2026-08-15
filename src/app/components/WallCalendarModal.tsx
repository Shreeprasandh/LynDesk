"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  ExternalLink,
  Check
} from "lucide-react";
import { 
  WallEvent, 
  fetchWallCalendarEvents, 
  addWallCalendarEvent, 
  deleteWallCalendarEvent 
} from "../lib/wallCalendarSync";

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

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export default function WallCalendarModal({ isOpen, onClose, userId }: WallCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<WallEvent[]>([]);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Add Event Form Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [newCategory, setNewCategory] = useState<WallEvent["category"]>("reminder");
  const [newDescription, setNewDescription] = useState("");

  const loadEvents = async () => {
    const loaded = await fetchWallCalendarEvents(userId);
    setEvents(loaded);
  };

  useEffect(() => {
    if (!isOpen) return;
    loadEvents();

    const handleUpdate = () => loadEvents();
    window.addEventListener("ldk_wall_calendar_update", handleUpdate);
    return () => window.removeEventListener("ldk_wall_calendar_update", handleUpdate);
  }, [isOpen, userId]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(toDateString(new Date()));
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
    setSelectedDateStr(cellDateStr);
    handleOpenAddModal(cellDateStr);
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
  const calendarMatrix: CalendarCell[] = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    
    let dayOfWeek = firstDayOfMonth.getDay() - 1;
    if (dayOfWeek < 0) dayOfWeek = 6;

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - dayOfWeek);

    const todayStr = toDateString(new Date());
    const days: CalendarCell[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = toDateString(d);

      days.push({
        date: d,
        dateStr,
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        isToday: dateStr === todayStr,
        dayOfWeek: d.getDay(),
      });
    }

    return days;
  }, [currentDate]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main WallCalendar Modal Container */}
      <div className="absolute inset-4 md:inset-8 z-10 bg-bg-surface border border-border-main/90 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-border-main/40 flex items-center justify-between bg-bg-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-main/10 border border-accent-main/30 rounded">
              <CalendarIcon size={18} className="text-accent-main" />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-semibold block">
                Live Scheduler & Event Desk
              </span>
              <h2 className="font-display text-xl font-light text-txt-main">WallCalendar</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-3.5 py-1.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase font-semibold rounded cursor-pointer transition-opacity flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} /> Schedule Event
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body: Calendar Grid (Left 8 cols) + Event Feed (Right 4 cols) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Interactive Month Grid */}
          <div className="lg:col-span-8 p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-border-main/40 overflow-y-auto">
            
            {/* Controls: Month Switcher & Today */}
            <div className="flex items-center justify-between pb-4 border-b border-border-main/30 mb-4">
              <div className="flex items-center gap-3 font-mono">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded border border-border-main/70 hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <h3 className="font-display text-lg font-semibold text-txt-main">
                  {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded border border-border-main/70 hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={handleToday}
                className="px-3 py-1 bg-bg-card hover:bg-border-main/30 border border-border-main text-txt-main font-mono text-[10px] uppercase font-semibold rounded cursor-pointer transition-colors"
              >
                Today
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 text-center font-mono text-[10px] uppercase tracking-wider text-txt-muted pb-2 border-b border-border-main/20">
              {WEEKDAY_NAMES.map((w, idx) => (
                <span key={w} className={idx >= 5 ? "text-accent-main font-semibold" : ""}>
                  {w}
                </span>
              ))}
            </div>

            {/* 42-Cell Month Grid */}
            <div className="grid grid-cols-7 auto-rows-fr gap-1 pt-2 flex-1 relative">
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
                    className={`min-h-[70px] md:min-h-[85px] p-2 border rounded flex flex-col justify-between transition-all cursor-pointer relative ${
                      cell.isToday
                        ? "border-accent-main bg-accent-main/5 font-bold shadow-xs"
                        : cell.isCurrentMonth
                        ? "border-border-main/40 bg-bg-base/50 hover:bg-bg-card hover:border-border-main"
                        : "border-border-main/20 bg-bg-base/20 opacity-40"
                    } ${isSelected ? "ring-2 ring-accent-main bg-accent-main/10" : ""}`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className={cell.isToday ? "text-accent-main font-bold" : "text-txt-main"}>
                        {cell.dayNum}
                      </span>
                      {dayEvts.length > 0 && (
                        <span className="text-[9px] bg-accent-main text-bg-base px-1.5 py-0.2 rounded font-bold font-mono">
                          {dayEvts.length}
                        </span>
                      )}
                    </div>

                    {/* Day Event Dots / Small Badges */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayEvts.slice(0, 2).map((evt) => {
                        const style = CATEGORY_COLORS[evt.category];
                        return (
                          <div
                            key={evt.id}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono truncate border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvts.length > 2 && (
                        <div className="text-[8px] font-mono text-txt-muted pl-1">
                          +{dayEvts.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Hover Inspector Tooltip Popover */}
                    {isHovered && dayEvts.length > 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 bg-bg-surface border border-border-main/90 p-3 rounded-md shadow-2xl space-y-2 pointer-events-none animate-fade-in">
                        <div className="font-mono text-[10px] text-accent-main uppercase font-bold border-b border-border-main/30 pb-1">
                          {cell.dateStr} ({dayEvts.length} scheduled)
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {dayEvts.map((e) => (
                            <div key={e.id} className="text-xs space-y-0.5 border-b border-border-main/20 pb-1.5 last:border-0">
                              <span className="font-semibold text-txt-main block">{e.title}</span>
                              {e.time && (
                                <span className="text-[9px] text-txt-muted font-mono block">⏰ {e.time}</span>
                              )}
                              {e.description && (
                                <p className="text-[10px] text-txt-sub font-light line-clamp-2">{e.description}</p>
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
          </div>

          {/* Right Column: Active Date / Filter & Upcoming Event List */}
          <div className="lg:col-span-4 p-6 bg-bg-card/30 flex flex-col overflow-y-auto space-y-4">
            
            <div className="border-b border-border-main/40 pb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-light text-txt-main">
                {selectedDateStr ? `Events for ${selectedDateStr}` : "Scheduled Feed"}
              </h3>
              {selectedDateStr && (
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="text-[10px] font-mono text-txt-muted hover:text-txt-main cursor-pointer underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Category Filter Badges */}
            <div className="flex flex-wrap gap-1 font-mono text-[9px] uppercase tracking-wider">
              {["all", "contest", "deadline", "opportunity", "study", "reminder"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer border ${
                    categoryFilter === cat
                      ? "bg-accent-main text-bg-base font-bold border-accent-main"
                      : "bg-bg-surface text-txt-muted border-border-main/60 hover:text-txt-main"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Event List Feed */}
            <div className="space-y-3 flex-1 pt-1">
              {((selectedDateStr ? eventsByDate[selectedDateStr] || [] : filteredEvents)).length > 0 ? (
                (selectedDateStr ? eventsByDate[selectedDateStr] || [] : filteredEvents).map((evt) => {
                  const style = CATEGORY_COLORS[evt.category];
                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 border rounded-md bg-bg-surface/80 space-y-2 relative transition-all ${style.border}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold inline-block border ${style.bg} ${style.text} ${style.border}`}>
                            {evt.category}
                          </span>
                          <h4 className="font-display text-xs font-semibold text-txt-main pt-1">{evt.title}</h4>
                        </div>

                        {!evt.isAutoSynced && (
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="text-txt-muted hover:text-rose-400 p-1 transition-colors cursor-pointer shrink-0"
                            title="Delete Event"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[10px] text-txt-muted">
                        <span>📅 {evt.date}</span>
                        {evt.time && <span>⏰ {evt.time}</span>}
                      </div>

                      {evt.description && (
                        <p className="text-xs text-txt-sub font-light leading-relaxed">
                          {evt.description}
                        </p>
                      )}

                      {evt.link && (
                        <a
                          href={evt.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-accent-main hover:underline pt-1"
                        >
                          Open Link <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-txt-muted font-mono text-xs space-y-2">
                  <CalendarIcon size={24} className="mx-auto text-txt-muted/60" />
                  <p>No events scheduled for this view.</p>
                </div>
              )}
            </div>
          </div>

        </div>
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
                  <option value="reminder">📌 Personal Reminder</option>
                  <option value="contest">🎯 Coding Contest</option>
                  <option value="deadline">⚠️ Academic Deadline</option>
                  <option value="study">📚 Study Session</option>
                  <option value="opportunity">💼 Job / Internship Opportunity</option>
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
