"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
  FileText,
  DollarSign,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Download,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Check,
  X,
  Code2,
  FolderPlus,
  RefreshCw,
  Building2,
  UserCheck,
  Send,
  ShieldCheck,
  QrCode,
  Printer,
  ChevronDown
} from "lucide-react";

interface SubjectAttendance {
  id: string;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  credits: number;
  semester: number;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  odClasses: number;
  lateClasses: number;
  percentage: number;
  status: "Safe" | "Warning" | "Critical";
}

interface AttendanceLog {
  id: string;
  subject_id: string;
  date: string;
  period_slot: number;
  status: "PRESENT" | "ABSENT" | "OD" | "LATE";
  remarks: string | null;
  created_at: string;
}

interface ExamBreakdown {
  examType: string;
  marksObtained: number;
  maxMarks: number;
  classAverage: number;
  percentage: number;
  grade: string;
  remarks: string;
}

interface SubjectMarks {
  id: string;
  subject_code: string;
  subject_name: string;
  faculty_name: string;
  credits: number;
  internalAverage: number;
  exams: ExamBreakdown[];
}

interface TranscriptCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
  points: number;
}

interface SemesterTranscript {
  semester: number;
  sgpa: number;
  cgpa: number;
  total_credits: number;
  earned_credits: number;
  status: string;
  results_json: TranscriptCourse[];
}

interface FeeRecord {
  id: string;
  academic_year: string;
  term_name: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "PARTIAL";
  receipt_url: string | null;
}

interface TimetableSlot {
  periodSlot: number;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNumber: string;
}

interface TimetableDay {
  dayIndex: number;
  dayName: string;
  periods: TimetableSlot[];
}

interface ClassroomPost {
  id: string;
  post_type: "assignment" | "material" | "notice" | "discussion";
  title: string;
  content: string;
  author_name: string;
  author_role: string;
  attachment_name?: string;
  attachment_url?: string;
  due_date?: string;
  created_at: string;
  submission?: {
    id: string;
    status: string;
    submissionUrl?: string;
    submissionText?: string;
    workspaceId?: string;
    grade?: number;
    feedback?: string;
    submittedAt: string;
  } | null;
}

interface LeaveApplication {
  id: string;
  student_id: string;
  application_type: "leave" | "od";
  target_date: string;
  end_date?: string | null;
  is_full_day: boolean;
  periods: number[];
  category: string;
  title: string;
  reason: string;
  letter_body?: string | null;
  proof_url?: string | null;
  status: "pending" | "approved" | "rejected";
  faculty_remarks?: string | null;
  created_at: string;
}

