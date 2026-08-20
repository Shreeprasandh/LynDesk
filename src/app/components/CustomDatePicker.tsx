"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "DD / MM / YYYY",
  required = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setInputValue(value || "");
    });
  }, [value]);

  const initialDate = value ? new Date(value) : new Date(2002, 0, 15);
  const [viewYear, setViewYear] = useState<number>(
    isNaN(initialDate.getFullYear()) ? 2002 : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    isNaN(initialDate.getMonth()) ? 0 : initialDate.getMonth()
  );

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        queueMicrotask(() => {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        });
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthsMap = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from({ length: 70 }, (_, i) => currentYearNum - 10 - i);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const handleInputChange = (rawVal: string) => {
    setInputValue(rawVal);
    onChange(rawVal);

    if (rawVal.length >= 8) {
      const d = new Date(rawVal);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  };

  const handleSelectDay = (dayNum: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    setInputValue(dateStr);
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full pl-3 pr-9 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main font-mono placeholder:text-txt-muted/60 transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 p-1 text-txt-muted hover:text-txt-main cursor-pointer transition-colors"
          aria-label="Open Calendar"
        >
          <CalendarIcon size={14} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="absolute z-[9999] top-full mt-1.5 left-0 w-64 p-3 bg-bg-card border border-border-main/90 rounded-md shadow-2xl backdrop-blur-xl font-mono text-xs select-none"
          >
            {/* Header: Month & Year Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-border-main/50 mb-2">
              <div className="flex items-center gap-1.5">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value))}
                  className="bg-bg-surface border border-border-main/70 text-txt-main text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {monthsMap.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value))}
                  className="bg-bg-surface border border-border-main/70 text-txt-main text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear(viewYear - 1);
                    } else {
                      setViewMonth(viewMonth - 1);
                    }
                  }}
                  className="p-1 hover:bg-bg-surface rounded text-txt-muted hover:text-txt-main transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear(viewYear + 1);
                    } else {
                      setViewMonth(viewMonth + 1);
                    }
                  }}
                  className="p-1 hover:bg-bg-surface rounded text-txt-muted hover:text-txt-main transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[9px] text-txt-muted font-bold mb-1">
              <span>SU</span>
              <span>MO</span>
              <span>TU</span>
              <span>WE</span>
              <span>TH</span>
              <span>FR</span>
              <span>SA</span>
            </div>

            {/* Day Tiles Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-6" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedMonth = String(viewMonth + 1).padStart(2, "0");
                const formattedDay = String(dayNum).padStart(2, "0");
                const thisDateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
                const isSelected = value === thisDateStr;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-6 rounded text-[11px] font-medium flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent-main text-bg-base font-bold shadow-xs"
                        : "hover:bg-bg-surface text-txt-sub hover:text-txt-main"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
