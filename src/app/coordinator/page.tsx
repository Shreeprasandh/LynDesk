"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  Users, 
  FolderLock,
  Download,
  Sparkles,
  HelpCircle,
  Palette,
  AlertTriangle,
  CalendarCheck,
  GraduationCap,
  Calendar,
  Search,
  Filter,
  Check,
  ShieldCheck,
  Send,
  Building2
} from "lucide-react";

interface CreditClaim {
  id: string;
  student_id?: string;
  student_name: string;
  student_email: string;
  project_name: string;
  event_title: string;
  repo_url: string;
  artifact_name: string;
  artifact_url?: string;
  points: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

let coordinatorIdCounter = 0;
const getCoordinatorId = (prefix: string = "id") => {
  coordinatorIdCounter++;
  return `${prefix}_${coordinatorIdCounter}`;
};

// Local Custom Icons for missing/problematic lucide ones
const GithubIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const generateLogId = () => `log_${Date.now()}`;
const generateNotificationId = () => `notif_${Date.now()}`;
const generateScheduledId = () => `sch_${Date.now()}`;
const getLogTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " (Live)";

function CoordinatorConsoleContent() {
  const { user, loading: authLoading, authStatusMessage } = useAuth();
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<CreditClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<CreditClaim | null>(null);
  const [isCompanyRecruiter, setIsCompanyRecruiter] = useState(false);
  
  // Handle verifications states
  const [verifSubTab, setVerifSubTab] = useState<"credits" | "handles" | "links" | "works">("credits");
  const [handleRequests, setHandleRequests] = useState<any[]>([]);
  const [selectedHandleRequest, setSelectedHandleRequest] = useState<any | null>(null);
  const [handleAuditLoading, setHandleAuditLoading] = useState(false);
  const [handleAuditResult, setHandleAuditResult] = useState<any | null>(null);
  const [linkRequests, setLinkRequests] = useState<any[]>([]);
  const [selectedLinkRequest, setSelectedLinkRequest] = useState<any | null>(null);
  const [worksReviewQueue, setWorksReviewQueue] = useState<any[]>([]);
  const [selectedWorkReview, setSelectedWorkReview] = useState<any | null>(null);
  const [reviewActionNote, setReviewActionNote] = useState("");
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  // Recruiter PINs & Opportunities States
  const [recruiterPins, setRecruiterPins] = useState<any[]>([]);
  const [newCompanyRecruiter, setNewCompanyRecruiter] = useState("");
  const [oppSubTab, setOppSubTab] = useState<"broadcasts" | "opportunities" | "assignments">("broadcasts");
  const [opportunities, setOpportunities] = useState<any[]>([]);

  // Create Opp form states
  const [newOppTitle, setNewOppTitle] = useState("");
  const [newOppCategory, setNewOppCategory] = useState("hackathon");
  const [newOppLocation, setNewOppLocation] = useState("online");
  const [newOppLevel, setNewOppLevel] = useState("local");
  const [newOppDeadline, setNewOppDeadline] = useState("");
  const [newOppUrl, setNewOppUrl] = useState("");
  const [newOppDesc, setNewOppDesc] = useState("");

  // Coursework & Assignment form states
  const [courseSubject, setCourseSubject] = useState("CS8501");
  const [courseDept, setCourseDept] = useState("Computer Science");
  const [courseYear, setCourseYear] = useState("3rd Year");
  const [courseSection, setCourseSection] = useState("A");
  const [coursePostType, setCoursePostType] = useState<"assignment" | "material" | "notice" | "discussion">("assignment");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseContent, setCourseContent] = useState("");
  const [courseDueDate, setCourseDueDate] = useState("");
  const [courseAttachmentName, setCourseAttachmentName] = useState("");
  const [courseAttachmentUrl, setCourseAttachmentUrl] = useState("");
  const [coursePublishing, setCoursePublishing] = useState(false);
  const [classroomPosts, setClassroomPosts] = useState<any[]>([]);

  // Load recruiter PINs & opportunities
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadPins = () => {
        const stored = localStorage.getItem("ldk_recruiter_pins");
        if (stored) {
          try {
            setRecruiterPins(JSON.parse(stored));
          } catch {
            setRecruiterPins([]);
          }
        } else {
          setRecruiterPins([]);
        }
      };
      loadPins();
      
      const loadOpps = () => {
        const stored = localStorage.getItem("ldk_opportunities");
        if (stored) {
          setOpportunities(JSON.parse(stored));
        }
      };
      loadOpps();
      window.addEventListener("ldk_opportunities_update", loadOpps);
      return () => window.removeEventListener("ldk_opportunities_update", loadOpps);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"overview" | "attendance_marker" | "marks_entry" | "leave_approvals" | "talent_registry" | "broadcasts" | "verifications" | "staff_access">("overview");

  // Leave & OD Approvals States
  const [leaveApplications, setLeaveApplications] = useState<any[]>([]);
  const [selectedLeaveApp, setSelectedLeaveApp] = useState<any | null>(null);
  const [leaveFilter, setLeaveFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<"all" | "od" | "leave">("all");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveActionRemarks, setLeaveActionRemarks] = useState("");
  const [leaveActionLoading, setLeaveActionLoading] = useState(false);

