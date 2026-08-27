import { NextRequest, NextResponse } from "next/server";
import { stripEmojis, checkRateLimit, isHarassmentOrOffensive } from "@/app/lib/moderation";

// Natural, human-like offline conversational fallback engine
function generateConversationalFallback(
  userPrompt: string, 
  userName?: string, 
  profileContext?: any
): { response: string; actionLink?: { label: string; href: string } } {
  const p = (userPrompt || "").trim().toLowerCase();
  const name = userName || profileContext?.name || "there";

  // 1. College / University Linking Intent
  if (p.includes("college") || p.includes("university") || p.includes("institute") || p.includes("campus") || p.includes("institution")) {
    return {
      response: `You can link your university or college directly in your **Profile Settings**.\n\nHead over to the Institutional Affiliation section on your profile page and enter your official **College Key** or Passcode provided by your campus coordinator.\n\nOnce saved, your verified student status, department, and academic credits will automatically sync with your campus directory!`,
      actionLink: { label: "Go to Profile Settings", href: "/profile" }
    };
  }

  // 2. Greetings
  if (/^(hi|hello|hey|greetings|sup|hola|hi there|hello there)\b/i.test(p)) {
    return {
      response: `Hey ${name}! I'm LynAI, your developer companion on LynDesk.\n\nWhether you want to sync your coding handles, track your hackathon project milestones, explore DSA concepts, or link to your college network, I'm here to help. What are you working on today?`
    };
  }

  // 3. Status & Wellbeing
  if (/how (are|r) (you|u)|how's it going|how are things|doing well/i.test(p)) {
    return {
      response: `I'm running great and ready to help you build, ${name}!\n\nWe can check your LeetCode daily target, look up project stages on Event Desk, or dive into some coding problems. What would you like to tackle?`
    };
  }

  // 4. Capabilities & Features
  if (/what\s*can|capabilities|features|help|who\s*are\s*you|what\s*are\s*you|ability|whatdo/i.test(p)) {
    return {
      response: `I'm your intelligent co-pilot on LynDesk, designed to make tracking and building your developer career effortless.\n\nHere are some of the main things we can do together:\n\n- **College & Portfolio**: Link your college via your College Key, showcase your verified projects, and update your resume.\n- **Code Desk**: Sync and monitor your live problem-solving stats across LeetCode, CodeChef, HackerRank, GeeksforGeeks, and Codeforces.\n- **Event Desk & Workspaces**: Manage your hackathons, track stage deadlines, and collaborate live with your team.\n- **Study Desk**: Master Data Structures & Algorithms with structured curricula, coding practice, and revision banks.\n- **Matchmaking & Explore**: Find classmates and hackathon teammates filtered by tech stack.\n\nLet me know what you'd like to jump into!`,
      actionLink: { label: "Explore Code Desk", href: "/coding-deck" }
    };
  }

  // 5. Coding Desk & Handles (LeetCode, Codeforces, CodeChef, HackerRank, GFG)
  if (p.includes("leetcode") || p.includes("codeforces") || p.includes("codechef") || p.includes("hackerrank") || p.includes("geeksforgeeks") || p.includes("gfg") || p.includes("coding") || p.includes("streak") || p.includes("dcc")) {
    return {
      response: `You can track and sync your competitive programming profiles right from the **Code Desk**.\n\nWe support real-time sync for LeetCode, CodeChef, HackerRank, GeeksforGeeks, and Codeforces. You can manage your linked handles in Profile Settings or directly inside the Code Desk portal modal.`,
      actionLink: { label: "Open Code Desk", href: "/coding-deck" }
    };
  }

  // 6. Profile & Settings
  if (p.includes("profile") || p.includes("settings") || p.includes("resume") || p.includes("avatar") || p.includes("bio")) {
    return {
      response: `You can customize your developer identity, upload your resume, update social links, and manage your coding handles in **Profile Settings**.\n\nIt's also where you enter your College Key to connect with your institution.`,
      actionLink: { label: "Go to Profile Settings", href: "/profile" }
    };
  }

  // 7. Explore & Teammate Matchmaking
  if (p.includes("explore") || p.includes("teammate") || p.includes("match") || p.includes("partner") || p.includes("friend")) {
    return {
      response: `Looking for teammates for your next hackathon? The **Explore Arena** lets you search for student developers by tech stack, department, and coding rank.\n\nYou can send collaboration invites directly to peers and form teams in seconds.`,
      actionLink: { label: "Open Explore Arena", href: "/explore" }
    };
  }

  // 8. Study Desk & DSA Mastery
  if (p.includes("study") || p.includes("dsa") || p.includes("curriculum") || p.includes("lesson") || p.includes("quiz") || p.includes("learn")) {
    return {
      response: `The **Study Desk** is your interactive technical learning hub.\n\nYou can work through structured DSA mastery roadmaps, practice coding in the sandbox editor, review mistake flashcards, and test your knowledge with AI quizzes.`,
      actionLink: { label: "Open Study Desk", href: "/study-desk" }
    };
  }

  // 9. Event Desk & Workspaces
  if (p.includes("event") || p.includes("workspace") || p.includes("project") || p.includes("milestone") || p.includes("stage")) {
    return {
      response: `The **Event Desk** is your command center for hackathons and projects.\n\nCreate dedicated project workspaces, assign tasks to teammates, track milestone deadlines, and prepare verified project deliverables for submission.`,
      actionLink: { label: "Open Event Desk", href: "/event-desk" }
    };
  }

  // 10. General Programming / CS Concepts
  if (p.includes("array") || p.includes("list")) {
    return {
      response: `An **Array** is a fundamental linear data structure that stores elements in contiguous memory locations.\n\nIt provides instant $O(1)$ random access when you know the index, but insertions or deletions in the middle require $O(N)$ time to shift elements. In JavaScript and Python, arrays/lists are dynamically sized for convenience.`
    };
  }

  if (p.includes("tree") || p.includes("bst")) {
    return {
      response: `A **Binary Search Tree (BST)** is a hierarchical node-based structure where each node has at most two children.\n\nFor every node, all values in its left subtree are strictly smaller, and all values in its right subtree are greater. This allows $O(\\log N)$ average-case time for search, insertion, and deletion.`
    };
  }

  if (p.includes("graph")) {
    return {
      response: `A **Graph** consists of a collection of vertices (nodes) connected by edges.\n\nCommon graph traversal techniques include **Breadth-First Search (BFS)**, which explores layer-by-layer using a queue (ideal for shortest paths in unweighted graphs), and **Depth-First Search (DFS)**, which explores along branches using a stack or recursion.`
    };
  }

  // Default Friendly, Natural Fallback
  return {
    response: `I'm here to help with anything on LynDesk or software development!\n\nYou can ask me how to link your college, track your coding stats, structure your project workspaces, or master Data Structures & Algorithms. What would you like to explore?`
  };
}

