import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { stripEmojis, checkRateLimit, isHarassmentOrOffensive } from "@/app/lib/moderation";

// Natural, human-like conversational fallback engine with complete platform knowledge
function generateConversationalFallback(
  userPrompt: string, 
  userName?: string, 
  profileContext?: any
): { response: string; actionLink?: { label: string; href: string } } {
  const p = (userPrompt || "").trim().toLowerCase();
  const name = userName || profileContext?.name || "there";

  // 1. Password Management & Account Security
  if (p.includes("password") || p.includes("reset pass") || p.includes("change pass") || p.includes("forgot pass") || p.includes("security")) {
    if (p.includes("forgot") || p.includes("cant login") || p.includes("lost")) {
      return {
        response: `If you have forgotten your password or cannot log in, head to the **Home Page** login modal and click **"Forgot Password?"**.\n\nEnter your registered email address to receive a secure one-time passcode (OTP). Once verified, you can immediately set a new password and regain access to your account.`,
        actionLink: { label: "Go to Home", href: "/" }
      };
    }
    return {
      response: `To change your account password:\n\n1. Open **Profile Settings** from the navigation bar.\n2. Scroll down to the **Security & Password** section.\n3. Enter your **New Password** meeting the security rules (8+ characters, uppercase, lowercase, numeric digit, and special character).\n4. Confirm your new password and click **Update Password**.\n\nYour session credentials will immediately update across all devices.`,
      actionLink: { label: "Go to Security Settings", href: "/profile" }
    };
  }

  // 2. College / University Linking Intent
  if (p.includes("college") || p.includes("university") || p.includes("institute") || p.includes("campus") || p.includes("institution") || p.includes("registrar key") || p.includes("college key")) {
    return {
      response: `You can link your university or college directly in **Profile Settings**.\n\nNavigate to the **Institutional Affiliation** section on your profile page and enter your official **College Key** or Passcode provided by your campus coordinator.\n\nOnce saved, your verified student status, department, academic year, and section will automatically sync with your campus directory!`,
      actionLink: { label: "Go to Profile Settings", href: "/profile" }
    };
  }

  // 3. Coding Desk & Platform Handles (LeetCode, CodeChef, HackerRank, GFG, Codeforces)
  if (p.includes("leetcode") || p.includes("codeforces") || p.includes("codechef") || p.includes("hackerrank") || p.includes("geeksforgeeks") || p.includes("gfg") || p.includes("coding") || p.includes("streak") || p.includes("dcc") || p.includes("handle")) {
    return {
      response: `You can track and sync your competitive programming profiles right from the **Code Desk**.\n\nWe support real-time sync for **LeetCode, CodeChef, HackerRank, GeeksforGeeks, and Codeforces**. You can manage your linked handles in Profile Settings or directly inside the Code Desk portal modal.`,
      actionLink: { label: "Open Code Desk", href: "/coding-deck" }
    };
  }

  // 4. Study Desk & DSA Mastery
  if (p.includes("study") || p.includes("dsa") || p.includes("curriculum") || p.includes("lesson") || p.includes("quiz") || p.includes("learn") || p.includes("algorithm") || p.includes("data structure")) {
    return {
      response: `The **Study Desk** is your interactive technical learning hub.\n\nYou can work through structured DSA mastery roadmaps, practice coding in the sandbox editor, review mistake flashcards, and test your knowledge with interactive AI quizzes and automated code grading.`,
      actionLink: { label: "Open Study Desk", href: "/study-desk" }
    };
  }

  // 5. Event Desk & Workspaces
  if (p.includes("event") || p.includes("workspace") || p.includes("project") || p.includes("milestone") || p.includes("stage") || p.includes("hackathon") || p.includes("task") || p.includes("kanban")) {
    return {
      response: `The **Event Desk** is your command center for hackathons and team projects.\n\nCreate dedicated project workspaces, assign tasks to teammates, track milestone deadlines, and prepare verified project deliverables for submission.`,
      actionLink: { label: "Open Event Desk", href: "/event-desk" }
    };
  }

  // 6. Explore & Teammate Matchmaking
  if (p.includes("explore") || p.includes("teammate") || p.includes("match") || p.includes("partner") || p.includes("friend") || p.includes("invite") || p.includes("find student")) {
    return {
      response: `Looking for teammates for your next hackathon? The **Explore Arena** lets you search for student developers by tech stack, department, and coding rank.\n\nYou can send collaboration invites directly to peers and form teams in seconds.`,
      actionLink: { label: "Open Explore Arena", href: "/explore" }
    };
  }

  // 7. Profile & Settings
  if (p.includes("profile") || p.includes("settings") || p.includes("resume") || p.includes("avatar") || p.includes("bio") || p.includes("github") || p.includes("linkedin") || p.includes("portfolio")) {
    return {
      response: `You can customize your developer identity, upload your resume, update social links (GitHub, LinkedIn, Discord, Portfolio), and manage your coding handles in **Profile Settings**.\n\nIt is also where you enter your College Key to connect with your institution.`,
      actionLink: { label: "Go to Profile Settings", href: "/profile" }
    };
  }

  // 8. Faculty / Coordinator Portal
  if (p.includes("coordinator") || p.includes("faculty") || p.includes("hod") || p.includes("staff") || p.includes("broadcast")) {
    return {
      response: `The **Faculty & Coordinator Portal** allows department coordinators and HODs to view student performance metrics, review project works and certificates, dispatch institutional broadcasts, and recommend curated hackathons to students.`,
      actionLink: { label: "Go to Coordinator Portal", href: "/coordinator" }
    };
  }

  // 9. Recruiter Hub
  if (p.includes("recruiter") || p.includes("hiring") || p.includes("talent") || p.includes("candidate")) {
    return {
      response: `The **Recruiter Hub** provides verified corporate partners access to verified student talent portfolios, filtered by verified competitive ranks, projects, and academic qualifications.`,
      actionLink: { label: "Go to Recruiter Hub", href: "/recruiter" }
    };
  }

  // 10. Admin Master Deck
  if (p.includes("admin") || p.includes("master deck") || p.includes("college structure")) {
    return {
      response: `The **Admin Master Deck** gives institutional administrators complete governance over campus departments, academic sections, coordinator access keys, and recruiter PINs.`,
      actionLink: { label: "Go to Admin Deck", href: "/admin" }
    };
  }

  // 11. Greetings
  if (/^(hi|hello|hey|greetings|sup|hola|hi there|hello there)\b/i.test(p)) {
    return {
      response: `Hey ${name}! I'm LynAI, your developer companion on LynDesk.\n\nWhether you want to change your password, sync your coding handles, manage hackathon workspaces, practice DSA, or link your college, I'm here to help. What are you working on today?`
    };
  }

  // 12. Status & Wellbeing
  if (/how (are|r) (you|u)|how's it going|how are things|doing well/i.test(p)) {
    return {
      response: `I'm running great and ready to help you build, ${name}!\n\nWe can check your LeetCode daily target, look up project stages on Event Desk, or dive into some coding problems. What would you like to tackle?`
    };
  }

  // 13. Capabilities & Features
  if (/what\s*can|capabilities|features|help|who\s*are\s*you|what\s*are\s*you|ability|whatdo/i.test(p)) {
    return {
      response: `I'm your intelligent co-pilot on LynDesk, designed to make tracking and building your developer career effortless.\n\nHere are some of the main things we can do together:\n\n- **Account & Security**: Update your password, manage linked profiles, and configure notification preferences.\n- **College & Portfolio**: Link your college via your College Key, showcase your verified projects, and update your resume.\n- **Code Desk**: Sync and monitor your live problem-solving stats across LeetCode, CodeChef, HackerRank, GeeksforGeeks, and Codeforces.\n- **Event Desk & Workspaces**: Manage your hackathons, track stage deadlines, and collaborate live with your team.\n- **Study Desk**: Master Data Structures & Algorithms with structured curricula, coding practice, and revision banks.\n- **Matchmaking & Explore**: Find classmates and hackathon teammates filtered by tech stack.\n\nLet me know what you'd like to jump into!`,
      actionLink: { label: "Explore Code Desk", href: "/coding-deck" }
    };
  }

  // 14. CS Concepts
  if (p.includes("array") || p.includes("list")) {
    return {
      response: `An **Array** is a fundamental linear data structure that stores elements in contiguous memory locations.\n\nIt provides instant O(1) random access when you know the index, but insertions or deletions in the middle require O(N) time to shift elements. In JavaScript and Python, arrays/lists are dynamically sized for convenience.`
    };
  }

  if (p.includes("tree") || p.includes("bst")) {
    return {
      response: `A **Binary Search Tree (BST)** is a hierarchical node-based structure where each node has at most two children.\n\nFor every node, all values in its left subtree are strictly smaller, and all values in its right subtree are greater. This allows O(log N) average-case time for search, insertion, and deletion.`
    };
  }

  if (p.includes("graph")) {
    return {
      response: `A **Graph** consists of a collection of vertices (nodes) connected by edges.\n\nCommon graph traversal techniques include **Breadth-First Search (BFS)**, which explores layer-by-layer using a queue (ideal for shortest paths in unweighted graphs), and **Depth-First Search (DFS)**, which explores along branches using a stack or recursion.`
    };
  }

  // Default Friendly, Natural Fallback
  return {
    response: `I'm here to help with anything on LynDesk or software development!\n\nYou can ask me how to change your password, link your college, track your coding stats, structure your project workspaces, or master Data Structures & Algorithms. What would you like to explore?`
  };
}