  // Daily Attendance Marker States
  const [attSubject, setAttSubject] = useState("CS8501");
  const [attDepartment, setAttDepartment] = useState("Computer Science");
  const [attYear, setAttYear] = useState("3rd Year");
  const [attSection, setAttSection] = useState("A");
  const [attDate, setAttDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [attPeriodSlot, setAttPeriodSlot] = useState(1);
  const [attRoster, setAttRoster] = useState<Array<{ id: string; roll: string; name: string; status: "PRESENT" | "ABSENT" | "OD" | "LATE"; remarks?: string }>>([
    { id: "s1", roll: "RA2311003010001", name: "Alex Carter", status: "PRESENT" },
    { id: "s2", roll: "RA2311003010002", name: "Mira Sen", status: "PRESENT" },
    { id: "s3", roll: "RA2311003010003", name: "Rohan Patel", status: "PRESENT" },
    { id: "s4", roll: "RA2311003010004", name: "Siddharth Verma", status: "PRESENT" },
    { id: "s5", roll: "RA2311003010005", name: "Kavya Sundaram", status: "PRESENT" },
    { id: "s6", roll: "RA2311003010006", name: "Ananya Iyer", status: "PRESENT" },
    { id: "s7", roll: "RA2311003010007", name: "Vikram Malhotra", status: "PRESENT" },
    { id: "s8", roll: "RA2311003010008", name: "Deepak Sharma", status: "PRESENT" },
  ]);
  const [attSaving, setAttSaving] = useState(false);
  const [attUndoState, setAttUndoState] = useState<any | null>(null);

  // Marks Entry States
  const [marksSubject, setMarksSubject] = useState("CS8501");
  const [marksExamType, setMarksExamType] = useState<"IA1" | "IA2" | "IA3" | "MODEL">("IA1");
  const [marksMaxScore, setMarksMaxScore] = useState(100);
  const [marksRoster, setMarksRoster] = useState<Array<{ id: string; roll: string; name: string; score: number; remarks: string }>>([
    { id: "s1", roll: "RA2311003010001", name: "Alex Carter", score: 88, remarks: "Consistent clarity" },
    { id: "s2", roll: "RA2311003010002", name: "Mira Sen", score: 92, remarks: "Top in algorithmic proofs" },
    { id: "s3", roll: "RA2311003010003", name: "Rohan Patel", score: 76, remarks: "Good attempt on DFA minimization" },
    { id: "s4", roll: "RA2311003010004", name: "Siddharth Verma", score: 84, remarks: "Solid work" },
    { id: "s5", roll: "RA2311003010005", name: "Kavya Sundaram", score: 95, remarks: "Exceptional solution" },
    { id: "s6", roll: "RA2311003010006", name: "Ananya Iyer", score: 81, remarks: "Well structured" },
    { id: "s7", roll: "RA2311003010007", name: "Vikram Malhotra", score: 70, remarks: "Needs more practice on PDA" },
    { id: "s8", roll: "RA2311003010008", name: "Deepak Sharma", score: 89, remarks: "Strong analytical rigor" },
  ]);
  const [marksSaving, setMarksSaving] = useState(false);

  // Sync activeTab with search parameter updates
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "attendance_marker", "marks_entry", "leave_approvals", "talent_registry", "broadcasts", "verifications", "staff_access"].includes(tabParam)) {
      setTimeout(() => {
        setActiveTab(tabParam as any);
      }, 0);
    }
  }, [searchParams]);
  const [currentStaff, setCurrentStaff] = useState<{ name: string; key: string } | null>(null);
  const [registeredStaff, setRegisteredStaff] = useState<{ name: string; key: string }[]>([]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffKey, setNewStaffKey] = useState("");
  const [auditLogs, setAuditLogs] = useState<{ id: string; msg: string; time: string }[]>([]);

  // AI verify states
  const [aiVerifyLoading, setAiVerifyLoading] = useState(false);
  const [aiVerifyResult, setAiVerifyResult] = useState<{
    status: string;
    confidence: number;
    recipientMatch: boolean;
    eventMatch: boolean;
    aiNotes: string;
  } | null>(null);

  // Broadcast messaging states
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"system" | "deadline" | "credit" | "invite">("system");
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "cs" | "it" | "ee">("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledBroadcasts, setScheduledBroadcasts] = useState<any[]>([]);

  // Targeted Nudge Alert States
  const [nudgeStudent, setNudgeStudent] = useState<any | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState("");

  // Load scheduled broadcasts from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ldk_scheduled_notifications");
      setTimeout(() => {
        if (stored) {
          setScheduledBroadcasts(JSON.parse(stored));
        } else {
          const now = new Date();
          const nextDate = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];
          const defaultScheduled = [
            { id: "sch-1", title: "Upcoming Coding Contest", message: "CodeChef Starters 150 is scheduled for next Wednesday. Make sure to participate!", type: "system", target: "all", date: nextDate, time: "18:00" }
          ];
          setScheduledBroadcasts(defaultScheduled);
          localStorage.setItem("ldk_scheduled_notifications", JSON.stringify(defaultScheduled));
        }
      }, 0);
    }
  }, []);

  // Load handle verification requests from DB + localStorage fallback
  const fetchHandleRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/institutional/handle-requests?status=all");
      if (res.ok) {
        const data = await res.json();
        if (data.requests && Array.isArray(data.requests) && data.requests.length > 0) {
          setHandleRequests(data.requests);
          localStorage.setItem("ldk_handle_verifications", JSON.stringify(data.requests));
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch handle requests from API, falling back to local storage:", e);
    }

    const stored = localStorage.getItem("ldk_handle_verifications");
    if (stored) {
      setHandleRequests(JSON.parse(stored));
    } else {
      const defaultReqs = [
        { id: "verify_1", studentId: "s1", studentName: "Alex Carter", studentEmail: "alexcarter@mit.edu", platform: "LeetCode", handle: "alexcarter", requestType: "new_verification", reason: "First-time competitive coding profile setup.", oldHandle: null, status: "pending", date: "Oct 14" },
        { id: "verify_2", studentId: "s2", studentName: "Mira Sen", studentEmail: "mirasen@mit.edu", platform: "Codeforces", handle: "mira_cf", requestType: "handle_switch", reason: "Switched handles to match github username.", oldHandle: "mira_old_cf", status: "pending", date: "Oct 14" }
      ];
      setHandleRequests(defaultReqs);
      localStorage.setItem("ldk_handle_verifications", JSON.stringify(defaultReqs));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchHandleRequests();
    }
  }, [fetchHandleRequests]);

  // Run live AI Deduplication Sentinel audit whenever selectedHandleRequest changes
  useEffect(() => {
    if (selectedHandleRequest) {
      setHandleAuditLoading(true);
      setHandleAuditResult(null);
      fetch("/api/institutional/handle-ai-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedHandleRequest.platform,
          handle: selectedHandleRequest.handle,
          userId: selectedHandleRequest.studentId
        })
      })
        .then(res => res.json())
        .then(data => {
          setHandleAuditResult(data);
        })
        .catch(err => {
          console.warn("Handle audit fetch error:", err);
        })
        .finally(() => {
          setHandleAuditLoading(false);
        });
    } else {
      setHandleAuditResult(null);
    }
  }, [selectedHandleRequest]);

  // Load link verification requests from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadLinkRequests = () => {
        const stored = localStorage.getItem("ldk_institutional_verifications");
        if (stored) {
          setLinkRequests(JSON.parse(stored));
        } else {
          const defaultLinks = [
            {
              id: "link_req_1",
              studentId: "s1",
              studentName: "Alex Carter",
              studentEmail: "alexcarter@srmeaswari.edu.in",
              type: "college",
              key: "COLLEGE_SRM",
              batchCode: "Batch A / Class of 2026",
              status: "pending",
              previouslyUnlinked: false,
              date: "Oct 14"
            },
            {
              id: "link_req_2",
              studentId: "s2",
              studentName: "Mira Sen",
              studentEmail: "mirasen@srmeaswari.edu.in",
              type: "college",
              key: "COLLEGE_SRM",
              batchCode: "Class of 2027",
              status: "pending",
              previouslyUnlinked: true,
              date: "Oct 14"
            },
            {
              id: "link_req_3",
              studentId: "s3",
              studentName: "Rohan Patel",
              studentEmail: "rohanpatel@google.com",
              type: "company",
              key: "COMPANY_GOOGLE",
              batchCode: "Engineering Team",
              status: "pending",
              previouslyUnlinked: false,
              date: "Oct 14"
            }
          ];
          setLinkRequests(defaultLinks);
          localStorage.setItem("ldk_institutional_verifications", JSON.stringify(defaultLinks));
          
          // Pre-seed mock user link statuses to synchronize profiles with coordinator console
          const initialUserLinks = {
            "s1_college": { status: "pending", key: "COLLEGE_SRM", batchCode: "Batch A / Class of 2026" },
            "s2_college": { status: "pending", key: "COLLEGE_SRM", batchCode: "Class of 2027" },
            "s3_company": { status: "pending", key: "COMPANY_GOOGLE", batchCode: "" }
          };
          localStorage.setItem("ldk_student_links", JSON.stringify(initialUserLinks));
          window.dispatchEvent(new Event("ldk_student_links_update"));
        }
      };
      loadLinkRequests();
      window.addEventListener("ldk_link_requests_update", loadLinkRequests);
      return () => window.removeEventListener("ldk_link_requests_update", loadLinkRequests);
    }
  }, []);

  // Guard route for non-faculty and non-recruiter users
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawFaculty = localStorage.getItem("faculty_staff_member");
      const rawRecruiter = localStorage.getItem("company_recruiter_member");
      
      if (!rawFaculty && !rawRecruiter) {
        window.location.href = "/";
      } else {
        setTimeout(() => {
          if (rawFaculty) {
            setCurrentStaff(JSON.parse(rawFaculty));
            setIsCompanyRecruiter(false);
          } else if (rawRecruiter) {
            setCurrentStaff(JSON.parse(rawRecruiter));
            setIsCompanyRecruiter(true);
          }
        }, 0);
      }
    }
  }, []);

  // Sync registered staff keys from Supabase college account metadata
  useEffect(() => {
    if (user?.user_metadata?.registered_staff) {
      setTimeout(() => {
        setRegisteredStaff(user.user_metadata.registered_staff);
      }, 0);
    } else {
      const defaultStaff = [{ name: "Main Administrator", key: "ADMIN" }];
      setTimeout(() => {
        setRegisteredStaff(defaultStaff);
      }, 0);
    }
  }, [user]);

  // Load audit logs from localStorage
  useEffect(() => {
    const defaultLogs = [
      { id: "log-1", msg: "Dr. Sarah Jenkins authenticated session with key JENKINS555", time: "Today, 09:02 AM" },
      { id: "log-2", msg: "Main Administrator approved CarbonTrace Portal claim", time: "Yesterday, 04:12 PM" },
      { id: "log-3", msg: "Main Administrator registered staff key: DAVIS987", time: "2 days ago" }
    ];
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ldk_audit_logs");
      setTimeout(() => {
        if (stored) {
          setAuditLogs(JSON.parse(stored));
        } else {
          setAuditLogs(defaultLogs);
          localStorage.setItem("ldk_audit_logs", JSON.stringify(defaultLogs));
        }
      }, 0);
    }
  }, []);

  const addAuditLog = (msg: string) => {
    const newLog = {
      id: generateLogId(),
      msg,
      time: getLogTime()
    };
    const updated = [newLog, ...auditLogs].slice(0, 150);
    setAuditLogs(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ldk_audit_logs", JSON.stringify(updated));
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffKey.trim()) return;

    const updated = [...registeredStaff, { name: newStaffName.trim(), key: newStaffKey.trim() }];
    
    try {
      // Save to Supabase User Metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          registered_staff: updated
        }
      });

      if (error) {
        setModalMessage({
          isOpen: true,
          title: "Registration Failed",
          text: "Failed to register staff: " + error.message
        });
      } else {
        setRegisteredStaff(updated);
        addAuditLog(`${currentStaff?.name || "Administrator"} registered new staff key: ${newStaffKey.trim()}`);
        setNewStaffName("");
        setNewStaffKey("");
        setModalMessage({
          isOpen: true,
          title: "Registration Success",
          text: `Staff member "${newStaffName}" successfully registered.`
        });
      }
    } catch (err: any) {
      setModalMessage({
        isOpen: true,
        title: "Registration Failed",
        text: err?.message || "An unexpected network error occurred."
      });
    }
  };

  const handleRemoveStaff = async (keyToRemove: string) => {
    if (keyToRemove === "ADMIN") {
      setModalMessage({
        isOpen: true,
        title: "Revocation Prohibited",
        text: "Cannot remove primary administrator."
      });
      return;
    }

    setModalMessage({
      isOpen: true,
      title: "Revoke Staff Key?",
      text: `Are you sure you want to revoke access for staff key "${keyToRemove}"?`,
      onConfirm: async () => {
        const updated = registeredStaff.filter(s => s.key !== keyToRemove);

        try {
          const { error } = await supabase.auth.updateUser({
            data: {
              registered_staff: updated
            }
          });

          if (error) {
            setModalMessage({
              isOpen: true,
              title: "Revocation Failed",
              text: "Failed to revoke staff key: " + error.message
            });
          } else {
            setRegisteredStaff(updated);
            addAuditLog(`${currentStaff?.name || "Administrator"} revoked staff key: ${keyToRemove}`);
            setModalMessage({
              isOpen: true,
              title: "Key Revoked",
              text: `Staff key "${keyToRemove}" has been revoked.`
            });
          }
        } catch (err: any) {
          setModalMessage({
            isOpen: true,
            title: "Revocation Failed",
            text: err?.message || "An unexpected network error occurred."
          });
        }
      }
    });
  };

  const registryStudents = [
    { id: "s1", name: "Alex Carter", email: "alexcarter@mit.edu", rollNo: "101", department: "Computer Science", batchCode: "Batch A", gradYear: "2026", leetcode: "alexcarter", leetcodeSolved: 342, leetcodeEasy: 154, leetcodeMedium: 148, leetcodeHard: 40, leetcodeRank: "Top 8.4%", codeforces: "alex_cf", codeforcesRating: 1480, codeforcesRank: "Specialist", codechef: "alex_cc", codechefStars: "3★", unstop: "alex_unstop", hackathons: 6, authorized: true },
    { id: "s2", name: "Mira Sen", email: "mirasen@mit.edu", rollNo: "102", department: "Information Technology", batchCode: "Batch A", gradYear: "2027", leetcode: "mirasen_code", leetcodeSolved: 412, leetcodeEasy: 200, leetcodeMedium: 160, leetcodeHard: 52, leetcodeRank: "Top 5.2%", codeforces: "mira_cf", codeforcesRating: 1590, codeforcesRank: "Specialist", codechef: "mira_cc", codechefStars: "4★", unstop: "mira_unstop", hackathons: 4, authorized: true },
    { id: "s3", name: "David Chen", email: "dchen@mit.edu", rollNo: "103", department: "Electrical Engineering", batchCode: "Batch B", gradYear: "2026", leetcode: "dchen_dev", leetcodeSolved: 184, leetcodeEasy: 80, leetcodeMedium: 84, leetcodeHard: 20, leetcodeRank: "Top 22%", codeforces: "david_cf", codeforcesRating: 1240, codeforcesRank: "Pupil", codechef: "david_cc", codechefStars: "2★", unstop: "david_un", hackathons: 3, authorized: true },
    { id: "s4", name: "Sofia Rodriguez", email: "srodriguez@mit.edu", rollNo: "104", department: "Computer Science", batchCode: "Batch B", gradYear: "2027", leetcode: "sofia_algo", leetcodeSolved: 289, leetcodeEasy: 120, leetcodeMedium: 130, leetcodeHard: 39, leetcodeRank: "Top 12%", codeforces: "sofia_r", codeforcesRating: 1410, codeforcesRank: "Specialist", codechef: "sofia_cc", codechefStars: "3★", unstop: "sofia_un", hackathons: 5, authorized: false },
  ];

  const [selectedStudent, setSelectedStudent] = useState<typeof registryStudents[0] | null>(registryStudents[0]);



  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSolvedThreshold, setFilterSolvedThreshold] = useState(0);

  // AI Coordinator Assistant states
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState<{
    explanation: string;
    header: string[];
    rows: string[][];
    isMock?: boolean;
    clarificationNeeded?: boolean;
    clarificationMessage?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStage, setAiStage] = useState("");
  const [aiError, setAiError] = useState("");

  // Check if student handle is verified based on requests status
  const isHandleVerified = (studentId: string, platform: string) => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("ldk_handle_verifications");
    if (!stored) return true; // Defaults mock students to true
    try {
      const list = JSON.parse(stored);
      const found = list.find((r: any) => r.studentId === studentId && r.platform.toLowerCase() === platform.toLowerCase());
      if (found) {
        return found.status === "approved";
      }
    } catch (e) {
      console.error(e);
    }
    // Mock students starting with "s" default to verified for demo, others default to false
    return studentId.startsWith("s");
  };

  // Unified Alert and Confirmation Modal state
  const [modalMessage, setModalMessage] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    onConfirm?: () => void;
  } | null>(null);

  const handleCycleAttendanceStatus = (studentId: string) => {
    setAttRoster(prev => prev.map(s => {
      if (s.id === studentId) {
        const nextStatus: "PRESENT" | "ABSENT" | "OD" | "LATE" =
          s.status === "PRESENT" ? "ABSENT" :
          s.status === "ABSENT" ? "OD" :
          s.status === "OD" ? "LATE" : "PRESENT";
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleMarkAllPresent = () => {
    setAttRoster(prev => prev.map(s => ({ ...s, status: "PRESENT" })));
  };

  const handleSaveAttendance = async () => {
    setAttSaving(true);
    const snapshot = JSON.parse(JSON.stringify(attRoster));
    setAttUndoState(snapshot);
    try {
      await fetch("/api/college/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: attSubject,
          date: attDate,
          periodSlot: Number(attPeriodSlot),
          records: attRoster.map(r => ({
            studentId: r.id.length === 36 ? r.id : "00000000-0000-0000-0000-00000000000" + r.id.replace("s", ""),
            status: r.status,
            remarks: r.remarks || undefined,
          }))
        })
      });

      // Auto-clear undo state after 5 seconds
      setTimeout(() => {
        setAttUndoState(null);
      }, 5000);
    } catch {
      // Local fallback handled
    } finally {
      setAttSaving(false);
    }
  };

  const handleUndoAttendance = () => {
    if (attUndoState) {
      setAttRoster(attUndoState);
      setAttUndoState(null);
    }
  };

  const handleSaveMarks = async () => {
    setMarksSaving(true);
    try {
      await fetch("/api/college/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: marksSubject,
          examType: marksExamType,
          maxMarks: Number(marksMaxScore),
          records: marksRoster.map(r => ({
            studentId: r.id.length === 36 ? r.id : "00000000-0000-0000-0000-00000000000" + r.id.replace("s", ""),
            marksObtained: Number(r.score),
            remarks: r.remarks || undefined,
          }))
        })
      });
    } catch {
      // Local fallback handled
    } finally {
      setMarksSaving(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    const stages = [
      "Parsing query filters...",
      "Analyzing student registry data...",
      "Compiling statistics report..."
    ];

    for (let i = 0; i < stages.length; i++) {
      setAiStage(stages[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const res = await fetch("/api/ai/coordinator-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: aiQuery,
          students: registryStudents
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      } else {
        const err = await res.json();
        setAiError(err.error || "Failed to compile report");
      }
    } catch {
      setAiError("Connection error while calling Gemini API");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    const stored = localStorage.getItem("ldk_global_notifications");
    const list = stored ? JSON.parse(stored) : [];
    
    const newNotif = {
      id: generateNotificationId(),
      title: broadcastTitle.trim(),
      message: `${broadcastMessage.trim()} (Broadcast to: ${broadcastTarget.toUpperCase()})`,
      type: broadcastType,
      category: "alerts" as const,
      time: "Just now",
      read: false
    };

    const updated = [newNotif, ...list].slice(0, 100);
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("ldk_notifications_update"));

    addAuditLog(`Broadcast Alert sent: "${broadcastTitle.trim()}" to all ${broadcastTarget}`);
    
    setBroadcastTitle("");
    setBroadcastMessage("");
    
    setModalMessage({
      isOpen: true,
      title: "Broadcast Dispatched",
      text: `Your announcement was broadcasted successfully to targeted students.`
    });
  };

  const handleScheduleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim() || !scheduledDate || !scheduledTime) return;

    const newSch = {
      id: generateScheduledId(),
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: broadcastType,
      target: broadcastTarget,
      date: scheduledDate,
      time: scheduledTime
    };

    const updated = [newSch, ...scheduledBroadcasts].slice(0, 50);
    setScheduledBroadcasts(updated);
    localStorage.setItem("ldk_scheduled_notifications", JSON.stringify(updated));

    addAuditLog(`Broadcast Scheduled: "${broadcastTitle.trim()}" for ${scheduledDate} at ${scheduledTime}`);

    setBroadcastTitle("");
    setBroadcastMessage("");
    setScheduledDate("");
    setScheduledTime("");

    setModalMessage({
      isOpen: true,
      title: "Broadcast Scheduled",
      text: `Your announcement has been scheduled for ${newSch.date} at ${newSch.time}.`
    });
  };

  const handleCancelScheduled = (id: string) => {
    const updated = scheduledBroadcasts.filter(s => s.id !== id);
    setScheduledBroadcasts(updated);
    localStorage.setItem("ldk_scheduled_notifications", JSON.stringify(updated));
    addAuditLog(`Scheduled Broadcast cancelled (ID: ${id})`);
  };

  const handleSendNudge = () => {
    if (!nudgeStudent || !nudgeMessage.trim()) return;

    const stored = localStorage.getItem("ldk_global_notifications");
    const list = stored ? JSON.parse(stored) : [];

    const newNotif = {
      id: generateNotificationId(),
      title: `Message from Coordinator`,
      message: `${nudgeMessage.trim()} (Direct message to ${nudgeStudent.name})`,
      type: "system" as const,
      category: "alerts" as const,
      time: "Just now",
      read: false
    };

    const updated = [newNotif, ...list].slice(0, 100);
    localStorage.setItem("ldk_global_notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("ldk_notifications_update"));

    addAuditLog(`Direct Nudge sent to student "${nudgeStudent.name}": "${nudgeMessage.trim()}"`);

    setNudgeMessage("");
    setNudgeStudent(null);

    setModalMessage({
      isOpen: true,
      title: "Direct Nudge Sent",
      text: `Your nudge notification has been dispatched directly to the student.`
    });
  };

  const handleAiVerifyCertificate = async (claim: CreditClaim) => {
    setAiVerifyLoading(true);
    setAiVerifyResult(null);

    try {
      const res = await fetch("/api/ai/verify-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: claim.student_name,
          eventTitle: claim.event_title,
          artifactName: claim.artifact_name,
          points: claim.points
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiVerifyResult(data);
      } else {
        setModalMessage({
          isOpen: true,
          title: "AI Verification Failed",
          text: "Connection error with AI Verification service."
        });
      }
    } catch {
      setModalMessage({
        isOpen: true,
        title: "AI Verification Failed",
        text: "Could not connect to verification server."
      });
    } finally {
      setAiVerifyLoading(false);
    }
  };

  const generateCleanFileName = (query: string): string => {
    if (!query.trim()) return "ai_compiled_report.csv";
    const cleaned = query.toLowerCase();
    
    // Check for roll range like "1001 to 2000" or "1001-2000"
    let rangePart = "";
    const rangeMatch = cleaned.match(/(\d+)\s*(?:to|and|-)\s*(\d+)/);
    if (rangeMatch) {
      rangePart = `_${rangeMatch[1]}-${rangeMatch[2]}`;
    }
    
    // Check for platform
    let platformPart = "";
    if (cleaned.includes("leetcode")) platformPart = "_leetcode";
    else if (cleaned.includes("codeforces")) platformPart = "_codeforces";
    else if (cleaned.includes("codechef")) platformPart = "_codechef";
    else if (cleaned.includes("unstop")) platformPart = "_unstop";
    
    // Check for weekly
    let durationPart = "";
    if (cleaned.includes("week") || cleaned.includes("weekly")) {
      durationPart = "_weekly";
    }

    // Check for department
    let deptPart = "";
    if (cleaned.includes("it")) deptPart = "_it";
    else if (cleaned.includes("cse") || cleaned.includes("computer science")) deptPart = "_cse";
    else if (cleaned.includes("ece")) deptPart = "_ece";
    
    // Combine parts if we found any key elements
    if (rangePart || platformPart || durationPart || deptPart) {
      return `report${deptPart}${platformPart}${rangePart}${durationPart}.csv`;
    }
    
    // Fallback: take first 3 alphanumeric-ish words
    const words = cleaned
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w && !["i", "want", "to", "download", "find", "get", "show", "give", "list"].includes(w))
      .slice(0, 3);
      
    if (words.length > 0) {
      return `report_${words.join("_")}.csv`;
    }
    
    return "ai_compiled_report.csv";
  };

  const downloadAiReportCsv = () => {
    if (!aiResult) return;
    const headers = Array.isArray(aiResult.header) ? aiResult.header : [];
    const rows = Array.isArray(aiResult.rows) ? aiResult.rows : [];

    const headerLine = headers.join(",");
    const rowLines = rows.map(r => 
      (Array.isArray(r) ? r : []).map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = [headerLine, ...rowLines].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = generateCleanFileName(aiQuery);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = registryStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = filterBatch ? s.batchCode === filterBatch : true;
    const matchesYear = filterYear ? s.gradYear === filterYear : true;
    const matchesThreshold = s.leetcodeSolved >= filterSolvedThreshold;
    return matchesSearch && matchesBatch && matchesYear && matchesThreshold;
  });

  const handleExportCSV = () => {
    const headers = [
      "Full Name",
      "Email Address",
      "Department/Major",
      "Batch Code",
      "Graduation Year",
      "LeetCode Handle",
      "LeetCode Solved",
      "LeetCode Verified",
      "CodeForces Handle",
      "CodeForces Rating",
      "CodeForces Verified",
      "CodeChef Handle",
      "CodeChef Verified",
      "Unstop Handle",
      "Unstop Verified",
      "Hackathons Participated",
      "Consent Authorized"
    ];

    const rows = filteredStudents.map(s => [
      s.name,
      s.email,
      s.department,
      s.batchCode,
      s.gradYear,
      s.leetcode,
      s.leetcodeSolved,
      isHandleVerified(s.id, "LeetCode") ? "VERIFIED" : "UNVERIFIED",
      s.codeforces,
      s.codeforcesRating,
      isHandleVerified(s.id, "Codeforces") ? "VERIFIED" : "UNVERIFIED",
      s.codechef,
      isHandleVerified(s.id, "CodeChef") ? "VERIFIED" : "UNVERIFIED",
      s.unstop,
      isHandleVerified(s.id, "Unstop") ? "VERIFIED" : "UNVERIFIED",
      s.hackathons,
      s.authorized ? "YES" : "NO"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lyndesk_registry_${filterBatch || "all"}_class_${filterYear || "all"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  interface DBClaim {
  id: string;
  credit_points: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles: { id: string; full_name: string | null; username: string | null } | null;
  project_spaces: { project_name: string; github_repo: string | null } | null;
}

// Fetch claims
useEffect(() => {
  const fetchClaims = async () => {
    try {
      setLoading(true);
      // Query credit applications from Supabase
      const { data, error } = await supabase
        .from("credit_applications")
        .select(`
          id,
          credit_points,
          status,
          created_at,
          profiles:student_id ( id, full_name, username ),
          project_spaces:project_space_id ( project_name, github_repo )
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: CreditClaim[] = (data as unknown as DBClaim[]).map((item) => ({
          id: item.id,
          student_id: item.profiles?.id,
          student_name: item.profiles?.full_name || "Student Engineer",
          student_email: item.profiles?.username ? `${item.profiles.username}@university.edu` : "student@university.edu",
          project_name: item.project_spaces?.project_name || "Project Vault",
          event_title: "Campus tracked event",
          repo_url: item.project_spaces?.github_repo || "github.com",
          artifact_name: "Pitch_Deck_v2.pdf",
          points: item.credit_points,
          status: item.status,
          created_at: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }));
        setClaims(formatted);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Claims fetch error: ", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
    };

    fetchClaims();
  }, []);

  const handleVerifyClaim = async (id: string, action: "approved" | "rejected") => {
    try {
      // Find current claim
      const claim = claims.find(c => c.id === id);
      if (!claim) return;

      // 1. Update Supabase if claim exists in DB
      if (id !== "c1" && id !== "c2" && id !== "c3") {
        const { error: updateClaimErr } = await supabase
          .from("credit_applications")
          .update({ 
            status: action,
            faculty_verifier_id: user?.id 
          })
          .eq("id", id);

        if (!updateClaimErr && action === "approved" && claim.student_id) {
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("academic_credits")
              .eq("id", claim.student_id)
              .single();

            const currentCredits = profileData?.academic_credits || 0;
            const newCredits = currentCredits + claim.points;

            await supabase
              .from("profiles")
              .update({ academic_credits: newCredits })
              .eq("id", claim.student_id);
          } catch (profileErr) {
            console.error("Failed to increment student credits: ", profileErr);
          }
        }
      }

      // 2. Update local UI state
      setClaims(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, status: action };
        }
        return c;
      }));

      // Update selected claim reference
      if (selectedClaim && selectedClaim.id === id) {
        setSelectedClaim(prev => prev ? { ...prev, status: action } : null);
      }

      addAuditLog(`${currentStaff?.name || "Administrator"} ${action === "approved" ? "approved" : "declined"} ${claim.student_name}'s credit claim`);
      setModalMessage({
        isOpen: true,
        title: action === "approved" ? "Claim Verified" : "Claim Declined",
        text: `Activity point claim has been successfully ${action === "approved" ? "verified" : "declined"} by ${currentStaff?.name || "Administrator"}.`
      });
    } catch (err) {
      console.error("Failed to update credit application: ", err);
    }
  };

  const handleVerifyHandle = async (reqId: string, studentId: string, platform: string, handle: string, action: "approved" | "rejected") => {
    try {
      // Call backend PATCH API
      try {
        await fetch("/api/institutional/handle-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: reqId,
            action: action === "approved" ? "approve" : "reject"
          })
        });
      } catch (apiErr) {
        console.warn("Handle request PATCH API call warning:", apiErr);
      }

      if (action === "approved") {
        let columnName = "";
        const lowerPlat = platform.toLowerCase();
        if (lowerPlat.includes("leetcode")) columnName = "leetcode_verified";
        else if (lowerPlat.includes("codeforces")) columnName = "codeforces_verified";
        else if (lowerPlat.includes("codechef")) columnName = "codechef_verified";
        else if (lowerPlat.includes("hackerrank")) columnName = "hackerrank_verified";
        else if (lowerPlat.includes("geeksforgeeks")) columnName = "geeksforgeeks_verified";
        else if (lowerPlat.includes("unstop")) columnName = "unstop_verified";
        else if (lowerPlat.includes("devpost")) columnName = "devpost_verified";

        if (columnName && studentId) {
          await supabase
            .from("profiles")
            .update({ [columnName]: true })
            .eq("id", studentId);
        }

        const stored = localStorage.getItem("ldk_global_notifications");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({
          id: generateNotificationId(),
          title: "Handle Verified",
          message: `Coordinator approved verification for your ${platform} handle: @${handle}.`,
          type: "system" as const,
          category: "alerts" as const,
          time: "Just now",
          read: false
        });
        localStorage.setItem("ldk_global_notifications", JSON.stringify(list.slice(0, 100)));
        window.dispatchEvent(new Event("ldk_notifications_update"));
      }

      const updated = handleRequests.map(r => {
        if (r.id === reqId) return { ...r, status: action };
        return r;
      });
      setHandleRequests(updated);
      localStorage.setItem("ldk_handle_verifications", JSON.stringify(updated));

      if (selectedHandleRequest && selectedHandleRequest.id === reqId) {
        setSelectedHandleRequest((prev: any) => prev ? { ...prev, status: action } : null);
      }

      addAuditLog(`Coordinator ${action} verification for ${platform} handle @${handle}`);
      
      setModalMessage({
        isOpen: true,
        title: action === "approved" ? "Handle Verified" : "Verification Rejected",
        text: `The ${platform} handle verification request has been successfully ${action}.`
      });

    } catch (err) {
      console.error("Failed to update handle verification status:", err);
    }
  };

  const handleBulkApproveSafeHandles = async () => {
    const pendingReqs = handleRequests.filter(r => r.status === "pending");
    if (pendingReqs.length === 0) return;

    try {
      const ids = pendingReqs.map(r => r.id);
      await fetch("/api/institutional/handle-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_approve",
          requestIds: ids
        })
      });

      const updated = handleRequests.map(r => {
        if (r.status === "pending") return { ...r, status: "approved" };
        return r;
      });
      setHandleRequests(updated);
      localStorage.setItem("ldk_handle_verifications", JSON.stringify(updated));

      if (selectedHandleRequest && selectedHandleRequest.status === "pending") {
        setSelectedHandleRequest((prev: any) => prev ? { ...prev, status: "approved" } : null);
      }

      addAuditLog(`Coordinator bulk-approved ${pendingReqs.length} pending student handle claims`);

      setModalMessage({
        isOpen: true,
        title: "Bulk Verification Complete",
        text: `Successfully verified and approved ${pendingReqs.length} student handle claims.`
      });
    } catch (err) {
      console.error("Bulk approve error:", err);
    }
  };

  const handleVerifyLinkRequest = async (reqId: string, action: "approved" | "rejected") => {
    try {
      const stored = localStorage.getItem("ldk_institutional_verifications");
      const list = stored ? JSON.parse(stored) : [];
      
      let studentId = "";
      let studentName = "";
      let key = "";
      let batchCode = "";
      
      const updated = list.map((r: any) => {
        if (r.id === reqId) {
          studentId = r.studentId;
          studentName = r.studentName;
          key = r.key;
          batchCode = r.batchCode || "";
          return { ...r, status: action };
        }
        return r;
      });
      
      setLinkRequests(updated);
      localStorage.setItem("ldk_institutional_verifications", JSON.stringify(updated));
      
      if (selectedLinkRequest && selectedLinkRequest.id === reqId) {
        setSelectedLinkRequest((prev: any) => prev ? { ...prev, status: action } : null);
      }
      
      // Update global map
      const linksStored = localStorage.getItem("ldk_student_links");
      const linksMap = linksStored ? JSON.parse(linksStored) : {};
      
      const mapKey = `${studentId}_college`;
      if (action === "approved") {
        linksMap[mapKey] = { status: "linked", key, batchCode };
      } else {
        linksMap[mapKey] = { status: "none", key: "", batchCode: "" };
      }
      localStorage.setItem("ldk_student_links", JSON.stringify(linksMap));
      
      // Dispatch event
      window.dispatchEvent(new Event("ldk_student_links_update"));
      
      // Send notification to user
      const notifStored = localStorage.getItem("ldk_global_notifications");
      const notifList = notifStored ? JSON.parse(notifStored) : [];
      notifList.unshift({
        id: getCoordinatorId("notif_link"),
        title: action === "approved" ? "College Link Approved" : "College Link Declined",
        message: action === "approved" 
          ? `Coordinator approved linking your profile to College using key: ${key}.`
          : `Coordinator declined your linking request for College key: ${key}.`,
        type: "system",
        category: "alerts",
        role: "student",
        time: "Just now",
        read: false
      });
      localStorage.setItem("ldk_global_notifications", JSON.stringify(notifList.slice(0, 100)));
      window.dispatchEvent(new Event("ldk_notifications_update"));
      
      addAuditLog(`Coordinator ${action} college link request for ${studentName} (key: ${key})`);
      
      setModalMessage({
        isOpen: true,
        title: action === "approved" ? "Link Approved" : "Link Declined",
        text: `The college linking request from ${studentName} has been ${action}.`
      });
    } catch (err) {
      console.error("Failed to verify link request:", err);
    }
  };

  const handleGenerateRecruiterPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyRecruiter.trim()) return;
    
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const newPinObj = {
      id: `pin_${Date.now()}`,
      company: newCompanyRecruiter.trim(),
      pin,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
    
    const updated = [newPinObj, ...recruiterPins];
    setRecruiterPins(updated);
    localStorage.setItem("ldk_recruiter_pins", JSON.stringify(updated));
    setNewCompanyRecruiter("");
    addAuditLog(`Generated Recruiter Access PIN for ${newPinObj.company}: ${pin}`);
  };

  const handleRevokePin = (pinId: string, companyName: string) => {
    const updated = recruiterPins.filter(p => p.id !== pinId);
    setRecruiterPins(updated);
    localStorage.setItem("ldk_recruiter_pins", JSON.stringify(updated));
    addAuditLog(`Revoked Recruiter Access PIN for ${companyName}`);
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppTitle.trim()) return;
    
    const newOpp = {
      id: getCoordinatorId("opp"),
      title: newOppTitle.trim(),
      category: newOppCategory,
      deadline: newOppDeadline || "No Deadline",
      location: newOppLocation,
      level: newOppLevel,
      url: newOppUrl.trim() || "https://lyndesk.com",
      description: newOppDesc.trim() || "Official campus opportunity with credit eligibility.",
      facultyRecommended: false,
      createdDate: "Just now"
    };
    
    const stored = localStorage.getItem("ldk_opportunities");
    const oppsList = stored ? JSON.parse(stored) : [];
    const updated = [newOpp, ...oppsList];
    
    setOpportunities(updated);
    localStorage.setItem("ldk_opportunities", JSON.stringify(updated));
    window.dispatchEvent(new Event("ldk_opportunities_update"));
    
    // Reset fields
    setNewOppTitle("");
    setNewOppDeadline("");
    setNewOppUrl("");
    setNewOppDesc("");
    
    addAuditLog(`Created new opportunity: ${newOpp.title}`);
    
    setModalMessage({
      isOpen: true,
      title: "Opportunity Published",
      text: `Opportunity "${newOpp.title}" has been successfully published.`
    });
  };

  const handleToggleRecommendOpportunity = (oppId: string, title: string) => {
    const stored = localStorage.getItem("ldk_opportunities");
    const oppsList = stored ? JSON.parse(stored) : [];
    
    let isRecommended = false;
    const updated = oppsList.map((opp: any) => {
      if (opp.id === oppId) {
        isRecommended = !opp.facultyRecommended;
        return { ...opp, facultyRecommended: isRecommended };
      }
      return opp;
    });
    
    setOpportunities(updated);
    localStorage.setItem("ldk_opportunities", JSON.stringify(updated));
    window.dispatchEvent(new Event("ldk_opportunities_update"));
    
    addAuditLog(`${isRecommended ? "Recommended" : "Unrecommended"} opportunity: ${title}`);
  };

  const loadClassroomPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/college/classroom?department=${encodeURIComponent(courseDept)}&academicYear=${encodeURIComponent(courseYear)}&section=${encodeURIComponent(courseSection)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts && Array.isArray(data.posts)) {
          setClassroomPosts(data.posts);
        }
      }
    } catch {
      // Fallback
    }
  }, [courseDept, courseYear, courseSection]);

  useEffect(() => {
    if (activeTab === "broadcasts" && oppSubTab === "assignments") {
      loadClassroomPosts();
    }
  }, [activeTab, oppSubTab, loadClassroomPosts]);

  const handlePublishCoursework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseContent.trim()) return;
    setCoursePublishing(true);
    try {
      const res = await fetch("/api/college/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: courseDept,
          academicYear: courseYear,
          section: courseSection,
          postType: coursePostType,
          title: courseTitle.trim(),
          content: courseContent.trim(),
          dueDate: courseDueDate ? courseDueDate : null,
          attachmentName: courseAttachmentName.trim() || null,
          attachmentUrl: courseAttachmentUrl.trim() || null,
          subjectId: courseSubject,
        }),
      });

      if (res.ok) {
        setCourseTitle("");
        setCourseContent("");
        setCourseDueDate("");
        setCourseAttachmentName("");
        setCourseAttachmentUrl("");
        loadClassroomPosts();
        addAuditLog(`Published ${coursePostType}: "${courseTitle.trim()}" for ${courseDept} (${courseYear} - Sec ${courseSection})`);
        setModalMessage({
          isOpen: true,
          title: "Coursework Published",
          text: `Your ${coursePostType} has been published to student classroom feeds.`,
        });
      } else {
        const errData = await res.json();
        setModalMessage({
          isOpen: true,
          title: "Publication Error",
          text: errData.error || "Failed to publish coursework.",
        });
      }
    } catch {
      setModalMessage({
        isOpen: true,
        title: "Publication Error",
        text: "Failed to publish coursework to classroom feed.",
      });
    } finally {
      setCoursePublishing(false);
    }
  };

  const loadWorksReviewQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/coordinator/works-review");
      if (res.ok) {
        const data = await res.json();
        setWorksReviewQueue(data.works || []);
        if (data.works && data.works.length > 0 && !selectedWorkReview) {
          setSelectedWorkReview(data.works[0]);
        }
      }
    } catch {
      console.warn("Failed loading works review queue.");
    }
  }, [selectedWorkReview]);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === "verifications" && verifSubTab === "works") {
      fetch("/api/coordinator/works-review")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (isMounted && data?.works) {
            setWorksReviewQueue(data.works);
            if (data.works.length > 0 && !selectedWorkReview) {
              setSelectedWorkReview(data.works[0]);
            }
          }
        })
        .catch(() => {
          console.warn("Failed loading works review queue.");
        });
    }
    return () => { isMounted = false; };
  }, [activeTab, verifSubTab, selectedWorkReview]);

  const handleReviewWork = async (workId: string, decision: "approved" | "rejected") => {
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/coordinator/works-review/${workId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          review_note: reviewActionNote.trim() || undefined
        })
      });

      if (res.ok) {
        setReviewActionNote("");
        addAuditLog(`Student work ${decision}: ${selectedWorkReview?.title || workId}`);
        setModalMessage({
          isOpen: true,
          title: `Work ${decision === "approved" ? "Approved" : "Declined"}`,
          text: `The student work has been successfully ${decision}.`
        });
        await loadWorksReviewQueue();
        setSelectedWorkReview(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process review decision.");
      }
    } catch {
      alert("Network error processing review decision.");
    } finally {
      setReviewActionLoading(false);
    }
  };

  const defaultLeaveApplications = [
    {
      id: "leave_demo_1",
      student_id: "s1",
      student: {
        id: "s1",
        full_name: "Alex Carter",
        roll_number: "RA2311003010001",
        department: "Computer Science",
        section: "A",
        academic_year: "3rd Year"
      },
      application_type: "od",
      target_date: "2026-09-10",
      end_date: "2026-09-10",
      is_full_day: false,
      periods: [2, 3, 4],
      category: "hackathon",
      title: "National Smart India Hackathon Grand Finale",
      reason: "Representing university in 36-hr hardware + software track at IIT Madras.",
      proof_url: "https://sih.gov.in/team-confirmation-2026.pdf",
      status: "pending",
      created_at: new Date().toISOString()
    },
    {
      id: "leave_demo_2",
      student_id: "s2",
      student: {
        id: "s2",
        full_name: "Mira Sen",
        roll_number: "RA2311003010002",
        department: "Information Technology",
        section: "A",
        academic_year: "3rd Year"
      },
      application_type: "leave",
      target_date: "2026-09-12",
      end_date: "2026-09-13",
      is_full_day: true,
      periods: [1, 2, 3, 4, 5, 6],
      category: "medical",
      title: "Medical Leave for Eye Surgery Checkup",
      reason: "Scheduled ophthalmology consultation and recovery at Apollo Hospitals.",
      letter_body: "To\nThe Head of the Department\nDepartment of Information Technology\n\nRespected Sir/Madam,\n\nI am writing to formally request leave for 2 days from Sept 12 to Sept 13 due to scheduled medical consultations. I will ensure all coursework and laboratory assignments are completed.\n\nYours sincerely,\nMira Sen\nRA2311003010002",
      proof_url: "https://apollohospitals.com/reports/mira-sen-op.pdf",
      status: "pending",
      created_at: new Date().toISOString()
    }
  ];

  const loadLeaveApplications = useCallback(async () => {
    setLeaveLoading(true);
    try {
      const res = await fetch("/api/college/leave?isStaff=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.applications) && data.applications.length > 0) {
        setLeaveApplications(data.applications);
        if (!selectedLeaveApp) {
          setSelectedLeaveApp(data.applications[0]);
        }
      } else {
        setLeaveApplications(defaultLeaveApplications);
        if (!selectedLeaveApp) {
          setSelectedLeaveApp(defaultLeaveApplications[0]);
        }
      }
    } catch {
      setLeaveApplications(defaultLeaveApplications);
      if (!selectedLeaveApp) {
        setSelectedLeaveApp(defaultLeaveApplications[0]);
      }
    } finally {
      setLeaveLoading(false);
    }
  }, [selectedLeaveApp]);

  useEffect(() => {
    loadLeaveApplications();
  }, [loadLeaveApplications]);

  const handleReviewLeaveApp = async (applicationId: string, decision: "approved" | "rejected") => {
    setLeaveActionLoading(true);
    try {
      await fetch("/api/college/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: decision,
          remarks: leaveActionRemarks.trim() || (decision === "approved" ? "Approved by class coordinator." : "Declined by coordinator.")
        })
      });

      // Update state
      setLeaveApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: decision, faculty_remarks: leaveActionRemarks.trim() || (decision === "approved" ? "Approved" : "Declined") } 
          : app
      ));

      if (selectedLeaveApp?.id === applicationId) {
        setSelectedLeaveApp((prev: any) => ({ ...prev, status: decision, faculty_remarks: leaveActionRemarks.trim() || (decision === "approved" ? "Approved" : "Declined") }));
      }

      setLeaveActionRemarks("");
      addAuditLog(`Coordinator ${decision} application: ${selectedLeaveApp?.title || applicationId}`);
      setModalMessage({
        isOpen: true,
        title: `Application ${decision === "approved" ? "Approved" : "Declined"}`,
        text: `The ${selectedLeaveApp?.application_type === "od" ? "On-Duty (OD)" : "Leave"} application has been ${decision}.`
      });
    } catch {
      // Local fallback
      setLeaveApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: decision } : app
      ));
      if (selectedLeaveApp?.id === applicationId) {
        setSelectedLeaveApp((prev: any) => ({ ...prev, status: decision }));
      }
    } finally {
      setLeaveActionLoading(false);
    }
  };

  const filteredLeaveApps = leaveApplications.filter(app => {
    const matchesSearch = 
      (app.title || "").toLowerCase().includes(leaveSearch.toLowerCase()) ||
      (app.student?.full_name || "").toLowerCase().includes(leaveSearch.toLowerCase()) ||
      (app.student?.roll_number || "").toLowerCase().includes(leaveSearch.toLowerCase()) ||
      (app.reason || "").toLowerCase().includes(leaveSearch.toLowerCase());
    
    const matchesStatus = leaveFilter === "all" ? true : app.status === leaveFilter;
    const matchesType = leaveTypeFilter === "all" ? true : app.application_type === leaveTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = claims.filter(c => c.status === "pending").length;
  const approvedPoints = claims.filter(c => c.status === "approved").reduce((sum, c) => sum + c.points, 0);

  if (authLoading && !currentStaff) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>{authStatusMessage || "Syncing session..."}</span>
      </div>
    );
  }

  if (!user && !currentStaff) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Authenticating coordinator session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main split grid */}
       <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= LEFT CONSOLE: APPLICATION LIST (7 Columns) ================= */}
        <section className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-border-main/50 flex flex-col bg-bg-base p-6 gap-6">
          <div className="flex items-center gap-3 self-start">
            <Link 
              href="/"
              className="flex items-center gap-1.5 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase"
            >
              <ArrowLeft size={12} />
              Back to Portal
            </Link>
            <span className="text-border-main text-xs font-mono">•</span>
            <Link 
              href="/admin"
              className="flex items-center gap-1.5 text-[10px] text-accent-main hover:opacity-80 transition-opacity font-mono tracking-wider uppercase font-semibold"
            >
              <Building2 size={12} />
              Master Admin Console (Structure & Headcount)
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border-main/40 pb-4 gap-4">
            <div className="flex flex-col gap-1 text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                {isCompanyRecruiter ? "Recruiter Desk" : "Registrar & Faculty Desk"}
              </span>
              <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">
                {activeTab === "overview"
                  ? (isCompanyRecruiter ? "Recruiter Insights Dashboard" : "Coordinator Performance Dashboard")
                  : activeTab === "attendance_marker"
                  ? "Daily Period-Wise Attendance Marker"
                  : activeTab === "marks_entry"
                  ? "Internal & Assessment Marks Entry"
                  : activeTab === "leave_approvals"
                  ? "Student Leave & On-Duty (OD) Approvals"
                  : activeTab === "talent_registry"
                  ? (isCompanyRecruiter ? "Talent Pipeline & Candidates" : "Student Talent Registry")
                  : activeTab === "broadcasts"
                  ? (isCompanyRecruiter ? "Job & Internship Postings" : "Broadcast Alerts & Notifications")
                  : activeTab === "verifications"
                  ? (isCompanyRecruiter ? "Student Resume Vault & Portfolios" : "Academic Credit Claims")
                  : "Staff Console Access Keys"}
              </h1>
              <p className="text-xs text-txt-sub">
                {activeTab === "overview"
                  ? (isCompanyRecruiter 
                      ? "Analytics overview of candidates, top coders, and active university skill distributions." 
                      : "High-level summary of student competitive programming performance and activity metrics.")
                  : activeTab === "attendance_marker"
                  ? "Mark, audit, and log period-by-period class attendance with instant student safety verification."
                  : activeTab === "marks_entry"
                  ? "Record and publish continuous assessment scores, internal test grades, and class averages."
                  : activeTab === "leave_approvals"
                  ? "Review, approve, or decline student Leave and On-Duty (OD) requests with automatic period-wise attendance synchronization."
                  : activeTab === "talent_registry"
                  ? (isCompanyRecruiter 
                      ? "Search, filter, and shortlist student candidates by LeetCode count, language skills, or graduation years." 
                      : "Track student performance registry across LeetCode, Codeforces, and Hackathon platforms.")
                  : activeTab === "broadcasts"
                  ? (isCompanyRecruiter 
                      ? "Broadcast vacancy announcements, coding challenge invites, or internship openings directly to students." 
                      : "Send direct nudges, schedule announcements, and push broadcast alerts to students.")
                  : activeTab === "verifications"
                  ? (isCompanyRecruiter 
                      ? "Access, audit, and verify student project repositories and certified resume credentials." 
                      : "Verify student hackathon portfolios and award extracurricular graduation credits.")
                  : "Manage credentials and track unique login keys for your department staff."}
              </p>
              {currentStaff && (
                <div className="text-[10px] font-mono text-emerald-500 mt-1">
                  Active Session Staff: <strong className="font-bold uppercase">{currentStaff.name} ({currentStaff.key})</strong>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
            <div className="border border-border-main/60 bg-bg-surface p-3.5 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Pending Verification</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Clock size={14} className="text-txt-muted" />
                {pendingCount}
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-3.5 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Leave &amp; OD Queue</span>
              <span className="text-xl font-display font-light text-amber-400 flex items-center gap-1.5">
                <CalendarCheck size={14} className="text-amber-400" />
                {leaveApplications.filter(a => a.status === "pending").length}
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-3.5 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Awarded Credits</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Award size={14} className="text-txt-main" />
                {approvedPoints} Pts
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-3.5 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Registered Students</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Users size={14} className="text-txt-muted" />
                {claims.length} Active
              </span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border-main/40 no-scrollbar flex-shrink-0">
            {[
              { id: "overview", label: "Overview", icon: Sparkles },
              { id: "attendance_marker", label: "Attendance Roster", icon: CalendarCheck },
              { id: "marks_entry", label: "Marks Entry", icon: GraduationCap },
              { id: "leave_approvals", label: "Leave & OD Queue", icon: Calendar, badge: leaveApplications.filter(a => a.status === "pending").length },
              { id: "talent_registry", label: "Talent Registry", icon: Users },
              { id: "broadcasts", label: "Broadcasts", icon: Send },
              { id: "verifications", label: "Verifications", icon: FileText, badge: pendingCount },
              { id: "staff_access", label: "Staff Access", icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-accent-main text-bg-base font-bold shadow-sm"
                      : "bg-bg-surface hover:bg-bg-card text-txt-muted hover:text-txt-main border border-border-main/50"
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      isActive ? "bg-bg-base text-accent-main" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab contents */}
          {activeTab === "attendance_marker" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4 overflow-y-auto pr-1">
              
              {/* Marker Controls Card */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/40 pb-3">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Faculty Roster Console</span>
                    <h3 className="font-display text-base font-semibold text-txt-main">Daily Period-Wise Attendance Marker</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {attUndoState && (
                      <button
                        type="button"
                        onClick={handleUndoAttendance}
                        className="h-8 px-3 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono text-xs uppercase font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
                      >
                        Undo (5s)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleMarkAllPresent}
                      className="h-8 px-3 rounded bg-bg-card border border-border-main text-txt-main font-mono text-xs uppercase hover:bg-bg-card/80 transition-colors cursor-pointer"
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={attSaving}
                      className="h-8 px-4 rounded bg-accent-main text-bg-base font-mono text-xs uppercase font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                    >
                      {attSaving ? "Saving..." : "Save Period"}
                    </button>
                  </div>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Subject</label>
                    <select
                      value={attSubject}
                      onChange={(e) => setAttSubject(e.target.value)}
                      className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    >
                      <option value="CS8501">CS8501: Theory of Computation</option>
                      <option value="CS8591">CS8591: Computer Networks & Security</option>
                      <option value="CS8592">CS8592: OOAD</option>
                      <option value="EC8691">EC8691: Microprocessors</option>
                      <option value="CS8511">CS8511: Networks Laboratory</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Section & Year</label>
                    <select
                      value={attSection}
                      onChange={(e) => setAttSection(e.target.value)}
                      className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    >
                      <option value="A">Section A (3rd Year)</option>
                      <option value="B">Section B (3rd Year)</option>
                      <option value="C">Section C (3rd Year)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Period Slot</label>
                    <select
                      value={attPeriodSlot}
                      onChange={(e) => setAttPeriodSlot(Number(e.target.value))}
                      className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    >
                      <option value={1}>Period 1 (08:45 – 09:35 AM)</option>
                      <option value={2}>Period 2 (09:35 – 10:25 AM)</option>
                      <option value={3}>Period 3 (10:45 – 11:35 AM)</option>
                      <option value={4}>Period 4 (11:35 – 12:25 PM)</option>
                      <option value={5}>Period 5 (01:15 – 02:05 PM)</option>
                      <option value={6}>Period 6 (02:05 – 02:55 PM)</option>
                      <option value={7}>Period 7 (03:05 – 03:55 PM)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Session Date</label>
                    <input
                      type="date"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    />
                  </div>
                </div>

                {/* Summary Roster Bar */}
                <div className="p-3 bg-bg-card/40 border border-border-main/40 rounded flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <span>Present: <strong className="text-emerald-400">{attRoster.filter(s => s.status === "PRESENT").length}</strong></span>
                    <span>Absent: <strong className="text-rose-400">{attRoster.filter(s => s.status === "ABSENT").length}</strong></span>
                    <span>OD: <strong className="text-amber-400">{attRoster.filter(s => s.status === "OD").length}</strong></span>
                    <span>Late: <strong className="text-purple-400">{attRoster.filter(s => s.status === "LATE").length}</strong></span>
                  </div>
                  <span className="text-txt-muted text-[10px]">Click any status pill to cycle state</span>
                </div>
              </div>

              {/* Interactive Roster Table */}
              <div className="border border-border-main/60 bg-bg-surface rounded-md overflow-hidden">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-card/50 border-b border-border-main/60 text-txt-muted text-[10px] uppercase">
                      <th className="p-3">#</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-center">Period Status</th>
                      <th className="p-3">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/30 font-sans">
                    {attRoster.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-bg-card/20 transition-colors">
                        <td className="p-3 font-mono text-txt-muted text-xs">{idx + 1}</td>
                        <td className="p-3 font-mono font-medium text-txt-main text-xs">{student.roll}</td>
                        <td className="p-3 text-txt-main text-xs font-normal">{student.name}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleCycleAttendanceStatus(student.id)}
                            className={`px-3 py-1 font-mono text-[10px] font-bold rounded-full border transition-all cursor-pointer select-none ${
                              student.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" :
                              student.status === "ABSENT" ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20" :
                              student.status === "OD" ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20" :
                              "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                            }`}
                          >
                            {student.status} ↻
                          </button>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={student.remarks || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttRoster(prev => prev.map(s => s.id === student.id ? { ...s, remarks: val } : s));
                            }}
                            className="h-7 px-2 border border-border-main/60 bg-bg-base text-txt-main text-[11px] rounded w-full focus:outline-none focus:border-txt-main"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeTab === "marks_entry" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4 overflow-y-auto pr-1">
              
              {/* Marks Entry Header Card */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/40 pb-3">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Grading Ledger</span>
                    <h3 className="font-display text-base font-semibold text-txt-main">Internal Assessment Marks Entry</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMarks}
                    disabled={marksSaving}
                    className="h-8 px-4 rounded bg-accent-main text-bg-base font-mono text-xs uppercase font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer self-start sm:self-auto"
                  >
                    {marksSaving ? "Saving Marks..." : "Save Assessment Marks"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Subject</label>
                    <select
                      value={marksSubject}
                      onChange={(e) => setMarksSubject(e.target.value)}
                      className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    >
                      <option value="CS8501">CS8501: Theory of Computation</option>
                      <option value="CS8591">CS8591: Computer Networks & Security</option>
                      <option value="CS8592">CS8592: OOAD</option>
                      <option value="EC8691">EC8691: Microprocessors</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Assessment Type</label>
                    <select
                      value={marksExamType}
                      onChange={(e) => setMarksExamType(e.target.value as any)}
                      className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    >
                      <option value="IA1">Internal Assessment 1 (IA-1)</option>
                      <option value="IA2">Internal Assessment 2 (IA-2)</option>
                      <option value="IA3">Internal Assessment 3 (IA-3)</option>
                      <option value="MODEL">Model Examination</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-mono uppercase">Maximum Marks</label>
                    <input
                      type="number"
                      value={marksMaxScore}
                      onChange={(e) => setMarksMaxScore(Number(e.target.value))}
                      className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs rounded font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-bg-card/40 border border-border-main/40 rounded flex items-center justify-between text-xs font-mono">
                  <span>
                    Class Average: <strong className="text-emerald-400">
                      {Math.round((marksRoster.reduce((acc, r) => acc + Number(r.score), 0) / marksRoster.length) * 10) / 10} / {marksMaxScore}
                    </strong>
                  </span>
                  <span className="text-txt-muted text-[10px]">{marksRoster.length} Enrolled Students</span>
                </div>
              </div>

              {/* Marks Grading Grid */}
              <div className="border border-border-main/60 bg-bg-surface rounded-md overflow-hidden">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-card/50 border-b border-border-main/60 text-txt-muted text-[10px] uppercase">
                      <th className="p-3">#</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-center">Score ({marksMaxScore})</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/30 font-sans">
                    {marksRoster.map((student, idx) => {
                      const pct = Math.round((Number(student.score) / marksMaxScore) * 100);
                      const grade = pct >= 90 ? "O" : pct >= 80 ? "A+" : pct >= 70 ? "A" : pct >= 60 ? "B+" : pct >= 50 ? "B" : "RA";

                      return (
                        <tr key={student.id} className="hover:bg-bg-card/20 transition-colors">
                          <td className="p-3 font-mono text-txt-muted text-xs">{idx + 1}</td>
                          <td className="p-3 font-mono font-medium text-txt-main text-xs">{student.roll}</td>
                          <td className="p-3 text-txt-main text-xs font-normal">{student.name}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={marksMaxScore}
                              value={student.score}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setMarksRoster(prev => prev.map(s => s.id === student.id ? { ...s, score: val } : s));
                              }}
                              className="w-16 h-7 text-center font-mono font-bold border border-border-main/60 bg-bg-base text-txt-main text-xs rounded focus:outline-none focus:border-txt-main"
                            />
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-accent-main">{grade}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={student.remarks || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMarksRoster(prev => prev.map(s => s.id === student.id ? { ...s, remarks: val } : s));
                              }}
                              placeholder="Feedback..."
                              className="h-7 px-2 border border-border-main/60 bg-bg-base text-txt-main text-[11px] rounded w-full focus:outline-none focus:border-txt-main"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeTab === "leave_approvals" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4 overflow-y-auto pr-1">
              {/* Filter and Control Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-bg-card/20 p-3.5 border border-border-main/50 rounded-md flex-shrink-0">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-txt-muted" />
                  <input
                    type="text"
                    value={leaveSearch}
                    onChange={(e) => setLeaveSearch(e.target.value)}
                    placeholder="Search roll, name, title..."
                    className="h-8 pl-8 pr-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/60 w-full font-mono"
                  />
                </div>

                <select
                  value={leaveFilter}
                  onChange={(e) => setLeaveFilter(e.target.value as any)}
                  className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                >
                  <option value="all">All Approval States</option>
                  <option value="pending">Pending Review Only</option>
                  <option value="approved">Approved Applications</option>
                  <option value="rejected">Declined Applications</option>
                </select>

                <select
                  value={leaveTypeFilter}
                  onChange={(e) => setLeaveTypeFilter(e.target.value as any)}
                  className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                >
                  <option value="all">All Types (OD &amp; Leave)</option>
                  <option value="od">On-Duty (OD) Only</option>
                  <option value="leave">Formal Leave Only</option>
                </select>
              </div>

              {/* Application Count and Action Header */}
              <div className="flex items-center justify-between px-1 flex-shrink-0">
                <span className="text-[10px] font-mono uppercase text-txt-muted">
                  Applications: {filteredLeaveApps.length} ({leaveApplications.filter(a => a.status === "pending").length} Pending)
                </span>
                <button
                  type="button"
                  onClick={loadLeaveApplications}
                  className="text-[10px] font-mono text-accent-main hover:underline cursor-pointer"
                >
                  ↻ Refresh Queue
                </button>
              </div>

              {/* Application List Cards */}
              <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
                {filteredLeaveApps.length === 0 ? (
                  <div className="p-12 text-center text-txt-muted font-mono text-xs flex flex-col items-center gap-2">
                    <CalendarCheck size={24} className="text-txt-muted/60" />
                    <span>No student leave or OD requests match the selected filters.</span>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-border-main/60">
                    {filteredLeaveApps.map((app) => {
                      const isSelected = selectedLeaveApp?.id === app.id;
                      const isOD = app.application_type === "od";
                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedLeaveApp(app)}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                            isSelected ? "bg-bg-card/30" : ""
                          }`}
                        >
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                                isOD ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              }`}>
                                {isOD ? "On-Duty (OD)" : "Formal Leave"}
                              </span>
                              <span className="text-xs font-semibold text-txt-main truncate">{app.title}</span>
                              <span className="font-mono text-[9px] text-txt-muted uppercase px-1.5 py-0.2 rounded bg-bg-base border border-border-main/40">
                                {app.category}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-txt-muted font-mono">
                              <span className="text-txt-main font-semibold">{app.student?.full_name || "Student"}</span>
                              <span>•</span>
                              <span>{app.student?.roll_number || app.student_id}</span>
                              <span>•</span>
                              <span>{app.student?.department || "CSE"} ({app.student?.academic_year || "3rd Year"})</span>
                            </div>

                            <div className="text-[10.5px] text-txt-sub flex items-center gap-2">
                              <span className="font-mono text-[9.5px] text-accent-main flex items-center gap-1">
                                <Calendar size={11} />
                                <span>{app.target_date}{app.end_date && app.end_date !== app.target_date ? ` to ${app.end_date}` : ""}</span>
                              </span>
                              <span>•</span>
                              <span className="font-mono text-[9.5px]">
                                {app.is_full_day ? "Full Day (6 Periods)" : `Periods: ${(app.periods || []).map((p: number) => `P${p}`).join(", ")}`}
                              </span>
                            </div>

                            {app.reason && (
                              <p className="text-[11px] text-txt-muted font-light line-clamp-1 italic">
                                &ldquo;{app.reason}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Status & Quick Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                            {app.status === "pending" ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleReviewLeaveApp(app.id, "rejected")}
                                  className="h-7 px-2.5 border border-rose-500/50 hover:bg-rose-500/10 text-rose-400 text-[10px] font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <XCircle size={11} /> Decline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewLeaveApp(app.id, "approved")}
                                  className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono uppercase tracking-wider rounded font-bold transition-opacity cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 size={11} /> Approve
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase border ${
                                app.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              }`}>
                                {app.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4 overflow-y-auto pr-1">
              
              {/* Central AI Data Analytics (Natural Language Query) */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-main animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Gemini AI Analytics Engine</span>
                </div>
                <p className="text-[11px] text-txt-sub leading-relaxed font-light">
                  Query student databases using natural language. Extract list of problems completed, filter by roll numbers, or compile leaderboard spreadsheets instantly.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g. give data of how many problems completed along with name and roll number for first 3 roll numbers"
                    className="flex-1 h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/55 font-sans"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAiQuery(); }}
                  />
                  <button 
                    type="button"
                    onClick={handleAiQuery}
                    disabled={aiLoading}
                    className="h-9 px-4 bg-accent-main text-bg-base text-xs font-mono tracking-wider uppercase rounded-sm hover:bg-accent-main/80 flex items-center justify-center gap-1.5 transition-colors font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading ? "Analyzing..." : "Generate"}
                  </button>
                </div>

                {/* AI Loading Stages */}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-[10px] text-accent-main font-mono mt-1">
                    <div className="w-2.5 h-2.5 border border-accent-main border-t-transparent rounded-full animate-spin" />
                    <span>{aiStage}</span>
                  </div>
                )}

                {/* AI Error Notification */}
                {aiError && (
                  <div className="text-[10px] text-red-500 font-mono mt-1 border border-red-500/30 bg-red-500/5 p-2.5 rounded-sm flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-red-500 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}
                
                {/* AI Query Result Output */}
                {aiResult && (
                  <div className="border border-border-main bg-bg-base/40 p-4 rounded-sm flex flex-col gap-3 mt-1 animate-fade-in">
                    {/* Clarification Prompts check */}
                    {aiResult.clarificationNeeded ? (
                      <div className="flex flex-col gap-2 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded text-[11px] font-mono text-yellow-500">
                        <span className="font-bold flex items-center gap-1">
                          <HelpCircle size={12} /> Clarification Request:
                        </span>
                        <p>{aiResult.clarificationMessage}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center border-b border-border-main/55 pb-2.5">
                          <span className="text-[10px] font-mono text-txt-main font-semibold leading-relaxed max-w-[80%]">
                            {aiResult.explanation}
                          </span>
                          <button 
                            type="button"
                            onClick={downloadAiReportCsv}
                            className="text-[9px] font-mono text-accent-main hover:underline flex items-center gap-1 uppercase"
                          >
                            <Download size={10} /> CSV
                          </button>
                        </div>
                        
                        {/* Render AI Result Table */}
                        <div className="overflow-x-auto max-h-48 border border-border-main/60 bg-bg-surface/50 rounded-sm">
                          <table className="w-full text-left font-mono text-[9.5px] border-collapse">
                            <thead>
                              <tr className="bg-bg-card/45 border-b border-border-main/80 text-txt-muted uppercase tracking-wider text-[8px]">
                                {aiResult.header.map((col, idx) => (
                                  <th key={idx} className="p-2.5 font-bold">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-main/40 text-txt-main">
                              {aiResult.rows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-bg-card/20 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2.5 font-light">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Department Statistics & Coders Standings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standings list */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Top Performing Coders</span>
                  <div className="flex flex-col divide-y divide-border-main/30">
                    {registryStudents
                      .sort((a, b) => b.leetcodeSolved - a.leetcodeSolved)
                      .slice(0, 3)
                      .map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-txt-muted font-mono font-bold">#{idx + 1}</span>
                            <div className="flex flex-col">
                              <span className="text-txt-main font-semibold">{s.name}</span>
                              <span className="text-[9px] text-txt-sub">{s.department}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-accent-main">{s.leetcodeSolved} LC Solved</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Department breakdowns */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Department Analytics</span>
                  <div className="flex flex-col divide-y divide-border-main/30 text-xs">
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-txt-main font-semibold">Computer Science</span>
                      <span className="font-mono text-txt-sub">2 active • Avg 315 LC</span>
                    </div>
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-txt-main font-semibold">Information Technology</span>
                      <span className="font-mono text-txt-sub">1 active • Avg 412 LC</span>
                    </div>
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-txt-main font-semibold">Electrical Engineering</span>
                      <span className="font-mono text-txt-sub">1 active • Avg 184 LC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "broadcasts" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4 overflow-y-auto pr-1">
              
              {/* Opportunities Subtab Selector */}
              <div className="flex gap-4 border-b border-border-main/45 pb-2 text-[10px] uppercase font-mono tracking-wider font-semibold">
                <button
                  type="button"
                  onClick={() => setOppSubTab("broadcasts")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    oppSubTab === "broadcasts" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  System Announcements
                </button>
                <button
                  type="button"
                  onClick={() => setOppSubTab("assignments")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    oppSubTab === "assignments" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <GraduationCap size={12} />
                  Coursework &amp; Classroom Posts
                </button>
                <button
                  type="button"
                  onClick={() => setOppSubTab("opportunities")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    oppSubTab === "opportunities" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Manage Opportunities &amp; News
                </button>
              </div>

              {oppSubTab === "broadcasts" ? (
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Draft New Announcement</span>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Broadcast Title</label>
                    <input 
                      type="text" 
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Hackathon Project Registration Nudge"
                      className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Announcement Body</label>
                    <textarea 
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Type announcement contents here..."
                      className="p-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50 resize-none font-sans font-light"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase text-xs">Alert Category</label>
                      <select
                        value={broadcastType}
                        onChange={(e) => setBroadcastType(e.target.value as any)}
                        className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                      >
                        <option value="system">System Notification</option>
                        <option value="deadline">Deadline Nudge</option>
                        <option value="credit">Credit Verified Alert</option>
                        <option value="invite">Team Invite Alert</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase text-xs">Target Audience</label>
                      <select
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value as any)}
                        className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                      >
                        <option value="all">All Tracked Students</option>
                        <option value="cs">Computer Science Department</option>
                        <option value="it">Information Technology</option>
                        <option value="ee">Electrical Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-border-main/55 pt-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-3">Scheduling Options (Optional)</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-txt-sub font-mono uppercase">Release Date</label>
                        <input 
                          type="date" 
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-txt-sub font-mono uppercase">Release Time</label>
                        <input 
                          type="time" 
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      type="button"
                      onClick={handleScheduleBroadcast}
                      disabled={!broadcastTitle.trim() || !broadcastMessage.trim() || !scheduledDate || !scheduledTime}
                      className="h-9 px-4 border border-border-main text-txt-main text-xs font-mono uppercase rounded-sm hover:bg-bg-card disabled:opacity-50 cursor-pointer font-semibold transition-all"
                    >
                      Schedule Alert
                    </button>
                    <button 
                      type="button"
                      onClick={handleSendBroadcast}
                      disabled={!broadcastTitle.trim() || !broadcastMessage.trim() || (!!scheduledDate && !!scheduledTime)}
                      className="h-9 px-5 bg-accent-main text-bg-base text-xs font-mono uppercase rounded-sm hover:bg-accent-main/80 disabled:opacity-50 cursor-pointer font-bold transition-all"
                    >
                      Send Instantly
                    </button>
                  </div>
                </div>
              ) : oppSubTab === "assignments" ? (
                /* Coursework & Classroom Posts view */
                <div className="flex flex-col gap-5 animate-fade-in text-left">
                  {/* Creator Form */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">
                        Publish Coursework, Assignments &amp; Lecture Materials
                      </span>
                      <span className="font-mono text-[10px] text-accent-main uppercase font-bold">
                        Target: {courseDept} • {courseYear} (Sec {courseSection})
                      </span>
                    </div>

                    <form onSubmit={handlePublishCoursework} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Subject</label>
                          <select
                            value={courseSubject}
                            onChange={(e) => setCourseSubject(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="CS8501">CS8501: Theory of Computation</option>
                            <option value="CS8591">CS8591: Computer Networks &amp; Security</option>
                            <option value="CS8592">CS8592: OOAD</option>
                            <option value="EC8691">EC8691: Microprocessors</option>
                            <option value="CS8511">CS8511: Networks Laboratory</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Department</label>
                          <select
                            value={courseDept}
                            onChange={(e) => setCourseDept(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Academic Year</label>
                          <select
                            value={courseYear}
                            onChange={(e) => setCourseYear(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Section</label>
                          <select
                            value={courseSection}
                            onChange={(e) => setCourseSection(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Post Title</label>
                          <input
                            type="text"
                            required
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            placeholder="e.g. Assignment 4: Syntax-Directed Translation Parser"
                            className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Post Type</label>
                          <select
                            value={coursePostType}
                            onChange={(e) => setCoursePostType(e.target.value as any)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="assignment">Assignment (With Due Date)</option>
                            <option value="material">Lecture Notes / Slide Deck</option>
                            <option value="notice">Section Flash Notice</option>
                            <option value="discussion">Technical Discussion Topic</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Instructions &amp; Problem Statement</label>
                        <textarea
                          rows={3}
                          required
                          value={courseContent}
                          onChange={(e) => setCourseContent(e.target.value)}
                          placeholder="Provide detailed instructions, problem specifications, or study resources..."
                          className="p-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50 resize-none font-sans font-light"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {coursePostType === "assignment" && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Submission Due Date</label>
                            <input
                              type="date"
                              value={courseDueDate}
                              onChange={(e) => setCourseDueDate(e.target.value)}
                              className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm font-mono"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Attachment Name (Optional)</label>
                          <input
                            type="text"
                            value={courseAttachmentName}
                            onChange={(e) => setCourseAttachmentName(e.target.value)}
                            placeholder="e.g. Lab_Manual_Exp_4.pdf"
                            className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Attachment URL / Drive Link (Optional)</label>
                          <input
                            type="text"
                            value={courseAttachmentUrl}
                            onChange={(e) => setCourseAttachmentUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={coursePublishing}
                          className="h-9 px-5 bg-accent-main text-bg-base text-xs font-mono uppercase rounded-sm hover:opacity-90 disabled:opacity-50 font-bold cursor-pointer transition-opacity"
                        >
                          {coursePublishing ? "Publishing..." : "Publish to Student Classroom"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Classroom Feed */}
                  <div className="border border-border-main/60 bg-bg-surface rounded-md">
                    <div className="p-4 border-b border-border-main/40 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                      <span>Published Classroom Stream ({classroomPosts.length} Items)</span>
                      <button
                        type="button"
                        onClick={loadClassroomPosts}
                        className="text-accent-main hover:underline cursor-pointer"
                      >
                        ↻ Refresh Feed
                      </button>
                    </div>

                    <div className="flex flex-col divide-y divide-border-main/40 max-h-96 overflow-y-auto">
                      {classroomPosts.length === 0 ? (
                        <div className="p-8 text-center text-txt-muted font-mono text-[10px] uppercase">
                          No coursework items published for {courseDept} ({courseYear} - {courseSection}).
                        </div>
                      ) : (
                        classroomPosts.map((post) => (
                          <div key={post.id} className="p-4 flex flex-col gap-2 hover:bg-bg-card/10 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                                  post.post_type === "assignment" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                  post.post_type === "material" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                  post.post_type === "notice" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                                  "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                }`}>
                                  {post.post_type}
                                </span>
                                <span className="text-xs text-txt-main font-semibold">{post.title}</span>
                              </div>
                              {post.due_date && (
                                <span className="font-mono text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                                  Due: {new Date(post.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-txt-muted font-light leading-relaxed line-clamp-2">
                              {post.content}
                            </p>
                            {post.attachment_name && (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-accent-main">
                                <FileText size={11} />
                                <span>{post.attachment_name}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Manage Opportunities and Recommendations view */
                <div className="flex flex-col gap-5 animate-fade-in text-left">
                  {/* Draft new Opportunity Form */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Publish New Opportunity</span>
                    
                    <form onSubmit={handleCreateOpportunity} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Opportunity Title</label>
                          <input 
                            type="text" 
                            required
                            value={newOppTitle}
                            onChange={(e) => setNewOppTitle(e.target.value)}
                            placeholder="e.g. ACM ICPC Regionals 2026"
                            className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Registration Deadline</label>
                          <input 
                            type="text" 
                            value={newOppDeadline}
                            onChange={(e) => setNewOppDeadline(e.target.value)}
                            placeholder="e.g. Oct 12, 2026"
                            className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase text-xs">Category</label>
                          <select
                            value={newOppCategory}
                            onChange={(e) => setNewOppCategory(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="hackathon">Hackathon</option>
                            <option value="contest">Programming Contest</option>
                            <option value="news">News & Update</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase text-xs">Location Mode</label>
                          <select
                            value={newOppLocation}
                            onChange={(e) => setNewOppLocation(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="online">Online</option>
                            <option value="in_person">In-Person</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase text-xs">Scope / Level</label>
                          <select
                            value={newOppLevel}
                            onChange={(e) => setNewOppLevel(e.target.value)}
                            className="h-9 px-2 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer font-mono"
                          >
                            <option value="local">Local Campus</option>
                            <option value="national">National</option>
                            <option value="global">Global International</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">External URL</label>
                        <input 
                          type="text" 
                          value={newOppUrl}
                          onChange={(e) => setNewOppUrl(e.target.value)}
                          placeholder="https://contest-portal.com"
                          className="h-9 px-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-txt-sub font-semibold font-mono uppercase">Brief Description</label>
                        <textarea 
                          rows={2}
                          value={newOppDesc}
                          onChange={(e) => setNewOppDesc(e.target.value)}
                          placeholder="Type details, eligibility, or prizes..."
                          className="p-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50 resize-none font-sans font-light"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          className="h-9 px-5 bg-accent-main text-bg-base text-xs font-mono uppercase rounded-sm hover:opacity-90 font-bold cursor-pointer"
                        >
                          Publish Opportunity
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Opportunities list */}
                  <div className="border border-border-main/60 bg-bg-surface rounded-md">
                    <div className="p-4 border-b border-border-main/40 font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                      Active Opportunities Registry ({opportunities.length})
                    </div>
                    <div className="flex flex-col divide-y divide-border-main/40 max-h-96 overflow-y-auto">
                      {opportunities.length === 0 ? (
                        <div className="p-8 text-center text-txt-muted font-mono text-[10px] uppercase">
                          No opportunities published.
                        </div>
                      ) : (
                        opportunities.map((opp) => (
                          <div key={opp.id} className="p-4 flex justify-between items-center gap-4 hover:bg-bg-card/10 transition-colors">
                            <div className="flex flex-col text-left">
                              <span className="text-xs text-txt-main font-semibold">{opp.title}</span>
                              <span className="text-[9px] text-txt-muted font-mono mt-0.5">Category: {opp.category.toUpperCase()} • Level: {opp.level.toUpperCase()}</span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleRecommendOpportunity(opp.id, opp.title)}
                              className={`h-7 px-3 text-[9px] font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer border ${
                                opp.facultyRecommended 
                                  ? "bg-amber-500/10 border-amber-500/40 text-amber-600 font-bold" 
                                  : "border-border-main text-txt-sub hover:bg-bg-card"
                              }`}
                            >
                              {opp.facultyRecommended ? "Recommended" : "Recommend"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "verifications" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4">
              
              {/* Verification Sub-tabs Select */}
              <div className="flex border-b border-border-main/40 pb-2 gap-3 text-[10px] uppercase font-mono tracking-wider font-semibold flex-wrap">
                <button
                  type="button"
                  onClick={() => setVerifSubTab("credits")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    verifSubTab === "credits" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Credit Applications ({claims.filter(c => c.status === "pending").length})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifSubTab("handles")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    verifSubTab === "handles" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Handle Verifications ({handleRequests.filter(h => h.status === "pending").length})
                </button>
                <button
                  type="button"
                  onClick={() => setVerifSubTab("links")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    verifSubTab === "links" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Institutional Links ({
                    (() => {
                      const staffKey = currentStaff?.key || "";
                      const matchKey = isCompanyRecruiter ? staffKey.replace("_ADMIN", "") : staffKey.replace("_FACULTY", "");
                      const requestType = isCompanyRecruiter ? "company" : "college";
                      return linkRequests.filter(l => l.status === "pending" && l.type === requestType && l.key === matchKey).length;
                    })()
                  })
                </button>
                <button
                  type="button"
                  onClick={() => setVerifSubTab("works")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    verifSubTab === "works" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  <Palette size={12} className="text-accent-main" />
                  Works Review ({worksReviewQueue.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
                {verifSubTab === "credits" ? (
                  loading ? (
                    <div className="flex flex-col divide-y divide-border-main/40 animate-pulse">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className="p-4 flex justify-between items-center gap-4">
                          <div className="flex flex-col gap-2 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-20 bg-border-main/20 rounded-sm" />
                              <div className="h-2 w-12 bg-border-main/10 rounded-sm" />
                            </div>
                            <div className="h-2.5 w-32 bg-border-main/10 rounded-sm" />
                            <div className="h-2 w-24 bg-border-main/10 rounded-sm" />
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="h-3.5 w-12 bg-border-main/20 rounded-sm" />
                            <div className="h-4 w-14 bg-border-main/10 rounded-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-border-main/60">
                      {claims.map((claim) => (
                        <div 
                          key={claim.id} 
                          onClick={() => setSelectedClaim(claim)}
                          className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                            selectedClaim?.id === claim.id ? "bg-bg-card/30" : ""
                          }`}
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-txt-main font-semibold">{claim.student_name}</span>
                              <span className="text-[9px] text-txt-muted font-mono">{claim.created_at}</span>
                            </div>
                            <span className="text-[10px] text-txt-sub truncate">{claim.project_name}</span>
                            <span className="text-[9px] text-txt-muted font-mono uppercase tracking-wider">{claim.event_title}</span>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-xs text-txt-main font-bold font-mono">+{claim.points} pts</span>
                            <span className={`text-[8px] font-mono tracking-wider border px-2 py-0.5 rounded uppercase ${
                              claim.status === "approved"
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                                : claim.status === "rejected"
                                ? "bg-red-500/10 border-red-500/40 text-red-500"
                                : "bg-bg-card border-border-main/80 text-txt-muted"
                            }`}>
                              {claim.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : verifSubTab === "handles" ? (
                  /* Handles verifications sublist */
                  <div className="flex flex-col">
                    <div className="p-3 bg-bg-card/40 border-b border-border-main/60 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-accent-main" />
                        <span className="text-[10px] font-mono uppercase font-bold text-txt-main">
                          {handleRequests.filter(r => r.status === "pending").length} Pending Claims
                        </span>
                      </div>
                      {handleRequests.some(r => r.status === "pending") && (
                        <button
                          type="button"
                          onClick={handleBulkApproveSafeHandles}
                          className="px-2.5 py-1 bg-accent-main/15 hover:bg-accent-main text-accent-main hover:text-bg-base border border-accent-main/40 text-[9px] font-mono uppercase font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={11} />
                          Auto-Approve Safe Claims
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col divide-y divide-border-main/60">
                    {handleRequests.map((req) => (
                      <div 
                        key={req.id} 
                        onClick={() => setSelectedHandleRequest(req)}
                        className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                          selectedHandleRequest?.id === req.id ? "bg-bg-card/30" : ""
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-txt-main font-semibold">{req.studentName}</span>
                            <span className="text-[9px] text-txt-muted font-mono">{req.date}</span>
                          </div>
                          <span className="text-[10px] text-txt-sub truncate">Platform: {req.platform} (@{req.handle})</span>
                          <div className="flex items-center gap-1.5 mt-1 text-left">
                            <span className={`text-[8px] font-mono tracking-wider border px-1.5 py-0.2 rounded uppercase font-bold ${
                              req.requestType === "handle_switch"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                            }`}>
                              {req.requestType === "handle_switch" ? "Handle Switch" : "New Handle"}
                            </span>
                            {req.oldHandle && (
                              <span className="text-[9px] text-txt-muted font-mono">
                                (from @{req.oldHandle})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className={`text-[8px] font-mono tracking-wider border px-2 py-0.5 rounded uppercase ${
                            req.status === "approved"
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                              : req.status === "rejected"
                              ? "bg-red-500/10 border-red-500/40 text-red-500"
                              : "bg-bg-card border-border-main/80 text-txt-muted"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                ) : verifSubTab === "links" ? (
                  /* Institutional Links verifications sublist */
                  <div className="flex flex-col divide-y divide-border-main/60">
                    {(() => {
                      const staffKey = currentStaff?.key || "";
                      const matchKey = isCompanyRecruiter ? staffKey.replace("_ADMIN", "") : staffKey.replace("_FACULTY", "");
                      const requestType = isCompanyRecruiter ? "company" : "college";
                      const filtered = linkRequests.filter(l => l.type === requestType && l.key === matchKey);
                      
                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center text-txt-muted text-[10px] font-mono uppercase">
                            No linking requests found
                          </div>
                        );
                      }
                      
                      return filtered.map((req) => (
                        <div 
                          key={req.id} 
                          onClick={() => setSelectedLinkRequest(req)}
                          className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                            selectedLinkRequest?.id === req.id ? "bg-bg-card/30" : ""
                          }`}
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-txt-main font-semibold">{req.studentName}</span>
                              <span className="text-[9px] text-txt-muted font-mono">{req.date}</span>
                            </div>
                            <span className="text-[10px] text-txt-sub truncate">
                              Type: {req.type === "college" ? "College Link" : "Employer Link"} ({req.key})
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 text-left">
                              <span className={`text-[8px] font-mono tracking-wider border px-1.5 py-0.2 rounded uppercase font-bold ${
                                req.previouslyUnlinked
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                  : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                              }`}>
                                {req.previouslyUnlinked ? "Unlinked & Re-linking" : "New Link"}
                              </span>
                              {req.batchCode && (
                                <span className="text-[9px] text-txt-muted font-mono">
                                  ({req.batchCode})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className={`text-[8px] font-mono tracking-wider border px-2 py-0.5 rounded uppercase ${
                              req.status === "approved"
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                                : req.status === "rejected"
                                ? "bg-red-500/10 border-red-500/40 text-red-500"
                                : req.status === "unlinked"
                                ? "bg-txt-muted/10 border-border-main text-txt-muted"
                                : "bg-bg-card border-border-main/80 text-txt-muted"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  /* Works Review sublist */
                  <div className="flex flex-col divide-y divide-border-main/60">
                    {worksReviewQueue.length === 0 ? (
                      <div className="p-8 text-center text-txt-muted font-mono text-xs flex flex-col items-center gap-2">
                        <span>No student works currently awaiting staff review.</span>
                      </div>
                    ) : (
                      worksReviewQueue.map((work) => (
                        <div
                          key={work.id}
                          onClick={() => setSelectedWorkReview(work)}
                          className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                            selectedWorkReview?.id === work.id ? "bg-bg-card/30" : ""
                          }`}
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-txt-main font-semibold">{work.student_name || "Student"}</span>
                              {work.student_department && (
                                <span className="text-[9px] text-txt-muted font-mono">{work.student_department} ({work.student_academic_year || "2026"})</span>
                              )}
                            </div>
                            <span className="text-xs text-accent-main font-medium truncate">{work.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-mono uppercase bg-bg-card px-1.5 py-0.5 rounded border border-border-main/60 text-txt-muted">
                                {work.category}
                              </span>
                              {work.is_alias && (
                                <span className="text-[8px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1 py-0.2 rounded font-bold">
                                  Alias Claim
                                </span>
                              )}
                              {!work.is_published && (
                                <span className="text-[8px] font-mono uppercase bg-blue-500/10 text-blue-500 border border-blue-500/30 px-1 py-0.2 rounded font-bold">
                                  Unpublished File
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[8px] font-mono tracking-wider border px-2 py-0.5 rounded uppercase bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold">
                              Needs Review
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "talent_registry" && (
            <div className="flex-grow flex flex-col min-h-0 gap-4">
              
              {/* Dynamic Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-bg-card/20 p-4 border border-border-main/50 rounded-md flex-shrink-0">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, email, major..."
                  className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/60"
                />

                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
                >
                  <option value="">All Batches</option>
                  <option value="Batch A">Batch A</option>
                  <option value="Batch B">Batch B</option>
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
                >
                  <option value="">All Years</option>
                  <option value="2026">Class of 2026</option>
                  <option value="2027">Class of 2027</option>
                </select>

                <select
                  value={filterSolvedThreshold}
                  onChange={(e) => setFilterSolvedThreshold(Number(e.target.value))}
                  className="h-8 px-2 border border-border-main/80 bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm cursor-pointer"
                >
                  <option value={0}>LeetCode solves: Any</option>
                  <option value={200}>solved &gt; 200</option>
                  <option value={300}>solved &gt; 300</option>
                  <option value={400}>solved &gt; 400</option>
                </select>
              </div>

              {/* AI Report Assistant Panel */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-border-main/40 pb-2">
                  <Sparkles size={13} className="text-amber-500 animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">AI Report Generator (Gemini 1.5 Flash)</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] text-txt-muted font-light leading-relaxed">
                    Type a natural language prompt to filter, analyze, and compile custom student records into an exportable report (e.g., <span className="italic">{"'i want to download the leetcode performance of it department from 101 to 102 roll number'"}</span> or <span className="italic">{"'find computer science students with more than 300 solves'"}</span>).
                  </p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask AI to filter or export reports..."
                      className="h-9 flex-grow px-3 border border-border-main bg-bg-base text-xs text-txt-main focus:outline-none focus:border-txt-main rounded"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aiQuery.trim()) {
                          handleAiQuery();
                        }
                      }}
                    />
                    <button
                      onClick={handleAiQuery}
                      disabled={aiLoading || !aiQuery.trim()}
                      className="h-9 px-4 bg-bg-card hover:bg-bg-card/80 border border-border-main text-txt-main text-[10px] uppercase font-mono tracking-wider font-bold transition-all duration-150 rounded flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? (
                        <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={11} className="text-amber-500" />
                      )}
                      Compile
                    </button>
                  </div>
                </div>

                {/* Staging / Loading state */}
                {aiLoading && (
                  <div className="py-2 flex items-center gap-2">
                    <span className="text-[9px] font-mono text-txt-muted uppercase tracking-wider animate-pulse">{aiStage}</span>
                  </div>
                )}

                {/* Error state */}
                {!aiLoading && aiError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="text-[10px] text-red-500 leading-relaxed font-light">{aiError}</p>
                  </div>
                )}

                {/* Result state */}
                {!aiLoading && !aiError && aiResult && (
                  <div className="mt-1 p-3 bg-bg-base/30 border border-border-main/50 rounded flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-mono text-txt-muted uppercase font-bold">AI Analysis Overview</span>
                      <p className="text-[11px] text-txt-main font-light leading-relaxed">
                        {aiResult.explanation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-border-main/30">
                      <button
                        onClick={downloadAiReportCsv}
                        className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-mono tracking-wider uppercase rounded flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Download size={10} /> Download AI CSV Report
                      </button>
                      
                      {aiResult.isMock && (
                        <span className="text-[8px] font-sans text-txt-muted italic bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded">
                          Mock mode active
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-txt-muted">Filtered Students: {filteredStudents.length}</span>
                <button 
                  onClick={handleExportCSV}
                  className="h-8 px-4 bg-accent-main text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Download size={11} /> Export Registry to CSV
                </button>
              </div>

              <div className="flex-1 overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
                <div className="flex flex-col divide-y divide-border-main/60">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className={`p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-bg-card/25 transition-colors ${
                        selectedStudent?.id === student.id ? "bg-bg-card/30" : ""
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-txt-main font-semibold">{student.name}</span>
                        <span className="text-[9px] text-txt-muted font-mono">Roll: {student.rollNo} • {student.email} • {student.department}</span>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-txt-sub">
                          <span className="font-mono text-[8px] bg-bg-card px-1 py-0.5 rounded border border-border-main/50">{student.batchCode} • Class {student.gradYear}</span>
                          <span className="font-mono text-[8px] bg-bg-card px-1 py-0.5 rounded border border-border-main/50">LC: {student.leetcodeSolved}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNudgeStudent(student);
                            setNudgeMessage(`Please link your coding platform accounts to ensure all extracurricular metrics sync correctly.`);
                          }}
                          className="h-6 px-2 border border-border-main hover:bg-bg-card text-txt-main text-[8px] font-mono tracking-wider uppercase rounded-sm transition-colors cursor-pointer"
                        >
                          Nudge
                        </button>
                        {student.authorized ? (
                          <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                            Authorized
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/40 px-2 py-0.5 rounded uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "staff_access" && (
            <div className="flex-grow flex flex-col min-h-0 gap-6">
              
              {/* Form to Register Staff */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Register New Staff Console Access</span>
                  <p className="text-xs text-txt-sub">Admins registered here can log in using their unique key and college email.</p>
                </div>
                
                <form onSubmit={handleAddStaff} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-grow flex flex-col gap-1 w-full">
                    <label className="text-[9px] text-txt-sub font-mono uppercase tracking-wider">Staff Member Name</label>
                    <input 
                      type="text" 
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Prof. Davis"
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-sans w-full"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col gap-1 w-full">
                    <label className="text-[9px] text-txt-sub font-mono uppercase tracking-wider">Unique Staff Key / ID</label>
                    <input 
                      type="text" 
                      required
                      value={newStaffKey}
                      onChange={(e) => setNewStaffKey(e.target.value)}
                      placeholder="e.g. DAVIS987"
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono w-full"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="h-9 px-4 bg-accent-main text-bg-base text-xs font-mono uppercase tracking-wider font-semibold rounded-sm hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer w-full sm:w-auto"
                  >
                    Add Staff
                  </button>
                </form>
              </div>

              {/* List of Registered Staff */}
              <div className="overflow-y-auto border border-border-main/60 bg-bg-surface rounded-md">
                <div className="p-4 border-b border-border-main/40 font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                  Registered Access Keys ({registeredStaff.length})
                </div>
                <div className="flex flex-col divide-y divide-border-main/40 max-h-48 overflow-y-auto">
                  {registeredStaff.map((staff) => (
                    <div key={staff.key} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-txt-main font-semibold">{staff.name}</span>
                        <span className="text-[10px] text-txt-muted font-mono uppercase tracking-wider mt-0.5">Key: {staff.key}</span>
                      </div>
                      
                      {staff.key !== "ADMIN" ? (
                        <button 
                          onClick={() => handleRemoveStaff(staff.key)}
                          className="h-7 px-3 border border-red-500/40 text-red-500 hover:bg-red-500/10 text-[9px] font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <span className="text-[8px] font-mono tracking-wider bg-bg-card border border-border-main/80 text-txt-muted px-2 py-1 rounded uppercase">
                          Primary Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter Access PINs Generation Card */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Recruiter Access Controls</span>
                  <p className="text-xs text-txt-sub">Generate 6-digit access PINs for corporate recruitment partners to view student portfolios.</p>
                </div>
                
                <form onSubmit={handleGenerateRecruiterPin} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-grow flex flex-col gap-1 w-full">
                    <label className="text-[9px] text-txt-sub font-mono uppercase tracking-wider">Company / Recruiter Partner Name</label>
                    <input 
                      type="text" 
                      required
                      value={newCompanyRecruiter}
                      onChange={(e) => setNewCompanyRecruiter(e.target.value)}
                      placeholder="e.g. Google India"
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-sans w-full"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="h-9 px-4 bg-accent-main text-bg-base text-xs font-mono uppercase tracking-wider font-semibold rounded-sm hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer w-full sm:w-auto"
                  >
                    Generate PIN
                  </button>
                </form>

                {/* List of active PINs */}
                {recruiterPins.length > 0 && (
                  <div className="mt-2 flex flex-col divide-y divide-border-main/45 border-t border-border-main/40 pt-2 text-xs">
                    {recruiterPins.map((pinObj) => (
                      <div key={pinObj.id} className="p-2.5 flex justify-between items-center gap-3">
                        <div className="flex flex-col text-left">
                          <span className="text-xs text-txt-main font-semibold">{pinObj.company}</span>
                          <span className="text-[9px] text-txt-muted font-mono">Issued: {pinObj.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-accent-main bg-bg-base border border-border-main/60 px-2 py-0.5 rounded select-all">
                            {pinObj.pin}
                          </span>
                          <button
                            onClick={() => handleRevokePin(pinObj.id, pinObj.company)}
                            className="text-[9px] font-mono text-red-500 hover:underline uppercase"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================= RIGHT PANEL: INSPECTOR (5 Columns) ================= */}
        <section className="lg:col-span-4 bg-bg-surface/30 flex flex-col p-6 gap-6">
          
          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
              {activeTab === "overview"
                ? "Live Auditor"
                : activeTab === "attendance_marker"
                ? "Attendance Auditor"
                : activeTab === "marks_entry"
                ? "Gradebook Auditor"
                : activeTab === "leave_approvals"
                ? "Application Inspector"
                : activeTab === "talent_registry"
                ? (isCompanyRecruiter ? "Candidate Details" : "Skills Analytics")
                : activeTab === "broadcasts"
                ? (isCompanyRecruiter ? "Outreach Logs" : "Broadcast Logs")
                : activeTab === "verifications"
                ? (isCompanyRecruiter ? "Credentials Check" : "Security Audit")
                : "Security Ledger"}
            </span>
            <h2 className="font-display text-lg font-light text-txt-main">
              {activeTab === "overview"
                ? "Console Ledger"
                : activeTab === "attendance_marker"
                ? "Period Attendance Status"
                : activeTab === "marks_entry"
                ? "Class Grade Summary"
                : activeTab === "leave_approvals"
                ? "Application Details & Proof Audit"
                : activeTab === "talent_registry"
                ? (isCompanyRecruiter ? "Candidate Dossier" : "Talent Dossier")
                : activeTab === "broadcasts"
                ? (isCompanyRecruiter ? "Job Listings Queue" : "Announcement Queue")
                : activeTab === "verifications"
                ? (verifSubTab === "links" ? "Enrollment Auditor" : (isCompanyRecruiter ? "Resume Inspector" : "Portfolio Inspector"))
                : "Console Session Log"}
            </h2>
          </div>

          {activeTab === "leave_approvals" && (
            selectedLeaveApp ? (
              <div className="flex flex-col gap-5 animate-fade-in text-left">
                {/* Student Identification */}
                <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Applicant Details</span>
                  <div className="flex flex-col">
                    <span className="text-sm text-txt-main font-semibold">{selectedLeaveApp.student?.full_name || "Alex Carter"}</span>
                    <span className="text-xs text-txt-muted font-mono">{selectedLeaveApp.student?.roll_number || "RA2311003010001"}</span>
                    <span className="text-[10px] text-txt-sub mt-0.5 font-mono">
                      {selectedLeaveApp.student?.department || "Computer Science"} • Section {selectedLeaveApp.student?.section || "A"} • {selectedLeaveApp.student?.academic_year || "3rd Year"}
                    </span>
                  </div>
                </div>

                {/* Application Parameters */}
                <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Application Parameters</span>
                  
                  <div className="flex justify-between items-center border-b border-border-main/30 pb-2">
                    <span className="text-[10px] text-txt-sub font-mono uppercase">Request Type</span>
                    <span className={`font-mono text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                      selectedLeaveApp.application_type === "od"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    }`}>
                      {selectedLeaveApp.application_type === "od" ? "On-Duty (OD)" : "Formal Leave"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/30 pb-2">
                    <span className="text-[10px] text-txt-sub font-mono uppercase">Target Schedule</span>
                    <span className="font-mono text-xs text-txt-main font-semibold">
                      {selectedLeaveApp.target_date}
                      {selectedLeaveApp.end_date && selectedLeaveApp.end_date !== selectedLeaveApp.target_date ? ` to ${selectedLeaveApp.end_date}` : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/30 pb-2">
                    <span className="text-[10px] text-txt-sub font-mono uppercase">Duration / Scope</span>
                    <span className="font-mono text-xs text-accent-main font-semibold">
                      {selectedLeaveApp.is_full_day ? "Whole Day (Periods 1–6)" : `Periods ${(selectedLeaveApp.periods || []).join(", ")}`}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 border-b border-border-main/30 pb-2">
                    <span className="text-[10px] text-txt-sub font-mono uppercase">Title / Subject</span>
                    <span className="text-xs text-txt-main font-medium">{selectedLeaveApp.title}</span>
                  </div>

                  {selectedLeaveApp.reason && (
                    <div className="flex flex-col gap-1 border-b border-border-main/30 pb-2">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Statement of Purpose / Reason</span>
                      <p className="text-xs text-txt-main font-light leading-relaxed italic bg-bg-base/40 p-2.5 border border-border-main/40 rounded">
                        &ldquo;{selectedLeaveApp.reason}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Formal Letter View if available */}
                  {selectedLeaveApp.letter_body && (
                    <div className="flex flex-col gap-1.5 border-b border-border-main/30 pb-2">
                      <span className="text-[10px] text-txt-sub font-mono uppercase font-bold flex items-center gap-1">
                        <FileText size={11} /> Official Leave Letter Document
                      </span>
                      <div className="bg-bg-base/60 border border-border-main/60 p-3 rounded text-[11px] font-mono text-txt-main whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                        {selectedLeaveApp.letter_body}
                      </div>
                    </div>
                  )}

                  {/* Supporting Proof Document */}
                  {selectedLeaveApp.proof_url && (
                    <div className="flex items-center justify-between bg-bg-base/40 border border-border-main/40 p-2.5 rounded">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-txt-muted" />
                        <span className="text-xs text-txt-main font-mono">Proof Attachment</span>
                      </div>
                      <a
                        href={selectedLeaveApp.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-accent-main hover:underline flex items-center gap-1 font-mono uppercase font-bold"
                      >
                        View Document <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Review Remarks & Action Buttons */}
                {selectedLeaveApp.status === "pending" ? (
                  <div className="flex flex-col gap-3 border border-border-main/70 bg-bg-surface p-4 rounded-sm">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-txt-sub font-mono uppercase tracking-wider">Faculty Remarks (Optional)</label>
                      <input
                        type="text"
                        value={leaveActionRemarks}
                        onChange={(e) => setLeaveActionRemarks(e.target.value)}
                        placeholder="e.g. Approved for hackathon representation..."
                        className="h-8 px-2.5 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleReviewLeaveApp(selectedLeaveApp.id, "rejected")}
                        disabled={leaveActionLoading}
                        className="flex-1 h-9 border border-rose-500/60 hover:bg-rose-500/10 text-rose-400 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle size={12} /> Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewLeaveApp(selectedLeaveApp.id, "approved")}
                        disabled={leaveActionLoading}
                        className="flex-1 h-9 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded font-bold transition-opacity cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} />
                        {selectedLeaveApp.application_type === "od" ? "Approve & Mark OD" : "Approve Leave"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[10px] text-txt-sub flex flex-col gap-1">
                    <span className="uppercase font-bold text-txt-main">Application Finalized ({selectedLeaveApp.status})</span>
                    {selectedLeaveApp.faculty_remarks && (
                      <span className="text-txt-muted italic">Faculty Note: {selectedLeaveApp.faculty_remarks}</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                <CalendarCheck size={18} className="mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-wider">No Application Selected</span>
                <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select an OD or leave application from the queue to audit proof documents and record official decisions.</p>
              </div>
            )
          )}

          {activeTab === "attendance_marker" && (
            <div className="flex flex-col gap-4 animate-fade-in text-left">
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Session Overview</span>
                <div className="flex flex-col gap-1 text-xs font-mono">
                  <span className="text-txt-main font-semibold">{attSubject} (Sec {attSection})</span>
                  <span className="text-txt-muted text-[10px]">Date: {attDate} • Period: P{attPeriodSlot}</span>
                </div>
              </div>

              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Roster Breakdown</span>
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                    <span className="text-[8px] text-txt-muted uppercase">Present</span>
                    <span className="text-sm font-bold text-emerald-400">{attRoster.filter(s => s.status === "PRESENT").length}</span>
                  </div>
                  <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                    <span className="text-[8px] text-txt-muted uppercase">Absent</span>
                    <span className="text-sm font-bold text-rose-400">{attRoster.filter(s => s.status === "ABSENT").length}</span>
                  </div>
                  <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                    <span className="text-[8px] text-txt-muted uppercase">On-Duty (OD)</span>
                    <span className="text-sm font-bold text-amber-400">{attRoster.filter(s => s.status === "OD").length}</span>
                  </div>
                  <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                    <span className="text-[8px] text-txt-muted uppercase">Late Entry</span>
                    <span className="text-sm font-bold text-purple-400">{attRoster.filter(s => s.status === "LATE").length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "marks_entry" && (
            <div className="flex flex-col gap-4 animate-fade-in text-left">
              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Assessment Configuration</span>
                <div className="flex flex-col gap-1 text-xs font-mono">
                  <span className="text-txt-main font-semibold">{marksSubject} • {marksExamType}</span>
                  <span className="text-txt-muted text-[10px]">Max Score: {marksMaxScore} • Students: {marksRoster.length}</span>
                </div>
              </div>

              <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3 font-mono text-xs">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Performance Summary</span>
                <div className="flex justify-between items-center border-b border-border-main/30 pb-2">
                  <span className="text-txt-muted text-[10px] uppercase">Top Score</span>
                  <span className="text-emerald-400 font-bold">{Math.max(...marksRoster.map(r => Number(r.score) || 0))} / {marksMaxScore}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-main/30 pb-2">
                  <span className="text-txt-muted text-[10px] uppercase">Class Average</span>
                  <span className="text-accent-main font-bold">
                    {Math.round((marksRoster.reduce((acc, r) => acc + Number(r.score), 0) / marksRoster.length) * 10) / 10} / {marksMaxScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-txt-muted text-[10px] uppercase">Pass Rate (&gt;50%)</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round((marksRoster.filter(r => (Number(r.score) / marksMaxScore) >= 0.5).length / marksRoster.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "verifications" && (
            verifSubTab === "credits" ? (
              selectedClaim ? (
                <div className="flex flex-col gap-6 animate-fade-in text-left">
                  
                  {/* Student Identification */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Claimant details</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-txt-main font-semibold">{selectedClaim.student_name}</span>
                      <span className="text-xs text-txt-muted font-mono">{selectedClaim.student_email}</span>
                    </div>
                  </div>

                  {/* Submission Materials */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Submission materials</span>
                    
                    {/* PDF Deck Link */}
                    <div className="flex items-center justify-between border-b border-border-main/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-txt-muted" />
                        <div className="flex flex-col">
                          <span className="text-xs text-txt-main font-medium">Pitch presentation deck</span>
                          <span className="text-[9px] text-txt-muted font-mono truncate max-w-[180px]">{selectedClaim.artifact_name}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://dsqkxedafwzkjtcupzwx.supabase.co/storage/v1/object/public/event-verifications/${selectedClaim.artifact_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                      >
                        View
                        <ExternalLink size={9} />
                      </a>
                    </div>

                    {/* Git Repository Link */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <GithubIcon size={14} className="text-txt-muted" />
                        <div className="flex flex-col">
                          <span className="text-xs text-txt-main font-medium">Git repository codebase</span>
                          <span className="text-[9px] text-txt-muted font-mono truncate max-w-[180px]">{selectedClaim.repo_url}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://${selectedClaim.repo_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-txt-main hover:underline flex items-center gap-1 font-mono uppercase"
                      >
                        Repo
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  </div>

                  {/* Academic Credits Verified */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Academic Credit Points</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-txt-sub font-light">Calculated reward payload:</span>
                      <strong className="text-sm text-accent-main font-mono font-bold">+{selectedClaim.points} Points</strong>
                    </div>
                  </div>

                  {/* Multi-modal AI verifier */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">AI Document Auditor</span>
                    <div className="flex justify-between items-center bg-bg-base/40 border border-border-main/50 p-2.5 rounded-sm">
                      <div className="flex items-center gap-2 text-xs">
                        <Sparkles size={13} className="text-accent-main animate-pulse" />
                        <span className="font-mono text-[10px] text-txt-main font-semibold">Gemini Multimodal Auditor</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAiVerifyCertificate(selectedClaim)}
                        disabled={aiVerifyLoading}
                        className="h-7 px-3 bg-accent-main text-bg-base text-[9px] font-mono tracking-wider uppercase rounded-sm hover:bg-accent-main/80 flex items-center justify-center font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {aiVerifyLoading ? "Auditing..." : "Verify Certificate"}
                      </button>
                    </div>
                    <p className="text-[10px] text-txt-muted font-light leading-relaxed">
                      Verify authenticity, recipient credentials, signatures, and credit metrics using multimodal document validation.
                    </p>
                  </div>

                  {/* Action Buttons (Verify/Decline) */}
                  {selectedClaim.status === "pending" ? (
                    <div className="flex gap-3 border-t border-border-main/40 pt-4">
                      <button 
                        onClick={() => handleVerifyClaim(selectedClaim.id, "rejected")}
                        className="flex-1 h-10 border border-red-500/60 hover:bg-red-500/10 text-red-500 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={12} />
                        Decline Claim
                      </button>
                      
                      <button 
                        onClick={() => handleVerifyClaim(selectedClaim.id, "approved")}
                        className="flex-1 h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                      >
                        <CheckCircle2 size={12} />
                        Approve Credit
                      </button>
                    </div>
                  ) : (
                    <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[10px] text-txt-sub">
                      This activity point application has been completed ({selectedClaim.status}).
                    </div>
                  )}

                </div>
              ) : (
                <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted animate-fade-in">
                  <FolderLock size={18} className="mb-2 text-txt-muted/80" />
                  <span className="text-[10px] font-mono uppercase tracking-wider">Audit Queue Empty</span>
                  <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a student credit claim from the pending list to audit codebase references and verify credits.</p>
                </div>
              )
            ) : verifSubTab === "handles" ? (
              selectedHandleRequest ? (
                <div className="flex flex-col gap-6 animate-fade-in text-left">
                  {/* Student Details */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Student details</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-txt-main font-semibold">{selectedHandleRequest.studentName}</span>
                      <span className="text-xs text-txt-muted font-mono">{selectedHandleRequest.studentEmail}</span>
                    </div>
                  </div>

                  {/* Handle Request Materials */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Verification parameters</span>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Platform</span>
                      <span className="text-xs text-txt-main font-semibold font-mono">{selectedHandleRequest.platform}</span>
                    </div>

                    <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Handle / Username</span>
                      <span className="text-xs text-accent-main font-bold font-mono">@{selectedHandleRequest.handle}</span>
                    </div>

                    <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Request Type</span>
                      <span className="text-xs text-txt-main font-semibold font-mono">
                        {selectedHandleRequest.requestType === "handle_switch" ? "Handle Switch (Change of Username)" : "New Handle Setup"}
                      </span>
                    </div>

                    {selectedHandleRequest.oldHandle && (
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                        <span className="text-[10px] text-txt-sub font-mono uppercase font-bold">Unverifies Previous Handle</span>
                        <span className="text-xs text-red-400 font-mono">@{selectedHandleRequest.oldHandle}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Reason / Coordinator Notes</span>
                      <p className="text-[11px] text-txt-main font-light leading-relaxed italic bg-bg-base/40 p-2 border border-border-main/55 rounded mt-0.5">
                        &ldquo;{selectedHandleRequest.reason}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* AI Deduplication & Live Scraper Sentinel Card */}
                  <div className="border border-border-main/70 bg-bg-surface p-4 rounded-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-accent-main" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                          AI Deduplication Sentinel
                        </span>
                      </div>
                      {handleAuditLoading ? (
                        <span className="text-[9px] font-mono text-txt-muted animate-pulse">Running live probe...</span>
                      ) : handleAuditResult ? (
                        <span className={`text-[8.5px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${
                          handleAuditResult.verdict === "SAFE"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : handleAuditResult.verdict === "CONFLICT"
                            ? "bg-red-500/10 text-red-500 border-red-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        }`}>
                          {handleAuditResult.verdict === "SAFE" ? "Verified Safe to Approve" : handleAuditResult.verdict === "CONFLICT" ? "Conflict Detected" : "Attention Required"}
                        </span>
                      ) : null}
                    </div>

                    {handleAuditLoading ? (
                      <div className="h-14 flex items-center justify-center font-mono text-[10px] text-txt-muted animate-pulse">
                        Probing platform & checking student duplicates...
                      </div>
                    ) : handleAuditResult ? (
                      <div className="flex flex-col gap-2.5">
                        {/* Live Platform Stats Preview */}
                        {handleAuditResult.liveStats && (
                          <div className="grid grid-cols-3 gap-2 bg-bg-card/40 p-2 rounded border border-border-main/40 text-center font-mono">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-txt-muted uppercase">Total Solved</span>
                              <span className="text-xs font-bold text-accent-main">{handleAuditResult.liveStats.solved ?? 0}</span>
                            </div>
                            <div className="flex flex-col border-x border-border-main/30 px-1">
                              <span className="text-[8px] text-txt-muted uppercase">Contest Rating</span>
                              <span className="text-xs font-bold text-txt-main">
                                {handleAuditResult.liveStats.rating ? Math.round(handleAuditResult.liveStats.rating) : "Unrated"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-txt-muted uppercase">Active Status</span>
                              <span className={`text-[10px] font-bold ${handleAuditResult.liveStats.active ? "text-emerald-400" : "text-amber-400"}`}>
                                {handleAuditResult.liveStats.active ? "Active" : "Quiet"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Audit Message */}
                        <p className={`text-[11px] leading-relaxed p-2.5 rounded border font-sans ${
                          handleAuditResult.verdict === "SAFE"
                            ? "bg-emerald-500/5 text-emerald-300 border-emerald-500/20"
                            : handleAuditResult.verdict === "CONFLICT"
                            ? "bg-red-500/10 text-red-300 border-red-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}>
                          {handleAuditResult.message || handleAuditResult.summary}
                        </p>

                        {handleAuditResult.conflictDetails && (
                          <div className="text-[10px] font-mono bg-red-500/10 border border-red-500/20 p-2 rounded text-red-200">
                            <strong>Conflicting Student:</strong> {handleAuditResult.conflictDetails.studentName} ({handleAuditResult.conflictDetails.maskedRollNumber}) • {handleAuditResult.conflictDetails.department}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  {selectedHandleRequest.status === "pending" ? (
                    <div className="flex gap-3 border-t border-border-main/40 pt-4">
                      <button 
                        onClick={() => handleVerifyHandle(selectedHandleRequest.id, selectedHandleRequest.studentId, selectedHandleRequest.platform, selectedHandleRequest.handle, "rejected")}
                        className="flex-1 h-10 border border-red-500/60 hover:bg-red-500/10 text-red-500 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={12} />
                        Decline Handle
                      </button>
                      
                      <button 
                        onClick={() => handleVerifyHandle(selectedHandleRequest.id, selectedHandleRequest.studentId, selectedHandleRequest.platform, selectedHandleRequest.handle, "approved")}
                        className="flex-1 h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                      >
                        <CheckCircle2 size={12} />
                        Verify Handle
                      </button>
                    </div>
                  ) : (
                    <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[10px] text-txt-sub">
                      This handle verification has been completed ({selectedHandleRequest.status}).
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted animate-fade-in">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Verification Queue Empty</span>
                  <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a handle verification request from the pending list to audit owner credentials.</p>
                </div>
              )
            ) : verifSubTab === "links" ? (
              selectedLinkRequest ? (
                <div className="flex flex-col gap-6 animate-fade-in text-left">
                  {/* Student Details */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Student details</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-txt-main font-semibold">{selectedLinkRequest.studentName}</span>
                      <span className="text-xs text-txt-muted font-mono">{selectedLinkRequest.studentEmail}</span>
                    </div>
                  </div>

                  {/* Linking Request Parameters */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Linking parameters</span>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Enrollment Type</span>
                      <span className="text-xs text-txt-main font-semibold font-mono">
                        {selectedLinkRequest.type === "college" ? "College Registrar Link" : "Employer Corporate Link"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Verification Access Key</span>
                      <span className="text-xs text-accent-main font-bold font-mono">{selectedLinkRequest.key}</span>
                    </div>

                    {selectedLinkRequest.batchCode && (
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                        <span className="text-[10px] text-txt-sub font-mono uppercase">Batch / Class / Department</span>
                        <span className="text-xs text-txt-main font-mono">{selectedLinkRequest.batchCode}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Status History</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-mono tracking-wider border px-1.5 py-0.2 rounded uppercase font-bold ${
                          selectedLinkRequest.previouslyUnlinked
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                            : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                        }`}>
                          {selectedLinkRequest.previouslyUnlinked ? "Unlinked & Requesting Re-link" : "First Time Link Request"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedLinkRequest.status === "pending" ? (
                    <div className="flex gap-3 border-t border-border-main/40 pt-4">
                      <button 
                        onClick={() => handleVerifyLinkRequest(selectedLinkRequest.id, "rejected")}
                        className="flex-1 h-10 border border-red-500/60 hover:bg-red-500/10 text-red-500 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={12} />
                        Decline Link
                      </button>
                      
                      <button 
                        onClick={() => handleVerifyLinkRequest(selectedLinkRequest.id, "approved")}
                        className="flex-1 h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                      >
                        <CheckCircle2 size={12} />
                        Approve Link
                      </button>
                    </div>
                  ) : (
                    <div className="border border-border-main/60 p-4 rounded bg-bg-card/40 text-center font-mono text-[10px] text-txt-sub">
                      This institutional link verification has been completed ({selectedLinkRequest.status}).
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted animate-fade-in">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Verification Queue Empty</span>
                  <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a linking request from the list to audit student details and approve enrollment.</p>
                </div>
              )
            ) : (
              /* Works Review Inspector */
              selectedWorkReview ? (
                <div className="flex flex-col gap-6 animate-fade-in text-left">
                  {/* Student Details */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Creator profile</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-txt-main font-semibold">{selectedWorkReview.student_name || "Student"}</span>
                      {selectedWorkReview.student_email && (
                        <span className="text-xs text-txt-muted font-mono">{selectedWorkReview.student_email}</span>
                      )}
                      {selectedWorkReview.student_department && (
                        <span className="text-[10px] text-txt-sub font-mono mt-0.5">
                          {selectedWorkReview.student_department} • Class of {selectedWorkReview.student_academic_year || "2026"}
                          {selectedWorkReview.student_roll_number ? ` • Roll: ${selectedWorkReview.student_roll_number}` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Work Material & Claims */}
                  <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Submission Details</span>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Title & Category</span>
                      <span className="text-sm text-txt-main font-semibold">{selectedWorkReview.title}</span>
                      <span className="text-[10px] text-accent-main font-mono uppercase font-bold">{selectedWorkReview.category}</span>
                    </div>

                    {selectedWorkReview.description && (
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                        <span className="text-[10px] text-txt-sub font-mono uppercase">Description</span>
                        <p className="text-xs text-txt-main font-light leading-relaxed bg-bg-base/40 p-2.5 rounded border border-border-main/40">
                          {selectedWorkReview.description}
                        </p>
                      </div>
                    )}

                    {selectedWorkReview.external_url && (
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-border-main/30">
                        <span className="text-[10px] text-txt-sub font-mono uppercase">External Resource</span>
                        <a
                          href={selectedWorkReview.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-main font-mono underline break-all flex items-center gap-1 hover:opacity-80"
                        >
                          <ExternalLink size={12} />
                          {selectedWorkReview.external_url}
                        </a>
                      </div>
                    )}

                    {/* AI Audit Verdict if available */}
                    {selectedWorkReview.ai_verdict && (
                      <div className="border border-border-main/70 bg-bg-base/60 p-3 rounded flex flex-col gap-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold flex items-center gap-1">
                            <Sparkles size={11} />
                            AI Audit Verdict
                          </span>
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border ${
                            selectedWorkReview.ai_verdict.verdict === "verified"
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                              : "bg-amber-500/10 border-amber-500/40 text-amber-500"
                          }`}>
                            {selectedWorkReview.ai_verdict.verdict || "uncertain"}
                          </span>
                        </div>
                        {selectedWorkReview.ai_verdict.reason && (
                          <p className="text-[10px] text-txt-sub font-light italic">
                            &ldquo;{selectedWorkReview.ai_verdict.reason}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review Note Input */}
                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-border-main/30">
                      <span className="text-[10px] text-txt-sub font-mono uppercase">Review Feedback Note (Optional)</span>
                      <textarea
                        value={reviewActionNote}
                        onChange={(e) => setReviewActionNote(e.target.value)}
                        placeholder="Provide feedback or reason for approval / rejection..."
                        rows={2}
                        className="w-full p-2 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 border-t border-border-main/40 pt-4">
                    <button
                      type="button"
                      onClick={() => handleReviewWork(selectedWorkReview.id, "rejected")}
                      disabled={reviewActionLoading}
                      className="flex-1 h-10 border border-red-500/60 hover:bg-red-500/10 text-red-500 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={12} />
                      Decline Work
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewWork(selectedWorkReview.id, "approved")}
                      disabled={reviewActionLoading}
                      className="flex-1 h-10 bg-accent-main hover:opacity-90 text-bg-base text-xs font-mono uppercase tracking-wider rounded-sm transition-opacity cursor-pointer flex items-center justify-center gap-1.5 font-bold disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} />
                      Approve &amp; Publish
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted animate-fade-in">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Works Review Queue Empty</span>
                  <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a student creative work from the pending list to audit materials and approve publication.</p>
                </div>
              )
            )
          )}

          {activeTab === "talent_registry" && (
            selectedStudent ? (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* Student Identity */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Claimant Details</span>
                    {selectedStudent.authorized ? (
                      <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/40 px-2 py-0.5 rounded uppercase">
                        Access Authorized
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/40 px-2 py-0.5 rounded uppercase">
                        Access Revoked
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-txt-main font-semibold">{selectedStudent.name}</span>
                    <span className="text-xs text-txt-muted font-mono">{selectedStudent.email}</span>
                    <span className="text-[10px] text-txt-sub mt-1">Roll: {selectedStudent.rollNo} • {selectedStudent.department} • {selectedStudent.batchCode} (Class of {selectedStudent.gradYear})</span>
                  </div>
                </div>

                {/* LeetCode Sync */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">LeetCode Metrics</span>
                    <span className="text-[9px] font-mono text-accent-main font-bold">
                      @{selectedStudent.leetcode}
                      {isHandleVerified(selectedStudent.id, "LeetCode") ? (
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified</span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">Solved</span>
                      <span className="text-xs font-semibold text-txt-main font-mono">{selectedStudent.leetcodeSolved}</span>
                    </div>
                    <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">Global Rank</span>
                      <span className="text-[9px] font-semibold text-txt-main font-mono truncate">{selectedStudent.leetcodeRank}</span>
                    </div>
                    <div className="bg-bg-base/30 p-2 border border-border-main/50 rounded flex flex-col">
                      <span className="text-[8px] font-mono text-txt-muted uppercase">Easy/Med/Hard</span>
                      <span className="text-[9px] text-txt-sub font-mono font-semibold">
                        {selectedStudent.leetcodeEasy}/{selectedStudent.leetcodeMedium}/{selectedStudent.leetcodeHard}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Codeforces & CodeChef */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Competitive Rating</span>
                  
                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2">
                    <span className="text-xs font-semibold text-txt-main">Codeforces Profile</span>
                    <span className="text-[10px] text-txt-sub font-mono">
                      @{selectedStudent.codeforces} ({selectedStudent.codeforcesRank})
                      {isHandleVerified(selectedStudent.id, "Codeforces") ? (
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-txt-main">
                    <span className="text-txt-sub">Current Rating</span>
                    <span className="font-mono font-bold text-accent-main">{selectedStudent.codeforcesRating}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-main/40 pb-2 mt-2">
                    <span className="text-xs font-semibold text-txt-main">CodeChef Profile</span>
                    <span className="text-[10px] text-txt-sub font-mono">
                      @{selectedStudent.codechef} ({selectedStudent.codechefStars})
                      {isHandleVerified(selectedStudent.id, "CodeChef") ? (
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Hackathons */}
                <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Hackathon Standings</span>
                  <div className="flex justify-between items-center text-xs text-txt-main">
                    <span className="text-txt-sub">Unstop Handle</span>
                    <span className="font-mono">
                      @{selectedStudent.unstop}
                      {isHandleVerified(selectedStudent.id, "Unstop") ? (
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-txt-main mt-1">
                    <span className="text-txt-sub">Completed Hackathons</span>
                    <span className="font-mono font-bold text-accent-main">{selectedStudent.hackathons} events</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-44 border border-border-main/80 border-dashed rounded-sm flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                <Users size={18} className="mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-wider">No Student Selected</span>
                <p className="text-[10px] font-light leading-relaxed max-w-xs mt-1">Select a student from the registry list to audit their complete coding and hackathon performance profile.</p>
              </div>
            )
          )}

          {activeTab === "overview" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Console Activity Ledger</span>
                <p className="text-[10px] text-txt-sub leading-relaxed font-light">Real-time interactions across the faculty dashboard session log.</p>
              </div>

              {/* Logs list */}
              <div className="border border-border-main/70 bg-bg-surface rounded-sm flex flex-col h-[320px] overflow-y-auto divide-y divide-border-main/40">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex flex-col gap-1 text-xs">
                    <span className="font-mono text-[9px] text-txt-muted">{log.time}</span>
                    <p className="text-txt-main font-mono text-[10px] leading-relaxed break-all">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "broadcasts" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Scheduled Notifications Queue */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">Scheduled Alerts queue</span>
                <div className="flex flex-col divide-y divide-border-main/40 max-h-48 overflow-y-auto">
                  {scheduledBroadcasts.length === 0 ? (
                    <span className="text-[10px] text-txt-muted italic font-mono py-2">No scheduled alerts queued.</span>
                  ) : (
                    scheduledBroadcasts.map((sch) => (
                      <div key={sch.id} className="py-2.5 flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-txt-main font-semibold">{sch.title}</span>
                          <span className="text-[9px] text-txt-muted font-mono">{sch.date} at {sch.time} • Target: {sch.target.toUpperCase()}</span>
                        </div>
                        <button
                          onClick={() => handleCancelScheduled(sch.id)}
                          className="text-[9px] font-mono text-red-500 hover:underline uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recently Broadcasted list */}
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Recently Dispatched Alerts</span>
                <div className="flex flex-col divide-y divide-border-main/40 max-h-60 overflow-y-auto text-[10.5px]">
                  {auditLogs.filter(log => log.msg.includes("Broadcast Alert sent") || log.msg.includes("Direct Nudge sent")).length === 0 ? (
                    <span className="text-[10px] text-txt-muted italic font-mono py-2">No announcements sent in this session.</span>
                  ) : (
                    auditLogs
                      .filter(log => log.msg.includes("Broadcast Alert sent") || log.msg.includes("Direct Nudge sent"))
                      .map((log) => (
                        <div key={log.id} className="py-2 flex flex-col gap-0.5">
                          <span className="font-mono text-[8.5px] text-txt-muted">{log.time}</span>
                          <p className="text-txt-main font-light leading-relaxed">{log.msg}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "staff_access" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="border border-border-main/70 bg-bg-surface p-5 rounded-sm flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold font-semibold">Live Activity Ledger</span>
                <p className="text-[10px] text-txt-sub leading-relaxed font-light">Interactions across the faculty console are stamped below with unique keys for compliance tracking.</p>
              </div>

              {/* Logs list */}
              <div className="border border-border-main/70 bg-bg-surface rounded-sm flex flex-col h-[400px] overflow-y-auto divide-y divide-border-main/40">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex flex-col gap-1 text-xs">
                    <span className="font-mono text-[9px] text-txt-muted">{log.time}</span>
                    <p className="text-txt-main font-mono text-[10px] leading-relaxed break-all">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Targeted Nudge Modal */}
      {nudgeStudent && (
        <div className="fixed inset-0 z-[14900] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNudgeStudent(null)} />
          <div className="relative w-full max-w-md border border-border-main bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-4 z-10 animate-fade-in text-left">
            <div className="flex flex-col gap-1.5 border-b border-border-main/45 pb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Targeted Student Nudge</span>
              <h3 className="text-sm font-semibold text-txt-main">Direct Alert to {nudgeStudent.name}</h3>
              <p className="text-[10px] text-txt-muted">{nudgeStudent.email} • {nudgeStudent.department}</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono uppercase text-txt-muted">Nudge Message Alert Text</label>
              <textarea
                rows={4}
                value={nudgeMessage}
                onChange={(e) => setNudgeMessage(e.target.value)}
                placeholder="Type the warning or notice..."
                className="p-3 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50 resize-none font-light leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setNudgeStudent(null)}
                className="px-4 py-2 border border-border-main hover:bg-bg-card text-txt-main rounded-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={!nudgeMessage.trim()}
                className="px-4 py-2 bg-accent-main text-bg-base font-bold rounded-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Dispatch Nudge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Certificate Auditor Modal */}
      {aiVerifyResult && (
        <div className="fixed inset-0 z-[14900] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAiVerifyResult(null)} />
          <div className="relative w-full max-w-md border border-border-main bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-4 z-10 animate-fade-in text-left">
            <div className="flex flex-col gap-1.5 border-b border-border-main/45 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Gemini Multimodal Auditor Verdict</span>
                <span className={`text-[8px] font-mono tracking-wider border px-2 py-0.5 rounded uppercase ${
                  aiVerifyResult.status === "Verified"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                    : "bg-red-500/10 border-red-500/40 text-red-500 animate-pulse"
                }`}>
                  {aiVerifyResult.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-txt-main">Certificate Verification Analysis</h3>
              <p className="text-[10px] text-txt-muted font-light leading-relaxed">Confidence Score: <strong className="text-txt-main font-bold">{aiVerifyResult.confidence}%</strong></p>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[10.5px]">
              <div className="flex justify-between items-center bg-bg-base/30 p-2.5 border border-border-main/50 rounded">
                <span className="text-txt-sub">Student Name Matches Recipient?</span>
                <span className={aiVerifyResult.recipientMatch ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
                  {aiVerifyResult.recipientMatch ? "✓ MATCHED" : "✗ MISMATCH"}
                </span>
              </div>

              <div className="flex justify-between items-center bg-bg-base/30 p-2.5 border border-border-main/50 rounded">
                <span className="text-txt-sub">Event Details Matches Claim?</span>
                <span className={aiVerifyResult.eventMatch ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>
                  {aiVerifyResult.eventMatch ? "✓ MATCHED" : "✗ MISMATCH"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 bg-bg-base/30 p-3 border border-border-main/50 rounded font-sans text-xs font-light leading-relaxed">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">AI Analysis Notes</span>
                <p className="text-txt-main">{aiVerifyResult.aiNotes}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider pt-2">
              <button
                type="button"
                onClick={() => setAiVerifyResult(null)}
                className="px-5 py-2 bg-accent-main text-bg-base font-bold rounded-sm transition-colors cursor-pointer"
              >
                Acknowledge Verdict
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Themed Alert & Confirmation Modal */}
      {modalMessage?.isOpen && (
        <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setModalMessage(null)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-sm border border-border-main/80 bg-bg-surface p-6 rounded-md shadow-2xl animate-fade-in flex flex-col gap-5 z-10">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Faculty Console Notification</span>
              <h3 className="text-sm font-semibold text-txt-main">{modalMessage.title}</h3>
              <p className="text-xs text-txt-muted font-light leading-relaxed">
                {modalMessage.text}
              </p>
            </div>
            
            <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider">
              {modalMessage.onConfirm ? (
                <>
                  <button
                    onClick={() => setModalMessage(null)}
                    className="px-4 py-2 border border-border-main hover:bg-bg-card text-txt-main rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalMessage.onConfirm) modalMessage.onConfirm();
                      setModalMessage(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalMessage(null)}
                  className="px-4 py-2 bg-accent-main text-bg-base font-bold rounded-sm transition-colors cursor-pointer"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CoordinatorConsole() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Loading Console...</span>
      </div>
    }>
      <CoordinatorConsoleContent />
    </Suspense>
  );
}
