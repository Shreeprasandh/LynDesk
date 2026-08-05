"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, RotateCcw, Check, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";

export interface PreferencePreset {
  location: string;
  locationMode: "all" | "local" | "online";
  categoryFocus: "all" | "hackathon" | "contest" | "news";
  academicLevel: "all" | "undergraduate" | "postgraduate";
  travelPreference: "local" | "regional" | "national" | "global";
}

export const DEFAULT_PREFERENCES: PreferencePreset = {
  location: "",
  locationMode: "all",
  categoryFocus: "all",
  academicLevel: "all",
  travelPreference: "global"
};

interface PreferencePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencePresetModal({ isOpen, onClose }: PreferencePresetModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [location, setLocation] = useState("");
  const [locationMode, setLocationMode] = useState<"all" | "local" | "online">("all");
  const [categoryFocus, setCategoryFocus] = useState<"all" | "hackathon" | "contest" | "news">("all");
  const [academicLevel, setAcademicLevel] = useState<"all" | "undergraduate" | "postgraduate">("all");
  const [travelPreference, setTravelPreference] = useState<"local" | "regional" | "national" | "global">("global");

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load preferences from local storage & user metadata
  useEffect(() => {
    if (!isOpen) return;

    let loaded = false;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ldk_preference_preset");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLocation(parsed.location || "");
          setLocationMode(parsed.locationMode || "all");
          setCategoryFocus(parsed.categoryFocus || "all");
          setAcademicLevel(parsed.academicLevel || "all");
          setTravelPreference(parsed.travelPreference || "global");
          loaded = true;
        } catch {}
      }
    }

    if (!loaded && user?.user_metadata) {
      const meta = user.user_metadata;
      if (meta.location) setLocation(meta.location);
      if (meta.preference_preset) {
        const p = meta.preference_preset;
        if (p.locationMode) setLocationMode(p.locationMode);
        if (p.categoryFocus) setCategoryFocus(p.categoryFocus);
        if (p.academicLevel) setAcademicLevel(p.academicLevel);
        if (p.travelPreference) setTravelPreference(p.travelPreference);
      }
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setSaving(true);
    const newPreset: PreferencePreset = {
      location: location.trim(),
      locationMode,
      categoryFocus,
      academicLevel,
      travelPreference
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("ldk_preference_preset", JSON.stringify(newPreset));
      if (location.trim()) {
        localStorage.setItem("ldk_user_location", location.trim());
      }
      window.dispatchEvent(new Event("ldk_preferences_update"));
    }

    if (user?.id) {
      try {
        await supabase.auth.updateUser({
          data: {
            location: location.trim(),
            preference_preset: newPreset
          }
        });
        await supabase.from("profiles").update({
          location: location.trim(),
          preferences: newPreset
        }).eq("id", user.id);
      } catch (err) {
        console.error("Error saving preferences to DB:", err);
      }
    }

    setSaving(false);
    showToast("Preferences saved live!");
    onClose();
  };

  const handleConfirmReset = async () => {
    const defaultPreset = { ...DEFAULT_PREFERENCES };
    setLocation("");
    setLocationMode("all");
    setCategoryFocus("all");
    setAcademicLevel("all");
    setTravelPreference("global");

    if (typeof window !== "undefined") {
      localStorage.removeItem("ldk_preference_preset");
      window.dispatchEvent(new Event("ldk_preferences_update"));
    }

    if (user?.id) {
      try {
        await supabase.auth.updateUser({
          data: {
            preference_preset: defaultPreset
          }
        });
        await supabase.from("profiles").update({
          preferences: defaultPreset
        }).eq("id", user.id);
      } catch (err) {
        console.error("Error resetting preferences in DB:", err);
      }
    }

    setShowConfirmReset(false);
    showToast("Preferences reset to default");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-hidden font-sans text-left">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="max-w-lg w-full border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-6 relative z-[210]"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border-main/40 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold flex items-center gap-1.5">
                    <SlidersHorizontal size={11} /> Global Personalization
                  </span>
                  <h3 className="font-display text-lg font-semibold text-txt-main">Preference Presets</h3>
                  <p className="text-xs text-txt-muted font-light leading-snug">
                    Set your preferred location, domain focus, and event radius. LynDesk will prioritize and filter contests live across all boards.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Controls */}
              <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
                
                {/* 1. Location / City Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent-main" /> My Primary Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai, Tamil Nadu, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main focus:ring-1 focus:ring-ring-main font-light transition-colors"
                  />
                  <span className="text-[9.5px] text-txt-muted font-light">
                    Used to pin local campus hackathons and regional events at the top of your feeds.
                  </span>
                </div>

                {/* 2. Location Preference Mode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main">Location Filter Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all", label: "All Events" },
                      { id: "local", label: "My City First" },
                      { id: "online", label: "Online Only" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLocationMode(item.id as any)}
                        className={`h-8 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                          locationMode === item.id 
                            ? "bg-accent-main/15 border-accent-main text-accent-main font-bold" 
                            : "bg-bg-card border-border-main/60 text-txt-muted hover:text-txt-main"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Category Focus */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main">Preferred Category Track</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "hackathon", label: "Hackathons" },
                      { id: "contest", label: "Coding Contests" },
                      { id: "news", label: "News & Tech" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategoryFocus(item.id as any)}
                        className={`h-8 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                          categoryFocus === item.id 
                            ? "bg-accent-main/15 border-accent-main text-accent-main font-bold" 
                            : "bg-bg-card border-border-main/60 text-txt-muted hover:text-txt-main"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Travel Radius */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-txt-main">Travel / Event Scope</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "local", label: "Local City" },
                      { id: "regional", label: "Regional" },
                      { id: "national", label: "National" },
                      { id: "global", label: "Global / Any" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTravelPreference(item.id as any)}
                        className={`h-8 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                          travelPreference === item.id 
                            ? "bg-accent-main/15 border-accent-main text-accent-main font-bold" 
                            : "bg-bg-card border-border-main/60 text-txt-muted hover:text-txt-main"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center border-t border-border-main/40 pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="h-9 px-3 border border-border-main/70 bg-bg-card hover:bg-bg-base text-txt-muted hover:text-red-400 text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                >
                  <RotateCcw size={12} /> Reset
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 px-4 rounded-sm border border-border-main/70 bg-bg-card text-txt-muted hover:text-txt-main text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="h-9 px-5 rounded-sm bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider font-bold transition-opacity cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {saving ? "Saving..." : "Save Preferences"}
                    <Check size={13} />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Reset Confirmation Sub-Modal */}
          <AnimatePresence>
            {showConfirmReset && (
              <div className="fixed inset-0 z-[250] overflow-hidden font-sans text-left bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  className="max-w-xs w-full border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-4 relative z-[260]"
                >
                  <div className="flex flex-col gap-1.5 text-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 font-bold flex items-center justify-center gap-1">
                      <RotateCcw size={11} /> Confirm Reset
                    </span>
                    <h3 className="font-display text-base font-semibold text-txt-main">Reset all preference filters?</h3>
                    <p className="text-[11px] text-txt-muted font-light leading-relaxed">
                      Are you sure you want to reset all custom location, category, and radius preference presets back to default?
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="flex-1 h-8 rounded bg-bg-card border border-border-main/80 text-txt-muted hover:text-txt-main text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReset}
                      className="flex-1 h-8 rounded bg-red-500/90 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-opacity cursor-pointer shadow-sm flex items-center justify-center gap-1"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </AnimatePresence>
  );
}
