"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { normalizeTitleCase, getSpellingSuggestion, normalizeSkillsList, getAutocompleteSuggestions } from "../lib/textNormalization";
import Header from "../components/Header";
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
  Code2
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
  companyKey: string;
  batchCode: string;
  grantSharePermission: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Basic profiles table fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  
  // Detailed metadata fields
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  
  // Academic details
  const [collegeName, setCollegeName] = useState("");
  const [department, setDepartment] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [collegeKey, setCollegeKey] = useState("");
  const [companyKey, setCompanyKey] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [grantSharePermission, setGrantSharePermission] = useState(false);
  
  // Interface states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [linking, setLinking] = useState(false);
  
  // Suggestions
  const [collegeSuggestion, setCollegeSuggestion] = useState<string | null>(null);
  const [deptSuggestion, setDeptSuggestion] = useState<string | null>(null);

  // Autocomplete Suggestions
  const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([]);
  const [deptSuggestions, setDeptSuggestions] = useState<string[]>([]);

  // Edit/View Mode controls
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState<BackupProfileData | null>(null);

  const handleStartEdit = () => {
    setBackupData({
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
      companyKey,
      batchCode,
      grantSharePermission
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (backupData) {
      setFullName(backupData.fullName);
      setUsername(backupData.username);
      setBio(backupData.bio);
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
      setCompanyKey(backupData.companyKey);
      setBatchCode(backupData.batchCode);
      setGrantSharePermission(backupData.grantSharePermission);
    }
    setIsEditing(false);
    setMessage(null);
  };
  
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
          if (profile.institutes) {
            setCollegeName(profile.institutes.name || "");
          }
        }

        // 2. Fetch detailed record metadata from Auth user metadata as fallback/extension
        const meta = user.user_metadata || {};
        setBio(meta.bio || "");
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
        setCompanyKey(meta.company_key || "");
        setBatchCode(meta.batch_code || "");
        setGrantSharePermission(!!meta.grant_share_permission);
        
      } catch (err) {
        console.error("Error loading user profile: ", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
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

    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (githubUrl.trim() && !isValidUrl(githubUrl.trim())) {
      setMessage({ text: "Please enter a valid GitHub URL (including https://).", type: "error" });
      return;
    }
    if (linkedinUrl.trim() && !isValidUrl(linkedinUrl.trim())) {
      setMessage({ text: "Please enter a valid LinkedIn URL (including https://).", type: "error" });
      return;
    }
    if (portfolioUrl.trim() && !isValidUrl(portfolioUrl.trim())) {
      setMessage({ text: "Please enter a valid Personal Portfolio URL (including https://).", type: "error" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // 1. Try updating the public profiles table, but fail gracefully to prevent blocking the user
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            username: cleanUsername,
            full_name: cleanFullName,
            avatar_url: avatarUrl,
            is_profile_public: isPublic,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.warn("Profiles table upsert failed (database RLS/Schema). Proceeding with Auth Metadata fallback.", profileError);
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
          company_key: companyKey.trim(),
          batch_code: batchCode.trim(),
          grant_share_permission: grantSharePermission
        }
      });

      if (error) throw error;

      setMessage({ text: "Profile details updated successfully.", type: "success" });
      setIsEditing(false); // Disable editing mode after successful save
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile records.";
      setMessage({ text: message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check file size (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: "Profile image size cannot exceed 2MB.", type: "error" });
      return;
    }
    // Check mime type
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload a valid image file (PNG, JPG, WebP).", type: "error" });
      return;
    }
    
    setUploadingAvatar(true);
    setMessage(null);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id || Date.now()}-avatar.${fileExt}`;
      
      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
        
      setAvatarUrl(publicUrl);
    } catch (err) {
      console.warn("Storage bucket 'avatars' might not be configured, converting to Local URL reference.", err);
      // Fallback: read file content as base64 data url
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
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

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {loading && (
        <div className="w-full h-0.5 bg-accent-main/20 overflow-hidden flex-shrink-0">
          <div className="h-full bg-accent-main animate-pulse w-full" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-bg-base/30 py-8 px-4 md:px-12 max-w-5xl w-full mx-auto flex flex-col gap-6">
        
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: PROFILE FORM (7 Columns) ================= */}
          <form id="profile-form" onSubmit={handleSaveProfile} className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Required Identity Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Primary Identification (Required)</span>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-border-main/40 pb-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full border border-border-main overflow-hidden bg-bg-card flex items-center justify-center">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-txt-muted" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={!isEditing || uploadingAvatar}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white text-[10px] uppercase font-mono font-bold disabled:pointer-events-none"
                  >
                    {uploadingAvatar ? "..." : "Edit"}
                  </button>
                  <input 
                    type="file" 
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
                    disabled={!isEditing}
                    className="hidden" 
                    accept="image/*"
                  />
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
            </div>

            {/* Resume and Tech Profile Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Technical Portfolio Details (Optional)</span>
              
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
                      <span className="truncate max-w-[180px]">{resumeFileName}</span>
                      {resumeUrl !== "#mock-resume-url" && (
                        <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] text-txt-muted hover:text-txt-main underline ml-1">
                          View
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-txt-muted font-light italic">No resume uploaded yet.</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                    <GithubIcon size={12} /> GitHub URL
                  </label>
                  <input 
                    type="url" 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://github.com/username"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                  />
                </div>
 
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                    <LinkedinIcon size={12} /> LinkedIn URL
                  </label>
                  <input 
                    type="url" 
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                    <DiscordIcon size={12} /> Discord Username
                  </label>
                  <input 
                    type="text" 
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    disabled={!isEditing}
                    placeholder="username#0000"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                    <Globe size={12} /> Personal Portfolio URL
                  </label>
                  <input 
                    type="url" 
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://myportfolio.dev"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* College & Department Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credentials (Optional)</span>
              
              <div className="flex flex-col gap-1 relative">
                <label className="text-xs text-txt-sub font-semibold">Institute / College Name</label>
                <input 
                  type="text" 
                  value={collegeName}
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

            {/* Academic stats card */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credit Balance</span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent-main text-bg-base flex items-center justify-center">
                  <Award size={18} className="stroke-[1.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-light tracking-tight text-txt-main">32 Points</span>
                  <span className="text-[10px] text-txt-muted font-mono uppercase tracking-wider">Verified Extracurriculars</span>
                </div>
              </div>
            </div>

            {/* Coding & Platform Deck Integrations Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Integrations Center</span>
              <div className="flex flex-col gap-1 border-b border-border-main/40 pb-2">
                <span className="text-xs font-semibold text-txt-main">Coding & Hackathon Decks</span>
                <span className="text-[10px] text-txt-sub font-light leading-relaxed">
                  Link your profiles to aggregate solves, global ranks, and hackathon milestones.
                </span>
              </div>
              <Link 
                href="/coding-deck"
                className="w-full h-9 bg-accent-main hover:opacity-90 text-bg-base text-[10px] font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 rounded-sm transition-opacity"
              >
                <Code2 size={12} /> Manage Coding Deck
              </Link>
            </div>

            {/* Institutional Link / Key Enrollment Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Institutional Enrollment</span>
              <div className="flex flex-col gap-1.5 border-b border-border-main/40 pb-2.5">
                <span className="text-xs font-semibold text-txt-main">Link College or Employer</span>
                <span className="text-[10px] text-txt-sub font-light leading-relaxed">
                  Enter verification codes provided by your institution or coordinator to share your accomplishments.
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold">College Enrollment Key</label>
                  <input 
                    type="password"
                    value={collegeKey}
                    onChange={(e) => setCollegeKey(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter College Registrar Key"
                    className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                  />
                  {collegeKey && (
                    <span className="text-[9px] text-emerald-500 font-mono flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 size={10} /> Associated College Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold">Batch Code / Section</label>
                  <input 
                    type="text"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g. Batch A / Class of 2026"
                    className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-txt-sub font-semibold">Company Access Key</label>
                  <input 
                    type="password"
                    value={companyKey}
                    onChange={(e) => setCompanyKey(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter Corporate Access Key"
                    className="h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs focus:outline-none focus:border-txt-main transition-colors font-mono disabled:opacity-60"
                  />
                  {companyKey && (
                    <span className="text-[9px] text-emerald-500 font-mono flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 size={10} /> Connected Employer Verified
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2.5 mt-2 border-t border-border-main/40 pt-3">
                  <input 
                    type="checkbox"
                    id="grantSharePermission"
                    checked={grantSharePermission}
                    onChange={(e) => setGrantSharePermission(e.target.checked)}
                    disabled={!isEditing}
                    className="mt-0.5 h-3.5 w-3.5 border border-border-main/85 bg-bg-base text-accent-main focus:ring-0 rounded-sm cursor-pointer disabled:opacity-60"
                  />
                  <label htmlFor="grantSharePermission" className="text-[10px] text-txt-sub leading-normal cursor-pointer select-none">
                    <strong>Grant Performance Sharing Permission</strong>: I authorize my linked College/Company coordinators to view, audit, and export my milestones, competitive scores, and code verification statuses.
                  </label>
                </div>
              </div>
            </div>

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

    </div>
  );
}
