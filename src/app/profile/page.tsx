"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { extractAvatarFromUser } from "../lib/avatar";
import { normalizeTitleCase, getSpellingSuggestion, normalizeSkillsList, getAutocompleteSuggestions } from "../lib/textNormalization";
import { validatePassword } from "../lib/passwordValidation";
import { isHarassmentOrOffensive } from "../lib/moderation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AvatarCropModal from "../components/AvatarCropModal";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Unlink, 
  User, 
  FileText, 
  Award,
  Globe,
  Upload,
  Info,
  Trash2,
  X,
  Code2,
  Sparkles,
  MapPin
} from "lucide-react";

// Local Custom Icons for missing/problematic lucide ones
const DiscordIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 127.14 96.36" width={size} height={size} fill="currentColor" className={className}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73.08,0c.83.71,1.69,1.4,2.59,2a68.61,68.61,0,0,1-10.5,5,77.45,77.45,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129.24,49.07,122.86,26.32,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const GithubIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface BackupProfileData {
  fullName: string;
  username: string;
  bio: string;
  location?: string;
  skills: string;
  githubUrl: string;
  linkedinUrl: string;
  discordUsername: string;
  collegeName: string;
  department: string;
  gradYear: string;
  isPublic: boolean;
  portfolioUrl: string;
  collegeKey: string;
  batchCode: string;
  grantSharePermission: boolean;
  rollNumber?: string;
  academicYear?: string;
  section?: string;
  placementConsent?: boolean;
  instituteId?: string;
}

export function extractPlatformHandle(input: string, platform: string): { handle: string; error?: string } {
  const raw = (input || "").trim();
  if (!raw) return { handle: "" };

  const clean = raw.startsWith("@") ? raw.slice(1).trim() : raw;

  if (clean.includes("/") || clean.includes(".")) {
    try {
      const urlString = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
      const urlObj = new URL(urlString);
      const host = urlObj?.hostname ? urlObj.hostname.toLowerCase() : "";
      const pathSegments = urlObj?.pathname ? urlObj.pathname.split("/").filter(Boolean) : [];

      if (platform === "LeetCode") {
        if (!host.includes("leetcode")) {
          return { handle: "", error: "Invalid LeetCode URL. Must be a leetcode.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "u" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && pathSegments[0] !== "u" && pathSegments[0] !== "problems" && pathSegments[0] !== "contest") {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract LeetCode username from URL." };
        }
        return { handle: username };
      }

      if (platform === "Codeforces") {
        if (!host.includes("codeforces")) {
          return { handle: "", error: "Invalid Codeforces URL. Must be a codeforces.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "profile" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && pathSegments[0] !== "profile") {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract Codeforces username from URL." };
        }
        return { handle: username };
      }

      if (platform === "CodeChef") {
        if (!host.includes("codechef")) {
          return { handle: "", error: "Invalid CodeChef URL. Must be a codechef.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "users" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && pathSegments[0] !== "users") {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract CodeChef username from URL." };
        }
        return { handle: username };
      }

      if (platform === "HackerRank") {
        if (!host.includes("hackerrank")) {
          return { handle: "", error: "Invalid HackerRank URL. Must be a hackerrank.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "profile" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0]) {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract HackerRank username from URL." };
        }
        return { handle: username };
      }

      if (platform === "GeeksforGeeks" || platform === "GFG") {
        if (!host.includes("geeksforgeeks")) {
          return { handle: "", error: "Invalid GeeksforGeeks URL. Must be a geeksforgeeks.org profile link." };
        }
        let username = "";
        if (pathSegments[0] === "user" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && pathSegments[0] !== "user" && pathSegments[0] !== "practice") {
          username = pathSegments[0];
        } else if (pathSegments[pathSegments.length - 1]) {
          username = pathSegments[pathSegments.length - 1];
        }
        if (!username) {
          return { handle: "", error: "Could not extract GeeksforGeeks username from URL." };
        }
        return { handle: username };
      }

      if (platform === "Unstop") {
        if (!host.includes("unstop")) {
          return { handle: "", error: "Invalid Unstop URL. Must be an unstop.com profile link." };
        }
        let username = pathSegments[pathSegments.length - 1] || "";
        if (pathSegments[0] === "user" || pathSegments[0] === "u") {
          username = pathSegments[1] || username;
        }
        if (!username) {
          return { handle: "", error: "Could not extract Unstop username from URL." };
        }
        return { handle: username };
      }

      if (platform === "Devpost") {
        if (!host.includes("devpost")) {
          return { handle: "", error: "Invalid Devpost URL. Must be a devpost.com profile link." };
        }
        let username = pathSegments[pathSegments.length - 1] || "";
        if (pathSegments[0] === "user" || pathSegments[0] === "u") {
          username = pathSegments[1] || username;
        }
        if (!username) {
          return { handle: "", error: "Could not extract Devpost username from URL." };
        }
        return { handle: username };
      }
    } catch {
      return { handle: "", error: `Invalid ${platform} profile URL format.` };
    }
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return { handle: "", error: `Invalid ${platform} handle format. Handle contains invalid characters.` };
  }

  return { handle: clean };
}

export function normalizeSocialUrl(input: string, platform: "github" | "linkedin" | "discord" | "portfolio"): { url: string; error?: string } {
  const raw = (input || "").trim();
  if (!raw) return { url: "" };

  if (platform === "github") {
    const clean = raw.startsWith("@") ? raw.slice(1).trim() : raw;
    if (clean.includes("/") || clean.includes(".")) {
      try {
        const urlString = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
        const urlObj = new URL(urlString);
        const host = urlObj?.hostname ? urlObj.hostname.toLowerCase() : "";
        if (!host.includes("github")) {
          return { url: "", error: "Invalid GitHub URL. Must be a github.com profile link." };
        }
        const user = urlObj.pathname.split("/").filter(Boolean)[0];
        if (!user) return { url: "", error: "Could not extract GitHub username from URL." };
        return { url: `https://github.com/${user}` };
      } catch {
        return { url: "", error: "Invalid GitHub profile URL format." };
      }
    }
    if (!/^[a-zA-Z0-9-._]+$/.test(clean)) {
      return { url: "", error: "Invalid GitHub handle format." };
    }
    return { url: `https://github.com/${clean}` };
  }

  if (platform === "linkedin") {
    const clean = raw.startsWith("@") ? raw.slice(1).trim() : raw;
    if (clean.includes("/") || clean.includes(".")) {
      try {
        const urlString = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
        const urlObj = new URL(urlString);
        const host = urlObj?.hostname ? urlObj.hostname.toLowerCase() : "";
        if (!host.includes("linkedin")) {
          return { url: "", error: "Invalid LinkedIn URL. Must be a linkedin.com profile link." };
        }
        const segments = urlObj.pathname.split("/").filter(Boolean);
        const user = segments[segments.length - 1] || "";
        if (!user) return { url: "", error: "Could not extract LinkedIn username from URL." };
        return { url: `https://linkedin.com/in/${user}` };
      } catch {
        return { url: "", error: "Invalid LinkedIn profile URL format." };
      }
    }
    if (!/^[a-zA-Z0-9-._]+$/.test(clean)) {
      return { url: "", error: "Invalid LinkedIn handle format." };
    }
    return { url: `https://linkedin.com/in/${clean}` };
  }

  if (platform === "discord") {
    const clean = raw.startsWith("@") ? raw.slice(1).trim() : raw;
    if (clean.includes("/") || clean.includes(".")) {
      try {
        const urlString = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
        const url = new URL(urlString);
        const segments = url.pathname.split("/").filter(Boolean);
        const user = segments[segments.length - 1] || "";
        return { url: user || clean };
      } catch {
        return { url: clean };
      }
    }
    return { url: clean };
  }

  if (platform === "portfolio") {
    if (!/^https?:\/\//i.test(raw)) {
      const formatted = `https://${raw}`;
      try {
        new URL(formatted);
        return { url: formatted };
      } catch {
        return { url: "", error: "Invalid Portfolio URL format." };
      }
    }
    try {
      new URL(raw);
      return { url: raw };
    } catch {
      return { url: "", error: "Invalid Portfolio URL format." };
    }
  }

  return { url: raw };
}

