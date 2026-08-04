"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { 
  Sparkles, 
  Users, 
  Award, 
  GraduationCap, 
  FileText, 
  Plus, 
  ArrowRight, 
  Send
} from "lucide-react";

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  description: string;
  materialType: "pdf" | "video" | "link" | "note";
  datePosted: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  maxMarks: number;
  status: "pending" | "submitted" | "graded";
}

export default function StudyDeskPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"classroom" | "study-room" | "ai-teach" | "assess">("classroom");

  // AI Teach States
  const [topicInput, setTopicInput] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [curriculum, setCurriculum] = useState<any | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

  // AI Tutor Chat state inside Study Mode
  const [aiChatQuery, setAiChatQuery] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  // Sync sub-tab from URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlQuery = window.location.search;
      queueMicrotask(() => {
        if (urlQuery.includes("tab=study-room") || urlQuery.includes("tab=room")) setActiveTab("study-room");
        else if (urlQuery.includes("tab=ai-teach") || urlQuery.includes("tab=teach")) setActiveTab("ai-teach");
        else if (urlQuery.includes("tab=assess") || urlQuery.includes("tab=exam")) setActiveTab("assess");
        else if (urlQuery.includes("tab=classroom")) setActiveTab("classroom");
      });
    }
  }, []);

  // Mock materials and assignments
  const materials: StudyMaterial[] = [
    {
      id: "mat_1",
      title: "Data Structures & Algorithms - Binary Trees & Heaps",
      subject: "Computer Science",
      description: "Comprehensive lecture notes and code implementations for binary search trees, AVL balancing, and min-heaps.",
      materialType: "pdf",
      datePosted: "Yesterday"
    },
    {
      id: "mat_2",
      title: "Operating Systems - Process Synchronization & Semaphores",
      subject: "Systems Engineering",
      description: "Module 3 slides covering mutex locks, classical concurrency problems, and deadlock handling.",
      materialType: "pdf",
      datePosted: "3 days ago"
    }
  ];

  const assignments: Assignment[] = [
    {
      id: "ass_1",
      title: "Assignment 4: Custom Red-Black Tree Implementation",
      subject: "Data Structures",
      dueDate: "Oct 18, 2026",
      maxMarks: 100,
      status: "pending"
    },
    {
      id: "ass_2",
      title: "Lab Milestone 2: Thread Pool & Task Scheduler",
      subject: "Systems Programming",
      dueDate: "Nov 05, 2026",
      maxMarks: 50,
      status: "submitted"
    }
  ];

  const handleGenerateCurriculum = () => {
    if (!topicInput.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generated = {
        topic: topicInput.trim(),
        difficulty,
        sections: [
          {
            title: `1. Fundamentals of ${topicInput.trim()}`,
            content: `Core concepts and foundational principles of ${topicInput.trim()}. Understand key definitions, architecture, and practical applications in modern software engineering.`,
            keyPoints: [
              `Core structure and terminology of ${topicInput.trim()}`,
              "Time and space complexity tradeoffs",
              "Real-world production usage scenarios"
            ],
            codeExample: `// Sample implementation preview for ${topicInput.trim()}\nfunction initializeConcept() {\n  console.log("Initializing ${topicInput.trim()} module...");\n  return true;\n}`
          },
          {
            title: `2. Deep Dive & Algorithms`,
            content: `Algorithmic details, edge case considerations, and optimized patterns when implementing ${topicInput.trim()} at scale.`,
            keyPoints: [
              "Optimizing memory allocations",
              "Handling concurrent access safely",
              "Benchmarking execution latency"
            ],
            codeExample: `// Advanced operations\nfunction executeAdvanced() {\n  // Optimized execution step\n}`
          }
        ]
      };
      setCurriculum(generated);
      setCurrentSectionIdx(0);
      setIsGenerating(false);
      setAiChatMessages([
        { role: "ai", text: `Hello! I am your AI Tutor for ${topicInput.trim()}. Feel free to ask me any questions about Section 1!` }
      ]);
    }, 1500);
  };

  const handleSendAiQuestion = () => {
    if (!aiChatQuery.trim()) return;
    const q = aiChatQuery.trim();
    setAiChatMessages(prev => [...prev, { role: "user", text: q }]);
    setAiChatQuery("");

    setTimeout(() => {
      setAiChatMessages(prev => [
        ...prev,
        { 
          role: "ai", 
          text: `Great question regarding "${q}". In the context of ${curriculum?.topic || "this topic"}, key considerations involve keeping complexity low and handling memory bounds efficiently.`
        }
      ]);
    }, 1000);
  };

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
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col font-sans selection:bg-accent-main selection:text-bg-base">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 pb-2 flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-main/40 pb-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-txt-muted">Academic Center</span>
            <h1 className="font-display text-3xl font-light tracking-tight text-txt-main">Study Desk & AI Tutor</h1>
            <p className="text-xs text-txt-sub">Access course materials, launch study rooms with classmates, or learn any topic interactively with AI.</p>
          </div>

          {/* Sub-Tab Bar */}
          <div className="flex border border-border-main/80 rounded p-0.5 bg-bg-card/50 self-start font-mono text-[10px] tracking-wider uppercase flex-wrap gap-0.5">
            <button 
              onClick={() => setActiveTab("classroom")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "classroom" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Classroom & Materials
            </button>
            <button 
              onClick={() => setActiveTab("study-room")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "study-room" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Study Rooms
            </button>
            <button 
              onClick={() => setActiveTab("ai-teach")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "ai-teach" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              AI Teaching Mode
            </button>
            <button 
              onClick={() => setActiveTab("assess")}
              className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer ${
                activeTab === "assess" ? "bg-accent-main text-bg-base font-semibold" : "text-txt-sub hover:text-txt-main"
              }`}
            >
              Test & Assess
            </button>
          </div>
        </div>

        {/* 1. Classroom & Materials Tab */}
        {activeTab === "classroom" && (
          <div className="flex flex-col gap-6 pb-8">
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-amber-500" />
                  <span className="font-display text-sm font-semibold text-txt-main">Faculty Uploaded Materials</span>
                </div>
                <span className="text-[10px] font-mono text-txt-muted">{materials.length} Materials Available</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map(m => (
                  <div key={m.id} className="border border-border-main/50 bg-bg-base/40 p-4 rounded flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded self-start">
                        {m.subject}
                      </span>
                      <h4 className="text-xs font-semibold text-txt-main">{m.title}</h4>
                      <p className="text-[11px] text-txt-sub font-light leading-relaxed">{m.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border-main/30 text-[9px] font-mono text-txt-muted">
                      <span>Posted: {m.datePosted}</span>
                      <button className="text-accent-main hover:underline flex items-center gap-1">
                        View Material <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments Section */}
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  <span className="font-display text-sm font-semibold text-txt-main">Pending Assignments</span>
                </div>
                <span className="text-[10px] font-mono text-txt-muted">{assignments.length} Active Tasks</span>
              </div>

              <div className="flex flex-col gap-3">
                {assignments.map(a => (
                  <div key={a.id} className="border border-border-main/50 bg-bg-base/40 p-4 rounded flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-txt-main">{a.title}</span>
                        <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded border ${
                          a.status === "submitted" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}>
                          {a.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-txt-muted font-mono">{a.subject} • Due: {a.dueDate} • Max Marks: {a.maxMarks}</span>
                    </div>

                    <button className="h-7 px-3 bg-accent-main text-bg-base font-mono text-[9px] uppercase tracking-wider font-semibold rounded hover:opacity-90 transition-opacity">
                      {a.status === "submitted" ? "View Submission" : "Submit Assignment"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Study Rooms Tab */}
        {activeTab === "study-room" && (
          <div className="flex flex-col gap-6 pb-8">
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="font-display text-sm font-semibold text-txt-main">Live Collaborative Study Rooms</span>
                </div>
                <button className="h-7 px-3 bg-accent-main text-bg-base font-mono text-[9px] uppercase tracking-wider font-semibold rounded flex items-center gap-1">
                  <Plus size={10} /> Create Study Room
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border-main/50 bg-bg-base/40 p-4 rounded flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-txt-main">Data Structures Deep Dive Room</span>
                    <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      3 Members Online
                    </span>
                  </div>
                  <p className="text-[11px] text-txt-sub font-light">Collaborative study room focused on tree balancing and graph traversal problems.</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border-main/30 text-[9px] font-mono text-txt-muted">
                    <span>Host: @Shreeprasandh</span>
                    <button className="text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                      Enter Room <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. AI Teaching Mode Tab */}
        {activeTab === "ai-teach" && (
          <div className="flex flex-col gap-6 pb-8">
            {!curriculum ? (
              <div className="border border-border-main/70 bg-bg-surface p-6 sm:p-8 rounded-md flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-[10px] uppercase tracking-widest font-bold">
                    <Sparkles size={14} /> AI Interactive Learning Engine
                  </div>
                  <h3 className="font-display text-xl font-semibold text-txt-main">What topic would you like to learn today?</h3>
                  <p className="text-xs text-txt-sub font-light">Enter any technical topic, and Gemini AI will structure a point-by-point curriculum with quizzes after each section.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. Binary Search Trees, React Hooks, TCP/IP Handshake..."
                    className="flex-1 h-11 px-4 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs placeholder:text-txt-muted/50 focus:outline-none focus:border-txt-main font-mono"
                  />
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="h-11 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <button 
                    onClick={handleGenerateCurriculum}
                    disabled={isGenerating || !topicInput.trim()}
                    className="h-11 px-5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? "Generating..." : "Generate AI Lesson"} <Sparkles size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Section Content (8 cols) */}
                <div className="lg:col-span-8 border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                    <span className="font-display text-base font-semibold text-txt-main">
                      {curriculum.sections[currentSectionIdx]?.title}
                    </span>
                    <span className="text-[10px] font-mono text-txt-muted uppercase">
                      Section {currentSectionIdx + 1} of {curriculum.sections.length}
                    </span>
                  </div>

                  <p className="text-xs text-txt-main leading-relaxed font-light">
                    {curriculum.sections[currentSectionIdx]?.content}
                  </p>

                  <div className="border border-purple-500/30 bg-purple-500/[0.04] p-4 rounded flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Key Concept Points</span>
                    <ul className="list-disc list-inside text-xs text-txt-sub flex flex-col gap-1 font-light">
                      {curriculum.sections[currentSectionIdx]?.keyPoints?.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  {curriculum.sections[currentSectionIdx]?.codeExample && (
                    <div className="border border-border-main/80 bg-bg-base p-4 rounded font-mono text-xs text-emerald-400 overflow-x-auto">
                      <pre>{curriculum.sections[currentSectionIdx]?.codeExample}</pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border-main/40 pt-4 mt-2">
                    <button 
                      onClick={() => setCurrentSectionIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentSectionIdx === 0}
                      className="h-8 px-4 border border-border-main text-txt-main font-mono text-[10px] uppercase rounded disabled:opacity-40"
                    >
                      ← Previous Section
                    </button>
                    <button 
                      onClick={() => setCurrentSectionIdx(prev => Math.min(curriculum.sections.length - 1, prev + 1))}
                      disabled={currentSectionIdx === curriculum.sections.length - 1}
                      className="h-8 px-4 bg-purple-600 text-white font-mono text-[10px] uppercase font-semibold rounded disabled:opacity-40"
                    >
                      Next Section →
                    </button>
                  </div>
                </div>

                {/* AI Tutor Sidebar Chat (4 cols) */}
                <div className="lg:col-span-4 border border-border-main/70 bg-bg-surface p-5 rounded-md flex flex-col justify-between h-[450px]">
                  <div className="flex items-center gap-2 border-b border-border-main/40 pb-3 text-purple-400 font-mono text-xs font-semibold">
                    <Sparkles size={14} /> AI Tutor Chat
                  </div>

                  <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-3 pr-1 text-xs">
                    {aiChatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded max-w-[90%] font-light ${
                          msg.role === "user" 
                            ? "bg-purple-600/20 text-txt-main border border-purple-500/30 self-end" 
                            : "bg-bg-base text-txt-sub border border-border-main/60 self-start"
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 border-t border-border-main/40 pt-3">
                    <input 
                      type="text" 
                      value={aiChatQuery}
                      onChange={(e) => setAiChatQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAiQuestion()}
                      placeholder="Ask AI Tutor a question..."
                      className="flex-1 h-9 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs focus:outline-none font-mono"
                    />
                    <button 
                      onClick={handleSendAiQuestion}
                      className="h-9 px-3 bg-purple-600 text-white rounded cursor-pointer"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Test & Assess Tab */}
        {activeTab === "assess" && (
          <div className="flex flex-col gap-6 pb-8">
            <div className="border border-border-main/70 bg-bg-surface p-6 rounded-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-main/40 pb-3">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-emerald-400" />
                  <span className="font-display text-sm font-semibold text-txt-main">Knowledge Evaluation & Self Exam</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                  Exam Engine Live
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-xs text-txt-sub font-light">Generate a timed evaluation exam on any computer science topic or custom difficulty setting.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    placeholder="Exam Topic (e.g. Operating Systems)"
                    className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono"
                  />
                  <select className="h-10 px-3 border border-border-main/80 bg-bg-base text-txt-main rounded text-xs font-mono">
                    <option>10 Questions (15 mins)</option>
                    <option>20 Questions (30 mins)</option>
                  </select>
                  <button className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold tracking-wider rounded cursor-pointer transition-colors">
                    Start Self Exam
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
