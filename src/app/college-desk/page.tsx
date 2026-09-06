"use client";

import React, { useState, useEffect } from "react";
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
  UserCheck
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

export default function CollegeDeskPage() {
  const { user, userProfile, userRole, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Top-Level Main Tabs: "erp" | "classroom"
  const [activeMainTab, setActiveMainTab] = useState<"erp" | "classroom">("erp");

  // ERP Sub-Tabs: "attendance" | "marks" | "transcripts" | "fees" | "timetable"
  const [erpTab, setErpTab] = useState<"attendance" | "marks" | "transcripts" | "fees" | "timetable">("attendance");

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
  const isLinked = userProfile?.college_linked_status === "linked";

  // Fetch all College Desk Data on mount
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    async function loadCollegeDeskData() {
      setLoading(true);
      try {
        const [attRes, marksRes, transRes, feesRes, timeRes, classRes] = await Promise.allSettled([
          fetch(`/api/college/attendance?studentId=${user?.id}`),
          fetch(`/api/college/marks?studentId=${user?.id}`),
          fetch(`/api/college/transcripts?studentId=${user?.id}`),
          fetch(`/api/college/fees?studentId=${user?.id}`),
          fetch(`/api/college/timetable?department=${encodeURIComponent(studentDepartment)}&academicYear=${encodeURIComponent(studentYear)}&section=${encodeURIComponent(studentSection)}`),
          fetch(`/api/college/classroom?department=${encodeURIComponent(studentDepartment)}&academicYear=${encodeURIComponent(studentYear)}&section=${encodeURIComponent(studentSection)}&studentId=${user?.id}`)
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
    try {
      const res = await fetch(`/api/college/attendance?studentId=${user?.id}&subjectId=${subject.id}&includeLogs=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.logs && json.logs.length > 0) {
          setDrillDownLogs(json.logs);
        } else {
          // Generate realistic baseline logs matching totalClasses and percentage
          const mockLogs: AttendanceLog[] = [];
          const now = new Date();
          let currentDay = new Date(now.getTime() - (subject.totalClasses * 86400000 * 1.5));
          
          for (let i = 0; i < subject.totalClasses; i++) {
            currentDay = new Date(currentDay.getTime() + 86400000 * (currentDay.getDay() === 5 ? 3 : 1));
            const isAbsent = i % 8 === 0 && subject.percentage < 90;
            const isOD = i === 14;
            const status: "PRESENT" | "ABSENT" | "OD" | "LATE" = isAbsent ? "ABSENT" : isOD ? "OD" : "PRESENT";
            
            mockLogs.push({
              id: `log-${i}`,
              subject_id: subject.id,
              date: currentDay.toISOString().split("T")[0],
              period_slot: (i % 4) + 1,
              status,
              remarks: isOD ? "Smart India Hackathon Internal Round" : isAbsent ? "Medical leave submitted" : "Regular Lecture Attended",
              created_at: currentDay.toISOString(),
            });
          }
          setDrillDownLogs(mockLogs.reverse());
        }
      }
    } catch (err) {
      console.error("Failed loading attendance logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Submit Classroom Assignment
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingPost || !user?.id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/college/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_assignment",
          postId: submittingPost.id,
          studentId: user.id,
          submissionUrl: submissionUrl.trim() || undefined,
          submissionText: submissionNotes.trim() || undefined,
          workspaceId: selectedWorkspaceId.trim() || undefined,
        })
      });

      if (res.ok) {
        showToast("Assignment submitted successfully to course faculty!", "info");
        setSubmittingPost(null);
        setSubmissionUrl("");
        setSubmissionNotes("");
        setSelectedWorkspaceId("");
        
        // Refresh classroom posts
        const classRes = await fetch(`/api/college/classroom?department=${encodeURIComponent(studentDepartment)}&academicYear=${encodeURIComponent(studentYear)}&section=${encodeURIComponent(studentSection)}&studentId=${user.id}`);
        if (classRes.ok) {
          const classJson = await classRes.json();
          if (classJson.posts) setClassroomPosts(classJson.posts);
        }
      } else {
        const errJson = await res.json();
        showToast(errJson.error || "Failed submitting assignment.", "error");
      }
    } catch {
      showToast("Network error submitting assignment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Authenticating College Desk session...</span>
      </div>
    );
  }

  const filteredLogs = drillDownLogs.filter(log => {
    if (logStatusFilter === "ALL") return true;
    return log.status === logStatusFilter;
  });

  const filteredClassroomPosts = classroomPosts.filter(p => {
    if (classroomFilter === "all") return true;
    return p.post_type === classroomFilter;
  });

  const currentTranscript = transcripts[selectedSemIndex] || transcripts[0];

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 pb-16 flex flex-col gap-8">
        
        {/* ======================================================== */}
        {/* 🎓 TOP HERO: STUDENT IDENTITY & GLANCE METRICS           */}
        {/* ======================================================== */}
        <div className="border border-border-main/70 bg-bg-surface/60 backdrop-blur-md rounded-lg p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
          
          {/* Left: Student Identity & Department */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-txt-muted">
              <Building2 size={13} className="text-accent-main" />
              <span>{studentInstitute}</span>
              <span>•</span>
              <span className="text-txt-sub">{studentDepartment}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl md:text-3xl font-light text-txt-main tracking-tight">
                {userProfile?.full_name || "Student Scholar"}
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-border-main bg-bg-card text-txt-sub">
                {studentRoll}
              </span>
              {isLinked ? (
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <UserCheck size={11} /> Verified Enrolled
                </span>
              ) : (
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Clock size={11} /> Pending Verification
                </span>
              )}
            </div>

            <p className="text-xs text-txt-sub font-light">
              Academic Year: <strong className="text-txt-main font-normal">{studentYear}</strong> | Section: <strong className="text-txt-main font-normal">{studentSection}</strong> | Semester: <strong className="text-txt-main font-normal">5th (Odd)</strong>
            </p>
          </div>

          {/* Right: 4 Glance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:border-l lg:border-border-main/50 lg:pl-6">
            
            {/* 1. Overall Attendance */}
            <div className="flex flex-col p-3 rounded bg-bg-card/50 border border-border-main/40">
              <span className="font-mono text-[9px] uppercase tracking-wider text-txt-muted">Overall Attendance</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`font-display text-2xl font-light ${overallAttendance.percentage >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                  {overallAttendance.percentage}%
                </span>
                <span className="text-[10px] font-mono text-txt-muted">({overallAttendance.attendedClasses}/{overallAttendance.totalClasses})</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400/90 mt-0.5">{overallAttendance.status}</span>
            </div>

            {/* 2. Cumulative CGPA */}
            <div className="flex flex-col p-3 rounded bg-bg-card/50 border border-border-main/40">
              <span className="font-mono text-[9px] uppercase tracking-wider text-txt-muted">Cumulative CGPA</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-2xl font-light text-txt-main">
                  {transcripts.length > 0 ? transcripts[transcripts.length - 1].cgpa : "9.03"}
                </span>
                <span className="text-[10px] font-mono text-txt-muted">/ 10.0</span>
              </div>
              <span className="text-[9px] font-mono text-txt-sub mt-0.5">Top 5% in Dept</span>
            </div>

            {/* 3. Fee Ledger Status */}
            <div className="flex flex-col p-3 rounded bg-bg-card/50 border border-border-main/40">
              <span className="font-mono text-[9px] uppercase tracking-wider text-txt-muted">Semester Fee Dues</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`font-display text-xl font-light ${feeSummary.pendingBalance === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {feeSummary.pendingBalance === 0 ? "₹0" : `₹${feeSummary.pendingBalance.toLocaleString()}`}
                </span>
              </div>
              <span className="text-[9px] font-mono text-txt-sub mt-0.5">{feeSummary.status}</span>
            </div>

            {/* 4. Active Tasks */}
            <div className="flex flex-col p-3 rounded bg-bg-card/50 border border-border-main/40">
              <span className="font-mono text-[9px] uppercase tracking-wider text-txt-muted">Classroom Feed</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-2xl font-light text-accent-main">
                  {classroomPosts.filter(p => p.post_type === "assignment" && !p.submission).length}
                </span>
                <span className="text-[10px] font-mono text-txt-muted">Pending Tasks</span>
              </div>
              <span className="text-[9px] font-mono text-txt-sub mt-0.5">{classroomPosts.length} Total Posts</span>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* 🏛️ PILLAR SWITCHER: ERP ACADEMIC HUB VS CLASSROOM STREAM  */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-border-main/60 pb-3">
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
            
            {/* Sub-Navigation Pills */}
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
                onClick={() => setErpTab("marks")}
                className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  erpTab === "marks"
                    ? "bg-bg-card border-txt-main text-txt-main font-semibold"
                    : "border-border-main/50 text-txt-sub hover:text-txt-main hover:border-border-main"
                }`}
              >
                <Award size={13} />
                Internal Marks Matrix
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
                Fee &amp; Payment Ledger
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
            </div>

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 1: ATTENDANCE LEDGER WITH DRILL-DOWN           */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "attendance" && (
              <div className="flex flex-col gap-6">
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-lg text-txt-main font-normal">Subject-Wise Attendance Matrix</h2>
                    <p className="text-xs text-txt-sub font-light">Click any subject card to view complete date-by-date period attendance logs.</p>
                  </div>
                  <span className="font-mono text-[10px] text-txt-muted bg-bg-card border border-border-main/50 px-2.5 py-1 rounded">
                    Minimum Required: 75%
                  </span>
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
                              View Log <ChevronRight size={12} />
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
            {/* SUB-TAB 2: INTERNAL MARKS MATRIX                       */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "marks" && (
              <div className="flex flex-col gap-6">
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-display text-lg text-txt-main font-normal">Continuous Internal Assessment (CIA) Matrix</h2>
                    <p className="text-xs text-txt-sub font-light">Comparison with department class averages across IA-1, IA-2, and Model Exams.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {subjectsMarks.map((sub) => (
                    <div key={sub.id} className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-5 flex flex-col gap-4">
                      
                      {/* Subject Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/40 pb-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-accent-main">{sub.subject_code}</span>
                            <span className="text-txt-muted">•</span>
                            <h3 className="font-display text-sm font-medium text-txt-main">{sub.subject_name}</h3>
                          </div>
                          <span className="text-[11px] text-txt-sub font-light">Faculty: {sub.faculty_name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-txt-muted">Internal Avg:</span>
                          <span className="font-mono text-sm font-semibold px-2.5 py-1 rounded bg-bg-card border border-border-main/60 text-emerald-400">
                            {sub.internalAverage}%
                          </span>
                        </div>
                      </div>

                      {/* Exams Matrix Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {sub.exams.map((exam) => (
                          <div key={exam.examType} className="border border-border-main/40 bg-bg-card/40 rounded p-3 flex flex-col gap-2">
                            
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-txt-main">{exam.examType}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-surface border border-border-main/60 text-accent-main font-bold">
                                Grade {exam.grade}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between">
                              <span className="font-display text-xl font-light text-txt-main">
                                {exam.marksObtained} <span className="text-xs font-mono text-txt-muted">/ {exam.maxMarks}</span>
                              </span>
                              <span className="font-mono text-[10px] text-txt-muted">
                                Class Avg: {exam.classAverage}
                              </span>
                            </div>

                            {/* Comparison Progress Bar */}
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="w-full bg-bg-surface h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent-main rounded-full"
                                  style={{ width: `${exam.percentage}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-txt-muted font-light italic truncate">{exam.remarks}</span>
                            </div>

                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 3: SEMESTER TRANSCRIPTS (1 TO 8)               */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "transcripts" && (
              <div className="flex flex-col gap-6">
                
                {/* Semester Selector Pills */}
                <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
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
            {/* SUB-TAB 4: FEE RECORDS & PAYMENT LEDGER                */}
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
                    <div key={fee.id} className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
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

            {/* ────────────────────────────────────────────────────── */}
            {/* SUB-TAB 5: WEEKLY TIMETABLE SCHEDULE                   */}
            {/* ────────────────────────────────────────────────────── */}
            {erpTab === "timetable" && (
              <div className="flex flex-col gap-6">
                
                {/* Day of Week Selector */}
                <div className="flex items-center gap-2 border-b border-border-main/40 pb-3">
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

                {/* Timetable Period Rows */}
                {(() => {
                  const dayData = timetable.find(d => d.dayIndex === activeTimetableDay) || timetable[0];
                  if (!dayData) return null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayData.periods.map((slot) => (
                        <div key={slot.periodSlot} className="border border-border-main/60 bg-bg-surface/50 rounded-lg p-4 flex flex-col justify-between gap-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-accent-main">
                              Slot {slot.periodSlot}
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

          </div>
        )}

        {/* ======================================================== */}
        {/* 📚 PILLAR 2: SECTION CLASSROOM STREAM                    */}
        {/* ======================================================== */}
        {activeMainTab === "classroom" && (
          <div className="flex flex-col gap-6">
            
            {/* Stream Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/40 pb-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-lg text-txt-main font-normal">Section Classroom Stream</h2>
                <p className="text-xs text-txt-sub font-light">Enrolled course assignments, lecture materials, and academic discussion forum.</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                {(["all", "assignment", "material", "notice", "discussion"] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setClassroomFilter(ft)}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer capitalize ${
                      classroomFilter === ft
                        ? "bg-accent-main text-bg-base font-semibold"
                        : "bg-bg-card border border-border-main/50 text-txt-sub hover:text-txt-main"
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream Post Cards */}
            <div className="flex flex-col gap-4">
              {filteredClassroomPosts.map((post) => {
                const isAssignment = post.post_type === "assignment";
                const isMaterial = post.post_type === "material";
                const isNotice = post.post_type === "notice";
                const isDiscussion = post.post_type === "discussion";
                const isSubmitted = !!post.submission;

                return (
                  <div 
                    key={post.id}
                    className="border border-border-main/70 bg-bg-surface/50 rounded-lg p-6 flex flex-col gap-4 shadow-xs"
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

                    {/* Attached Resources / Downloadable PPT */}
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
                          {/* 1-Click Bridge to Workspace */}
                          <Link
                            href="/event-desk"
                            className="px-3 py-1.5 font-mono text-xs rounded border border-border-main hover:bg-bg-card text-txt-main transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Code2 size={13} className="text-accent-main" />
                            Bridge to Workspace
                          </Link>

                          {/* Submit Assignment Modal Button */}
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
      {/* 📅 MODAL: GRANULAR DAY-BY-DAY ATTENDANCE LOG TIMELINE    */}
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
                    Faculty In-Charge: {drillDownSubject.faculty_name} ({drillDownSubject.percentage}% Total Attendance)
                  </span>
                </div>

                <button 
                  onClick={() => setDrillDownSubject(null)}
                  className="p-1 rounded hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Filter Bar */}
              <div className="px-6 py-3 border-b border-border-main/30 bg-bg-card/20 flex items-center justify-between">
                <span className="font-mono text-[10px] text-txt-muted uppercase tracking-widest">Filter Records:</span>
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
                    No attendance logs found matching {logStatusFilter} filter.
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
                            <span className="text-[11px] text-txt-sub font-light">{log.remarks || "Regular session"}</span>
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
                  Showing {filteredLogs.length} of {drillDownLogs.length} records
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
