"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  Briefcase, 
  Radio, 
  Plus, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  LogOut, 
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  instituteId: string;
  instituteName: string;
}

export default function AdminConsolePage() {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  // Auth Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "structure" | "radar" | "staff" | "recruiters" | "audit">("overview");

  // Data States
  const [structures, setStructures] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [recruiterList, setRecruiterList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals & Form States
  const [isAddStructOpen, setIsAddStructOpen] = useState(false);
  const [newYear, setNewYear] = useState("3rd Year");
  const [newDept, setNewDept] = useState("Information Technology");
  const [newSec, setNewSec] = useState("Section E");
  const [newRollStart, setNewRollStart] = useState("RA2311003010261");
  const [newRollEnd, setNewRollEnd] = useState("RA2311003010325");
  const [newExpectedCount, setNewExpectedCount] = useState(65);

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"hod" | "coordinator" | "faculty">("coordinator");
  const [newStaffDept, setNewStaffDept] = useState("Information Technology");
  const [newStaffCustomKey, setNewStaffCustomKey] = useState("");
  const [issuedStaffKeyMessage, setIssuedStaffKeyMessage] = useState<string | null>(null);

  const [isAddRecruiterOpen, setIsAddRecruiterOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newValidityDays, setNewValidityDays] = useState(14);
  const [issuedRecruiterPin, setIssuedRecruiterPin] = useState<string | null>(null);

  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackToast({ text, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Check initial admin session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (res.ok && data.authenticated && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.warn("Session verify note:", err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Fetch data when authenticated or active tab changes
  useEffect(() => {
    if (!admin) return;

    async function loadData() {
      try {
        if (activeTab === "overview" || activeTab === "structure" || activeTab === "radar") {
          const structRes = await fetch("/api/admin/structure");
          const structData = await structRes.json();
          if (structData.structures) setStructures(structData.structures);

          const radarRes = await fetch("/api/admin/radar");
          const rData = await radarRes.json();
          if (rData.kpis) setRadarData(rData);
        }

        if (activeTab === "overview" || activeTab === "staff") {
          const staffRes = await fetch("/api/admin/staff");
          const sData = await staffRes.json();
          if (sData.staff) setStaffList(sData.staff);
        }

        if (activeTab === "overview" || activeTab === "recruiters") {
          const recRes = await fetch("/api/admin/recruiters");
          const rData = await recRes.json();
          if (rData.recruiters) setRecruiterList(rData.recruiters);
        }

        if (activeTab === "overview" || activeTab === "audit") {
          const auditRes = await fetch("/api/admin/audit");
          const aData = await auditRes.json();
          if (aData.logs) setAuditLogs(aData.logs);
        }
      } catch (err) {
        console.warn("Data load note:", err);
      }
    }

    loadData();
  }, [admin, activeTab]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Authentication failed. Please verify institutional credentials.");
        return;
      }

      setAdmin(data.admin);
      showToast(`Access granted. Welcome, ${data.admin.name}`);
    } catch (err: any) {
      setAuthError(err.message || "Connection error reaching authentication server.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAdmin(null);
      showToast("Administrator session signed out safely.");
    } catch {}
  };

  // Add structure handler
  const handleAddStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_year: newYear,
          department: newDept,
          section: newSec,
          roll_start: newRollStart,
          roll_end: newRollEnd,
          expected_students: newExpectedCount
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStructures(prev => [data.structure, ...prev]);
        setIsAddStructOpen(false);
        showToast("Campus section structure configured successfully.");
      } else {
        showToast(data.error || "Failed adding structure.", "error");
      }
    } catch {
      showToast("Error adding campus structure.", "error");
    }
  };

  // Issue staff passkey handler
  const handleIssueStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          role: newStaffRole,
          department_scope: newStaffDept,
          custom_passkey: newStaffCustomKey
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffList(prev => [data.staff, ...prev]);
        setIssuedStaffKeyMessage(`Generated Passkey: ${data.issuedPasskey}`);
        showToast(`Passkey generated for ${newStaffName}.`);
        setNewStaffName("");
        setNewStaffEmail("");
      } else {
        showToast(data.error || "Failed issuing staff passkey.", "error");
      }
    } catch {
      showToast("Error issuing staff passkey.", "error");
    }
  };

  // Issue recruiter PIN handler
  const handleIssueRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/recruiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: newCompanyName,
          validity_days: newValidityDays
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecruiterList(prev => [data.recruiterKey, ...prev]);
        setIssuedRecruiterPin(`Access PIN: ${data.issuedPin}`);
        showToast(`PIN created for ${newCompanyName}.`);
        setNewCompanyName("");
      } else {
        showToast(data.error || "Failed generating recruiter PIN.", "error");
      }
    } catch {
      showToast("Error generating recruiter PIN.", "error");
    }
  };

  // Dispatch invite to missing students
  const handleInviteMissing = async (sectionItem: any) => {
    try {
      const res = await fetch("/api/admin/invite-missing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: sectionItem.department,
          section: sectionItem.section,
          academicYear: sectionItem.academicYear,
          missingRolls: sectionItem.missingRolls
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
      } else {
        showToast(data.error || "Failed dispatching invites.", "error");
      }
    } catch {
      showToast("Error queuing student invites.", "error");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-base text-txt-main flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-main animate-ping" />
          Verifying Institutional Session...
        </div>
      </main>
    );
  }

  // --- 1. Login Gateway View ---
  if (!admin) {
    return (
      <main className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-border-main/80 bg-bg-surface p-8 rounded-lg shadow-xl flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1.5 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent-main text-bg-base flex items-center justify-center mb-1">
                <Building2 size={24} className="stroke-[1.75]" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Campus Governance Tier</span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-txt-main">College Root Administrator</h1>
              <p className="text-xs text-txt-muted font-light leading-relaxed">
                Log in to manage campus architecture, staff passkeys, and student missing rosters.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded font-mono flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Administrator Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  required
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-txt-main font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Master Passkey</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Root Passkey"
                    required
                    className="w-full h-10 pl-3 pr-9 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-txt-main font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors p-0.5 cursor-pointer"
                    aria-label={showPassword ? "Hide passkey" : "Show passkey"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="h-10 w-full bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded transition-opacity flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {authLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    Enter Root Console
                  </>
                )}
              </button>
            </form>

            <div className="p-3 bg-bg-base/40 border border-border-main/50 rounded flex flex-col gap-1 font-mono text-[9px] text-txt-muted">
              <span className="font-semibold uppercase text-txt-sub">Default Demo Credentials:</span>
              <span>Email: <strong className="text-txt-main">admin@srmist.edu.in</strong></span>
              <span>Passkey: <strong className="text-txt-main">Admin@LynDesk2026</strong></span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- 2. Authenticated Admin Console View ---
  return (
    <main className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      {/* Floating Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-bg-surface border border-border-main/90 shadow-2xl p-4 rounded-md flex items-center gap-3 animate-fade-in text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${feedbackToast.type === "success" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span>{feedbackToast.text}</span>
        </div>
      )}

      {/* Subheader Banner */}
      <div className="border-b border-border-main/60 bg-bg-surface/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-accent-main text-bg-base flex items-center justify-center shadow-sm">
              <Building2 size={20} className="stroke-[1.75]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold text-txt-main">{admin.instituteName}</h1>
                <span className="text-[8.5px] font-mono uppercase bg-accent-main/10 text-accent-main border border-accent-main/30 px-2 py-0.5 rounded font-semibold">Root Admin</span>
              </div>
              <span className="text-xs text-txt-muted font-mono">{admin.name} · {admin.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="h-8 px-3 border border-border-main text-xs font-mono uppercase tracking-wider text-txt-muted hover:text-red-400 hover:border-red-400/40 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-6 flex flex-col gap-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border-main/60 overflow-x-auto pb-1">
          {[
            { id: "overview", label: "Executive Overview", icon: ShieldCheck },
            { id: "radar", label: "Missing Student Radar", icon: Radio },
            { id: "structure", label: "Campus Architecture", icon: Building2 },
            { id: "staff", label: "Staff Passkeys", icon: KeyRound },
            { id: "recruiters", label: "Recruiter PINs", icon: Briefcase },
            { id: "audit", label: "Activity Ledger", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-9 px-3.5 rounded-t text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? "border-accent-main text-txt-main font-bold bg-bg-surface/50"
                    : "border-transparent text-txt-muted hover:text-txt-main hover:bg-bg-card/40"
                }`}
              >
                <Icon size={14} className={isActive ? "text-accent-main" : "text-txt-muted"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- TAB 1: EXECUTIVE OVERVIEW --- */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 border border-border-main/70 bg-bg-surface rounded-md flex flex-col gap-2">
                <span className="text-[9.5px] font-mono uppercase tracking-widest text-txt-muted">Total Enrolled</span>
                <span className="font-display text-3xl font-bold text-txt-main">{radarData?.kpis?.totalEnrolled || 128}</span>
                <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                  <CheckCircle2 size={11} /> {radarData?.kpis?.adoptionRate || 74}% Campus Adoption
                </span>
              </div>

              <div className="p-5 border border-border-main/70 bg-bg-surface rounded-md flex flex-col gap-2">
                <span className="text-[9.5px] font-mono uppercase tracking-widest text-txt-muted">Missing Students</span>
                <span className="font-display text-3xl font-bold text-red-400">{radarData?.kpis?.totalMissing || 42}</span>
                <span className="text-[10px] text-txt-muted font-mono">Out of {radarData?.kpis?.totalExpected || 170} expected</span>
              </div>

              <div className="p-5 border border-border-main/70 bg-bg-surface rounded-md flex flex-col gap-2">
                <span className="text-[9.5px] font-mono uppercase tracking-widest text-txt-muted">Active Staff Keys</span>
                <span className="font-display text-3xl font-bold text-txt-main">{staffList.length || 3}</span>
                <span className="text-[10px] text-txt-muted font-mono">HODs & Section Coordinators</span>
              </div>

              <div className="p-5 border border-border-main/70 bg-bg-surface rounded-md flex flex-col gap-2">
                <span className="text-[9.5px] font-mono uppercase tracking-widest text-txt-muted">Placement PINs</span>
                <span className="font-display text-3xl font-bold text-txt-main">{recruiterList.filter(r => r.is_active).length || 2}</span>
                <span className="text-[10px] text-txt-muted font-mono">Active Company Portals</span>
              </div>
            </div>

            {/* Quick Actions & Department Census */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <h3 className="font-display text-sm font-semibold text-txt-main">Department Roster Overview</h3>
                  <button onClick={() => setActiveTab("radar")} className="text-[10px] font-mono uppercase text-accent-main hover:underline flex items-center gap-1">
                    Open Radar <ChevronRight size={12} />
                  </button>
                </div>

                <div className="flex flex-col divide-y divide-border-main/40">
                  {(radarData?.sections || structures.slice(0, 4)).map((sec: any) => (
                    <div key={sec.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-txt-main">{sec.department} · {sec.section}</span>
                        <span className="text-[10px] text-txt-muted font-mono">{sec.academicYear} · Rolls: {sec.rollRange || `${sec.roll_start} - ${sec.roll_end}`}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-emerald-500">{sec.enrolledCount || 52} Enrolled</span>
                        <span className="text-xs font-mono font-semibold text-red-400">{sec.missingCount || 13} Missing</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast Issue Shortcuts */}
              <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                <h3 className="font-display text-sm font-semibold text-txt-main border-b border-border-main/40 pb-3">Quick Governance Actions</h3>
                
                <button
                  onClick={() => { setActiveTab("staff"); setIsAddStaffOpen(true); }}
                  className="p-3 border border-border-main/70 bg-bg-base/50 hover:bg-bg-card rounded flex items-center justify-between text-xs font-mono uppercase text-txt-main transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><KeyRound size={14} className="text-accent-main" /> Issue Staff Passkey</span>
                  <Plus size={14} />
                </button>

                <button
                  onClick={() => { setActiveTab("recruiters"); setIsAddRecruiterOpen(true); }}
                  className="p-3 border border-border-main/70 bg-bg-base/50 hover:bg-bg-card rounded flex items-center justify-between text-xs font-mono uppercase text-txt-main transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-accent-main" /> Generate Recruiter PIN</span>
                  <Plus size={14} />
                </button>

                <button
                  onClick={() => { setActiveTab("structure"); setIsAddStructOpen(true); }}
                  className="p-3 border border-border-main/70 bg-bg-base/50 hover:bg-bg-card rounded flex items-center justify-between text-xs font-mono uppercase text-txt-main transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Building2 size={14} className="text-accent-main" /> Add Section Range</span>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: MISSING STUDENT RADAR --- */}
        {activeTab === "radar" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-base font-bold text-txt-main">Missing Student Radar</h2>
                <p className="text-xs text-txt-muted font-light leading-relaxed">
                  Compares configured roll number ranges against live registered student profiles to find missing candidates.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {(radarData?.sections || []).map((sec: any) => (
                <div key={sec.id} className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/40 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-txt-main">{sec.department} · {sec.academicYear} · {sec.section}</span>
                      <span className="text-[10px] text-txt-muted font-mono">Expected Range: {sec.rollRange}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/30">
                        {sec.enrolledCount} Enrolled
                      </span>
                      <span className="text-xs font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/30">
                        {sec.missingCount} Missing
                      </span>
                      {sec.missingCount > 0 && (
                        <button
                          onClick={() => handleInviteMissing(sec)}
                          className="h-8 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[9.5px] font-mono uppercase tracking-wider rounded font-bold transition-opacity flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail size={12} /> Invite Missing
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Missing Roll Number Chips */}
                  {sec.missingRolls && sec.missingRolls.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-txt-muted font-semibold">Unregistered Roll Numbers:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sec.missingRolls.map((roll: string) => (
                          <span key={roll} className="text-[9px] font-mono bg-red-500/5 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                            {roll}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: CAMPUS ARCHITECTURE BUILDER --- */}
        {activeTab === "structure" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-base font-bold text-txt-main">Campus Architecture Configurator</h2>
                <p className="text-xs text-txt-muted font-light leading-relaxed">
                  Define academic years, department sections, and starting/ending roll number patterns.
                </p>
              </div>

              <button
                onClick={() => setIsAddStructOpen(true)}
                className="h-9 px-4 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider font-semibold rounded transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Section Range
              </button>
            </div>

            {/* Structure Add Modal */}
            {isAddStructOpen && (
              <div className="p-5 border border-accent-main/40 bg-bg-surface rounded-md flex flex-col gap-4 animate-fade-in">
                <h3 className="font-display text-sm font-semibold text-txt-main">Configure New Section Range</h3>
                <form onSubmit={handleAddStructure} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Academic Year</label>
                    <select value={newYear} onChange={(e) => setNewYear(e.target.value)} className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs">
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Department</label>
                    <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} required className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Section</label>
                    <input type="text" value={newSec} onChange={(e) => setNewSec(e.target.value)} required className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Starting Roll Number</label>
                    <input type="text" value={newRollStart} onChange={(e) => setNewRollStart(e.target.value)} required className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs font-mono uppercase" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Ending Roll Number</label>
                    <input type="text" value={newRollEnd} onChange={(e) => setNewRollEnd(e.target.value)} required className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs font-mono uppercase" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Expected Students Count</label>
                    <input type="number" value={newExpectedCount} onChange={(e) => setNewExpectedCount(Number(e.target.value))} required className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs font-mono" />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddStructOpen(false)} className="h-8 px-3 border border-border-main text-xs font-mono uppercase rounded">Cancel</button>
                    <button type="submit" className="h-8 px-4 bg-accent-main text-bg-base text-xs font-mono uppercase rounded font-semibold">Save Structure</button>
                  </div>
                </form>
              </div>
            )}

            {/* Structure Table */}
            <div className="border border-border-main/70 bg-bg-surface rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-border-main/60 bg-bg-card/40 text-[9px] uppercase tracking-wider text-txt-muted">
                    <tr>
                      <th className="p-3">Academic Year</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Section</th>
                      <th className="p-3">Roll Number Bounds</th>
                      <th className="p-3 text-right">Expected Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/40">
                    {structures.map((s) => (
                      <tr key={s.id} className="hover:bg-bg-card/20 transition-colors">
                        <td className="p-3 font-semibold text-txt-main">{s.academic_year}</td>
                        <td className="p-3 text-txt-sub">{s.department}</td>
                        <td className="p-3 text-txt-main font-bold">{s.section}</td>
                        <td className="p-3 text-txt-muted">{s.roll_start} → {s.roll_end}</td>
                        <td className="p-3 text-right font-semibold text-txt-main">{s.expected_students}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: STAFF PASSKEYS --- */}
        {activeTab === "staff" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-base font-bold text-txt-main">Staff & Coordinator Passkeys</h2>
                <p className="text-xs text-txt-muted font-light leading-relaxed">
                  Issue and govern scoped access passkeys for HODs and faculty coordinators.
                </p>
              </div>

              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="h-9 px-4 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider font-semibold rounded transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Issue Passkey
              </button>
            </div>

            {/* Issued Passkey Message Banner */}
            {issuedStaffKeyMessage && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs rounded flex items-center justify-between">
                <span>{issuedStaffKeyMessage}</span>
                <button onClick={() => setIssuedStaffKeyMessage(null)} className="text-[10px] underline uppercase">Dismiss</button>
              </div>
            )}

            {/* Add Staff Modal */}
            {isAddStaffOpen && (
              <div className="p-5 border border-accent-main/40 bg-bg-surface rounded-md flex flex-col gap-4 animate-fade-in">
                <h3 className="font-display text-sm font-semibold text-txt-main">Issue New Faculty / Coordinator Passkey</h3>
                <form onSubmit={handleIssueStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Staff Full Name</label>
                    <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} required placeholder="e.g. Dr. S. Malathi" className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Official Email</label>
                    <input type="email" value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} required placeholder="faculty@institution.edu" className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs font-mono" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Role Scope Tier</label>
                    <select value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value as any)} className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs">
                      <option value="hod">HOD (Full Department Scope)</option>
                      <option value="coordinator">Coordinator (Section Scope)</option>
                      <option value="faculty">Faculty (Read-Only Analytics)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Assigned Department</label>
                    <input type="text" value={newStaffDept} onChange={(e) => setNewStaffDept(e.target.value)} required placeholder="Information Technology" className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs" />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Custom Passkey (Optional — leave blank to auto-generate)</label>
                    <input type="text" value={newStaffCustomKey} onChange={(e) => setNewStaffCustomKey(e.target.value)} placeholder="e.g. COORD_SEC_E" className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs font-mono" />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddStaffOpen(false)} className="h-8 px-3 border border-border-main text-xs font-mono uppercase rounded">Cancel</button>
                    <button type="submit" className="h-8 px-4 bg-accent-main text-bg-base text-xs font-mono uppercase rounded font-semibold">Generate Passkey</button>
                  </div>
                </form>
              </div>
            )}

            {/* Staff Accounts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((st) => (
                <div key={st.id} className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-mono uppercase bg-accent-main/10 text-accent-main border border-accent-main/30 px-2 py-0.5 rounded font-bold">
                        {st.role.toUpperCase()}
                      </span>
                      <span className={`text-[8.5px] font-mono uppercase px-2 py-0.5 rounded ${st.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
                        {st.is_active ? "Active" : "Revoked"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-txt-main">{st.name}</span>
                      <span className="text-xs text-txt-muted font-mono">{st.email}</span>
                      <span className="text-[10px] text-txt-sub font-mono mt-1">Scope: {st.department_scope}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-main/40 text-[9.5px] font-mono text-txt-muted">
                    <span>{st.queries_count || 0} Queries · {st.exports_count || 0} Exports</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: RECRUITER PINS --- */}
        {activeTab === "recruiters" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-base font-bold text-txt-main">Corporate Placement Access PINs</h2>
                <p className="text-xs text-txt-muted font-light leading-relaxed">
                  Generate time-limited PIN keys for visiting recruiters to access anonymized talent analytics.
                </p>
              </div>

              <button
                onClick={() => setIsAddRecruiterOpen(true)}
                className="h-9 px-4 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider font-semibold rounded transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Generate Recruiter PIN
              </button>
            </div>

            {/* Issued Recruiter PIN Banner */}
            {issuedRecruiterPin && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs rounded flex items-center justify-between">
                <span>{issuedRecruiterPin}</span>
                <button onClick={() => setIssuedRecruiterPin(null)} className="text-[10px] underline uppercase">Dismiss</button>
              </div>
            )}

            {/* Add Recruiter Modal */}
            {isAddRecruiterOpen && (
              <div className="p-5 border border-accent-main/40 bg-bg-surface rounded-md flex flex-col gap-4 animate-fade-in">
                <h3 className="font-display text-sm font-semibold text-txt-main">Generate Recruiter Access Code</h3>
                <form onSubmit={handleIssueRecruiter} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Company / Partner Name</label>
                    <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} required placeholder="e.g. Google India" className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-txt-sub">Validity Duration (Days)</label>
                    <select value={newValidityDays} onChange={(e) => setNewValidityDays(Number(e.target.value))} className="h-9 px-3 border border-border-main/80 bg-bg-base rounded text-xs">
                      <option value={7}>7 Days</option>
                      <option value={14}>14 Days (Standard Drive)</option>
                      <option value={30}>30 Days (Full Month)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddRecruiterOpen(false)} className="h-8 px-3 border border-border-main text-xs font-mono uppercase rounded">Cancel</button>
                    <button type="submit" className="h-8 px-4 bg-accent-main text-bg-base text-xs font-mono uppercase rounded font-semibold">Issue PIN</button>
                  </div>
                </form>
              </div>
            )}

            {/* Recruiter Keys List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recruiterList.map((rec) => (
                <div key={rec.id} className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-txt-main flex items-center gap-1.5">
                        <Briefcase size={14} className="text-accent-main" /> {rec.company_name}
                      </span>
                      <span className={`text-[8.5px] font-mono uppercase px-2 py-0.5 rounded ${rec.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
                        {rec.is_active ? "Active" : "Expired"}
                      </span>
                    </div>

                    <span className="text-xs text-txt-muted font-mono">PIN: {rec.pin || "••••••"}</span>
                    <span className="text-[10px] text-txt-sub font-mono">Expires: {new Date(rec.expires_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-main/40 text-[9.5px] font-mono text-txt-muted">
                    <span>{rec.exports_count || 0} Reports Downloaded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 6: ACTIVITY AUDIT LEDGER --- */}
        {activeTab === "audit" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1 border-b border-border-main/40 pb-4">
              <h2 className="font-display text-base font-bold text-txt-main">Institutional Activity Ledger</h2>
              <p className="text-xs text-txt-muted font-light leading-relaxed">
                Immutable, GDPR-compliant event history with SHA-256 hashed IP records.
              </p>
            </div>

            <div className="border border-border-main/70 bg-bg-surface rounded-md divide-y divide-border-main/40 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-bg-card/20 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-bg-card text-txt-main border border-border-main/60">
                        {log.action_type}
                      </span>
                      <span className="text-xs text-txt-main font-semibold">{log.actor_name} ({log.actor_type.toUpperCase()})</span>
                    </div>
                    <span className="text-[11px] text-txt-muted leading-relaxed font-sans">{log.description}</span>
                  </div>
                  <span className="text-[9.5px] text-txt-muted whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
