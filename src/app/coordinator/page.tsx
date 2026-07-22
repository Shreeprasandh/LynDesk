"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Sparkles
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
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<CreditClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<CreditClaim | null>(null);
  const [isCompanyRecruiter, setIsCompanyRecruiter] = useState(false);
  
  // Handle verifications states
  const [verifSubTab, setVerifSubTab] = useState<"credits" | "handles" | "links">("credits");
  const [handleRequests, setHandleRequests] = useState<any[]>([]);
  const [selectedHandleRequest, setSelectedHandleRequest] = useState<any | null>(null);
  const [linkRequests, setLinkRequests] = useState<any[]>([]);
  const [selectedLinkRequest, setSelectedLinkRequest] = useState<any | null>(null);

  // Recruiter PINs & Opportunities States
  const [recruiterPins, setRecruiterPins] = useState<any[]>([]);
  const [newCompanyRecruiter, setNewCompanyRecruiter] = useState("");
  const [oppSubTab, setOppSubTab] = useState<"broadcasts" | "opportunities">("broadcasts");
  const [opportunities, setOpportunities] = useState<any[]>([]);

  // Create Opp form states
  const [newOppTitle, setNewOppTitle] = useState("");
  const [newOppCategory, setNewOppCategory] = useState("hackathon");
  const [newOppLocation, setNewOppLocation] = useState("online");
  const [newOppLevel, setNewOppLevel] = useState("local");
  const [newOppDeadline, setNewOppDeadline] = useState("");
  const [newOppUrl, setNewOppUrl] = useState("");
  const [newOppDesc, setNewOppDesc] = useState("");

  // Seed and load recruiter PINs & opportunities
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadPins = () => {
        const stored = localStorage.getItem("ldk_recruiter_pins");
        if (stored) {
          setRecruiterPins(JSON.parse(stored));
        } else {
          const defaultPins = [
            { id: "pin_1", company: "Google India", pin: "847291", date: "Oct 14" },
            { id: "pin_2", company: "Microsoft", pin: "301984", date: "Oct 14" }
          ];
          setRecruiterPins(defaultPins);
          localStorage.setItem("ldk_recruiter_pins", JSON.stringify(defaultPins));
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

  const [activeTab, setActiveTab] = useState<"overview" | "talent_registry" | "broadcasts" | "verifications" | "staff_access">("overview");

  // Sync activeTab with search parameter updates (client component useSearchParams hook, // await searchParams)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "talent_registry", "broadcasts", "verifications", "staff_access"].includes(tabParam)) {
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
          const defaultScheduled = [
            { id: "sch-1", title: "Upcoming Coding Contest", message: "CodeChef Starters 148 is scheduled for next Friday. Make sure to participate!", type: "system", target: "all", date: "2026-07-24", time: "12:00" }
          ];
          setScheduledBroadcasts(defaultScheduled);
          localStorage.setItem("ldk_scheduled_notifications", JSON.stringify(defaultScheduled));
        }
      }, 0);
    }
  }, []);

  // Load handle verification requests from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ldk_handle_verifications");
      setTimeout(() => {
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
      }, 0);
    }
  }, []);

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
      if (action === "approved") {
        let columnName = "";
        const lowerPlat = platform.toLowerCase();
        if (lowerPlat.includes("leetcode")) columnName = "leetcode_verified";
        else if (lowerPlat.includes("codeforces")) columnName = "codeforces_verified";
        else if (lowerPlat.includes("codechef")) columnName = "codechef_verified";
        else if (lowerPlat.includes("unstop")) columnName = "unstop_verified";
        else if (lowerPlat.includes("hack2skill")) columnName = "hack2skill_verified";

        if (columnName) {
          await supabase
            .from("profiles")
            .update({ [columnName]: true })
            .eq("id", studentId);
        }

        const stored = localStorage.getItem("ldk_global_notifications");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({
          id: generateNotificationId(),
          title: "Handle Verified ✓",
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
        title: action === "approved" ? "College Link Approved ✓" : "College Link Declined ✗",
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

  const pendingCount = claims.filter(c => c.status === "pending").length;
  const approvedPoints = claims.filter(c => c.status === "approved").reduce((sum, c) => sum + c.points, 0);

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main split grid */}
       <main className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* ================= LEFT CONSOLE: APPLICATION LIST (7 Columns) ================= */}
        <section className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-border-main/50 flex flex-col h-auto lg:h-full bg-bg-base overflow-hidden p-6 gap-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
          >
            <ArrowLeft size={12} />
            Back to Portal
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border-main/40 pb-4 gap-4">
            <div className="flex flex-col gap-1 text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                {isCompanyRecruiter ? "Recruiter Desk" : "Registrar Desk"}
              </span>
              <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">
                {activeTab === "overview"
                  ? (isCompanyRecruiter ? "Recruiter Insights Dashboard" : "Coordinator Performance Dashboard")
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
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Pending Verification</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Clock size={14} className="text-txt-muted" />
                {pendingCount}
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Awarded Credits</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Award size={14} className="text-txt-main" />
                {approvedPoints} Pts
              </span>
            </div>
            <div className="border border-border-main/60 bg-bg-surface p-4 rounded-sm flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-txt-muted">Registered Students</span>
              <span className="text-xl font-display font-light text-txt-main flex items-center gap-1.5">
                <Users size={14} className="text-txt-muted" />
                {claims.length} Active
              </span>
            </div>
          </div>

          {/* Active Tab contents */}
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
                  <div className="text-[10px] text-red-500 font-mono mt-1 border border-red-500/30 bg-red-500/5 p-2.5 rounded-sm">
                    ⚠️ {aiError}
                  </div>
                )}
                
                {/* AI Query Result Output */}
                {aiResult && (
                  <div className="border border-border-main bg-bg-base/40 p-4 rounded-sm flex flex-col gap-3 mt-1 animate-fade-in">
                    {/* Clarification Prompts check */}
                    {aiResult.clarificationNeeded ? (
                      <div className="flex flex-col gap-2 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded text-[11px] font-mono text-yellow-500">
                        <span className="font-bold">🤔 Clarification Request:</span>
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
                  onClick={() => setOppSubTab("opportunities")}
                  className={`pb-1 border-b-2 transition-all cursor-pointer ${
                    oppSubTab === "opportunities" ? "border-accent-main text-accent-main font-bold" : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Manage Opportunities & News
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
                              {opp.facultyRecommended ? "Recommended ★" : "Recommend"}
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
              <div className="flex border-b border-border-main/40 pb-2 gap-3 text-[10px] uppercase font-mono tracking-wider font-semibold">
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
                ) : (
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
        <section className="lg:col-span-4 bg-bg-surface/30 flex flex-col h-auto lg:h-full overflow-y-auto p-6 gap-6">
          
          <div className="flex flex-col gap-0.5 border-b border-border-main/40 pb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
              {activeTab === "overview"
                ? "Live Auditor"
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
                : activeTab === "talent_registry"
                ? (isCompanyRecruiter ? "Candidate Dossier" : "Talent Dossier")
                : activeTab === "broadcasts"
                ? (isCompanyRecruiter ? "Job Listings Queue" : "Announcement Queue")
                : activeTab === "verifications"
                ? (verifSubTab === "links" ? "Enrollment Auditor" : (isCompanyRecruiter ? "Resume Inspector" : "Portfolio Inspector"))
                : "Console Session Log"}
            </h2>
          </div>

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
            ) : (
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
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified ✓</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified ⚠️</span>
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
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified ✓</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified ⚠️</span>
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
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified ✓</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified ⚠️</span>
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
                        <span className="text-[7.5px] text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/25 ml-1.5 uppercase font-normal">Verified ✓</span>
                      ) : (
                        <span className="text-[7.5px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/25 ml-1.5 uppercase font-normal animate-pulse">Unverified ⚠️</span>
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
