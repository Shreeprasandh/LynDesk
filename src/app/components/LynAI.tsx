"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Cpu, 
  Award, 
  Compass, 
  BookOpen 
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "lynai";
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

export default function LynAI() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User details for personalized AI context
  const [studentMeta, setStudentMeta] = useState<Record<string, string | boolean | number>>({});

  useEffect(() => {
    if (user) {
      const handle = setTimeout(() => {
        setStudentMeta(user.user_metadata || {});
        // Welcome message
        const name = user.user_metadata?.full_name || "Engineer";
        setMessages([
          {
            id: "welcome",
            sender: "lynai",
            text: `Greetings, ${name}! I am LynAI, your academic and talent co-pilot. I have synchronized with your LynDesk profile.\n\nHow can I accelerate your portfolio today? Choose a quick action below or ask me anything!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const simulateAISponse = async (userPrompt: string) => {
    setIsTyping(true);
    
    // Process prompts with premium contextual answers
    let aiResponse = "";
    let actionLink: { label: string; href: string } | undefined = undefined;
    const promptLower = userPrompt.toLowerCase();

    // Context variable resolutions
    const name = studentMeta.full_name || "Student Developer";
    const college = studentMeta.college_name || "your college";
    const skills = studentMeta.skills || "React, JavaScript, Node.js";
    const leetcode = studentMeta.leetcode_username || "not linked";

    if (promptLower.includes("profile") || promptLower.includes("settings") || promptLower.includes("account") || promptLower.includes("bio") || promptLower.includes("change my name") || promptLower.includes("resume upload") || promptLower.includes("college key") || promptLower.includes("company key")) {
      aiResponse = `### 👤 LynDesk Profile Settings
To modify your account profile, change academic details, enter institution registrar validation codes, or upload your verified resume PDF, go to settings:`;
      actionLink = { label: "Go to Profile Settings", href: "/profile" };
    } else if (promptLower.includes("leetcode") || promptLower.includes("codeforces") || promptLower.includes("codechef") || promptLower.includes("unstop") || promptLower.includes("hack2skill") || promptLower.includes("coding deck") || promptLower.includes("daily problem") || promptLower.includes("streak") || promptLower.includes("solve")) {
      aiResponse = `### 💻 Competitive Coding Deck
Sync your competitive coding handles, inspect solved problems, daily streaks, activity calendars, and access official coding contests:`;
      actionLink = { label: "Go to Coding Deck", href: "/coding-deck" };
    } else if (promptLower.includes("explore") || promptLower.includes("teammates") || promptLower.includes("partners") || promptLower.includes("hackathons") || promptLower.includes("events") || promptLower.includes("classmates")) {
      aiResponse = `### 🔍 Matchmaking & Events Arena
Search peer directories, coordinate hackathon teams, browse global developer meetups, and find project collaborators:`;
      actionLink = { label: "Go to Explore Arena", href: "/explore" };
    } else if (promptLower.includes("faculty") || promptLower.includes("coordinator") || promptLower.includes("approve") || promptLower.includes("claims") || promptLower.includes("verify points")) {
      aiResponse = `### 🎓 Faculty coordinator desk
The Faculty Coordinator Console allows college staff or company admins to verify credit applications and audit registry spreadsheets.`;
      actionLink = { label: "Go to Faculty Console", href: "/coordinator" };
    } else if (promptLower.includes("leaderboard") || promptLower.includes("ranking") || promptLower.includes("who is top")) {
      aiResponse = `### 🏆 Global Leaderboard
Compare scores, LeetCode milestones, and verified extracurricular credit standings with other student engineers across institutions:`;
      actionLink = { label: "Go to Leaderboard", href: "/leaderboard" };
    } else if (promptLower.includes("dashboard") || promptLower.includes("workspace") || promptLower.includes("gantt") || promptLower.includes("tasks") || promptLower.includes("create project")) {
      aiResponse = `### 🗂️ Active Workspace Dashboard
Manage your active project channels, group chats, kanban lists, calendar plans, and git bot validation tasks:`;
      actionLink = { label: "Go to Dashboard", href: "/" };
    } else if (promptLower.includes("bubble sort")) {
      aiResponse = `### 💡 Bubble Sort Explanation
Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. 

Here is a quick JavaScript sample:
\`\`\`javascript
function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
\`\`\``;
    } else if (promptLower.includes("audit") || promptLower.includes("portfolio")) {
      aiResponse = `### 📊 LynAI Portfolio Audit for ${name}
- **College Link**: \`${college}\`
- **Technical Skills**: ${skills}
- **LeetCode Integration**: \`@${leetcode}\`

#### 🔍 Analysis:
1. **Competitive Edge**: Your linked profile demonstrates core competencies in **Frontend Web Design** and **Algorithmic Solves**.
2. **Next Steps**:
   - Link your **Codeforces** handle to show active contest participation.
   - Boost your skill index by solving 2 medium problems on arrays daily to build consistency.
   - Your profile is currently **Public** - this means verified recruiters on LynDesk can see your metrics!`;
    } else if (promptLower.includes("placement") || promptLower.includes("job") || promptLower.includes("career")) {
      aiResponse = `### 🎯 Placement Readiness Roadmap
Based on your skillset (${skills}) and college association, here is your career recommendation:

1. **Target Roles**: Full-Stack Engineer, Associate Software Engineer, Systems Architect.
2. **Key Employers Matching**: Google, Microsoft, TCS, Goldman Sachs.
3. **LynDesk Placement Checklist**:
   - [ ] Sync your **Portfolio URL** in settings to show live demos of your projects.
   - [ ] Apply for **Verification Credits** on your hackathon codes so recruiters know your codebase is authenticated.
   - [ ] Complete the upcoming **TCS Mock Challenge** under the Explore tab next week.`;
    } else if (promptLower.includes("idea") || promptLower.includes("hackathon")) {
      aiResponse = `### 💡 Custom Hackathon Project Idea: "EduBlock Portal"
*Perfect fit for: ${skills}*

* **Concept**: A decentralized, tamper-proof transcript and credentials wallet where colleges issue graduation credits directly to student addresses (using smart contracts).
* **Tech Stack**: Next.js (frontend), Supabase (Auth/JSON databases), Ethers.js/Solidity (Web3 integration).
* **MVP Roadmap**:
  1. Build a credential registration page.
  2. Implement verification workflow (similar to the LynDesk Coordinator desk).
  3. Hook up Metamask/wallet authentication.`;
    } else if (promptLower.includes("resume") || promptLower.includes("cv")) {
      aiResponse = `### 📝 Optimized Resume Layout (Markdown Format)
Copy the structure below to use in your portfolio:

\`\`\`markdown
# ${name}
*Email: ${user?.email} | College: ${college}*

## TECHNICAL SKILLS
* Languages: JavaScript, Python, TypeScript
* Frameworks: React, Next.js, CSS Grid
* Tools & Databases: Git, GitHub, Supabase

## HACKATHON PROJECTS
### Project Space Claim on LynDesk
* Built a collaborative workspace featuring real-time chat and milestone tracking.
* Synced active GitHub commits verified by LDK:BOT.
\`\`\``;
    } else {
      aiResponse = `I received your request: "${userPrompt}". 

As your LynAI Co-pilot, I can assist you with academic roadmaps, code explanations, and direct app navigation! 

*Pro Tip: Ask me "how do I link my leetcode?" or "where can I change my profile?" to get direct navigation buttons!*`;
    }

    // Simulate streaming typing effect
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "lynai",
          text: aiResponse,
          actionLink: actionLink,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    simulateAISponse(userMsg.text);
  };

  const selectQuickAction = (actionText: string) => {
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: actionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    simulateAISponse(actionText);
  };

  return (
    <>
      {/* Floating AI circular trigger button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-[9999] h-12 w-12 bg-accent-main opacity-60 hover:opacity-100 text-bg-base rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border border-accent-main/40 cursor-pointer animate-bounce"
        style={{ animationDuration: '3s' }}
        title="Ask LynAI Co-Pilot"
      >
        <Sparkles size={20} className="animate-pulse stroke-[2]" />
      </button>

      {/* Floating Chat Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] overflow-hidden font-sans">
          {/* Backdrop blur */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md border-l border-border-main/70 bg-bg-surface flex flex-col h-full shadow-2xl animate-fade-in">
              
              {/* AI Drawer Header */}
              <div className="px-6 py-5 border-b border-border-main/40 bg-bg-card/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-accent-main/15 flex items-center justify-center border border-accent-main/30">
                    <Cpu size={16} className="text-accent-main animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-accent-main font-bold">Quantum Engine v1.4</span>
                    <h2 className="text-sm font-semibold text-txt-main">LynAI Assistant</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-card text-txt-muted hover:text-txt-main cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
                  >
                    <div className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center border ${
                      msg.sender === "user" 
                        ? "bg-bg-card border-border-main" 
                        : "bg-accent-main/10 border-accent-main/30"
                    }`}>
                      {msg.sender === "user" ? (
                        <User size={12} className="text-txt-sub" />
                      ) : (
                        <Bot size={12} className="text-accent-main" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className={`px-4 py-3 rounded text-xs leading-relaxed whitespace-pre-line ${
                        msg.sender === "user"
                          ? "bg-accent-main text-bg-base font-medium rounded-tr-none"
                          : "bg-bg-base/60 border border-border-main/50 text-txt-sub rounded-tl-none font-light"
                      }`}>
                        {msg.text}

                        {msg.actionLink && (
                          <Link 
                            href={msg.actionLink.href}
                            onClick={() => setIsOpen(false)}
                            className="mt-3 block w-full text-center h-8 leading-8 bg-accent-main hover:opacity-90 text-bg-base text-[9px] font-mono tracking-wider uppercase rounded transition-opacity font-bold"
                          >
                            {msg.actionLink.label} &rarr;
                          </Link>
                        )}
                      </div>
                      <span className="text-[8px] text-txt-muted font-mono tracking-wider self-end px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 max-w-[85%] self-start">
                    <div className="h-7 w-7 rounded-full bg-accent-main/10 border border-accent-main/30 flex items-center justify-center animate-spin">
                      <Cpu size={12} className="text-accent-main" />
                    </div>
                    <div className="px-4 py-3 rounded-md bg-bg-base/60 border border-border-main/50 text-txt-muted text-xs font-mono">
                      LynAI is reading profile and auditing...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Panel */}
              <div className="px-6 py-3 border-t border-border-main/40 bg-bg-base/20 flex flex-wrap gap-2">
                <button 
                  onClick={() => selectQuickAction("Audit my portfolio")}
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-border-main/80 bg-bg-surface hover:bg-bg-card text-txt-sub hover:text-txt-main text-[9px] font-mono rounded cursor-pointer transition-all"
                >
                  <Award size={10} /> Portfolio Audit
                </button>
                <button 
                  onClick={() => selectQuickAction("Placement readiness")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border-main/80 bg-bg-surface hover:bg-bg-card text-txt-sub hover:text-txt-main text-[9px] font-mono rounded cursor-pointer transition-all"
                >
                  <Compass size={10} /> Career Placements
                </button>
                <button 
                  onClick={() => selectQuickAction("Hackathon ideas")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border-main/80 bg-bg-surface hover:bg-bg-card text-txt-sub hover:text-txt-main text-[9px] font-mono rounded cursor-pointer transition-all"
                >
                  <Terminal size={10} /> Project Ideas
                </button>
                <button 
                  onClick={() => selectQuickAction("Generate resume layout")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border-main/80 bg-bg-surface hover:bg-bg-card text-txt-sub hover:text-txt-main text-[9px] font-mono rounded cursor-pointer transition-all"
                >
                  <BookOpen size={10} /> Optimize Resume
                </button>
              </div>

              {/* Form Input Message bar */}
              <form onSubmit={handleSend} className="p-4 border-t border-border-main/40 bg-bg-card/25 flex gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask LynAI about code, contests, or resumes..."
                  className="flex-1 h-9 px-3 bg-bg-base border border-border-main/80 text-txt-main text-xs rounded-sm focus:outline-none focus:border-accent-main placeholder:text-txt-muted/60 transition-colors"
                />
                <button 
                  type="submit"
                  className="h-9 w-9 bg-accent-main hover:opacity-90 text-bg-base rounded-sm flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <Send size={12} />
                </button>
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