export default function CollegeDeskPage() {
  const { user, userProfile, userRole, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Top-Level Main Tabs: "erp" | "classroom"
  const [activeMainTab, setActiveMainTab] = useState<"erp" | "classroom">("erp");

  // ERP Sub-Tabs: Reordered as requested (Attendance -> Timetable -> Marks -> Transcripts -> Fees)
  const [erpTab, setErpTab] = useState<"attendance" | "timetable" | "marks" | "transcripts" | "fees">("attendance");

  // Data States
  const [loading, setLoading] = useState(true);
  const [overallAttendance, setOverallAttendance] = useState<{ totalClasses: number; attendedClasses: number; percentage: number; status: string }>({
    totalClasses: 160,
    attendedClasses: 142,
    percentage: 89,
    status: "Eligible"
  });
  const [subjectsAttendance, setSubjectsAttendance] = useState<SubjectAttendance[]>([]);
  const [subjectsMarks, setSubjectsMarks] = useState<SubjectMarks[]>([]);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<"IA-1" | "IA-2" | "Model Exam" | "Lab Practicals" | "Course Assignments">("IA-1");
  const [transcripts, setTranscripts] = useState<SemesterTranscript[]>([]);
  const [selectedSemIndex, setSelectedSemIndex] = useState<number>(0);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [feeSummary, setFeeSummary] = useState<{ totalDues: number; totalPaid: number; pendingBalance: number; status: string }>({
    totalDues: 73300,
    totalPaid: 69800,
    pendingBalance: 3500,
    status: "Payment Due"
  });
  const [timetable, setTimetable] = useState<TimetableDay[]>([]);
  const [activeTimetableDay, setActiveTimetableDay] = useState<number>(1);
  const [classroomPosts, setClassroomPosts] = useState<ClassroomPost[]>([]);
  const [classroomFilter, setClassroomFilter] = useState<"all" | "assignment" | "material" | "notice" | "discussion">("all");

  // Interactive Attendance Drill-Down Modal State
  const [drillDownSubject, setDrillDownSubject] = useState<SubjectAttendance | null>(null);
  const [drillDownLogs, setDrillDownLogs] = useState<AttendanceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logStatusFilter, setLogStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "OD" | "LATE">("ALL");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("2026-09");

  // On-Duty & Leave Application State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalTab, setLeaveModalTab] = useState<"od" | "leave" | "history">("od");
  const [leaveTargetDate, setLeaveTargetDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [leaveEndDate, setLeaveEndDate] = useState<string>("");
  const [isFullDay, setIsFullDay] = useState<boolean>(true);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [leaveCategory, setLeaveCategory] = useState<string>("symposium");
  const [leaveTitle, setLeaveTitle] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [leaveLetterBody, setLeaveLetterBody] = useState<string>("");
  const [leaveProofUrl, setLeaveProofUrl] = useState<string>("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState<boolean>(false);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [viewingLeaveSlip, setViewingLeaveSlip] = useState<LeaveApplication | null>(null);

  // Interactive Assignment Submission Modal
  const [submittingPost, setSubmittingPost] = useState<ClassroomPost | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student details derived
  const studentDepartment = userProfile?.department || "Computer Science";
  const studentYear = userProfile?.academic_year || "3rd Year";
  const studentSection = userProfile?.section || "A";
  const studentRoll = userProfile?.roll_number || "RA2311003010265";
  const studentInstitute = userProfile?.college_name || "SRM Institute of Science & Technology";
  const studentName = userProfile?.full_name || user?.user_metadata?.full_name || "Scholar";

  // Prepopulate formal leave letter body
  useEffect(() => {
    if (leaveModalTab === "leave") {
      setLeaveLetterBody(
`To,
The Class Coordinator / Head of the Department,
Department of ${studentDepartment},
${studentInstitute}.

Respected Faculty In-Charge,

I am writing to formally request leave of absence for ${isFullDay ? "the full academic day" : `Periods ${selectedPeriods.join(", ")}`} on ${leaveTargetDate}${leaveEndDate ? ` to ${leaveEndDate}` : ""}.

Reason for Leave:
${leaveReason || "Medical rest / personal academic engagement."}

I assure you that I will catch up with all pending lecture notes, coursework assignments, and lab deliverables promptly.

Thank you.

Yours sincerely,
${studentName}
Roll Number: ${studentRoll}
Section: ${studentSection} (${studentYear})`
      );
    }
  }, [leaveModalTab, leaveTargetDate, leaveEndDate, isFullDay, selectedPeriods, leaveReason, studentDepartment, studentInstitute, studentName, studentRoll, studentSection, studentYear]);

  // Fetch all College Desk Data on mount
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    async function loadCollegeDeskData() {
      setLoading(true);
      try {
        const [attRes, marksRes, transRes, feesRes, timeRes, classRes, leaveRes] = await Promise.allSettled([
          fetch(`/api/college/attendance?studentId=${user?.id}`),
          fetch(`/api/college/marks?studentId=${user?.id}`),
          fetch(`/api/college/transcripts?studentId=${user?.id}`),
          fetch(`/api/college/fees?studentId=${user?.id}`),
          fetch(`/api/college/timetable?department=${encodeURIComponent(studentDepartment)}&academicYear=${encodeURIComponent(studentYear)}&section=${encodeURIComponent(studentSection)}`),
          fetch(`/api/college/classroom?department=${encodeURIComponent(studentDepartment)}&academicYear=${encodeURIComponent(studentYear)}&section=${encodeURIComponent(studentSection)}&studentId=${user?.id}`),
          fetch(`/api/college/leave?studentId=${user?.id}`)
        ]);

        if (!isMounted) return;

        // Attendance
        if (attRes.status === "fulfilled" && attRes.value.ok) {
          const attJson = await attRes.value.json();
          if (attJson.overall) setOverallAttendance(attJson.overall);
          if (attJson.subjects) setSubjectsAttendance(attJson.subjects);
        }

        // Marks
        if (marksRes.status === "fulfilled" && marksRes.value.ok) {
          const marksJson = await marksRes.value.json();
          if (marksJson.subjects) setSubjectsMarks(marksJson.subjects);
        }

        // Transcripts
        if (transRes.status === "fulfilled" && transRes.value.ok) {
          const transJson = await transRes.value.json();
          if (transJson.transcripts) {
            setTranscripts(transJson.transcripts);
            setSelectedSemIndex(transJson.transcripts.length - 1);
          }
        }

        // Fees
        if (feesRes.status === "fulfilled" && feesRes.value.ok) {
          const feesJson = await feesRes.value.json();
          if (feesJson.fees) setFees(feesJson.fees);
          if (feesJson.summary) setFeeSummary(feesJson.summary);
        }

        // Timetable
        if (timeRes.status === "fulfilled" && timeRes.value.ok) {
          const timeJson = await timeRes.value.json();
          if (timeJson.schedule) setTimetable(timeJson.schedule);
        }

        // Classroom
        if (classRes.status === "fulfilled" && classRes.value.ok) {
          const classJson = await classRes.value.json();
          if (classJson.posts) setClassroomPosts(classJson.posts);
        }

        // Leave & OD applications
        if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
          const leaveJson = await leaveRes.value.json();
          if (leaveJson.applications) setLeaveApplications(leaveJson.applications);
        }
      } catch (err) {
        console.error("Failed loading college desk data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCollegeDeskData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, studentDepartment, studentYear, studentSection]);

  // Open Subject Attendance Drill-down Modal and Fetch Granular Daily Logs
  const handleOpenAttendanceDrilldown = async (subject: SubjectAttendance) => {
    setDrillDownSubject(subject);
    setLogsLoading(true);
    setLogStatusFilter("ALL");
    setSelectedMonthFilter("2026-09");
    try {
      const res = await fetch(`/api/college/attendance?studentId=${user?.id}&subjectId=${subject.id}&includeLogs=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.logs && json.logs.length > 0) {
          setDrillDownLogs(json.logs);
        } else {
          // Realistic baseline logs
          const mockLogs: AttendanceLog[] = [];
          const now = new Date();
          let currentDay = new Date(now.getTime() - (subject.totalClasses * 86400000 * 1.5));
          
          let attendedCount = 0;
          for (let i = 0; i < subject.totalClasses; i++) {
            currentDay = new Date(currentDay.getTime() + 86400000);
            if (currentDay.getDay() === 0 || currentDay.getDay() === 6) continue;

            const isAttended = attendedCount < subject.attendedClasses;
            const isOD = !isAttended && i % 8 === 0;
            const status: "PRESENT" | "ABSENT" | "OD" = isAttended ? "PRESENT" : isOD ? "OD" : "ABSENT";
            if (isAttended) attendedCount++;

            mockLogs.push({
              id: `log-${subject.id}-${i}`,
              subject_id: subject.id,
              date: currentDay.toISOString().split("T")[0],
              period_slot: (i % 6) + 1,
              status,
              remarks: status === "PRESENT" ? "Session completed" : status === "OD" ? "Smart India Hackathon OD" : "Absent without intimation",
              created_at: currentDay.toISOString()
            });
          }
          setDrillDownLogs(mockLogs.reverse());
        }
      }
    } catch {
      showToast("Error loading daily attendance logs.", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  // Submit Leave or OD Application
  const handleSubmitLeaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !leaveTitle.trim()) {
      showToast("Please provide an application title.", "error");
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await fetch("/api/college/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          applicationType: leaveModalTab === "od" ? "od" : "leave",
          targetDate: leaveTargetDate,
          endDate: leaveEndDate || null,
          isFullDay,
          periods: isFullDay ? [1, 2, 3, 4, 5, 6] : selectedPeriods,
          category: leaveCategory,
          title: leaveTitle,
          reason: leaveReason,
          letterBody: leaveModalTab === "leave" ? leaveLetterBody : null,
          proofUrl: leaveProofUrl || null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setLeaveApplications(prev => [data.application, ...prev]);
        setIsLeaveModalOpen(false);
        setLeaveTitle("");
        setLeaveReason("");
        setLeaveProofUrl("");
      } else {
        showToast(data.error || "Failed submitting application.", "error");
      }
    } catch {
      showToast("Error submitting leave application.", "error");
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Submit Assignment
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingPost || !user?.id) return;
    if (!submissionUrl.trim() && !selectedWorkspaceId.trim()) {
      showToast("Please provide either a submission URL or Workspace Bridge ID.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/college/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: submittingPost.id,
          studentId: user.id,
          submissionUrl: submissionUrl.trim(),
          submissionText: submissionNotes.trim(),
          workspaceId: selectedWorkspaceId.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Assignment deliverable submitted to faculty!", "success");
        setClassroomPosts(prev =>
          prev.map(p => (p.id === submittingPost.id ? { ...p, submission: data.submission } : p))
        );
        setSubmittingPost(null);
        setSubmissionUrl("");
        setSubmissionNotes("");
        setSelectedWorkspaceId("");
      } else {
        showToast(data.error || "Failed to submit assignment.", "error");
      }
    } catch {
      showToast("Error submitting deliverable.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle period selection
  const togglePeriod = (p: number) => {
    if (selectedPeriods.includes(p)) {
      if (selectedPeriods.length > 1) {
        setSelectedPeriods(selectedPeriods.filter(x => x !== p));
      }
    } else {
      setSelectedPeriods([...selectedPeriods, p].sort((a, b) => a - b));
    }
  };

  // Filter logs by status and month
  const filteredLogs = useMemo(() => {
    return drillDownLogs.filter(log => {
      const matchStatus = logStatusFilter === "ALL" || log.status === logStatusFilter;
      const matchMonth = selectedMonthFilter === "ALL" || log.date.startsWith(selectedMonthFilter);
      return matchStatus && matchMonth;
    });
  }, [drillDownLogs, logStatusFilter, selectedMonthFilter]);

  // Luna's Live Attendance Impact Calculator
  const simulatedAttendanceImpact = useMemo(() => {
    const totalPeriodsToApply = isFullDay ? 6 : selectedPeriods.length;
    const isOD = leaveModalTab === "od";
    const currentAttended = overallAttendance.attendedClasses;
    const currentTotal = overallAttendance.totalClasses;

    const projectedAttended = isOD ? currentAttended + totalPeriodsToApply : currentAttended;
    const projectedTotal = currentTotal + totalPeriodsToApply;
    const projectedPct = Math.round((projectedAttended / projectedTotal) * 1000) / 10;

    return {
      currentPct: overallAttendance.percentage,
      projectedPct,
      diff: Math.round((projectedPct - overallAttendance.percentage) * 10) / 10,
      isSafe: projectedPct >= 75
    };
  }, [isFullDay, selectedPeriods, leaveModalTab, overallAttendance]);

  const currentTranscript = transcripts[selectedSemIndex] || transcripts[0];

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* ======================================================== */}
        {/* 🎓 HERO & STUDENT IDENTITY GLANCE BANNER                */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden border border-border-main/70 bg-bg-surface/70 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent-main/10 border border-accent-main/30 flex items-center justify-center text-accent-main shrink-0 shadow-inner">
                <GraduationCap size={28} className="stroke-[1.75]" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-txt-main">
                    College Desk &amp; Academic ERP
                  </h1>
                  <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-accent-main/10 text-accent-main border border-accent-main/30 font-semibold">
                    University Scholar
                  </span>
                </div>
                <p className="text-xs text-txt-muted font-mono leading-relaxed">
                  {studentInstitute} • {studentDepartment} • Section {studentSection} ({studentYear}) • Roll: <strong className="text-txt-main">{studentRoll}</strong>
                </p>
              </div>
            </div>

            {/* Quick Metrics Glance */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="px-4 py-2.5 rounded-lg bg-bg-card/50 border border-border-main/60 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] uppercase text-txt-muted">Overall Attendance</span>
                  <span className="font-display text-sm font-bold text-txt-main">{overallAttendance.percentage}% ({overallAttendance.status})</span>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-lg bg-bg-card/50 border border-border-main/60 flex items-center gap-3">
                <Award size={15} className="text-accent-main" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] uppercase text-txt-muted">Current CGPA</span>
                  <span className="font-display text-sm font-bold text-accent-main">
                    {transcripts[transcripts.length - 1]?.cgpa || 8.92} / 10.0
                  </span>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-lg bg-bg-card/50 border border-border-main/60 flex items-center gap-3">
                <DollarSign size={15} className="text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] uppercase text-txt-muted">Tuition &amp; Fees</span>
                  <span className="font-display text-sm font-bold text-txt-main">₹{feeSummary.pendingBalance.toLocaleString()} Due</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 🎛️ MAIN PILLAR SELECTOR TABS                             */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-border-main/60 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainTab("erp")}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === "erp"
                  ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                  : "text-txt-sub hover:text-txt-main hover:bg-bg-card/50"
              }`}
            >
              <Layers size={14} />
              Pillar 1: Academic ERP Hub
            </button>
            <button
              onClick={() => setActiveMainTab("classroom")}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === "classroom"
                  ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                  : "text-txt-sub hover:text-txt-main hover:bg-bg-card/50"
              }`}
            >
              <MessageSquare size={14} />
              Pillar 2: Section Classroom Stream
              {classroomPosts.filter(p => p.post_type === "assignment" && !p.submission).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          <span className="hidden md:inline font-mono text-[10px] text-txt-muted uppercase tracking-widest">
            {activeMainTab === "erp" ? "Institutional ERP Portal" : `Section ${studentSection} Stream`}
          </span>
        </div>

        {/* ======================================================== */}
        {/* 📊 PILLAR 1: ACADEMIC ERP HUB CONTENT                    */}
        {/* ======================================================== */}
        {activeMainTab === "erp" && (
          <div className="flex flex-col gap-6">
            
            {/* Sub-Navigation Pills: Reordered (Attendance -> Timetable -> Marks -> Transcripts -> Fees) */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
              <button
                onClick={() => setErpTab("attendance")}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  erpTab === "attendance"
                    ? "bg-bg-card border-txt-main text-txt-main font-semibold"
                    : "border-border-main/50 text-txt-sub hover:text-txt-main hover:border-border-main"
                }`}
              >
                <Calendar size={13} />
                Attendance Ledger ({overallAttendance.percentage}%)
              </button>

              <button
                onClick={() => setErpTab("timetable")}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  erpTab === "timetable"
                    ? "bg-bg-card border-txt-main text-txt-main font-semibold"
                    : "border-border-main/50 text-txt-sub hover:text-txt-main hover:border-border-main"
                }`}
              >
                <Clock size={13} />
                Class Timetable
              </button>

              <button
                onClick={() => setErpTab("marks")}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  erpTab === "marks"
                    ? "bg-bg-card border-txt-main text-txt-main font-semibold"
                    : "border-border-main/50 text-txt-sub hover:text-txt-main hover:border-border-main"
                }`}
              >
                <Award size={13} />
                Internal &amp; Assignment Marks
              </button>

              <button
                onClick={() => setErpTab("transcripts")}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  erpTab === "transcripts"
                    ? "bg-bg-card border-txt-main text-txt-main font-semibold"
                    : "border-border-main/50 text-txt-sub hover:text-txt-main hover:border-border-main"
                }`}
              >
                <GraduationCap size={13} />
                Semester Transcripts (1–8)
              </button>

              <button
                onClick={() => setErpTab("fees")}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  erpTab === "fees"
                    ? "bg-bg-card border-txt-main text-txt-main font-semibold"
                    : "border-border-main/50 text-txt-sub hover:text-txt-main hover:border-border-main"
                }`}
              >
                <DollarSign size={13} />
                Fee Ledger
              </button>
            </div>

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 1: ATTENDANCE LEDGER WITH DRILL-DOWN           */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "attendance" && (
              <div className="flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-lg text-txt-main font-normal">Subject-Wise Attendance Ledger</h2>
                    <p className="text-xs text-txt-sub font-light">Click any subject card to view filtered month-wise period logs.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setLeaveModalTab("od");
                        setIsLeaveModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded text-xs font-mono font-semibold bg-accent-main text-bg-base hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Award size={13} /> Apply for OD
                    </button>
                    <button
                      onClick={() => {
                        setLeaveModalTab("leave");
                        setIsLeaveModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded text-xs font-mono border border-border-main hover:bg-bg-card text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={13} /> Apply for Leave
                    </button>
                  </div>
                </div>

                {/* Subject Attendance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectsAttendance.map((sub) => {
                    const isSafe = sub.percentage >= 75;
                    const isWarning = sub.percentage >= 65 && sub.percentage < 75;
                    
                    return (
                      <motion.div
                        key={sub.id}
                        whileHover={{ y: -2 }}
                        onClick={() => handleOpenAttendanceDrilldown(sub)}
                        className="group border border-border-main/70 hover:border-accent-main/60 bg-bg-surface/50 hover:bg-bg-card/40 rounded-lg p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all shadow-xs"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-accent-main">{sub.subject_code}</span>
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                              isSafe ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : isWarning ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}>
                              {sub.percentage}% • {sub.status}
                            </span>
                          </div>

                          <h3 className="font-display text-sm font-medium text-txt-main line-clamp-1 group-hover:text-accent-main transition-colors">
                            {sub.subject_name}
                          </h3>

                          <span className="text-xs text-txt-sub font-light">
                            Instructor: {sub.faculty_name} ({sub.credits} Credits)
                          </span>
                        </div>

                        {/* Progress Bar & Class Stats */}
                        <div className="flex flex-col gap-2">
                          <div className="w-full bg-bg-card h-2 rounded-full overflow-hidden border border-border-main/40">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isSafe ? "bg-emerald-400" : isWarning ? "bg-amber-400" : "bg-rose-400"
                              }`}
                              style={{ width: `${Math.min(100, sub.percentage)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between font-mono text-[10px] text-txt-muted">
                            <span>Attended: <strong className="text-txt-main font-normal">{sub.attendedClasses}</strong> / {sub.totalClasses}</span>
                            <span>Absent: <strong className="text-rose-400/90 font-normal">{sub.absentClasses}</strong></span>
                            <span className="flex items-center gap-0.5 text-accent-main group-hover:underline">
                              View Month Logs <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 2: CLASS TIMETABLE & OD/LEAVE ACTIONS          */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "timetable" && (
              <div className="flex flex-col gap-6">
                
                {/* Timetable Header & Action Strip */}
                <div className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-base font-semibold text-txt-main">
                        Weekly Class Schedule (Periods 1–6)
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-main/10 text-accent-main border border-accent-main/30 font-semibold">
                        Semester 5 Schedule
                      </span>
                    </div>
                    <p className="text-xs text-txt-muted font-light">
                      Periods are aligned 50 minutes each. You can claim On-Duty (OD) or submit Leave directly for upcoming periods.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => {
                        setLeaveModalTab("od");
                        setIsLeaveModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded text-xs font-mono font-semibold bg-accent-main text-bg-base hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Award size={13} /> Apply for OD
                    </button>
                    <button
                      onClick={() => {
                        setLeaveModalTab("leave");
                        setIsLeaveModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded text-xs font-mono border border-border-main hover:bg-bg-card text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={13} /> Apply for Leave
                    </button>
                    <button
                      onClick={() => {
                        setLeaveModalTab("history");
                        setIsLeaveModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded text-xs font-mono border border-border-main/60 bg-bg-card/40 hover:bg-bg-card text-txt-sub hover:text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock size={13} /> My Applications ({leaveApplications.length})
                    </button>
                  </div>
                </div>

                {/* Day of Week Selector */}
                <div className="flex items-center gap-2 border-b border-border-main/40 pb-3 overflow-x-auto">
                  {timetable.map((d) => (
                    <button
                      key={d.dayIndex}
                      onClick={() => setActiveTimetableDay(d.dayIndex)}
                      className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                        activeTimetableDay === d.dayIndex
                          ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                          : "bg-bg-card/50 border border-border-main/50 text-txt-sub hover:text-txt-main"
                      }`}
                    >
                      {d.dayName}
                    </button>
                  ))}
                </div>

                {/* Timetable Period Rows Aligned */}
                {(() => {
                  const dayData = timetable.find(d => d.dayIndex === activeTimetableDay) || timetable[0];
                  if (!dayData) return null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {dayData.periods.map((slot) => (
                        <div key={slot.periodSlot} className="border border-border-main/60 bg-bg-surface/50 hover:bg-bg-card/30 transition-colors rounded-lg p-4 flex flex-col justify-between gap-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-accent-main">
                              Period {slot.periodSlot}
                            </span>
                            <span className="font-mono text-[10px] text-txt-muted bg-bg-card px-2 py-0.5 rounded border border-border-main/40">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <h4 className="font-display text-sm font-medium text-txt-main line-clamp-1">{slot.subjectName}</h4>
                            <span className="font-mono text-[11px] text-txt-sub">{slot.subjectCode}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border-main/30 font-mono text-[10px] text-txt-muted">
                            <span>Room: <strong className="text-txt-main font-normal">{slot.roomNumber}</strong></span>
                            <span>{slot.facultyName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            )}

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 3: INTERNAL & ASSIGNMENT MARKS (TEST-WISE)     */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "marks" && (
              <div className="flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-lg text-txt-main font-normal">Internal &amp; Assignment Marks</h2>
                    <p className="text-xs text-txt-sub font-light">View subject performance categorized test-wise and coursework assignments.</p>
                  </div>

                  {/* Assessment-Wise Switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-bg-card/60 rounded-md border border-border-main/60 font-mono text-[10.5px]">
                    {(["IA-1", "IA-2", "Model Exam", "Lab Practicals", "Course Assignments"] as const).map((testType) => (
                      <button
                        key={testType}
                        onClick={() => setSelectedAssessmentType(testType)}
                        className={`px-3 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
                          selectedAssessmentType === testType
                            ? "bg-accent-main text-bg-base font-bold shadow-xs"
                            : "text-txt-sub hover:text-txt-main hover:bg-bg-surface"
                        }`}
                      >
                        {testType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Internal Assessment / Exam Views */}
                {selectedAssessmentType !== "Course Assignments" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectsMarks.map((sub) => {
                      const exam = sub.exams.find(e => e.examType === selectedAssessmentType) || sub.exams[0];
                      if (!exam) return null;

                      return (
                        <div key={sub.id} className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-5 flex flex-col justify-between gap-4 shadow-xs">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-accent-main">{sub.subject_code}</span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg-card border border-border-main/60 text-accent-main font-bold">
                                Grade {exam.grade}
                              </span>
                            </div>

                            <h3 className="font-display text-sm font-medium text-txt-main line-clamp-1">{sub.subject_name}</h3>
                            <span className="text-[11px] text-txt-sub font-light">Instructor: {sub.faculty_name}</span>
                          </div>

                          <div className="flex flex-col gap-2.5 pt-3 border-t border-border-main/40">
                            <div className="flex items-baseline justify-between">
                              <span className="font-display text-2xl font-light text-txt-main">
                                {exam.marksObtained} <span className="text-xs font-mono text-txt-muted">/ {exam.maxMarks}</span>
                              </span>
                              <span className="font-mono text-xs text-txt-muted">
                                Class Benchmark: <strong className="text-txt-main">{exam.classAverage}</strong>
                              </span>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="w-full bg-bg-card h-1.5 rounded-full overflow-hidden border border-border-main/40">
                                <div 
                                  className="h-full bg-accent-main rounded-full"
                                  style={{ width: `${exam.percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-txt-muted font-light italic truncate">{exam.remarks}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* 2. Dedicated Coursework Assignments View */
                  <div className="flex flex-col gap-3">
                    {classroomPosts.filter(p => p.post_type === "assignment").map((assign) => {
                      const isSubmitted = !!assign.submission;
                      const grade = assign.submission?.grade;

                      return (
                        <div key={assign.id} className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-accent-main font-semibold">Coursework</span>
                              <span className="text-txt-muted">•</span>
                              <span className="text-xs text-txt-muted font-mono">Due: {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : "Next Week"}</span>
                            </div>
                            <h3 className="font-display text-sm font-medium text-txt-main">{assign.title}</h3>
                            <p className="text-xs text-txt-sub font-light line-clamp-1">{assign.content}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col text-right font-mono text-xs">
                              {grade !== undefined && grade !== null ? (
                                <span className="text-sm font-bold text-emerald-400">{grade} / 100</span>
                              ) : isSubmitted ? (
                                <span className="text-amber-400 font-medium">Submitted (Grading Pending)</span>
                              ) : (
                                <span className="text-txt-muted">Not Submitted</span>
                              )}
                              <span className="text-[10px] text-txt-muted">{assign.author_name}</span>
                            </div>

                            <button
                              onClick={() => {
                                setActiveMainTab("classroom");
                                setSubmittingPost(assign);
                              }}
                              className="px-3.5 py-1.5 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Code2 size={13} className="text-accent-main" />
                              {isSubmitted ? "View Submission" : "Submit Work"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 4: SEMESTER TRANSCRIPTS (1 TO 8)               */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "transcripts" && (
              <div className="flex flex-col gap-6">
                
                {/* Semester Selector Pills */}
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    {transcripts.map((t, idx) => (
                      <button
                        key={t.semester}
                        onClick={() => setSelectedSemIndex(idx)}
                        className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                          selectedSemIndex === idx
                            ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                            : "bg-bg-card/50 border border-border-main/50 text-txt-sub hover:text-txt-main"
                        }`}
                      >
                        Sem {t.semester} ({t.sgpa} SGPA)
                      </button>
                    ))}
                  </div>

                  <span className="font-mono text-xs text-txt-sub hidden sm:inline">
                    Cumulative: <strong className="text-txt-main">{transcripts[transcripts.length - 1]?.cgpa} CGPA</strong>
                  </span>
                </div>

                {/* Grade Sheet Table */}
                {currentTranscript && (
                  <div className="border border-border-main/70 bg-bg-surface/60 rounded-lg overflow-hidden flex flex-col shadow-xs">
                    
                    <div className="p-4 border-b border-border-main/50 bg-bg-card/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-base font-medium text-txt-main">
                          Semester {currentTranscript.semester} Official Transcript
                        </h3>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {currentTranscript.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-xs text-txt-sub">
                        <span>Total Credits: <strong className="text-txt-main">{currentTranscript.total_credits}</strong></span>
                        <span>Earned: <strong className="text-emerald-400">{currentTranscript.earned_credits}</strong></span>
                        <span>SGPA: <strong className="text-accent-main">{currentTranscript.sgpa}</strong></span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-light">
                        <thead className="border-b border-border-main/40 font-mono text-[10px] uppercase text-txt-muted bg-bg-card/20">
                          <tr>
                            <th className="px-4 py-3">Course Code</th>
                            <th className="px-4 py-3">Course Title</th>
                            <th className="px-4 py-3 text-center">Credits</th>
                            <th className="px-4 py-3 text-center">Letter Grade</th>
                            <th className="px-4 py-3 text-center">Grade Point</th>
                            <th className="px-4 py-3 text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main/30 font-sans">
                          {currentTranscript.results_json.map((course) => (
                            <tr key={course.code} className="hover:bg-bg-card/30 transition-colors">
                              <td className="px-4 py-3 font-mono font-medium text-accent-main">{course.code}</td>
                              <td className="px-4 py-3 text-txt-main font-normal">{course.name}</td>
                              <td className="px-4 py-3 text-center font-mono text-txt-sub">{course.credits}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-txt-main">{course.grade}</td>
                              <td className="px-4 py-3 text-center font-mono text-txt-sub">{course.points}</td>
                              <td className="px-4 py-3 text-right font-mono text-emerald-400 font-medium">PASS</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 5: FEE RECORDS & PAYMENT LEDGER                */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "fees" && (
              <div className="flex flex-col gap-6">
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-lg text-txt-main font-normal">Institutional Fee Ledger &amp; Receipts</h2>
                    <p className="text-xs text-txt-sub font-light">Track semester tuition fees, lab dues, university exam fees, and payment vouchers.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {fees.map((fee) => (
                    <div key={fee.id} className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-txt-muted">{fee.academic_year}</span>
                          <span className="text-txt-muted">•</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                            fee.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {fee.status}
                          </span>
                        </div>

                        <h3 className="font-display text-sm font-medium text-txt-main">{fee.term_name}</h3>
                        <span className="text-xs text-txt-sub font-light">Due Date: {fee.due_date}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col text-right">
                          <span className="font-display text-lg font-light text-txt-main">₹{fee.total_amount.toLocaleString()}</span>
                          <span className="font-mono text-[10px] text-txt-muted">Paid: ₹{fee.paid_amount.toLocaleString()}</span>
                        </div>

                        {fee.status === "PAID" && fee.receipt_url ? (
                          <button 
                            onClick={() => showToast("Downloading official fee payment receipt...", "info")}
                            className="px-3 py-1.5 font-mono text-[11px] rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download size={13} />
                            Receipt
                          </button>
                        ) : (
                          <button 
                            onClick={() => showToast("Opening institutional payment gateway...", "info")}
                            className="px-3.5 py-1.5 font-mono text-[11px] font-semibold rounded bg-accent-main text-bg-base hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                          >
                            Pay Dues
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* 📚 PILLAR 2: SECTION CLASSROOM STREAM                    */}
        {/* ======================================================== */}
        {activeMainTab === "classroom" && (
          <div className="flex flex-col gap-6">
            
            {/* Stream Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/50 pb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto font-mono text-[11px]">
                {(["all", "assignment", "material", "notice", "discussion"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setClassroomFilter(tab)}
                    className={`px-3 py-1.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
                      classroomFilter === tab
                        ? "bg-accent-main text-bg-base font-semibold shadow-xs"
                        : "bg-bg-card/40 border border-border-main/40 text-txt-sub hover:text-txt-main"
                    }`}
                  >
                    {tab === "all" ? "All Streams" : tab}
                  </button>
                ))}
              </div>

              <span className="font-mono text-xs text-txt-muted">
                Showing {classroomPosts.filter(p => classroomFilter === "all" || p.post_type === classroomFilter).length} stream posts
              </span>
            </div>

            {/* Posts Feed */}
            <div className="flex flex-col gap-4">
              {classroomPosts.filter(p => classroomFilter === "all" || p.post_type === classroomFilter).map((post) => {
                const isAssignment = post.post_type === "assignment";
                const isMaterial = post.post_type === "material";
                const isNotice = post.post_type === "notice";
                const isSubmitted = !!post.submission;

                return (
                  <div
                    key={post.id}
                    className={`border rounded-lg p-5 flex flex-col gap-4 transition-all shadow-xs ${
                      isAssignment
                        ? "border-accent-main/40 bg-bg-surface/70"
                        : "border-border-main/70 bg-bg-surface/50"
                    }`}
                  >
                    {/* Post Top Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                          isAssignment ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                          isMaterial ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                          isNotice ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}>
                          {post.post_type}
                        </span>
                        <span className="text-txt-muted text-xs">•</span>
                        <span className="text-xs text-txt-sub">{post.author_name}</span>
                      </div>

                      <span className="font-mono text-[10px] text-txt-muted">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title & Body Content */}
                    <div className="flex flex-col gap-2">
                      <h3 className="font-display text-base font-medium text-txt-main">{post.title}</h3>
                      <p className="text-xs text-txt-sub font-light leading-relaxed select-text">{post.content}</p>
                    </div>

                    {/* Attached Resources */}
                    {post.attachment_url && (
                      <div className="flex items-center gap-3 p-3 rounded bg-bg-card/40 border border-border-main/40 self-start">
                        <FileText size={16} className="text-accent-main shrink-0" />
                        <span className="text-xs font-mono text-txt-main truncate max-w-xs">{post.attachment_name || "Course_Resource_Document.pdf"}</span>
                        <a 
                          href={post.attachment_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-mono text-[10px] text-accent-main hover:underline flex items-center gap-0.5 ml-2"
                        >
                          Download <Download size={11} />
                        </a>
                      </div>
                    )}

                    {/* Assignment Action Bar & Workspace Bridge */}
                    {isAssignment && (
                      <div className="pt-3 border-t border-border-main/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                        
                        <div className="flex items-center gap-2 font-mono text-xs text-txt-sub">
                          <Clock size={13} className="text-amber-400" />
                          <span>Due: <strong className="text-txt-main font-normal">{post.due_date ? new Date(post.due_date).toLocaleDateString() : "Next Friday"}</strong></span>
                          {isSubmitted && (
                            <span className="ml-2 font-mono text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Submitted
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Link
                            href="/event-desk"
                            className="px-3 py-1.5 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Code2 size={13} className="text-accent-main" />
                            Bridge to Workspace
                          </Link>

                          <button
                            onClick={() => setSubmittingPost(post)}
                            className="px-4 py-1.5 font-mono text-xs font-semibold rounded bg-accent-main text-bg-base hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                          >
                            {isSubmitted ? "Update Submission" : "Submit Assignment"}
                          </button>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* 📅 MODAL: MONTH-FILTERED DAY-BY-DAY ATTENDANCE LOG       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {drillDownSubject && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrillDownSubject(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-bg-surface border border-border-main rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border-main/50 bg-bg-card/40 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-accent-main">{drillDownSubject.subject_code}</span>
                    <span className="text-txt-muted">•</span>
                    <h3 className="font-display text-base font-semibold text-txt-main">{drillDownSubject.subject_name}</h3>
                  </div>
                  <span className="text-xs text-txt-sub font-light">
                    Faculty: {drillDownSubject.faculty_name} ({drillDownSubject.percentage}% Attendance)
                  </span>
                </div>

                <button 
                  onClick={() => setDrillDownSubject(null)}
                  className="p-1 rounded hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Month Selector & Status Filter Bar */}
              <div className="px-6 py-3 border-b border-border-main/30 bg-bg-card/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-txt-muted uppercase tracking-widest">Month:</span>
                  <select
                    value={selectedMonthFilter}
                    onChange={(e) => setSelectedMonthFilter(e.target.value)}
                    className="h-7 px-2.5 bg-bg-surface border border-border-main/60 rounded text-[11px] font-mono text-txt-main focus:outline-none focus:border-accent-main"
                  >
                    <option value="2026-09">September 2026 (Current)</option>
                    <option value="2026-08">August 2026</option>
                    <option value="2026-07">July 2026</option>
                    <option value="2026-06">June 2026</option>
                    <option value="ALL">All Semester Logs</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  {(["ALL", "PRESENT", "ABSENT", "OD", "LATE"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setLogStatusFilter(st)}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        logStatusFilter === st
                          ? "bg-accent-main text-bg-base font-bold"
                          : "bg-bg-surface border border-border-main/40 text-txt-sub hover:text-txt-main"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Timeline List */}
              <div className="flex-1 p-6 overflow-y-auto divide-y divide-border-main/30">
                {logsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
                    <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
                    <span>Loading daily period records...</span>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-txt-muted font-mono">
                    No attendance logs found matching {selectedMonthFilter} • {logStatusFilter} filter.
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const isPres = log.status === "PRESENT";
                    const isAbs = log.status === "ABSENT";
                    const isOD = log.status === "OD";

                    return (
                      <div key={log.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                            isPres ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                            isAbs ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" :
                            isOD ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                            "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          }`}>
                            {log.status === "PRESENT" ? "P" : log.status === "ABSENT" ? "A" : log.status === "OD" ? "OD" : "L"}
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-medium text-txt-main">{log.date}</span>
                            <span className="text-[11px] text-txt-sub font-light">{log.remarks || "Regular period"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-txt-muted">Period {log.period_slot}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isPres ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            isAbs ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border-main/50 bg-bg-card/40 flex items-center justify-between">
                <span className="font-mono text-[10px] text-txt-muted">
                  Showing {filteredLogs.length} matching logs
                </span>
                <button
                  onClick={() => setDrillDownSubject(null)}
                  className="px-4 py-1.5 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                >
                  Close Log
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 📝 MODAL: INTEGRATED ON-DUTY (OD) & FORMAL LEAVE ENGINE  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsLeaveModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-bg-surface border border-border-main rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header & Tabs */}
              <div className="px-6 py-4 border-b border-border-main/50 bg-bg-card/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(["od", "leave", "history"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setLeaveModalTab(tab)}
                      className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        leaveModalTab === tab
                          ? "bg-accent-main text-bg-base font-bold shadow-xs"
                          : "text-txt-sub hover:text-txt-main hover:bg-bg-surface"
                      }`}
                    >
                      {tab === "od" ? "On-Duty (OD) Claim" : tab === "leave" ? "Formal Leave Letter" : `History (${leaveApplications.length})`}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="p-1 rounded hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex flex-col gap-4">
                
                {/* TAB 1: ON-DUTY (OD) & TAB 2: FORMAL LEAVE */}
                {leaveModalTab !== "history" ? (
                  <form onSubmit={handleSubmitLeaveApp} className="flex flex-col gap-4">
                    
                    {/* Live Attendance Impact Calculator Banner */}
                    <div className={`p-3.5 rounded-md border flex items-center justify-between font-mono text-xs ${
                      simulatedAttendanceImpact.isSafe
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}>
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} />
                        <span>
                          Attendance Impact: <strong>{simulatedAttendanceImpact.currentPct}%</strong> → <strong>{simulatedAttendanceImpact.projectedPct}%</strong>
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold">
                        {simulatedAttendanceImpact.isSafe ? "Safe (> 75% Threshold)" : "Attendance Risk Warning"}
                      </span>
                    </div>

                    {/* Target Date & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-txt-sub font-semibold">Target Date</label>
                        <input
                          type="date"
                          value={leaveTargetDate}
                          onChange={(e) => setLeaveTargetDate(e.target.value)}
                          required
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono focus:outline-none focus:border-accent-main"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-txt-sub font-semibold">Period Duration</label>
                        <div className="flex items-center gap-2 h-9">
                          <button
                            type="button"
                            onClick={() => {
                              setIsFullDay(true);
                              setSelectedPeriods([1, 2, 3, 4, 5, 6]);
                            }}
                            className={`flex-1 h-full rounded text-xs font-mono transition-all ${
                              isFullDay
                                ? "bg-accent-main text-bg-base font-bold"
                                : "border border-border-main/60 bg-bg-base text-txt-sub"
                            }`}
                          >
                            Whole Day (All 6)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFullDay(false)}
                            className={`flex-1 h-full rounded text-xs font-mono transition-all ${
                              !isFullDay
                                ? "bg-accent-main text-bg-base font-bold"
                                : "border border-border-main/60 bg-bg-base text-txt-sub"
                            }`}
                          >
                            Select Periods
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Period Checkbox Grid (if individual periods chosen) */}
                    {!isFullDay && (
                      <div className="flex flex-col gap-1.5 p-3 rounded bg-bg-card/30 border border-border-main/40">
                        <span className="text-[10px] font-mono text-txt-muted uppercase">Select Applicable Class Periods:</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-xs">
                          {[1, 2, 3, 4, 5, 6].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => togglePeriod(p)}
                              className={`py-1.5 rounded border text-center transition-colors ${
                                selectedPeriods.includes(p)
                                  ? "bg-accent-main/20 border-accent-main text-accent-main font-bold"
                                  : "border-border-main/50 bg-bg-surface text-txt-muted"
                              }`}
                            >
                              Period {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Title & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-txt-sub font-semibold">
                          {leaveModalTab === "od" ? "Event / Competition Title" : "Leave Subject / Title"}
                        </label>
                        <input
                          type="text"
                          value={leaveTitle}
                          onChange={(e) => setLeaveTitle(e.target.value)}
                          placeholder={leaveModalTab === "od" ? "e.g. Smart India Hackathon Grand Finale" : "e.g. Leave Request for Medical Recovery"}
                          required
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-accent-main"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-txt-sub font-semibold">Category Scope</label>
                        <select
                          value={leaveCategory}
                          onChange={(e) => setLeaveCategory(e.target.value)}
                          className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono focus:outline-none focus:border-accent-main"
                        >
                          {leaveModalTab === "od" ? (
                            <>
                              <option value="hackathon">Hackathon / Coding Contest</option>
                              <option value="symposium">Inter-College Technical Symposium</option>
                              <option value="conference">Research Conference / Paper Presentation</option>
                              <option value="sports">Sports &amp; Culturals Championship</option>
                              <option value="academic">Academic Project Defense / Lab Review</option>
                            </>
                          ) : (
                            <>
                              <option value="medical">Medical Rest / Doctor Consultation</option>
                              <option value="personal">Personal Emergency / Family Function</option>
                              <option value="academic">Academic Self-Study / External Exam</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Formal Letter Composer for Leave */}
                    {leaveModalTab === "leave" ? (
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-mono text-txt-sub font-semibold">Formal Letter to Class Coordinator</label>
                        <textarea
                          rows={6}
                          value={leaveLetterBody}
                          onChange={(e) => setLeaveLetterBody(e.target.value)}
                          className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono leading-relaxed focus:outline-none focus:border-accent-main resize-none"
                        />
                      </div>
                    ) : (
                      /* OD Description and Proof Attachment */
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-mono text-txt-sub font-semibold">OD Purpose &amp; Activity Description</label>
                          <textarea
                            rows={3}
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            placeholder="Explain the event format, your role, and institutional representation..."
                            className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-accent-main resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-mono text-txt-sub font-semibold">Proof / Acceptance Letter URL (Optional)</label>
                          <input
                            type="url"
                            value={leaveProofUrl}
                            onChange={(e) => setLeaveProofUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/my-od-invitation.pdf"
                            className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono focus:outline-none focus:border-accent-main"
                          />
                        </div>
                      </>
                    )}

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-2.5 pt-2 border-t border-border-main/40">
                      <button
                        type="button"
                        onClick={() => setIsLeaveModalOpen(false)}
                        className="px-4 py-2 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingLeave}
                        className="px-5 py-2 font-mono text-xs font-semibold rounded bg-accent-main text-bg-base hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSubmittingLeave ? (
                          <span className="w-3.5 h-3.5 rounded-full border border-bg-base border-t-transparent animate-spin" />
                        ) : (
                          <>
                            <Send size={13} />
                            Submit {leaveModalTab === "od" ? "OD Claim" : "Leave Application"}
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                ) : (
                  /* TAB 3: APPLICATIONS HISTORY */
                  <div className="flex flex-col gap-3">
                    {leaveApplications.length === 0 ? (
                      <div className="py-12 text-center text-xs text-txt-muted font-mono">
                        No previous leave or OD claims submitted.
                      </div>
                    ) : (
                      leaveApplications.map((app) => (
                        <div key={app.id} className="border border-border-main/60 bg-bg-card/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                                app.application_type === "od"
                                  ? "bg-accent-main/10 text-accent-main border-accent-main/30"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              }`}>
                                {app.application_type.toUpperCase()}
                              </span>
                              <span className="font-mono text-xs text-txt-muted">Date: {app.target_date}</span>
                              <span className="text-txt-muted">•</span>
                              <span className="font-mono text-xs text-txt-sub">{app.is_full_day ? "Whole Day" : `Periods ${app.periods?.join(", ")}`}</span>
                            </div>
                            <h4 className="font-display text-sm font-medium text-txt-main">{app.title}</h4>
                            {app.faculty_remarks && (
                              <span className="text-[11px] text-txt-muted italic">Faculty Note: {app.faculty_remarks}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              app.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : app.status === "rejected"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}>
                              {app.status}
                            </span>

                            {app.status === "approved" && (
                              <button
                                onClick={() => setViewingLeaveSlip(app)}
                                className="px-3 py-1 font-mono text-[10px] font-semibold rounded bg-accent-main text-bg-base hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                              >
                                <QrCode size={11} /> Leave Slip
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 🎫 MODAL: DIGITAL LEAVE SLIP / GATE PASS WITH QR         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {viewingLeaveSlip && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setViewingLeaveSlip(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-bg-surface border border-accent-main/40 rounded-xl shadow-2xl flex flex-col overflow-hidden text-txt-main"
            >
              {/* Official Seal Banner */}
              <div className="p-6 bg-gradient-to-b from-accent-main/10 to-transparent border-b border-border-main/50 flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent-main text-bg-base flex items-center justify-center shadow-md">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-display text-base font-bold tracking-tight">{studentInstitute}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent-main font-semibold">
                    Official Institutional Gate Pass &amp; Leave Slip
                  </span>
                </div>
              </div>

              {/* Student Details Card */}
              <div className="p-6 flex flex-col gap-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-bg-card/40 border border-border-main/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase text-txt-muted">Student Name</span>
                    <span className="font-bold text-txt-main">{studentName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase text-txt-muted">Roll Number</span>
                    <span className="font-bold text-txt-main">{studentRoll}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase text-txt-muted">Department</span>
                    <span className="text-txt-sub">{studentDepartment}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase text-txt-muted">Section &amp; Year</span>
                    <span className="text-txt-sub">Sec {studentSection} ({studentYear})</span>
                  </div>
                </div>

                {/* Authorization Details */}
                <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold">Type: {viewingLeaveSlip.application_type.toUpperCase()} Authorization</span>
                    <span className="text-[10px] font-bold">STATUS: VERIFIED</span>
                  </div>
                  <span className="text-xs text-txt-main font-semibold">{viewingLeaveSlip.title}</span>
                  <span className="text-[11px] text-txt-sub">
                    Authorized Date: <strong>{viewingLeaveSlip.target_date}</strong> • {viewingLeaveSlip.is_full_day ? "Whole Day (All Periods)" : `Periods ${viewingLeaveSlip.periods?.join(", ")}`}
                  </span>
                </div>

                {/* Verification Stamp & QR Code */}
                <div className="flex items-center justify-between pt-2 border-t border-border-main/40">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-bg-base border border-border-main rounded flex items-center justify-center">
                      <QrCode size={32} className="text-txt-main" />
                    </div>
                    <div className="flex flex-col text-[9.5px] text-txt-muted">
                      <span>Auth Hash: {viewingLeaveSlip.id.substring(0, 12)}...</span>
                      <span>Coordinator Signature: Verified</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3 py-1.5 rounded border border-border-main hover:bg-bg-card text-txt-main flex items-center gap-1.5 cursor-pointer text-[10px] uppercase"
                  >
                    <Printer size={12} /> Print Slip
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="p-4 border-t border-border-main/50 bg-bg-card/40 flex justify-end">
                <button
                  onClick={() => setViewingLeaveSlip(null)}
                  className="px-4 py-1.5 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 📝 MODAL: ASSIGNMENT SUBMISSION & WORKSPACE BRIDGE        */}
      {/* ======================================================== */}
      <AnimatePresence>
        {submittingPost && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSubmittingPost(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-bg-surface border border-border-main rounded-lg shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border-main/50 bg-bg-card/40 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Classroom Assignment</span>
                  <h3 className="font-display text-base font-semibold text-txt-main line-clamp-1">{submittingPost.title}</h3>
                </div>
                <button 
                  onClick={() => setSubmittingPost(null)}
                  className="p-1 rounded hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAssignmentSubmit} className="p-6 flex flex-col gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub">GitHub / Repository / Live Demo URL</label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/myusername/turing-machine-simulator"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-txt-main font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub">Project Space / Workspace Bridge ID (Optional)</label>
                  <input
                    type="text"
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    placeholder="e.g. workspace-eduforge-id"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-txt-main font-mono"
                  />
                  <span className="text-[10px] text-txt-muted font-light">Link an active LynDesk project workspace so instructors can review live code artifacts.</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub">Submission Notes &amp; Implementation Details</label>
                  <textarea
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Explain your approach, testing results, or edge cases handled..."
                    className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none focus:border-txt-main resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingPost(null)}
                    className="px-4 py-2 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 font-mono text-xs font-semibold rounded bg-accent-main text-bg-base hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 rounded-full border border-bg-base border-t-transparent animate-spin" />
                    ) : (
                      "Submit Deliverable"
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