function detectActionLink(userPrompt: string, replyText: string): { label: string; href: string } | undefined {
  const p = (userPrompt || "").toLowerCase();
  const r = (replyText || "").toLowerCase();

  if (/\b(password|security|change password|reset password|update password)\b/i.test(p) || r.includes("security & password") || r.includes("security settings")) {
    return { label: "Go to Security & Password", href: "/profile" };
  }
  if (/\b(college|university|institution|my profile|edit profile|change username|my settings|update handle|resume)\b/i.test(p) || r.includes("/profile")) {
    return { label: "Go to Profile Settings", href: "/profile" };
  }
  if (/\b(find teammate|matchmaking|student directory|invite team|explore)\b/i.test(p) || r.includes("/explore")) {
    return { label: "Open Matchmaking Arena", href: "/explore" };
  }
  if (/\b(code desk|daily challenge|my streak|coding desk|leetcode|hackerrank|geeksforgeeks|codeforces|codechef)\b/i.test(p) || r.includes("/coding-desk")) {
    return { label: "Open Code Desk", href: "/coding-deck" };
  }
  if (/\b(event desk|hackathon vault|workspace|project stage)\b/i.test(p) || r.includes("/event-desk")) {
    return { label: "Open Event Desk", href: "/event-desk" };
  }
  if (/\b(study desk|ai tutor|generate curriculum|dsa|learning path)\b/i.test(p) || r.includes("/study-desk")) {
    return { label: "Open Study Desk", href: "/study-desk" };
  }
  if (/\b(coordinator|faculty|hod|broadcast)\b/i.test(p) || r.includes("/coordinator")) {
    return { label: "Go to Coordinator Portal", href: "/coordinator" };
  }
  if (/\b(recruiter|hiring|talent)\b/i.test(p) || r.includes("/recruiter")) {
    return { label: "Go to Recruiter Hub", href: "/recruiter" };
  }
  if (/\b(admin|master deck)\b/i.test(p) || r.includes("/admin")) {
    return { label: "Go to Admin Deck", href: "/admin" };
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Protection (Max 25 requests/min per IP)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimit = checkRateLimit(`ai_chat_${clientIp}`, 25, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        response: "You are sending messages too quickly. Please pause for a moment before asking LynAI another question.",
        isMock: true,
        rateLimited: true
      },
      { status: 429 }
    );
  }

  let userPrompt = "";
  let profileContext: any = null;

  try {
    const body = await req.json();
    const { messages, userPrompt: inputPrompt, profileContext: pCtx, workspaceContext } = body;
    userPrompt = inputPrompt || "";
    profileContext = pCtx;

    // 2. Safety & Anti-Harassment Screening
    const safetyCheck = isHarassmentOrOffensive(userPrompt);
    if (!safetyCheck.safe) {
      return NextResponse.json({
        response: "I am committed to maintaining a respectful and constructive learning environment. I cannot assist with requests involving harassment, abuse, or offensive content.",
        isMock: true
      });
    }

    const now = new Date();
    const liveTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const liveDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const contextPrompt = `You are LynAI, an intelligent, human-like developer companion and engineering co-pilot on the LynDesk platform.

CURRENT TEMPORAL CONTEXT: ${liveDate} at ${liveTime}.
${workspaceContext ? `ACTIVE WORKSPACE CONTEXT: ${JSON.stringify(workspaceContext)}` : ""}
${profileContext ? `STUDENT DEVELOPER CONTEXT: ${JSON.stringify(profileContext)}` : ""}

YOUR PERSONA & COMMUNICATION STYLE:
1. NATURAL & HUMAN-LIKE: Speak like a seasoned, sharp, yet warm senior developer and peer mentor. Avoid generic AI mannerisms, robotic introductions, or repetitive filler.
2. CLEAN PARAGRAPH STRUCTURE: Write clean, well-aligned paragraphs. Avoid rigid walls of bullets unless a structured list is explicitly helpful.
3. BRIEF, CONCISE & PRECISE: Answer directly, accurately, and thoughtfully. Eliminate robotic disclaimers.
4. STRICT ZERO EMOJIS: Never use any emojis, emoticons, or decorative icons in any response under any circumstances.
5. TECHNICAL EXCELLENCE: Provide accurate, high-standard computer science insights, code reviews, and platform navigation.

COMPREHENSIVE LYNDESK PLATFORM KNOWLEDGE:
- Password Changes & Security: To change your account password, open Profile Settings (/profile) and scroll down to the "Security & Password" section. Enter your new password fulfilling requirements (8+ characters, uppercase, lowercase, numeric digit, special character), confirm it, and click "Update Password". For forgotten passwords, click "Forgot Password?" on the login modal on the Home page (/) to receive an email OTP reset link.
- College & Institution Linking: Users connect to their college in Profile Settings (/profile) under the "Institutional Affiliation" section by entering their official "College Key" / Passcode provided by their campus administrator. This syncs their verified student status, department, and academic year.
- Code Desk (/coding-deck): Integrates real-time stats for 5 platforms: LeetCode, CodeChef, HackerRank, GeeksforGeeks, and Codeforces. Displays daily challenge targets, solve breakdown by difficulty, and sync timestamps.
- Event Desk (/event-desk): Command center for student hackathons, team project workspaces, milestone deadlines, and deliverables.
- Workspace (/workspace/[id]): Dedicated project space featuring task boards, live member presence, project notes, real-time collaboration, and artifact management.
- Study Desk (/study-desk): Interactive DSA mastery roadmaps, coding sandbox, flashcard revision banks, and personalized AI tutoring.
- Explore (/explore): Student matchmaking arena to search peers by tech stack, department, or handle, and form hackathon teams.
- Coordinator & Faculty Portal (/coordinator): Campus oversight dashboard for faculty/HODs to review student works, verify credentials, manage event recommendations, and send broadcasts.
- Recruiter Hub (/recruiter): Corporate hiring portal to discover verified candidate portfolios and filter talent by competitive ratings.
- Admin Master Deck (/admin): Master administration portal for managing departments, staff credentials, and recruiter access keys.`;

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      const modelCandidates = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
      ];

      const groqMessages: Array<{ role: string; content: string }> = [
        { role: "system", content: contextPrompt }
      ];

      if (Array.isArray(messages) && messages.length > 0) {
        const recent = messages.slice(-6);
        recent.forEach((msg: any) => {
          if (!msg || !msg.text) return;
          const role = msg.sender === "user" ? "user" : "assistant";
          groqMessages.push({ role, content: stripEmojis(msg.text) });
        });
      }

      groqMessages.push({ role: "user", content: userPrompt });

      // Try model candidates sequentially for maximum resilience
      for (const model of modelCandidates) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey.trim()}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: model,
              messages: groqMessages,
              max_tokens: 1000,
              temperature: 0.65
            })
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const rawReply = groqData?.choices?.[0]?.message?.content;
            if (rawReply && rawReply.trim().length > 0) {
              // Strip thinking tags if returned by reasoning models
              const cleanedText = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
              const cleanReply = stripEmojis(cleanedText);
              if (cleanReply.length > 0) {
                return NextResponse.json({
                  response: cleanReply,
                  actionLink: detectActionLink(userPrompt, cleanReply),
                  isMock: false,
                  provider: "groq",
                  model: model
                });
              }
            }
          }
        } catch (modelErr) {
          console.warn(`Groq candidate model [${model}] failed, trying next candidate:`, modelErr);
        }
      }
    }

    // If Groq is unconfigured or failed, try Google Gemini if available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          systemInstruction: contextPrompt
        });

        const chat = model.startChat({
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.65,
          }
        });

        const result = await chat.sendMessage(userPrompt);
        const replyText = result.response.text();
        if (replyText && replyText.trim().length > 0) {
          const cleanReply = stripEmojis(replyText.trim());
          return NextResponse.json({
            response: cleanReply,
            actionLink: detectActionLink(userPrompt, cleanReply),
            isMock: false,
            provider: "gemini",
            model: "gemini-2.5-flash"
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini model call notice:", geminiErr);
      }
    }
  } catch (error: any) {
    console.error("Error in LynAI chat API:", error);
  }

  // Fallback to intelligent conversational engine
  const fallbackResult = generateConversationalFallback(
    userPrompt, 
    profileContext?.name, 
    profileContext
  );

  return NextResponse.json({
    response: stripEmojis(fallbackResult.response),
    actionLink: fallbackResult.actionLink,
    isMock: true
  });
}


