"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import LynDeskLogo from "./LynDeskLogo";
import { 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Bell, 
  X, 
  Clock, 
  Check, 
  Sparkles
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "invite" | "credit" | "system";
  category: "alerts" | "updates";
  time: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [drawerTab, setDrawerTab] = useState<"alerts" | "updates">("alerts");

  // Compute unread count dynamically during render
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize notifications
  useEffect(() => {
    const initial: NotificationItem[] = [
      { 
        id: "n1", 
        title: "Teammate Match Invite", 
        message: "Alex Carter invited you to join the 'HealthVibe' hackathon project space.", 
        type: "invite", 
        category: "alerts",
        time: "10m ago", 
        read: false,
        actionLabel: "Accept Invite",
        actionUrl: "/explore"
      },
      { 
        id: "n2", 
        title: "Hackathon Deadline Nudge", 
        message: "Registration for MIT HackHarvard closes in exactly 24 hours. Ensure your team registration is finalized.", 
        type: "deadline", 
        category: "alerts",
        time: "1h ago", 
        read: false,
        actionLabel: "View Event Details",
        actionUrl: "/explore"
      },
      { 
        id: "n3", 
        title: "Academic Credits Verified", 
        message: "Prof. Davis approved your project credits request. +10 Extracurricular points added to Stanford Leaderboard.", 
        type: "credit", 
        category: "alerts",
        time: "1d ago", 
        read: true 
      },
      {
        id: "n4",
        title: "Leaderboard Update",
        message: "MIT Computer Science department has risen to 2nd place on the regional standings board.",
        type: "system",
        category: "updates",
        time: "2h ago",
        read: false
      },
      {
        id: "n5",
        title: "Platform Maintenance",
        message: "Scheduled database migrations and maintenance will take place this Sunday at 2:00 AM EST.",
        type: "system",
        category: "updates",
        time: "1d ago",
        read: true
      }
    ];
    const handle = setTimeout(() => {
      setNotifications(initial);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => {
      if (n.category === drawerTab) {
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const handleNotificationAction = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, read: true, message: "Invitation accepted. Workspace link activated." };
      }
      return n;
    }));
  };

  const triggerCronNudge = () => {
    const alerts = [
      {
        id: `n_cron_${Date.now()}`,
        title: "Cron Sync Complete",
        message: "Resend background worker successfully synchronized active GitHub commits for your team project space.",
        type: "system" as const,
        category: "updates" as const,
        time: "Just now",
        read: false
      },
      {
        id: `n_cron_${Date.now()}`,
        title: "Urgent: Stage Overdue",
        message: "Your 'EduForge' prototype deployment is overdue. Submit your Vercel URL to avoid credit deductions.",
        type: "deadline" as const,
        category: "alerts" as const,
        time: "Just now",
        read: false,
        actionLabel: "Open Workspace",
        actionUrl: "/workspace/eduforge"
      }
    ];

    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    setNotifications(prev => [randomAlert, ...prev]);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 md:px-12 bg-bg-surface/80 backdrop-blur-md border-b border-border-main/60 transition-colors duration-150 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 select-none cursor-pointer">
          <LynDeskLogo size={20} className="mr-1" />
          <span className="font-display text-base font-semibold tracking-[0.25em] text-txt-main">
            LYNDESK
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase tracking-wider">
          <Link href="/" className="text-txt-sub hover:text-txt-main transition-colors pb-1">Dashboard</Link>
          <Link href="/explore" className="text-txt-sub hover:text-txt-main transition-colors pb-1">Explore</Link>
          <Link href="/leaderboard" className="text-txt-sub hover:text-txt-main transition-colors pb-1">Leaderboard</Link>
          <Link href="/coordinator" className="text-txt-sub hover:text-txt-main transition-colors pb-1">Faculty Console</Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell (Only visible when user is logged in) */}
          {user && (
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none relative cursor-pointer"
              aria-label="View notifications"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          )}

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          
          {user && (
            <>
              <Link 
                href="/profile"
                className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none flex items-center justify-center"
                title="View Profile"
              >
                <User size={14} />
              </Link>
              <button 
                onClick={signOut}
                className="p-2 rounded-full border border-border-main/80 hover:bg-bg-card text-txt-main transition-colors duration-150 focus:outline-none cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Slide-over Notification Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md border-l border-border-main/70 bg-bg-surface flex flex-col h-full shadow-2xl animate-fade-in">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-border-main/40 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Nudge Engine</span>
                  <h2 className="text-base font-semibold text-txt-main font-display">Notifications</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-mono uppercase tracking-wider text-txt-muted hover:text-txt-main cursor-pointer"
                  >
                    Clear Tab
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Category Tabs inside Drawer */}
              <div className="flex border-b border-border-main/40 bg-bg-base/30 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider gap-6">
                <button
                  onClick={() => setDrawerTab("alerts")}
                  className={`pb-1 cursor-pointer transition-all border-b-2 font-medium ${
                    drawerTab === "alerts" 
                      ? "text-txt-main border-txt-main" 
                      : "text-txt-muted border-transparent hover:text-txt-main"
                  }`}
                >
                  Personal Alerts ({notifications.filter(n => n.category === "alerts" && !n.read).length})
                </button>
                <button
                  onClick={() => setDrawerTab("updates")}
                  className={`pb-1 cursor-pointer transition-all border-b-2 font-medium ${
                    drawerTab === "updates" 
                      ? "text-txt-main border-txt-main" 
                      : "text-txt-muted border-transparent hover:text-txt-main"
                  }`}
                >
                  General Feed ({notifications.filter(n => n.category === "updates" && !n.read).length})
                </button>
              </div>

              {/* Nudge Engine Simulation Panel */}
              <div className="px-6 py-4 bg-bg-base/40 border-b border-border-main/40 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-txt-main flex items-center gap-1">
                    <Sparkles size={11} className="text-yellow-500" /> Cron Simulator
                  </span>
                  <span className="text-[9px] text-txt-muted font-light leading-snug max-w-[240px]">
                    Trigger background Resend worker deadlocks check manually.
                  </span>
                </div>
                <button
                  onClick={triggerCronNudge}
                  className="h-7 px-3 bg-accent-main text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Fire Worker
                </button>
              </div>

              {/* Notification Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                {notifications.filter(n => n.category === drawerTab).length > 0 ? (
                  notifications.filter(n => n.category === drawerTab).map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border rounded-sm flex flex-col gap-3 transition-colors ${
                        item.read 
                          ? "bg-bg-base/30 border-border-main/40 opacity-75" 
                          : "bg-bg-card border-border-main text-txt-main"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            item.type === "deadline" 
                              ? "bg-red-500" 
                              : item.type === "invite" 
                              ? "bg-blue-500" 
                              : item.type === "credit"
                              ? "bg-emerald-500"
                              : "bg-txt-muted"
                          }`} />
                          <h4 className="text-xs font-semibold text-txt-main">{item.title}</h4>
                        </div>
                        <span className="text-[8px] font-mono text-txt-muted">{item.time}</span>
                      </div>

                      <p className="text-[11px] text-txt-sub font-light leading-relaxed">
                        {item.message}
                      </p>

                      {item.actionLabel && !item.read && (
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleNotificationAction(item.id)}
                            className="h-6 px-3 bg-accent-main text-bg-base font-mono text-[8px] tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                          >
                            <Check size={8} /> {item.actionLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-txt-muted font-mono text-[10px] uppercase">
                    <Clock size={16} className="mb-2" />
                    No notifications
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