function detectActionLink(userPrompt: string, replyText: string): { label: string; href: string } | undefined {
  const p = (userPrompt || "").toLowerCase();
  const r = (replyText || "").toLowerCase();

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

    const contextPrompt = `You are LynAI, an intelligent, friendly, and human-like developer companion and co-pilot on the LynDesk platform.

CURRENT TEMPORAL CONTEXT: ${liveDate} at ${liveTime}.
${workspaceContext ? `ACTIVE WORKSPACE CONTEXT: ${JSON.stringify(workspaceContext)}` : ""}
${profileContext ? `STUDENT DEVELOPER CONTEXT: ${JSON.stringify(profileContext)}` : ""}

YOUR PERSONA & COMMUNICATION STYLE:
1. HUMAN-LIKE & CONVERSATIONAL: Speak naturally like a knowledgeable, encouraging peer or senior engineer. Be warm, approachable, and direct.
2. PARAGRAPH STRUCTURE: Write clean, well-spaced paragraphs ("para by para"). Avoid rigid, robotic walls of bullets.
3. BRIEF & CONCISE: Answer directly without unnecessary fluff or robotic disclaimers.
4. ZERO EMOJIS: Never use any emojis or decorative icons in any response.
5. ACCURACY & QUALITY: Provide 100% accurate, high-standard technical explanations and platform guidance.

LYNDESK PLATFORM KNOWLEDGE:
- College & Institution Linking: Users connect to their college or university in Profile Settings (/profile) under the "Institutional Affiliation" section by entering their official "College Key" / Passcode provided by their campus administrator.
- Code Desk (/coding-deck): Integrates real-time stats for 5 platforms: LeetCode, CodeChef, HackerRank, GeeksforGeeks, and Codeforces. Displays daily challenge targets, solve counts, and streaks.
- Event Desk (/event-desk): Command center for student hackathons, team project workspaces, milestone deadlines, and deliverables.
- Study Desk (/study-desk): Interactive DSA mastery roadmaps, coding sandbox, flashcard revision banks, and personalized AI tutoring.
- Explore (/explore): Student matchmaking arena to search peers by tech stack, department, or handle, and form hackathon teams.`;

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey) {
      const modelCandidates = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "groq/compound-mini"
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
            const replyText = groqData?.choices?.[0]?.message?.content;
            if (replyText && replyText.trim().length > 0) {
              const cleanReply = stripEmojis(replyText.trim());
              return NextResponse.json({
                response: cleanReply,
                actionLink: detectActionLink(userPrompt, cleanReply),
                isMock: false,
                provider: "groq",
                model: model
              });
            }
          }
        } catch (modelErr) {
          console.warn(`Groq candidate model [${model}] failed, trying next candidate:`, modelErr);
        }
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