export default function ProfilePage() {
  const { user, loading: authLoading, requestPasswordResetOtp, updateUserPassword } = useAuth();
  const { showToast } = useToast();

  // Security & Password Management States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [securityPasswordInput, setSecurityPasswordInput] = useState("");
  const [securityConfirmPasswordInput, setSecurityConfirmPasswordInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [securityActionLoading, setSecurityActionLoading] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  const handleRequestPasswordOtp = async () => {
    if (!user?.email) return;
    setSecurityActionLoading(true);
    setSecurityError(null);
    setSecuritySuccess(null);
    try {
      const { error } = await requestPasswordResetOtp(user.email);
      if (error) throw error;
      setOtpSent(true);
      setSecuritySuccess("Verification email dispatched! Check your inbox for the reset link/code.");
    } catch (err: any) {
      setSecurityError(err?.message || "Failed to dispatch verification email.");
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const handleUpdateSecurityPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const rules = validatePassword(securityPasswordInput, securityConfirmPasswordInput);
    if (!rules.isValid) {
      if (!rules.passwordsMatch) {
        setSecurityError("Passwords do not match. Re-enter password twice.");
      } else if (!rules.hasMinLength) {
        setSecurityError("Password must be at least 8 characters long.");
      } else if (!rules.hasUppercase) {
        setSecurityError("Password must contain at least 1 uppercase letter (A-Z).");
      } else if (!rules.hasLowercase) {
        setSecurityError("Password must contain at least 1 lowercase letter (a-z).");
      } else if (!rules.hasNumber) {
        setSecurityError("Password must contain at least 1 number (0-9).");
      } else if (!rules.hasSpecialChar) {
        setSecurityError("Password must contain at least 1 special character (!@#$%^&*).");
      } else {
        setSecurityError("Please enter a strong password matching all security rules.");
      }
      return;
    }

    setSecurityActionLoading(true);
    setSecurityError(null);
    setSecuritySuccess(null);
    try {
      const { error } = await updateUserPassword(securityPasswordInput);
      if (error) throw error;
      showToast("LynDesk Password successfully updated!");
      setSecuritySuccess("Password updated! You can now log in via Email/Username + Password.");
      setSecurityPasswordInput("");
      setSecurityConfirmPasswordInput("");
      setTimeout(() => setIsPasswordModalOpen(false), 2000);
    } catch (err: any) {
      setSecurityError(err?.message || "Failed to update password.");
    } finally {
      setSecurityActionLoading(false);
    }
  };


  
  // Basic profiles table fields with 0ms SWR Cache Initialization
  const [fullName, setFullName] = useState(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const cached = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (cached) return JSON.parse(cached).full_name || "";
      } catch {}
    }
    return "";
  });
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const cached = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (cached) return JSON.parse(cached).username || "";
      } catch {}
    }
    return "";
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (typeof window !== "undefined" && user) {
      try {
        return localStorage.getItem(`ldk_user_avatar_${user.id}`) || localStorage.getItem(`ldk_avatar_url_${user.id}`) || "";
      } catch {}
    }
    return "";
  });
  const [isPublic, setIsPublic] = useState(true);
  
  // Detailed metadata fields
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  
  // Academic details
  const [collegeName, setCollegeName] = useState(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const cached = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (cached) return JSON.parse(cached).college_name || "";
      } catch {}
    }
    return "";
  });
  const [department, setDepartment] = useState(() => {
    if (typeof window !== "undefined" && user) {
      try {
        const cached = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (cached) return JSON.parse(cached).department || "";
      } catch {}
    }
    return "";
  });
  const [gradYear, setGradYear] = useState("");
  const [collegeKey, setCollegeKey] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [grantSharePermission, setGrantSharePermission] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [section, setSection] = useState("");
  const [placementConsent, setPlacementConsent] = useState(false);
  const [instituteId, setInstituteId] = useState<string | null>(null);
  const [isVerifyingCollege, setIsVerifyingCollege] = useState(false);
  const [collegeAutoResolvedInfo, setCollegeAutoResolvedInfo] = useState<{
    instituteName: string;
    department: string;
    academicYear: string;
    section: string;
    batchCode: string;
  } | null>(null);
  const [academicCredits, setAcademicCredits] = useState(0);
  
  // Coding platforms handles
  const [leetcodeUsername, setLeetcodeUsername] = useState(() => {
    if (typeof window !== "undefined" && user) {
      try {
        return localStorage.getItem(`ldk_leetcode_handle_${user.id}`) || localStorage.getItem("ldk_leetcode_handle") || "";
      } catch {}
    }
    return "";
  });
  const [codeforcesUsername, setCodeforcesUsername] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("ldk_codeforces_handle") || "";
      } catch {}
    }
    return "";
  });
  const [codechefUsername, setCodechefUsername] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("ldk_codechef_handle") || "";
      } catch {}
    }
    return "";
  });
  const [hackerrankUsername, setHackerrankUsername] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("ldk_hackerrank_handle") || "";
      } catch {}
    }
    return "";
  });
  const [geeksforgeeksUsername, setGeeksforgeeksUsername] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("ldk_geeksforgeeks_handle") || "";
      } catch {}
    }
    return "";
  });
  const [unstopUsername, setUnstopUsername] = useState("");
  const [devpostUsername, setDevpostUsername] = useState("");

  // Handle verification statuses
  const [leetcodeVerified, setLeetcodeVerified] = useState(false);
  const [codeforcesVerified, setCodeforcesVerified] = useState(false);
  const [codechefVerified, setCodechefVerified] = useState(false);
  const [hackerrankVerified, setHackerrankVerified] = useState(false);
  const [geeksforgeeksVerified, setGeeksforgeeksVerified] = useState(false);
  const [unstopVerified, setUnstopVerified] = useState(false);
  const [devpostVerified, setDevpostVerified] = useState(false);

  // Coding Platform & Social Input Errors
  const [platformInputErrors, setPlatformInputErrors] = useState<Record<string, string>>({});
  const [socialInputErrors, setSocialInputErrors] = useState<Record<string, string>>({});

  // Verification request modal states
  const [verifyPlatform, setVerifyPlatform] = useState<string | null>(null);
  const [verifyReason, setVerifyReason] = useState("");
  const [verifiedHandlesBackup, setVerifiedHandlesBackup] = useState<Record<string, string>>({});
  
  // Link status states
  const [collegeLinkedStatus, setCollegeLinkedStatus] = useState<"none" | "pending" | "linked">("none");
  
  // Interface states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoDismissTimeout = () => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
  };

  const setAutoDismissMessage = (msg: { text: string; type: "success" | "error" } | null, durationMs = 5000) => {
    clearAutoDismissTimeout();
    setMessage(msg);
    if (msg && durationMs > 0) {
      messageTimeoutRef.current = setTimeout(() => {
        setMessage(null);
        messageTimeoutRef.current = null;
      }, durationMs);
    }
  };

  useEffect(() => {
    return () => {
      clearAutoDismissTimeout();
    };
  }, []);
  
  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [linking, setLinking] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isRec, setIsRec] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const staff = !!localStorage.getItem("faculty_staff_member");
      const rec = !!localStorage.getItem("company_recruiter_member") || (user && (user.user_metadata?.role === "employee" || !!user.user_metadata?.company_key));
      queueMicrotask(() => {
        setIsStaff(staff);
        setIsRec(!!rec);
      });
    }
  }, [user]);
  
  // Suggestions
  const [collegeSuggestion, setCollegeSuggestion] = useState<string | null>(null);
  const [deptSuggestion, setDeptSuggestion] = useState<string | null>(null);

  // Autocomplete Suggestions
  const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
  const [deptSuggestions, setDeptSuggestions] = useState<string[]>([]);

  // Edit/View Mode controls
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState<BackupProfileData | null>(null);

  // Draft auto-preservation states
  const isInitialLoadRef = useRef(true);

  const handleStartEdit = () => {
    clearAutoDismissTimeout();
    setMessage(null);
    setBackupData({
      fullName,
      username,
      bio,
      location,
      skills,
      githubUrl,
      linkedinUrl,
      discordUsername,
      portfolioUrl,
      collegeName,
      department,
      gradYear,
      isPublic,
      collegeKey,
      batchCode,
      grantSharePermission
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    clearAutoDismissTimeout();
    if (backupData) {
      setFullName(backupData.fullName);
      setUsername(backupData.username);
      setBio(backupData.bio);
      setLocation(backupData.location || "");
      setSkills(backupData.skills);
      setGithubUrl(backupData.githubUrl);
      setLinkedinUrl(backupData.linkedinUrl);
      setDiscordUsername(backupData.discordUsername);
      setPortfolioUrl(backupData.portfolioUrl);
      setCollegeName(backupData.collegeName);
      setDepartment(backupData.department);
      setGradYear(backupData.gradYear);
      setIsPublic(backupData.isPublic);
      setCollegeKey(backupData.collegeKey);
      setBatchCode(backupData.batchCode);
      setGrantSharePermission(backupData.grantSharePermission);
    }
    if (typeof window !== "undefined" && user?.id) {
      localStorage.removeItem(`ldk_profile_draft_${user.id}`);
    }
    setIsEditing(false);
    setMessage(null);
  };
  
  // Profile Completeness Calculation
  const calculateCompleteness = () => {
    let score = 0;
    const missingItems: string[] = [];

    if (avatarUrl) score += 15; else missingItems.push("Upload Avatar (+15%)");
    if (fullName && fullName.trim().length > 2) score += 15; else missingItems.push("Set Full Name (+15%)");
    if (username && username.trim().length > 2) score += 10; else missingItems.push("Set Username (+10%)");
    if (collegeName && collegeName.trim().length > 2) score += 15; else missingItems.push("Select College (+15%)");
    if (department && department.trim().length > 2) score += 15; else missingItems.push("Select Department (+15%)");
    if (gradYear && gradYear.trim().length > 0) score += 10; else missingItems.push("Select Grad Year (+10%)");
    if (githubUrl || linkedinUrl || portfolioUrl) score += 20; else missingItems.push("Add Portfolio / GitHub (+20%)");

    return { score: Math.min(score, 100), missingItems };
  };

  const { score: completenessScore, missingItems } = calculateCompleteness();

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load profile data on mount
  useEffect(() => {
    if (!user) return;
    
    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch public profile record
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*, institutes(name)")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Database profiles load error:", error);
        }
        if (profile) {
          setFullName(profile.full_name || "");
          setUsername(profile.username || "");
          setAvatarUrl(profile.avatar_url || "");
          setIsPublic(profile.is_profile_public ?? true);
          setGithubUrl(profile.github_url || "");
          setLinkedinUrl(profile.linkedin_url || "");
          setPortfolioUrl(profile.portfolio_url || "");
          setDepartment(profile.department || "");
          setGradYear(profile.graduation_year || "");
          setCollegeKey(profile.college_key || "");
          setAcademicCredits(profile.academic_credits || 0);
          setCollegeName(profile.college_name || "");
          setLeetcodeUsername(profile.leetcode_username || "");
          setCodechefUsername(profile.codechef_username || "");
          setHackerrankUsername(profile.hackerrank_username || "");
          setGeeksforgeeksUsername(profile.geeksforgeeks_username || "");
          setCodeforcesUsername(profile.codeforces_username || "");
          setUnstopUsername(profile.unstop_username || "");
          setDevpostUsername(profile.devpost_username || "");
          const hasKeys = (profile.college_key || "").trim() !== "";
          setLeetcodeVerified(hasKeys ? !!profile.leetcode_verified : true);
          setCodechefVerified(hasKeys ? !!profile.codechef_verified : true);
          setHackerrankVerified(hasKeys ? !!profile.hackerrank_verified : true);
          setGeeksforgeeksVerified(hasKeys ? !!profile.geeksforgeeks_verified : true);
          setCodeforcesVerified(hasKeys ? !!profile.codeforces_verified : true);
          setUnstopVerified(hasKeys ? !!profile.unstop_verified : true);
          setDevpostVerified(hasKeys ? !!profile.devpost_verified : true);

          const verifiedBackup: Record<string, string> = {};
          if (profile.leetcode_verified) verifiedBackup["LeetCode"] = profile.leetcode_username || "";
          if (profile.codechef_verified) verifiedBackup["CodeChef"] = profile.codechef_username || "";
          if (profile.hackerrank_verified) verifiedBackup["HackerRank"] = profile.hackerrank_username || "";
          if (profile.geeksforgeeks_verified) verifiedBackup["GeeksforGeeks"] = profile.geeksforgeeks_username || "";
          if (profile.codeforces_verified) verifiedBackup["Codeforces"] = profile.codeforces_username || "";
          if (profile.unstop_verified) verifiedBackup["Unstop"] = profile.unstop_username || "";
          if (profile.devpost_verified) verifiedBackup["Devpost"] = profile.devpost_username || "";
          setVerifiedHandlesBackup(verifiedBackup);

          if (profile.institutes) {
            setCollegeName(profile.institutes.name || profile.college_name || "");
          }
          if (profile.roll_number) setRollNumber(profile.roll_number);
          if (profile.academic_year) setAcademicYear(profile.academic_year);
          if (profile.section) setSection(profile.section);
          if (profile.batch_code) setBatchCode(profile.batch_code);
          if (profile.college_linked_status) setCollegeLinkedStatus(profile.college_linked_status);
          if (profile.grant_share_permission !== undefined) setGrantSharePermission(!!profile.grant_share_permission);
          if (profile.placement_consent !== undefined) setPlacementConsent(!!profile.placement_consent);
          if (profile.institute_id) setInstituteId(profile.institute_id);
        }

        // 2. Fetch detailed record metadata from Auth user metadata & OAuth identities as fallback/extension
        const meta = user.user_metadata || {};
        const hasRemovedAvatar = meta.avatar_removed === true;
        const bestAvatar = hasRemovedAvatar
          ? ""
          : (profile?.avatar_url && profile.avatar_url.trim().length > 0)
          ? profile.avatar_url.trim()
          : extractAvatarFromUser(user);

        setAvatarUrl(bestAvatar);

        setLeetcodeUsername(meta.leetcode_username || profile?.leetcode_username || "");
        setCodechefUsername(meta.codechef_username || profile?.codechef_username || "");
        setHackerrankUsername(meta.hackerrank_username || profile?.hackerrank_username || "");
        setGeeksforgeeksUsername(meta.geeksforgeeks_username || profile?.geeksforgeeks_username || "");
        setCodeforcesUsername(meta.codeforces_username || profile?.codeforces_username || "");
        setUnstopUsername(meta.unstop_username || profile?.unstop_username || "");
        setDevpostUsername(meta.devpost_username || profile?.devpost_username || "");
        setBio(meta.bio || "");
        setLocation(meta.location || profile?.location || "");
        setSkills(meta.skills || "");
        setGithubUrl(meta.github_url || "");
        setLinkedinUrl(meta.linkedin_url || "");
        setDiscordUsername(meta.discord_username || "");
        setPortfolioUrl(meta.portfolio_url || "");
        setResumeUrl(meta.resume_url || "");
        setResumeFileName(meta.resume_file_name || "");
        setCollegeName(meta.college_name || (profile?.institutes && profile.institutes.name) || "");
        setDepartment(meta.department || "");
        setGradYear(meta.graduation_year || "");
        setCollegeKey(meta.college_key || "");
        setBatchCode(profile?.batch_code || meta.batch_code || "");
        setRollNumber(profile?.roll_number || meta.roll_number || "");
        setAcademicYear(profile?.academic_year || meta.academic_year || "");
        setSection(profile?.section || meta.section || "");
        setGrantSharePermission(profile?.grant_share_permission !== undefined ? !!profile.grant_share_permission : !!meta.grant_share_permission);
        setPlacementConsent(profile?.placement_consent !== undefined ? !!profile.placement_consent : !!meta.placement_consent);
        setCollegeLinkedStatus(profile?.college_linked_status || meta.college_linked_status || "none");
        setInstituteId(profile?.institute_id || meta.institute_id || null);

        // 3. Restore unsaved local draft if user typed changes without submitting
        if (typeof window !== "undefined" && user?.id) {
          const draftStr = localStorage.getItem(`ldk_profile_draft_${user.id}`);
          if (draftStr) {
            try {
              const draft = JSON.parse(draftStr);
              if (draft.fullName !== undefined) setFullName(draft.fullName);
              if (draft.username !== undefined) setUsername(draft.username);
              if (draft.bio !== undefined) setBio(draft.bio);
              if (draft.skills !== undefined) setSkills(draft.skills);
              if (draft.githubUrl !== undefined) setGithubUrl(draft.githubUrl);
              if (draft.linkedinUrl !== undefined) setLinkedinUrl(draft.linkedinUrl);
              if (draft.discordUsername !== undefined) setDiscordUsername(draft.discordUsername);
              if (draft.portfolioUrl !== undefined) setPortfolioUrl(draft.portfolioUrl);
              if (draft.collegeName !== undefined) setCollegeName(draft.collegeName);
              if (draft.department !== undefined) setDepartment(draft.department);
              if (draft.gradYear !== undefined) setGradYear(draft.gradYear);
              if (draft.collegeKey !== undefined) setCollegeKey(draft.collegeKey);
              if (draft.batchCode !== undefined) setBatchCode(draft.batchCode);
              if (draft.leetcodeUsername !== undefined) setLeetcodeUsername(draft.leetcodeUsername);
              if (draft.codeforcesUsername !== undefined) setCodeforcesUsername(draft.codeforcesUsername);
              if (draft.codechefUsername !== undefined) setCodechefUsername(draft.codechefUsername);
              if (draft.unstopUsername !== undefined) setUnstopUsername(draft.unstopUsername);
              if (draft.devpostUsername !== undefined) setDevpostUsername(draft.devpostUsername);
              if (draft.isPublic !== undefined) setIsPublic(draft.isPublic);
              if (draft.grantSharePermission !== undefined) setGrantSharePermission(draft.grantSharePermission);
            } catch (draftErr) {
              console.warn("Failed parsing profile draft:", draftErr);
            }
          }
        }
        
      } catch (err) {
        console.error("Error loading user profile: ", err);
      } finally {
        setLoading(false);
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 400);
      }
    };
    
    loadProfileData();
  }, [user]);

  // Auto-save local draft whenever profile fields change during editing mode
  useEffect(() => {
    if (!user || isInitialLoadRef.current || !isEditing) return;

    const draftData = {
      fullName,
      username,
      bio,
      skills,
      githubUrl,
      linkedinUrl,
      discordUsername,
      portfolioUrl,
      collegeName,
      department,
      gradYear,
      isPublic,
      collegeKey,
      batchCode,
      grantSharePermission,
      leetcodeUsername,
      codeforcesUsername,
      codechefUsername,
      unstopUsername,
      devpostUsername,
      updatedAt: Date.now()
    };

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`ldk_profile_draft_${user.id}`, JSON.stringify(draftData));
      } catch (err) {
        console.warn("Failed saving profile draft:", err);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [
    user, fullName, username, bio, skills, githubUrl, linkedinUrl, discordUsername,
    portfolioUrl, collegeName, department, gradYear, isPublic, collegeKey, batchCode,
    grantSharePermission, leetcodeUsername, codeforcesUsername, codechefUsername,
    unstopUsername, devpostUsername, isEditing
  ]);

  // Sync institutional link status in real-time
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const syncStatus = async () => {
        const linksStored = localStorage.getItem("ldk_student_links");
        if (linksStored) {
          const linksMap = JSON.parse(linksStored);
          const collegeKeyMap = `${user.id}_college`;
          
          let newCollegeStatus = "";
          let finalCollegeKey = "";
          let finalBatchCode = "";
          
          if (linksMap[collegeKeyMap]) {
            const mappedStatus = linksMap[collegeKeyMap].status;
            newCollegeStatus = mappedStatus;
            setCollegeLinkedStatus(mappedStatus);
            if (mappedStatus === "linked") {
              finalCollegeKey = linksMap[collegeKeyMap].key;
              setCollegeKey(linksMap[collegeKeyMap].key);
              finalBatchCode = linksMap[collegeKeyMap].batchCode || "";
              setBatchCode(linksMap[collegeKeyMap].batchCode || "");
            }
          }
          
          // Compare with current Auth User metadata to see if changes occurred
          const currentMeta = user.user_metadata || {};
          const metaCollegeStatus = currentMeta.college_linked_status || "none";
          const metaCollegeKey = currentMeta.college_key || "";
          const metaBatchCode = currentMeta.batch_code || "";
          
          if (
            (newCollegeStatus && newCollegeStatus !== metaCollegeStatus) ||
            (finalCollegeKey && finalCollegeKey !== metaCollegeKey) ||
            (finalBatchCode && finalBatchCode !== metaBatchCode)
          ) {
            // Update auth metadata
            try {
              await supabase.auth.updateUser({
                data: {
                  college_linked_status: newCollegeStatus || metaCollegeStatus,
                  college_key: finalCollegeKey || metaCollegeKey,
                  batch_code: finalBatchCode || metaBatchCode
                }
              });
            } catch (authErr) {
              console.error("Auth metadata update failed:", authErr);
            }
            
            // Also write to profiles table
            await supabase
              .from("profiles")
              .update({
                college_key: finalCollegeKey || metaCollegeKey
              })
              .eq("id", user.id);
          }
        }
      };
      syncStatus();
      window.addEventListener("ldk_student_links_update", syncStatus);
      return () => window.removeEventListener("ldk_student_links_update", syncStatus);
    }
  }, [user]);

  // Extract linked identities from User object
  const connectedProviders = user?.identities?.map(id => id.provider) || [];

  const handleLinkIdentity = async (provider: "google" | "github" | "discord" | "linkedin") => {
    if (connectedProviders.includes(provider)) {
      setMessage({ text: `Account is already linked to ${provider}.`, type: "success" });
      return;
    }
    
    try {
      setLinking(true);
      setMessage(null);
      
      const { error } = await supabase.auth.linkIdentity({
        provider: provider === "linkedin" ? "linkedin_oidc" : provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined,
        }
      });
      
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to connect ${provider} account.`;
      setMessage({ text: message, type: "error" });
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkIdentity = async (provider: string) => {
    // Find matching identity object
    const identityToUnlink = user?.identities?.find(id => id.provider === provider);
    if (!identityToUnlink) return;
    
    try {
      setLinking(true);
      setMessage(null);
      
      // Supabase unlinks by identity ID
      const { error } = await supabase.auth.unlinkIdentity(identityToUnlink);
      if (error) throw error;
      
      setMessage({ text: `Disconnected ${provider} authentication.`, type: "success" });
      // Force reload to get updated identities array
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to unlink ${provider}.`;
      setMessage({ text: message, type: "error" });
      setLinking(false);
    }
  };

  const handleRequestCollegeLink = async () => {
    if (!user) return;
    if (!rollNumber.trim()) {
      setMessage({ text: "Please enter your Institutional Roll Number before verifying.", type: "error" });
      return;
    }
    if (!collegeKey.trim()) {
      setMessage({ text: "Please enter a valid College Registrar Key.", type: "error" });
      return;
    }

    try {
      setIsVerifyingCollege(true);
      setMessage(null);

      const res = await fetch("/api/institutional/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: rollNumber.trim(),
          collegeKey: collegeKey.trim()
        })
      });

      const verifyData = await res.json();

      if (!res.ok || !verifyData.success) {
        setMessage({ 
          text: verifyData.error || "Failed to verify institutional credentials. Please check your roll number and key.", 
          type: "error" 
        });
        setIsVerifyingCollege(false);
        return;
      }

      // Auto-resolve fields
      const cleanRoll = verifyData.rollNumber;
      const cleanDept = verifyData.department;
      const cleanYear = verifyData.academicYear;
      const cleanSec = verifyData.section;
      const cleanBatch = verifyData.batchCode;
      const cleanCollege = verifyData.instituteName;
      const cleanGrad = verifyData.graduationYear;
      const cleanInstId = verifyData.instituteId;

      setRollNumber(cleanRoll);
      setDepartment(cleanDept);
      setAcademicYear(cleanYear);
      setSection(cleanSec);
      setBatchCode(cleanBatch);
      setCollegeName(cleanCollege);
      if (cleanGrad) setGradYear(cleanGrad);
      if (cleanInstId) setInstituteId(cleanInstId);
      setCollegeLinkedStatus("linked");

      setCollegeAutoResolvedInfo({
        instituteName: cleanCollege,
        department: cleanDept,
        academicYear: cleanYear,
        section: cleanSec,
        batchCode: cleanBatch
      });

      // Update profiles table in Supabase
      try {
        await supabase
          .from("profiles")
          .update({
            roll_number: cleanRoll,
            department: cleanDept,
            academic_year: cleanYear,
            section: cleanSec,
            batch_code: cleanBatch,
            college_name: cleanCollege,
            college_key: collegeKey.trim(),
            college_linked_status: "linked",
            grant_share_permission: grantSharePermission,
            placement_consent: placementConsent,
            institute_id: cleanInstId || null,
            graduation_year: cleanGrad || gradYear,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
      } catch (dbErr) {
        console.warn("Profiles DB sync note:", dbErr);
      }

      // Update Auth Metadata
      try {
        await supabase.auth.updateUser({
          data: {
            roll_number: cleanRoll,
            department: cleanDept,
            academic_year: cleanYear,
            section: cleanSec,
            batch_code: cleanBatch,
            college_name: cleanCollege,
            college_key: collegeKey.trim(),
            college_linked_status: "linked",
            grant_share_permission: grantSharePermission,
            placement_consent: placementConsent,
            institute_id: cleanInstId || null,
            graduation_year: cleanGrad || gradYear
          }
        });
      } catch (metaErr) {
        console.warn("Auth metadata sync note:", metaErr);
      }

      // Log consent to consent_log table
      try {
        await supabase.from("consent_log").insert([
          {
            student_id: user.id,
            consent_type: "profile_sharing",
            granted: grantSharePermission,
            ip_hash: "self_verified"
          },
          {
            student_id: user.id,
            consent_type: "placement_analytics",
            granted: placementConsent,
            ip_hash: "self_verified"
          }
        ]);
      } catch {}

      // Update local storage verification bus
      const requestStored = localStorage.getItem("ldk_institutional_verifications");
      const requestList = requestStored ? JSON.parse(requestStored) : [];
      const newReq = {
        id: `link_req_${Date.now()}`,
        studentId: user.id,
        studentName: fullName || username || "Anonymous Student",
        studentEmail: user.email || "",
        type: "college" as const,
        key: collegeKey.trim(),
        rollNumber: cleanRoll,
        department: cleanDept,
        section: cleanSec,
        academicYear: cleanYear,
        batchCode: cleanBatch,
        status: "linked" as const,
        previouslyUnlinked: false,
        date: "Just now"
      };
      
      const updatedList = [newReq, ...requestList.filter((r: any) => !(r.studentId === user.id && r.type === "college"))];
      localStorage.setItem("ldk_institutional_verifications", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("ldk_link_requests_update"));

      const linksStored = localStorage.getItem("ldk_student_links");
      const linksMap = linksStored ? JSON.parse(linksStored) : {};
      linksMap[`${user.id}_college`] = { 
        status: "linked", 
        key: collegeKey.trim(), 
        rollNumber: cleanRoll,
        batchCode: cleanBatch,
        department: cleanDept,
        section: cleanSec
      };
      localStorage.setItem("ldk_student_links", JSON.stringify(linksMap));

      // Global Notification
      const notifStored = localStorage.getItem("ldk_global_notifications");
      const notifList = notifStored ? JSON.parse(notifStored) : [];
      notifList.unshift({
        id: `notif_link_connected_${Date.now()}`,
        title: "Institution Connected",
        message: `Successfully linked with ${cleanCollege} (${cleanDept}, ${cleanYear}, ${cleanSec}).`,
        type: "system",
        category: "alerts",
        role: "student",
        time: "Just now",
        read: false
      });
      localStorage.setItem("ldk_global_notifications", JSON.stringify(notifList.slice(0, 100)));
      window.dispatchEvent(new Event("ldk_notifications_update"));

      setMessage({ text: verifyData.message || "College linked and verified successfully!", type: "success" });

    } catch (err: any) {
      console.error("Institutional Link Exception:", err);
      setMessage({ text: "An error occurred during verification. Please try again.", type: "error" });
    } finally {
      setIsVerifyingCollege(false);
    }
  };

  const handleUnlink = async () => {
    if (!user) return;
    
    const requestStored = localStorage.getItem("ldk_institutional_verifications");
    const requestList = requestStored ? JSON.parse(requestStored) : [];
    
    const updatedList = [
      ...requestList.filter((r: any) => !(r.studentId === user.id && r.type === "college")),
      {
        id: `link_req_${Date.now()}`,
        studentId: user.id,
        studentName: fullName || username || "Anonymous Student",
        studentEmail: user.email || "",
        type: "college" as const,
        key: collegeKey,
        batchCode: batchCode,
        status: "unlinked" as const,
        previouslyUnlinked: true,
        date: "Just now"
      }
    ];
    localStorage.setItem("ldk_institutional_verifications", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("ldk_link_requests_update"));
    
    const linksStored = localStorage.getItem("ldk_student_links");
    const linksMap = linksStored ? JSON.parse(linksStored) : {};
    linksMap[`${user.id}_college`] = { status: "none", key: "", batchCode: "" };
    localStorage.setItem("ldk_student_links", JSON.stringify(linksMap));
    
    setCollegeLinkedStatus("none");
    setCollegeKey("");
    setBatchCode("");
    setRollNumber("");
    setAcademicYear("");
    setSection("");
    setInstituteId(null);
    setCollegeAutoResolvedInfo(null);

    try {
      await supabase
        .from("profiles")
        .update({
          college_key: null,
          batch_code: null,
          college_linked_status: "none",
          roll_number: null,
          academic_year: null,
          section: null,
          institute_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
    } catch {}

    try {
      await supabase.auth.updateUser({
        data: {
          college_key: "",
          batch_code: "",
          college_linked_status: "none",
          roll_number: "",
          academic_year: "",
          section: "",
          institute_id: null
        }
      });
    } catch (updateErr) {
      console.error("Failed updating user metadata:", updateErr);
    }

    setMessage({ text: "Institution unlinked successfully.", type: "success" });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // Auto-normalize text fields on submit
    const cleanFullName = normalizeTitleCase(fullName);
    const cleanUsername = username.trim().toLowerCase();
    const cleanCollege = normalizeTitleCase(collegeName);
    const cleanDept = normalizeTitleCase(department);
    const cleanSkills = normalizeSkillsList(skills);

    if (!cleanFullName || !cleanUsername) {
      setMessage({ text: "Full Name and Username are required.", type: "error" });
      return;
    }

    // Auto-normalize and validate Social Platform URLs & Handles
    const socialList: { name: string; key: "github" | "linkedin" | "discord" | "portfolio"; raw: string; setFn: (v: string) => void }[] = [
      { name: "GitHub", key: "github", raw: githubUrl, setFn: setGithubUrl },
      { name: "LinkedIn", key: "linkedin", raw: linkedinUrl, setFn: setLinkedinUrl },
      { name: "Discord", key: "discord", raw: discordUsername, setFn: setDiscordUsername },
      { name: "Portfolio", key: "portfolio", raw: portfolioUrl, setFn: setPortfolioUrl },
    ];

    const newSocialErrors: Record<string, string> = {};
    for (const item of socialList) {
      if (!item.raw.trim()) continue;
      const res = normalizeSocialUrl(item.raw, item.key);
      if (res.error) {
        newSocialErrors[item.name] = res.error;
      } else {
        item.setFn(res.url);
      }
    }
    setSocialInputErrors(newSocialErrors);

    if (Object.keys(newSocialErrors).length > 0) {
      const firstErr = Object.values(newSocialErrors)[0];
      setMessage({ text: `Validation Error: ${firstErr}. Please fix the indicated social link issue to save your profile.`, type: "error" });
      return;
    }
    // Auto-extract and validate coding platform handles or links
    const platformList = [
      { name: "LeetCode", raw: leetcodeUsername, setFn: setLeetcodeUsername },
      { name: "CodeChef", raw: codechefUsername, setFn: setCodechefUsername },
      { name: "HackerRank", raw: hackerrankUsername, setFn: setHackerrankUsername },
      { name: "GeeksforGeeks", raw: geeksforgeeksUsername, setFn: setGeeksforgeeksUsername },
      { name: "Codeforces", raw: codeforcesUsername, setFn: setCodeforcesUsername },
      { name: "Unstop", raw: unstopUsername, setFn: setUnstopUsername },
      { name: "Devpost", raw: devpostUsername, setFn: setDevpostUsername },
    ];

    const newPlatformErrors: Record<string, string> = {};
    const extractedHandles: Record<string, string> = {};

    for (const item of platformList) {
      if (!item.raw.trim()) continue;
      const res = extractPlatformHandle(item.raw, item.name);
      if (res.error) {
        newPlatformErrors[item.name] = res.error;
      } else {
        extractedHandles[item.name] = res.handle;
        item.setFn(res.handle);
      }
    }

    setPlatformInputErrors(newPlatformErrors);

    if (Object.keys(newPlatformErrors).length > 0) {
      const firstErr = Object.values(newPlatformErrors)[0];
      setMessage({ text: `Validation Error: ${firstErr}. Please fix the indicated handle issue to save your profile.`, type: "error" });
      return;
    }

    // Safety & Anti-Harassment Screening for Public Profile
    if (bio && bio.trim()) {
      const bioCheck = isHarassmentOrOffensive(bio);
      if (!bioCheck.safe) {
        setMessage({ text: bioCheck.reason || "Profile bio contains inappropriate content.", type: "error" });
        return;
      }
    }
    if (username && username.trim()) {
      const usernameCheck = isHarassmentOrOffensive(username);
      if (!usernameCheck.safe) {
        setMessage({ text: "Username contains inappropriate content.", type: "error" });
        return;
      }
    }

    setSaving(true);
    setMessage(null);

    try {
      // Unique Handle Validation (must be checked outside inner try to block saving on duplicates)
      const lcTrim = extractedHandles["LeetCode"] || leetcodeUsername.trim();
      const cfTrim = extractedHandles["Codeforces"] || codeforcesUsername.trim();
      const ccTrim = extractedHandles["CodeChef"] || codechefUsername.trim();
      const hrTrim = extractedHandles["HackerRank"] || hackerrankUsername.trim();
      const gfgTrim = extractedHandles["GeeksforGeeks"] || geeksforgeeksUsername.trim();
      const usTrim = extractedHandles["Unstop"] || unstopUsername.trim();
      const dpTrim = extractedHandles["Devpost"] || devpostUsername.trim();

      if (lcTrim || cfTrim || ccTrim || hrTrim || gfgTrim || usTrim || dpTrim) {
        const { data: existingProfiles } = await supabase
          .from("profiles")
          .select("id, leetcode_username, codeforces_username, codechef_username, hackerrank_username, geeksforgeeks_username, unstop_username, devpost_username")
          .neq("id", user.id);
          
        if (existingProfiles) {
          for (const ep of existingProfiles as any[]) {
            if (lcTrim && ep.leetcode_username && ep.leetcode_username.toLowerCase() === lcTrim.toLowerCase()) {
              throw new Error(`The LeetCode handle @${lcTrim} is already registered by another student.`);
            }
            if (cfTrim && ep.codeforces_username && ep.codeforces_username.toLowerCase() === cfTrim.toLowerCase()) {
              throw new Error(`The Codeforces handle @${cfTrim} is already registered by another student.`);
            }
            if (ccTrim && ep.codechef_username && ep.codechef_username.toLowerCase() === ccTrim.toLowerCase()) {
              throw new Error(`The CodeChef handle @${ccTrim} is already registered by another student.`);
            }
            if (hrTrim && ep.hackerrank_username && ep.hackerrank_username.toLowerCase() === hrTrim.toLowerCase()) {
              throw new Error(`The HackerRank handle @${hrTrim} is already registered by another student.`);
            }
            if (gfgTrim && ep.geeksforgeeks_username && ep.geeksforgeeks_username.toLowerCase() === gfgTrim.toLowerCase()) {
              throw new Error(`The GeeksforGeeks handle @${gfgTrim} is already registered by another student.`);
            }
            if (usTrim && ep.unstop_username && ep.unstop_username.toLowerCase() === usTrim.toLowerCase()) {
              throw new Error(`The Unstop handle @${usTrim} is already registered by another student.`);
            }
            if (dpTrim && ep.devpost_username && ep.devpost_username.toLowerCase() === dpTrim.toLowerCase()) {
              throw new Error(`The Devpost handle @${dpTrim} is already registered by another student.`);
            }
          }
        }
      }

      // 1. Try updating the public profiles table, but fail gracefully to prevent blocking the user
      try {
        const { data: currentDbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const hasCollege = collegeKey.trim() !== "";
        const joinedOrChangedInstitution = 
          collegeKey.trim() !== "" && collegeKey.trim() !== (currentDbProfile?.college_key || "").trim();

        let nextLcVerified = leetcodeVerified;
        let nextCfVerified = codeforcesVerified;
        let nextCcVerified = codechefVerified;
        let nextHrVerified = hackerrankVerified;
        let nextGfgVerified = geeksforgeeksVerified;
        let nextUsVerified = unstopVerified;
        let nextDpVerified = devpostVerified;

        if (hasCollege) {
          if (joinedOrChangedInstitution) {
            nextLcVerified = false;
            nextCfVerified = false;
            nextCcVerified = false;
            nextHrVerified = false;
            nextGfgVerified = false;
            nextUsVerified = false;
            nextDpVerified = false;
          } else {
            if (leetcodeUsername.trim() !== (currentDbProfile?.leetcode_username || "").trim()) {
              nextLcVerified = false;
            }
            if (codeforcesUsername.trim() !== (currentDbProfile?.codeforces_username || "").trim()) {
              nextCfVerified = false;
            }
            if (codechefUsername.trim() !== (currentDbProfile?.codechef_username || "").trim()) {
              nextCcVerified = false;
            }
            if (hackerrankUsername.trim() !== (currentDbProfile?.hackerrank_username || "").trim()) {
              nextHrVerified = false;
            }
            if (geeksforgeeksUsername.trim() !== (currentDbProfile?.geeksforgeeks_username || "").trim()) {
              nextGfgVerified = false;
            }
            if (unstopUsername.trim() !== (currentDbProfile?.unstop_username || "").trim()) {
              nextUsVerified = false;
            }
            if (devpostUsername.trim() !== (currentDbProfile?.devpost_username || "").trim()) {
              nextDpVerified = false;
            }
          }
        } else {
          // Solo users do not require verification
          nextLcVerified = true;
          nextCfVerified = true;
          nextCcVerified = true;
          nextHrVerified = true;
          nextGfgVerified = true;
          nextUsVerified = true;
          nextDpVerified = true;
        }

        setLeetcodeVerified(nextLcVerified);
        setCodeforcesVerified(nextCfVerified);
        setCodechefVerified(nextCcVerified);
        setHackerrankVerified(nextHrVerified);
        setGeeksforgeeksVerified(nextGfgVerified);
        setUnstopVerified(nextUsVerified);
        setDevpostVerified(nextDpVerified);

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            username: cleanUsername,
            full_name: cleanFullName,
            department: cleanDept,
            college_name: cleanCollege || null,
            college_key: collegeKey.trim() || null,
            avatar_url: avatarUrl || null,
            github_url: githubUrl.trim() || null,
            linkedin_url: linkedinUrl.trim() || null,
            portfolio_url: portfolioUrl.trim() || null,
            leetcode_username: leetcodeUsername.trim() || null,
            codechef_username: codechefUsername.trim() || null,
            hackerrank_username: hackerrankUsername.trim() || null,
            hackerrank_verified: nextHrVerified,
            geeksforgeeks_username: geeksforgeeksUsername.trim() || null,
            geeksforgeeks_verified: nextGfgVerified,
            codeforces_username: codeforcesUsername.trim() || null,
            unstop_username: unstopUsername.trim() || null,
            devpost_username: devpostUsername.trim() || null,
            devpost_verified: nextDpVerified,
            graduation_year: gradYear.trim() || null,
            roll_number: rollNumber.trim() || null,
            academic_year: academicYear.trim() || null,
            section: section.trim() || null,
            batch_code: batchCode.trim() || null,
            grant_share_permission: grantSharePermission,
            placement_consent: placementConsent,
            college_linked_status: collegeLinkedStatus,
            institute_id: instituteId || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);

        if (profileError) {
          console.warn("Profiles table update note:", profileError);
        }

        // Save public profile cache for instant cross-component discovery
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `ldk_public_profile_${user.id}`,
            JSON.stringify({
              username: cleanUsername,
              full_name: cleanFullName,
              department: cleanDept,
              college_name: cleanCollege,
              avatar_url: avatarUrl,
              bio: bio.trim(),
              location: location.trim(),
              skills: cleanSkills,
              github_url: githubUrl.trim(),
              linkedin_url: linkedinUrl.trim(),
              portfolio_url: portfolioUrl.trim(),
              leetcode_username: leetcodeUsername.trim(),
              codechef_username: codechefUsername.trim(),
              hackerrank_username: hackerrankUsername.trim(),
              geeksforgeeks_username: geeksforgeeksUsername.trim(),
              codeforces_username: codeforcesUsername.trim(),
              unstop_username: unstopUsername.trim(),
              devpost_username: devpostUsername.trim(),
              graduation_year: gradYear.trim(),
              roll_number: rollNumber.trim(),
              academic_year: academicYear.trim(),
              section: section.trim(),
              batch_code: batchCode.trim()
            })
          );
          if (location.trim()) {
            localStorage.setItem("ldk_user_location", location.trim());
            window.dispatchEvent(new Event("ldk_preferences_update"));
          }
          if (hackerrankUsername.trim()) {
            localStorage.setItem("ldk_hackerrank_handle", hackerrankUsername.trim());
            localStorage.setItem(`ldk_hackerrank_handle_${user.id}`, hackerrankUsername.trim());
          } else {
            localStorage.removeItem("ldk_hackerrank_handle");
            localStorage.removeItem(`ldk_hackerrank_handle_${user.id}`);
          }
          if (geeksforgeeksUsername.trim()) {
            localStorage.setItem("ldk_geeksforgeeks_handle", geeksforgeeksUsername.trim());
            localStorage.setItem(`ldk_geeksforgeeks_handle_${user.id}`, geeksforgeeksUsername.trim());
          } else {
            localStorage.removeItem("ldk_geeksforgeeks_handle");
            localStorage.removeItem(`ldk_geeksforgeeks_handle_${user.id}`);
          }
          if (devpostUsername.trim()) {
            localStorage.setItem("ldk_devpost_handle", devpostUsername.trim());
            localStorage.setItem(`ldk_devpost_handle_${user.id}`, devpostUsername.trim());
          } else {
            localStorage.removeItem("ldk_devpost_handle");
            localStorage.removeItem(`ldk_devpost_handle_${user.id}`);
          }
          if (avatarUrl) {
            localStorage.setItem(`ldk_user_avatar_${user.id}`, avatarUrl);
            localStorage.setItem(`ldk_avatar_url_${user.id}`, avatarUrl);
          } else {
            localStorage.removeItem(`ldk_user_avatar_${user.id}`);
            localStorage.removeItem(`ldk_avatar_url_${user.id}`);
          }
        }
      } catch (dbErr) {
        console.warn("Database profiles table write exception. Proceeding with Auth Metadata fallback.", dbErr);
      }

      // 2. Update metadata in Auth users to keep optional fields in sync
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanFullName,
          username: cleanUsername,
          avatar_url: avatarUrl,
          bio: bio.trim(),
          location: location.trim(),
          skills: cleanSkills,
          github_url: githubUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          discord_username: discordUsername.trim(),
          portfolio_url: portfolioUrl.trim(),
          resume_url: resumeUrl,
          resume_file_name: resumeFileName,
          college_name: cleanCollege,
          department: cleanDept,
          graduation_year: gradYear.trim(),
          college_key: collegeKey.trim(),
          batch_code: batchCode.trim(),
          roll_number: rollNumber.trim(),
          academic_year: academicYear.trim(),
          section: section.trim(),
          grant_share_permission: grantSharePermission,
          placement_consent: placementConsent,
          college_linked_status: collegeLinkedStatus,
          institute_id: instituteId || null,
          leetcode_username: leetcodeUsername.trim(),
          codechef_username: codechefUsername.trim(),
          hackerrank_username: hackerrankUsername.trim(),
          geeksforgeeks_username: geeksforgeeksUsername.trim(),
          codeforces_username: codeforcesUsername.trim(),
          unstop_username: unstopUsername.trim(),
          devpost_username: devpostUsername.trim()
        }
      });

      if (error) throw error;

      if (typeof window !== "undefined") {
        const sharingPermissions = localStorage.getItem("ldk_student_sharing_permissions");
        const sharingMap = sharingPermissions ? JSON.parse(sharingPermissions) : {};
        sharingMap[user.id] = grantSharePermission;
        localStorage.setItem("ldk_student_sharing_permissions", JSON.stringify(sharingMap));
      }

      if (typeof window !== "undefined" && user?.id) {
        localStorage.removeItem(`ldk_profile_draft_${user.id}`);
        // Dispatch live profile update event across Header, Dashboard, and Explore
        window.dispatchEvent(new Event("ldk_profile_update"));
      }

      setAutoDismissMessage({ text: "Profile details updated successfully.", type: "success" }, 5000);
      setIsEditing(false); // Disable editing mode after successful save
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile records.";
      setMessage({ text: message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyNewAvatar = async (url: string) => {
    setAvatarUrl(url);
    if (typeof window !== "undefined" && user?.id) {
      localStorage.setItem("ldk_active_user_avatar", url);
      localStorage.setItem(`ldk_user_avatar_${user.id}`, url);
      localStorage.setItem(`ldk_avatar_url_${user.id}`, url);
      try {
        const raw = localStorage.getItem(`ldk_public_profile_${user.id}`);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.avatar_url = url;
        localStorage.setItem(`ldk_public_profile_${user.id}`, JSON.stringify(parsed));
      } catch {}
      window.dispatchEvent(new Event("ldk_profile_update"));
    }

    if (user?.id) {
      try {
        await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("id", user.id);
        await supabase.auth.updateUser({ data: { avatar_url: url, picture: url, avatarUrl: url, avatar: url, avatar_removed: false, avatar_updated: true } });
      } catch (dbErr) {
        console.warn("Avatar database sync note:", dbErr);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 8 * 1024 * 1024) {
      showToast("Avatar image must be smaller than 8MB", "info");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result as string;
      if (src) setCropImageSrc(src);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropSave = async (croppedDataUrl: string) => {
    setCropImageSrc(null);
    setUploadingAvatar(true);
    try {
      await applyNewAvatar(croppedDataUrl);
    } catch {
      showToast("Failed to apply avatar crop", "info");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl("");
    if (typeof window !== "undefined" && user?.id) {
      try {
        localStorage.removeItem("ldk_active_user_avatar");
        localStorage.removeItem(`ldk_user_avatar_${user.id}`);
        localStorage.removeItem(`ldk_avatar_url_${user.id}`);
        const raw = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.avatar_url = "";
          localStorage.setItem(`ldk_public_profile_${user.id}`, JSON.stringify(parsed));
        }
      } catch {}
      window.dispatchEvent(new Event("ldk_profile_update"));
    }

    if (user?.id) {
      try {
        await supabase.from("profiles").update({ avatar_url: null, updated_at: new Date().toISOString() }).eq("id", user.id);
        await supabase.auth.updateUser({ data: { avatar_url: null, picture: null, avatarUrl: null, avatar: null, image: null, avatar_removed: true } });
      } catch (dbErr) {
        console.warn("Avatar removal database sync note:", dbErr);
      }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check file size (e.g., 3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ text: "Resume PDF size cannot exceed 3MB.", type: "error" });
      return;
    }
    // Check mime type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
      setMessage({ text: "Please upload a valid document file (PDF, DOC, or DOCX).", type: "error" });
      return;
    }
    
    setUploadingResume(true);
    setMessage(null);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id || Date.now()}-resume.${fileExt}`;
      
      const { error } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, { upsert: true });
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);
        
      setResumeUrl(publicUrl);
      setResumeFileName(file.name);
    } catch (err) {
      console.warn("Storage bucket 'resumes' might not be configured, saving fallback reference locally.", err);
      setResumeUrl("#mock-resume-url");
      setResumeFileName(file.name);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRequestDelete = async () => {
    setDeleteError(null);
    setDeleteSuccess(false);
    setDeleteOtp("");
    setShowDeleteModal(true);
    setDeleteLoading(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
        body: JSON.stringify({ action: "request" })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger verification code.");
      }
      setDeleteSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send delete verification code.";
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteOtp.trim()) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
        body: JSON.stringify({ action: "verify", otp: deleteOtp.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification code failed.";
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-bg-base flex flex-col items-center justify-center font-mono text-xs text-txt-muted gap-2">
        <div className="w-4 h-4 border-2 border-accent-main border-t-transparent rounded-full animate-spin" />
        <span>Syncing session...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-lg w-full mx-auto px-6 py-24 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-main/10 border border-accent-main/20 flex items-center justify-center text-accent-main">
            <User size={24} />
          </div>
          <h1 className="font-display text-2xl font-light text-txt-main">Student Profile Access</h1>
          <p className="text-xs text-txt-muted font-light leading-relaxed">
            Please sign in to view and manage your university credentials, verified platform handles, and projects.
          </p>
          <Link
            href="/?auth=login"
            className="px-6 py-2.5 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-bold rounded-sm transition-opacity mt-2"
          >
            Sign In to Continue
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {loading && (
        <div className="w-full h-0.5 bg-accent-main/20 overflow-hidden flex-shrink-0">
          <div className="h-full bg-accent-main animate-pulse w-full" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-bg-base/30 py-8 px-4 md:px-12 max-w-5xl w-full mx-auto flex flex-col gap-6">
        
        <Link 
          href="/"
          className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
        >
          <ArrowLeft size={12} />
          Back to Portal
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-main/40 pb-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Identity Control</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Your Technical Profile</h1>
            <p className="text-xs text-txt-sub">Manage authentication credentials, upload resumes, and connect social identities.</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="h-8 px-4 border border-border-main hover:bg-bg-card text-txt-main text-xs uppercase font-mono rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="profile-form"
                  disabled={saving}
                  className="h-8 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="h-8 px-4 bg-accent-main text-bg-base text-xs uppercase font-semibold rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`text-xs p-3 border rounded-sm font-mono tracking-tight text-center ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/50 text-txt-main" 
              : "bg-red-500/10 border-red-500/50 text-txt-muted"
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Completeness Progress Card (hides automatically at 100%) */}
        {!loading && !authLoading && completenessScore < 100 && (
          <div className="border border-border-main/80 bg-bg-surface/50 p-5 rounded-md flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-txt-main">
                  Profile Completeness
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-accent-main">
                {completenessScore}%
              </span>
            </div>

            <div className="w-full bg-bg-card h-2 rounded-full overflow-hidden border border-border-main/50">
              <div 
                className="h-full bg-accent-main transition-all duration-500" 
                style={{ width: `${completenessScore}%` }} 
              />
            </div>

            {missingItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-txt-muted font-mono uppercase tracking-wider">Suggested Actions:</span>
                {missingItems.map((item, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={() => {
                      document.getElementById("profile-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-accent-main/10 text-txt-main border border-accent-main/20 hover:bg-accent-main/20 cursor-pointer transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: PROFILE FORM (7 Columns) ================= */}
          <form id="profile-form" onSubmit={handleSaveProfile} className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Required Identity Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                Primary Identification (Required)
              </span>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-border-main/40 pb-4">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-full border border-border-main overflow-hidden bg-bg-card flex items-center justify-center">
                      {avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:image/")) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-txt-muted" />
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white text-[10px] uppercase font-mono font-bold cursor-pointer disabled:pointer-events-none"
                        title="Upload Custom Profile Picture"
                      >
                        {uploadingAvatar ? "..." : "Edit"}
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  {isEditing && avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-mono transition-colors cursor-pointer"
                      title="Remove Profile Picture"
                    >
                      <Trash2 size={11} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-3 w-full">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-semibold">Full Legal Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Mira Sen"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light disabled:opacity-60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-semibold">Username handle</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      placeholder="mirasen"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                    />
                    {/* Desk ID: horizontal, small, thin, opacity 60% */}
                    <div className="flex items-center justify-between border border-border-main/50 bg-bg-card/25 px-2.5 py-1 rounded-sm w-full mt-1.5 opacity-60">
                      <span className="text-[8px] font-mono text-txt-muted uppercase tracking-wider">Your Desk ID</span>
                      <span className="text-[9px] font-mono text-txt-main font-semibold select-all">{user?.id || "Loading..."}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Public Profile */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-txt-main">Public Directory Listing</span>
                  <span className="text-[10px] text-txt-muted font-light">Allow classmates and campus coordinators to discover your portfolio.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={!isEditing}
                  className="w-4 h-4 rounded border-border-main text-accent-main focus:ring-accent-main disabled:opacity-50"
                />
              </div>

              {/* Security & Credentials Sub-Section */}
              <div className="border-t border-border-main/40 pt-4 flex flex-col gap-2.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted font-bold">
                  Security & Credentials
                </span>
                
                <div className="flex items-center justify-between p-3 bg-bg-base/40 border border-border-main/60 rounded-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-txt-main font-semibold">Security Password</span>
                    <span className="text-xs font-mono tracking-widest text-txt-muted">••••••••••••</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityError(null);
                      setSecuritySuccess(null);
                      setIsPasswordModalOpen(true);
                    }}
                    className="h-7 px-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-[10px] font-semibold uppercase rounded-sm cursor-pointer transition-opacity shrink-0"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {!(isStaff || isRec) && (
              <>
                {/* Resume and Tech Profile Panel */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Technical Portfolio Details</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-semibold">Professional Bio</label>
                    <textarea 
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about your developer specialties, hackathon goals, or stack specialties..."
                      className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light resize-none disabled:opacity-60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-semibold flex items-center gap-1">
                      <MapPin size={11} className="text-accent-main" /> City / State Location
                    </label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Chennai, Tamil Nadu, India"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light disabled:opacity-60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-semibold">Skills & Stack Specialties (comma-separated)</label>
                    <input 
                      type="text" 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Next.js, TypeScript, PostgreSQL, Figma, UI/UX"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light disabled:opacity-60"
                    />
                  </div>

                  {/* Resume upload */}
                  <div className="flex flex-col gap-2 border border-border-main/60 p-4 rounded bg-bg-base/30">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Certified Resume PDF</span>
                    
                    <div className="flex items-center justify-between gap-4 mt-1">
                      {resumeFileName ? (
                        <div className="flex items-center gap-2 text-xs text-txt-main font-mono">
                          <FileText size={14} className="text-txt-muted" />
                          <span className="truncate max-w-[140px] md:max-w-[240px]" title={resumeFileName}>{resumeFileName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-txt-muted italic font-mono">No resume PDF uploaded.</span>
                      )}
                      
                      <input 
                        type="file" 
                        ref={resumeInputRef}
                        onChange={handleResumeUpload}
                        disabled={!isEditing}
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                      />
                      
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={!isEditing || uploadingResume}
                        className="h-8 px-4 border border-border-main/80 text-[10px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {uploadingResume ? "..." : <><Upload size={12} /> Upload PDF</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Social Platform Profiles */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Social Platform Profiles</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                        <GithubIcon size={12} /> GitHub
                      </label>
                      <input 
                        type="url" 
                        value={githubUrl}
                        onChange={(e) => {
                          setGithubUrl(e.target.value);
                          setSocialInputErrors(prev => ({ ...prev, GitHub: "" }));
                        }}
                        onBlur={() => {
                          if (githubUrl.trim()) {
                            const res = normalizeSocialUrl(githubUrl, "github");
                            if (res.url) setGithubUrl(res.url);
                            if (res.error) setSocialInputErrors(prev => ({ ...prev, GitHub: res.error || "" }));
                            else setSocialInputErrors(prev => ({ ...prev, GitHub: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="https://github.com/myusername or handle"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          socialInputErrors.GitHub ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {socialInputErrors.GitHub && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {socialInputErrors.GitHub}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                        <LinkedinIcon size={12} /> LinkedIn
                      </label>
                      <input 
                        type="url" 
                        value={linkedinUrl}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value);
                          setSocialInputErrors(prev => ({ ...prev, LinkedIn: "" }));
                        }}
                        onBlur={() => {
                          if (linkedinUrl.trim()) {
                            const res = normalizeSocialUrl(linkedinUrl, "linkedin");
                            if (res.url) setLinkedinUrl(res.url);
                            if (res.error) setSocialInputErrors(prev => ({ ...prev, LinkedIn: res.error || "" }));
                            else setSocialInputErrors(prev => ({ ...prev, LinkedIn: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/in/myusername or handle"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          socialInputErrors.LinkedIn ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {socialInputErrors.LinkedIn && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {socialInputErrors.LinkedIn}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                        <DiscordIcon size={12} /> Discord
                      </label>
                      <input 
                        type="text" 
                        value={discordUsername}
                        onChange={(e) => {
                          setDiscordUsername(e.target.value);
                          setSocialInputErrors(prev => ({ ...prev, Discord: "" }));
                        }}
                        onBlur={() => {
                          if (discordUsername.trim()) {
                            const res = normalizeSocialUrl(discordUsername, "discord");
                            if (res.url) setDiscordUsername(res.url);
                            if (res.error) setSocialInputErrors(prev => ({ ...prev, Discord: res.error || "" }));
                            else setSocialInputErrors(prev => ({ ...prev, Discord: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="username or profile link"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          socialInputErrors.Discord ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {socialInputErrors.Discord && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {socialInputErrors.Discord}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                        <Globe size={12} /> Personal Portfolio
                      </label>
                      <input 
                        type="url" 
                        value={portfolioUrl}
                        onChange={(e) => {
                          setPortfolioUrl(e.target.value);
                          setSocialInputErrors(prev => ({ ...prev, Portfolio: "" }));
                        }}
                        onBlur={() => {
                          if (portfolioUrl.trim()) {
                            const res = normalizeSocialUrl(portfolioUrl, "portfolio");
                            if (res.url) setPortfolioUrl(res.url);
                            if (res.error) setSocialInputErrors(prev => ({ ...prev, Portfolio: res.error || "" }));
                            else setSocialInputErrors(prev => ({ ...prev, Portfolio: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="https://myportfolio.dev"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          socialInputErrors.Portfolio ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {socialInputErrors.Portfolio && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {socialInputErrors.Portfolio}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coding Platform Integrations */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Coding Platform Integrations</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. LeetCode */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">LeetCode</label>
                        {leetcodeUsername.trim() && (
                          (leetcodeVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("LeetCode");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={leetcodeUsername}
                        onChange={(e) => {
                          setLeetcodeUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, LeetCode: "" }));
                        }}
                        onBlur={() => {
                          if (leetcodeUsername.trim()) {
                            const res = extractPlatformHandle(leetcodeUsername, "LeetCode");
                            if (res.handle) setLeetcodeUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, LeetCode: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, LeetCode: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://leetcode.com/u/id)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.LeetCode ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.LeetCode && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.LeetCode}</span>
                      )}
                    </div>

                    {/* 2. CodeChef */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">CodeChef</label>
                        {codechefUsername.trim() && (
                          (codechefVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("CodeChef");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={codechefUsername}
                        onChange={(e) => {
                          setCodechefUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, CodeChef: "" }));
                        }}
                        onBlur={() => {
                          if (codechefUsername.trim()) {
                            const res = extractPlatformHandle(codechefUsername, "CodeChef");
                            if (res.handle) setCodechefUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, CodeChef: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, CodeChef: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://codechef.com/users/id)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.CodeChef ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.CodeChef && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.CodeChef}</span>
                      )}
                    </div>

                    {/* 3. HackerRank */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">HackerRank</label>
                        {hackerrankUsername.trim() && (
                          (hackerrankVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("HackerRank");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={hackerrankUsername}
                        onChange={(e) => {
                          setHackerrankUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, HackerRank: "" }));
                        }}
                        onBlur={() => {
                          if (hackerrankUsername.trim()) {
                            const res = extractPlatformHandle(hackerrankUsername, "HackerRank");
                            if (res.handle) setHackerrankUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, HackerRank: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, HackerRank: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://hackerrank.com/profile/id)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.HackerRank ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.HackerRank && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.HackerRank}</span>
                      )}
                    </div>

                    {/* 4. GeeksforGeeks */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">GeeksforGeeks</label>
                        {geeksforgeeksUsername.trim() && (
                          (geeksforgeeksVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("GeeksforGeeks");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={geeksforgeeksUsername}
                        onChange={(e) => {
                          setGeeksforgeeksUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, GeeksforGeeks: "" }));
                        }}
                        onBlur={() => {
                          if (geeksforgeeksUsername.trim()) {
                            const res = extractPlatformHandle(geeksforgeeksUsername, "GeeksforGeeks");
                            if (res.handle) setGeeksforgeeksUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, GeeksforGeeks: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, GeeksforGeeks: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://geeksforgeeks.org/user/id)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.GeeksforGeeks ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.GeeksforGeeks && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.GeeksforGeeks}</span>
                      )}
                    </div>

                    {/* 5. Codeforces */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">Codeforces</label>
                        {codeforcesUsername.trim() && (
                          (codeforcesVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("Codeforces");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={codeforcesUsername}
                        onChange={(e) => {
                          setCodeforcesUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, Codeforces: "" }));
                        }}
                        onBlur={() => {
                          if (codeforcesUsername.trim()) {
                            const res = extractPlatformHandle(codeforcesUsername, "Codeforces");
                            if (res.handle) setCodeforcesUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, Codeforces: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, Codeforces: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://codeforces.com/profile/id)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.Codeforces ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.Codeforces && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.Codeforces}</span>
                      )}
                    </div>

                    {/* 6. Unstop */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">Unstop</label>
                        {unstopUsername.trim() && (
                          (unstopVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("Unstop");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={unstopUsername}
                        onChange={(e) => {
                          setUnstopUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, Unstop: "" }));
                        }}
                        onBlur={() => {
                          if (unstopUsername.trim()) {
                            const res = extractPlatformHandle(unstopUsername, "Unstop");
                            if (res.handle) setUnstopUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, Unstop: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, Unstop: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://unstop.com/user/id)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.Unstop ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.Unstop && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.Unstop}</span>
                      )}
                    </div>

                    {/* 7. Devpost */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs text-txt-sub font-semibold">Devpost</label>
                        {devpostUsername.trim() && (
                          (devpostVerified || !collegeKey.trim()) ? (
                            <span className="text-[7.5px] font-mono text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/30 opacity-70">Verified ✓</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyPlatform("Devpost");
                                setVerifyReason("");
                              }}
                              className="text-[7.5px] font-mono text-yellow-500 hover:underline bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                            >
                              Unverified (Verify Handle)
                            </button>
                          )
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={devpostUsername}
                        onChange={(e) => {
                          setDevpostUsername(e.target.value);
                          setPlatformInputErrors(prev => ({ ...prev, Devpost: "" }));
                        }}
                        onBlur={() => {
                          if (devpostUsername.trim()) {
                            const res = extractPlatformHandle(devpostUsername, "Devpost");
                            if (res.handle) setDevpostUsername(res.handle);
                            if (res.error) setPlatformInputErrors(prev => ({ ...prev, Devpost: res.error || "" }));
                            else setPlatformInputErrors(prev => ({ ...prev, Devpost: "" }));
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="Enter handle or profile link (e.g. https://devpost.com/username)"
                        className={`h-10 px-3 border bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                          platformInputErrors.Devpost ? "border-red-500/70 focus:border-red-500" : "border-border-main/80 focus:border-txt-main"
                        }`}
                      />
                      {platformInputErrors.Devpost && (
                        <span className="text-[10px] text-red-400 font-mono font-medium mt-0.5">⚠️ {platformInputErrors.Devpost}</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* College & Department Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credentials</span>
              
              <div className="flex flex-col gap-1 relative">
                <label className="text-xs text-txt-sub font-semibold">Institute / College Name</label>
                <input 
                  type="text" 
                  value={collegeName}
                  onFocus={() => {
                    if (isEditing) setCollegeSuggestions(getAutocompleteSuggestions(collegeName, "college"));
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCollegeName(val);
                    const match = getSpellingSuggestion(val);
                    setCollegeSuggestion(match && match.toLowerCase() !== val.toLowerCase() ? match : null);
                    setCollegeSuggestions(getAutocompleteSuggestions(val, "college"));
                  }}
                  disabled={!isEditing}
                  placeholder="MIT / IIT Delhi / Stanford University"
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light disabled:opacity-60"
                />
                {collegeSuggestions.length > 0 && (
                  <ul className="absolute z-50 w-full bg-bg-surface border border-border-main/80 rounded-sm shadow-xl top-full left-0 mt-1 py-1 max-h-40 overflow-y-auto text-xs font-light">
                    {collegeSuggestions.map((s) => (
                      <li 
                        key={s} 
                        onClick={() => {
                          setCollegeName(s);
                          setCollegeSuggestions([]);
                          setCollegeSuggestion(null);
                        }}
                        className="px-3 py-1.5 hover:bg-bg-card hover:text-txt-main cursor-pointer text-txt-sub transition-colors"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {collegeSuggestion && collegeSuggestions.length === 0 && (
                  <span className="text-[9px] text-accent-main font-mono mt-0.5 animate-fade-in">
                    Did you mean: <strong className="underline cursor-pointer" onClick={() => { setCollegeName(collegeSuggestion); setCollegeSuggestion(null); }}>{collegeSuggestion}</strong>?
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 relative">
                  <label className="text-xs text-txt-sub font-semibold">Department / Major</label>
                  <input 
                    type="text" 
                    value={department}
                    onFocus={() => {
                      if (isEditing) setDeptSuggestions(getAutocompleteSuggestions(department, "department"));
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDepartment(val);
                      const match = getSpellingSuggestion(val);
                      setDeptSuggestion(match && match.toLowerCase() !== val.toLowerCase() ? match : null);
                      setDeptSuggestions(getAutocompleteSuggestions(val, "department"));
                    }}
                    disabled={!isEditing}
                    placeholder="Computer Science"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light disabled:opacity-60"
                  />
                  {deptSuggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-bg-surface border border-border-main/80 rounded-sm shadow-xl top-full left-0 mt-1 py-1 max-h-40 overflow-y-auto text-xs font-light">
                      {deptSuggestions.map((s) => (
                        <li 
                          key={s} 
                          onClick={() => {
                            setDepartment(s);
                            setDeptSuggestions([]);
                            setDeptSuggestion(null);
                          }}
                          className="px-3 py-1.5 hover:bg-bg-card hover:text-txt-main cursor-pointer text-txt-sub transition-colors"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  {deptSuggestion && deptSuggestions.length === 0 && (
                    <span className="text-[9px] text-accent-main font-mono mt-0.5 animate-fade-in">
                      Did you mean: <strong className="underline cursor-pointer" onClick={() => { setDepartment(deptSuggestion); setDeptSuggestion(null); }}>{deptSuggestion}</strong>?
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold">Graduation Year</label>
                  <input 
                    type="text" 
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    disabled={!isEditing}
                    placeholder="2027"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <button 
                type="submit" 
                disabled={saving}
                className="w-full h-11 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity cursor-pointer"
              >
                {saving ? (
                  <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    Save Portfolio Changes
                  </>
                )}
              </button>
            )}
          </form>

          {/* ================= RIGHT COLUMN: ACCOUNT CONNECTIONS & VERIFIED STATS (5 Columns) ================= */}
          <section className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            
            {isStaff ? (
              <div className="flex flex-col gap-6">
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-3 text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Session Context</span>
                  <div className="flex flex-col gap-1 border-b border-border-main/45 pb-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">Administrative Desk</h3>
                    <p className="text-[10px] text-txt-muted leading-relaxed font-light">
                      You are logged in as a Faculty Coordinator. Student-specific features like handle integrations, enrollment keys, and academic credit claims are disabled.
                    </p>
                  </div>
                  <div className="text-[10.5px] font-mono text-txt-sub">
                    Authorized Role: <strong className="text-emerald-500 uppercase font-bold font-semibold">Faculty Staff</strong>
                  </div>
                </div>

                {/* Faculty Shareable Keys Section */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-3 text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Institutional Access Keys</span>
                  <div className="flex flex-col gap-1 border-b border-border-main/45 pb-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">Share with Students</h3>
                    <p className="text-[10px] text-txt-muted leading-relaxed font-light">
                      Send these verification keys to your students so they can link their profiles to your college.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9.5px] font-mono text-txt-sub">COLLEGE REGISTRAR KEY:</span>
                      <div className="flex items-center justify-between bg-bg-base border border-border-main/60 rounded px-2.5 py-1.5 font-mono text-[11px] text-txt-main">
                        <span>{(collegeKey || "COLLEGE_SRM_FACULTY").replace("_FACULTY", "")}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText((collegeKey || "COLLEGE_SRM_FACULTY").replace("_FACULTY", ""));
                            showToast("College Registrar Key copied to clipboard");
                          }}
                          className="text-[9px] uppercase tracking-wider text-accent-main hover:opacity-80 font-bold cursor-pointer font-mono"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* OAuth Connection linking panel */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Authentication Connections</span>
                  
                  <div className="flex flex-col gap-1.5 border-b border-border-main/40 pb-3">
                    <h3 className="font-display text-sm font-semibold text-txt-main">Linked Credentials</h3>
                    <p className="text-[10px] text-txt-muted font-light leading-relaxed">
                      Link multiple authentication accounts to this profile. You can log in using any linked account in the future.
                    </p>
                  </div>

                  {/* Provider List */}
                  <div className="flex flex-col gap-3 pt-1">
                    
                    {/* Google */}
                    <div className="flex items-center justify-between border-b border-border-main/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-txt-sub" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-txt-main">Google Account</span>
                          <span className="text-[9px] text-txt-muted font-mono">{user?.email}</span>
                        </div>
                      </div>
                      {connectedProviders.includes("google") ? (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-mono uppercase font-bold">
                          <CheckCircle2 size={10} /> Connected
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleLinkIdentity("google")}
                          disabled={linking}
                          className="h-7 px-3 border border-border-main/80 text-[9px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center justify-between border-b border-border-main/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <GithubIcon size={14} className="text-txt-sub" />
                        <span className="text-xs font-semibold text-txt-main">GitHub Login</span>
                      </div>
                      {connectedProviders.includes("github") ? (
                        <button 
                          onClick={() => handleUnlinkIdentity("github")}
                          disabled={linking}
                          className="text-[9px] text-txt-muted hover:text-red-500 font-mono uppercase font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Unlink size={10} /> Linked (Disconnect)
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleLinkIdentity("github")}
                          disabled={linking}
                          className="h-7 px-3 border border-border-main/80 text-[9px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {/* Discord */}
                    <div className="flex items-center justify-between border-b border-border-main/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <DiscordIcon size={14} className="text-txt-sub" />
                        <span className="text-xs font-semibold text-txt-main">Discord Login</span>
                      </div>
                      {connectedProviders.includes("discord") ? (
                        <button 
                          onClick={() => handleUnlinkIdentity("discord")}
                          disabled={linking}
                          className="text-[9px] text-txt-muted hover:text-red-500 font-mono uppercase font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Unlink size={10} /> Linked (Disconnect)
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleLinkIdentity("discord")}
                          disabled={linking}
                          className="h-7 px-3 border border-border-main/80 text-[9px] font-mono tracking-wider uppercase rounded-sm hover:bg-bg-card transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                  </div>

                  <div className="flex items-start gap-1.5 bg-bg-base/30 border border-border-main/60 p-3 rounded mt-2">
                    <Info size={12} className="text-txt-muted mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] text-txt-muted leading-relaxed font-light">
                      <strong>Important</strong>: You cannot disconnect all login options. At least one linked authentication method must remain active to prevent locking yourself out.
                    </span>
                  </div>
                </div>

                {/* Coding & Platform Desk Integrations Panel */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Integrations Center</span>
                  <div className="flex flex-col gap-1 border-b border-border-main/40 pb-2">
                    <span className="text-xs font-semibold text-txt-main">Coding & Hackathon Desks</span>
                    <span className="text-[10px] text-txt-sub font-light leading-relaxed">
                      Link your profiles to aggregate solves, global ranks, and hackathon milestones.
                    </span>
                  </div>
                  <Link 
                    href="/coding-desk"
                    className="w-full h-9 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 rounded-sm transition-opacity"
                  >
                    <Code2 size={12} /> Manage Code Desk
                  </Link>
                </div>

                {/* Academic stats card */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credit Balance</span>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent-main text-bg-base flex items-center justify-center">
                      <Award size={18} className="stroke-[1.5]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-display font-light tracking-tight text-txt-main">{academicCredits} Points</span>
                      <span className="text-[10px] text-txt-muted font-mono uppercase tracking-wider">Verified Extracurriculars</span>
                    </div>
                  </div>
                </div>

                {/* Institutional Link / Key Enrollment Panel */}
                <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Institutional Enrollment</span>
                    {collegeLinkedStatus === "linked" && (
                      <span className="text-[8.5px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified Student
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 border-b border-border-main/40 pb-2.5">
                    <span className="text-xs font-semibold text-txt-main">Academic Identity & Campus Integration</span>
                    <span className="text-[10px] text-txt-sub font-light leading-relaxed">
                      Connect your institutional student credentials to automatically sync departmental leaderboards, faculty event recommendations, and career placement analytics.
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {/* College Link Segment */}
                    <div className="flex flex-col gap-3 p-3 bg-bg-base/30 border border-border-main/50 rounded-sm">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-txt-sub">Institutional Credentials</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Roll Number */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-txt-sub font-semibold">Institutional Roll / Reg Number</label>
                          <input 
                            type="text"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                            disabled={!isEditing || collegeLinkedStatus === "linked"}
                            placeholder="e.g. RA2311003010045"
                            className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors font-mono uppercase disabled:opacity-60"
                          />
                        </div>

                        {/* College Key */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-txt-sub font-semibold">College Registrar Key</label>
                          <input 
                            type="password"
                            value={collegeKey}
                            onChange={(e) => setCollegeKey(e.target.value)}
                            disabled={!isEditing || collegeLinkedStatus === "linked"}
                            placeholder="e.g. COLLEGE_SRM"
                            className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* Resolved Hierarchy Details Preview (when linked or auto-resolved) */}
                      {(collegeLinkedStatus === "linked" || collegeAutoResolvedInfo) && (
                        <div className="p-2.5 bg-bg-card/70 border border-border-main/70 rounded flex flex-col gap-1.5 animate-fade-in font-mono text-[10px]">
                          <span className="text-[9px] text-txt-muted uppercase tracking-wider font-semibold">Mapped Campus Hierarchy</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-txt-main">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-txt-muted uppercase">Department</span>
                              <span className="font-semibold truncate">{department || collegeAutoResolvedInfo?.department || "General"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-txt-muted uppercase">Year</span>
                              <span className="font-semibold">{academicYear || collegeAutoResolvedInfo?.academicYear || "3rd Year"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-txt-muted uppercase">Section</span>
                              <span className="font-semibold">{section || collegeAutoResolvedInfo?.section || "Section A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-txt-muted uppercase">Batch Code</span>
                              <span className="font-semibold truncate">{batchCode || collegeAutoResolvedInfo?.batchCode || "Class of 2026"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* College Status Display & Buttons */}
                      <div className="flex flex-col gap-2 mt-1">
                        {collegeLinkedStatus === "none" && (
                          <button
                            type="button"
                            onClick={handleRequestCollegeLink}
                            disabled={isVerifyingCollege || !isEditing}
                            className="h-8 w-full bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base text-[9px] font-mono uppercase tracking-wider rounded-sm transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isVerifyingCollege ? (
                              <>
                                <span className="w-2.5 h-2.5 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />
                                Validating Credentials...
                              </>
                            ) : (
                              "Verify & Link College"
                            )}
                          </button>
                        )}
                        {collegeLinkedStatus === "linked" && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9.5px] text-emerald-500 font-mono flex items-center gap-1">
                              <CheckCircle2 size={11} /> Connected to {collegeName || "Institution"}
                            </span>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={handleUnlink}
                                className="text-[9px] text-txt-sub hover:text-red-400 font-mono uppercase tracking-wide transition-colors underline cursor-pointer"
                              >
                                Unlink College
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Consents & Data Governance Toggles */}
                    <div className="flex flex-col gap-2.5 mt-1 border-t border-border-main/40 pt-3">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-txt-muted font-bold">Privacy & Institutional Governance</span>
                      
                      {/* Departmental Performance Audit Consent */}
                      <div className="flex items-start gap-2.5">
                        <input 
                          type="checkbox"
                          id="grantSharePermission"
                          checked={grantSharePermission}
                          onChange={(e) => setGrantSharePermission(e.target.checked)}
                          disabled={!isEditing}
                          className="mt-0.5 h-3.5 w-3.5 border border-border-main/85 bg-bg-base text-accent-main focus:ring-0 rounded-sm cursor-pointer disabled:opacity-60"
                        />
                        <label htmlFor="grantSharePermission" className="text-[10px] text-txt-sub leading-normal cursor-pointer select-none">
                          <strong>Departmental Academic Audit</strong>: Authorize verified department faculty and coordinators to include your coding activity in internal academic reports and progress evaluations.
                        </label>
                      </div>

                      {/* Recruiter Placement Hub Consent */}
                      <div className="flex items-start gap-2.5">
                        <input 
                          type="checkbox"
                          id="placementConsent"
                          checked={placementConsent}
                          onChange={(e) => setPlacementConsent(e.target.checked)}
                          disabled={!isEditing}
                          className="mt-0.5 h-3.5 w-3.5 border border-border-main/85 bg-bg-base text-accent-main focus:ring-0 rounded-sm cursor-pointer disabled:opacity-60"
                        />
                        <label htmlFor="placementConsent" className="text-[10px] text-txt-sub leading-normal cursor-pointer select-none">
                          <strong>Campus Placement & Recruiter Intelligence (Opt-in)</strong>: Include anonymized skill benchmarks in corporate recruiter dashboards to increase your institution&apos;s placement visibility.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account Deletion Button */}
            <div className="flex justify-center mt-2 pb-6">
              <button
                type="button"
                onClick={handleRequestDelete}
                className="text-[9px] font-mono uppercase tracking-widest text-txt-muted hover:text-red-500 transition-colors duration-150 focus:outline-none cursor-pointer"
              >
                Delete LynDesk Account
              </button>
            </div>

          </section>

        </div>

      </main>

      {/* Password Security Center Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ease-out">
          <div className="bg-bg-surface border border-border-main/80 max-w-md w-full p-6 rounded-md flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-250 ease-out relative">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-1 border-b border-border-main/40 pb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Credential Security</span>
              <h3 className="font-display text-xl font-light text-txt-main">Password Security Center</h3>
              <p className="text-xs text-txt-sub">Set or update your LynDesk password to enable Email/Username logins.</p>
            </div>

            {securityError && (
              <div className="text-xs p-3 border border-red-500/50 bg-red-500/10 text-txt-muted font-mono rounded text-center">
                {securityError}
              </div>
            )}

            {securitySuccess && (
              <div className="text-xs p-3 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono rounded text-center">
                {securitySuccess}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-3 bg-bg-base/40 border border-border-main/50 rounded font-mono text-xs">
                <span className="text-[10px] uppercase text-txt-sub font-semibold">1. Verification Link Step</span>
                <p className="text-[11px] text-txt-muted leading-relaxed font-light">
                  Dispatch a secure 1-click verification link to <strong>{user?.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleRequestPasswordOtp}
                  disabled={securityActionLoading}
                  className="h-8 w-full border border-border-main/80 bg-bg-card hover:bg-bg-base text-txt-main text-[10px] uppercase tracking-wider rounded transition-colors font-semibold mt-1 cursor-pointer"
                >
                  {securityActionLoading ? "Dispatching Email..." : otpSent ? "Resend Verification Email" : "Request 1-Click Verification Email"}
                </button>
              </div>

              <form onSubmit={handleUpdateSecurityPassword} className="flex flex-col gap-3 font-mono text-xs">
                <span className="text-[10px] uppercase text-txt-sub font-semibold">2. Set New LynDesk Password</span>
                
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub">New Password *</label>
                    <input
                      type="password"
                      required
                      value={securityPasswordInput}
                      onChange={(e) => setSecurityPasswordInput(e.target.value)}
                      placeholder="Min 8 chars, A-Z, 0-9, special..."
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={securityConfirmPasswordInput}
                      onChange={(e) => setSecurityConfirmPasswordInput(e.target.value)}
                      placeholder="Re-enter new password..."
                      className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 ease-out font-mono"
                    />
                  </div>
                </div>

                {/* Live Rules Indicator */}
                {(() => {
                  const secRules = validatePassword(securityPasswordInput, securityConfirmPasswordInput);
                  return (
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[9px] font-mono border-t border-border-main/40 mt-1">
                      <span className={secRules.hasMinLength ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                        {secRules.hasMinLength ? "✓" : "○"} 8+ Characters
                      </span>
                      <span className={secRules.hasUppercase ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                        {secRules.hasUppercase ? "✓" : "○"} Uppercase (A-Z)
                      </span>
                      <span className={secRules.hasLowercase ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                        {secRules.hasLowercase ? "✓" : "○"} Lowercase (a-z)
                      </span>
                      <span className={secRules.hasNumber ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                        {secRules.hasNumber ? "✓" : "○"} Number (0-9)
                      </span>
                      <span className={secRules.hasSpecialChar ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                        {secRules.hasSpecialChar ? "✓" : "○"} Special Char (!@#$)
                      </span>
                      <span className={secRules.passwordsMatch && securityConfirmPasswordInput ? "text-emerald-400 font-semibold" : "text-txt-muted"}>
                        {secRules.passwordsMatch && securityConfirmPasswordInput ? "✓ Passwords Match" : "○ Match Passwords"}
                      </span>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  disabled={securityActionLoading || !validatePassword(securityPasswordInput, securityConfirmPasswordInput).isValid}
                  className="h-9 w-full bg-accent-main hover:opacity-90 text-bg-base text-xs font-semibold uppercase tracking-wider rounded transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {securityActionLoading ? "Updating Password..." : "Update LynDesk Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Handle Verification Modal */}
      {verifyPlatform && (() => {
        const handleName = verifyPlatform === "LeetCode" ? leetcodeUsername
                         : verifyPlatform === "Codeforces" ? codeforcesUsername
                         : verifyPlatform === "CodeChef" ? codechefUsername
                         : verifyPlatform === "HackerRank" ? hackerrankUsername
                         : verifyPlatform === "GeeksforGeeks" ? geeksforgeeksUsername
                         : verifyPlatform === "Unstop" ? unstopUsername
                         : devpostUsername;
        const prevVerifiedHandle = verifiedHandlesBackup[verifyPlatform] || "";
        const isSwitch = !!prevVerifiedHandle;

        return (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVerifyPlatform(null)} />
            <div className="relative w-full max-w-sm border border-border-main bg-bg-surface p-6 rounded-md shadow-2xl flex flex-col gap-4 z-10 animate-fade-in text-left">
              <div className="flex flex-col gap-1.5 border-b border-border-main/45 pb-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">
                  {isSwitch ? "Request Handle Switch" : "Request Handle Verification"}
                </span>
                <h3 className="text-sm font-semibold text-txt-main font-sans">Verify your {verifyPlatform} account</h3>
                <p className="text-[10px] text-txt-muted leading-relaxed">
                  {isSwitch ? (
                    <>
                      You are changing your verified {verifyPlatform} handle from <strong className="font-semibold font-mono">@{prevVerifiedHandle}</strong> to <strong className="font-semibold font-mono">@{handleName}</strong>. This will unverify your previous handle.
                    </>
                  ) : (
                    <>
                      Submit a verification request for your new {verifyPlatform} handle <strong className="font-semibold font-mono">@{handleName}</strong>.
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono uppercase text-txt-muted">
                  {isSwitch ? "Reason for Username Change" : "Verification Notes"}
                </label>
                <textarea
                  rows={3}
                  value={verifyReason}
                  onChange={(e) => setVerifyReason(e.target.value)}
                  placeholder={isSwitch ? "e.g. Switched username to align with my GitHub handle..." : "e.g. First-time competitive coding profile setup..."}
                  className="w-full p-2.5 border border-border-main bg-bg-base text-txt-main text-xs focus:outline-none focus:border-txt-main rounded-sm placeholder:text-txt-muted/50 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setVerifyPlatform(null)}
                  className="px-4 py-2 border border-border-main hover:bg-bg-card text-txt-main rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isSwitch && !verifyReason.trim()) return;

                    // Submit request to localStorage
                    const stored = localStorage.getItem("ldk_handle_verifications");
                    const list = stored ? JSON.parse(stored) : [];
                    
                    const newReq = {
                      id: `verify_${Date.now()}`,
                      studentId: user?.id,
                      studentName: fullName || "Student",
                      studentEmail: user?.email,
                      platform: verifyPlatform,
                      handle: handleName,
                      requestType: isSwitch ? "handle_switch" : "new_verification",
                      oldHandle: isSwitch ? prevVerifiedHandle : null,
                      newHandle: handleName,
                      reason: verifyReason.trim() || (isSwitch ? "Requested username switch." : "New profile verification setup."),
                      status: "pending",
                      date: new Date().toLocaleDateString()
                    };
                    
                    localStorage.setItem("ldk_handle_verifications", JSON.stringify([newReq, ...list].slice(0, 100)));
                    
                    // Add a student notification
                    const storedNotifs = localStorage.getItem("ldk_global_notifications");
                    const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
                    notifs.unshift({
                      id: `notif_verify_req_${Date.now()}`,
                      title: isSwitch ? "Switch Verification Requested" : "Verification Requested",
                      message: isSwitch 
                        ? `Switch request from @${prevVerifiedHandle} to @${handleName} submitted.`
                        : `Verification request for @${handleName} submitted.`,
                      type: "system",
                      category: "alerts",
                      time: "Just now",
                      read: false
                    });
                    localStorage.setItem("ldk_global_notifications", JSON.stringify(notifs.slice(0, 100)));
                    window.dispatchEvent(new Event("ldk_notifications_update"));

                    setVerifyPlatform(null);
                    setMessage({ 
                      text: isSwitch 
                        ? `Handle switch verification request submitted for @${handleName}.` 
                        : `Verification request submitted for @${handleName}.`, 
                      type: "success" 
                    });
                  }}
                  disabled={isSwitch && !verifyReason.trim()}
                  className="px-4 py-2 bg-accent-main text-bg-base font-bold rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Account OTP Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-bg-surface border border-border-main/80 max-w-md w-full p-6 md:p-8 rounded-md flex flex-col gap-5 shadow-2xl animate-fade-in">
              
              <div className="flex justify-between items-start gap-4 border-b border-border-main/40 pb-4">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-red-500 font-bold">Action Verification</span>
                  <h3 className="text-base font-semibold text-txt-main font-display">Confirm Permanent Deletion</h3>
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              {deleteError && (
                <div className="text-xs p-3 border border-red-500/50 bg-red-500/10 text-txt-muted font-mono rounded-sm text-center">
                  {deleteError}
                </div>
              )}

              {deleteSuccess ? (
                <form onSubmit={handleConfirmDelete} className="flex flex-col gap-4">
                  <p className="text-xs text-txt-sub font-light leading-relaxed">
                    A 6-digit confirmation code has been generated for your session. Enter the code sent to your email to authorize account deletion.
                  </p>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-txt-sub font-semibold uppercase tracking-wider">Verification Code *</label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm focus:outline-none focus:border-txt-main font-mono text-center tracking-[0.5em]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className="w-full h-10 bg-red-500 hover:opacity-90 disabled:opacity-50 text-white font-mono text-xs tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
                  >
                    {deleteLoading ? (
                      <span className="h-4 w-4 rounded-full border border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Trash2 size={12} />
                        Confirm Deletion
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <span className="h-6 w-6 rounded-full border border-accent-main/30 border-t-accent-main animate-spin" />
                  <span className="text-[10px] font-mono text-txt-muted uppercase">Sending OTP Security Code...</span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Avatar Crop Modal Overlay */}
      {cropImageSrc && (
        <AvatarCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropSave}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      <Footer />
    </div>
  );
}
