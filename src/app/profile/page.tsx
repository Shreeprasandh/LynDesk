"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Link from "next/link";
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
  Info
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
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  
  // Academic details
  const [collegeName, setCollegeName] = useState("");
  const [department, setDepartment] = useState("");
  const [gradYear, setGradYear] = useState("");
  
  // Interface states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [linking, setLinking] = useState(false);
  
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
        setResumeUrl(meta.resume_url || "");
        setResumeFileName(meta.resume_file_name || "");
        setCollegeName(meta.college_name || (profile?.institutes && profile.institutes.name) || "");
        setDepartment(meta.department || "");
        setGradYear(meta.graduation_year || "");
        
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
    if (!fullName.trim() || !username.trim()) {
      setMessage({ text: "Full Name and Username are required.", type: "error" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // 1. Update public profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: username.trim(),
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          is_profile_public: isPublic,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 2. Update metadata in Auth users to keep optional fields in sync
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          username: username.trim(),
          avatar_url: avatarUrl,
          bio: bio.trim(),
          skills: skills.trim(),
          github_url: githubUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          discord_username: discordUsername.trim(),
          resume_url: resumeUrl,
          resume_file_name: resumeFileName,
          college_name: collegeName.trim(),
          department: department.trim(),
          graduation_year: gradYear.trim()
        }
      });

      if (error) throw error;

      setMessage({ text: "Profile details updated successfully.", type: "success" });
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-base text-txt-muted font-mono text-xs">
        <span className="h-5 w-5 rounded-full border border-txt-main/20 border-t-txt-main animate-spin mr-2" />
        LOADING PORTFOLIO RECORD...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      
      {/* Header (Unified Navigation & Notifications Drawer) */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-bg-base/30 py-8 px-4 md:px-12 max-w-5xl w-full mx-auto flex flex-col gap-6">
        
        <Link 
          href="/"
          className="flex items-center gap-2 text-[10px] text-txt-muted hover:text-txt-main transition-colors font-mono tracking-wider uppercase self-start"
        >
          <ArrowLeft size={12} />
          Back to Portal
        </Link>

        <div className="flex flex-col gap-2 border-b border-border-main/40 pb-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Identity Control</span>
          <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Your Technical Profile</h1>
          <p className="text-xs text-txt-sub">Manage authentication credentials, upload resumes, and connect social identities.</p>
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
          <form onSubmit={handleSaveProfile} className="lg:col-span-7 flex flex-col gap-6">
            
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
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white text-[10px] uppercase font-mono font-bold"
                  >
                    {uploadingAvatar ? "..." : "Edit"}
                  </button>
                  <input 
                    type="file" 
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
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
                      placeholder="Mira Sen"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-txt-sub font-semibold">Username handle</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="mirasen"
                      className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-sm placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
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
                  className="w-4 h-4 rounded border-border-main text-accent-main focus:ring-accent-main"
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
                  placeholder="Tell us about your developer specialties, hackathon goals, or stack specialties..."
                  className="p-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-txt-sub font-semibold">Skills & Stack Specialties (comma-separated)</label>
                <input 
                  type="text" 
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Next.js, TypeScript, PostgreSQL, Figma, UI/UX"
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light"
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
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                  />
                  
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
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
                    placeholder="https://github.com/username"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
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
                    placeholder="https://linkedin.com/in/username"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-txt-sub font-semibold flex items-center gap-1.5">
                  <DiscordIcon size={12} /> Discord Username
                </label>
                <input 
                  type="text" 
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="username#0000"
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-mono"
                />
              </div>
            </div>

            {/* College & Department Panel */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Credentials (Optional)</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-txt-sub font-semibold">Institute / College Name</label>
                <input 
                  type="text" 
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="MIT / IIT Delhi / Stanford University"
                  className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold">Department / Major</label>
                  <input 
                    type="text" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-txt-sub font-semibold">Graduation Year</label>
                  <input 
                    type="text" 
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="2027"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded-sm text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main transition-colors font-light"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full h-11 bg-accent-main hover:opacity-90 disabled:opacity-50 text-bg-base font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity cursor-pointer"
            >
              {saving ? (
                <span className="h-4 w-4 rounded-full border border-bg-base/30 border-t-bg-base animate-spin" />
              ) : (
                <>
                  <Save size={14} className="stroke-[1.5]" />
                  Save Profile Records
                </>
              )}
            </button>
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

          </section>

        </div>

      </main>

    </div>
  );
}
