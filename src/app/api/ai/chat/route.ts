import { NextRequest, NextResponse } from "next/server";


function generateConversationalFallback(
  userPrompt: string, 
  userName?: string, 
  profileContext?: any
): { response: string; actionLink?: { label: string; href: string } } {
  const p = (userPrompt || "").trim().toLowerCase();
  const name = userName || profileContext?.name || "Developer";

  // Greetings
  if (/^(hi|hello|hey|greetings|sup|hola|hi there|hello there)\b/i.test(p)) {
    return {
      response: `Hello ${name}! I am LynAI, your portfolio & workspace co-pilot. How can I assist you with your projects, LeetCode daily challenge, or team today?`
    };
  }

  // Personal status
  if (/how (are|r) (you|u)|how's it going|how are things|doing well/i.test(p)) {
    return {
      response: `I'm operating smoothly and ready to assist you, ${name}! We can track your coding stats, review project workspace activity, or search for hackathon teammates. What shall we tackle first?`
    };
  }

  // Capabilities & Help
  if (/what\s*can|capabilities|features|help|who\s*are\s*you|what\s*are\s*you|ability|whatdo/i.test(p)) {
    return {
      response: `### I am LynAI, your portfolio & workspace co-pilot!

Here is everything I can help you with, ${name}:

- **Programming & CS Concepts**: Ask me to explain data structures (Arrays, Trees, Hash Maps), algorithms, time complexity, or LeetCode challenges.
- **Workspace & Project Tracking**: Monitor project milestone timelines, rule briefs, team task status, and repository specs.
- **Code Desk & Ratings**: Track your LeetCode daily streak, Codeforces rating, and CodeChef profile performance.
- **Teammate Matchmaking**: Search student developer profiles by skills and invite peers to your hackathon teams.
- **Study Desk & AI Tutor**: Generate structured curricula, practice quizzes, and interactive notes for any technical topic.

How can I assist you with your projects or coding today?`,
      actionLink: { label: "Explore Code Desk", href: "/coding-desk" }
    };
  }

  // Navigation Intents
  if (p.includes("profile") || p.includes("settings") || p.includes("resume")) {
    return {
      response: `### Profile & Portfolio Settings\nYou can update your academic details, technical skills, and resume directly in Settings:`,
      actionLink: { label: "Go to Profile Settings", href: "/profile" }
    };
  }

  if (p.includes("leetcode") || p.includes("coding") || p.includes("streak") || p.includes("problem") || p.includes("deck") || p.includes("desk")) {
    return {
      response: `### Code Desk\nSync your handles and verify your daily challenge streak on the Code Desk:`,
      actionLink: { label: "Go to Code Desk", href: "/coding-desk" }
    };
  }

  if (p.includes("explore") || p.includes("teammate") || p.includes("match") || p.includes("directory")) {
    return {
      response: `### Matchmaking Arena\nSearch student profiles, filter by tech stack, and build your hackathon team:`,
      actionLink: { label: "Go to Explore Arena", href: "/explore" }
    };
  }

  if (p.includes("study") || p.includes("material") || p.includes("assignment") || p.includes("class") || p.includes("quiz") || p.includes("exam")) {
    return {
      response: `### Study Desk & AI Tutor\nAccess course materials, submit assignments, join study rooms, or learn any topic interactively with AI:`,
      actionLink: { label: "Go to Study Desk", href: "/study-desk" }
    };
  }

  if (p.includes("event") || p.includes("workspace") || p.includes("project")) {
    return {
      response: `### Event Desk & Workspaces\nManage active project workspaces, track hackathons, and monitor team presence:`,
      actionLink: { label: "Go to Event Desk", href: "/event-desk" }
    };
  }

  if (p.includes("contest") || p.includes("hackathon") || p.includes("news")) {
    return {
      response: `### Contests & Opportunities\nExplore faculty-recommended hackathons and global coding contests in Explore:`,
      actionLink: { label: "Go to Explore -> News & Contests", href: "/explore?tab=news" }
    };
  }

  // Comprehensive Technical & CS Knowledge Base Fallbacks
  if (p.includes("array") || p.includes("list")) {
    return {
      response: `### What is an Array?

An **Array** is a linear data structure that stores a collection of elements in contiguous memory locations.

#### Key Characteristics:
- **Index-Based Access**: Elements are accessed via 0-based index numbers.
- **Contiguous Memory**: Memory is allocated sequentially.
- **Constant Time Access**: $O(1)$ lookup time if index is known.

#### Time Complexity Summary:
| Operation | Average Case | Worst Case |
| :--- | :--- | :--- |
| **Access** | $O(1)$ | $O(1)$ |
| **Search** | $O(N)$ | $O(N)$ |
| **Insertion** | $O(N)$ | $O(N)$ |
| **Deletion** | $O(N)$ | $O(N)$ |

#### Example (JavaScript & Python):
\`\`\`javascript
// JavaScript Array
const fruits = ["Apple", "Banana", "Cherry"];
console.log(fruits[0]); // "Apple" (O(1) Access)
\`\`\``
    };
  }

  if (p.includes("linked list")) {
    return {
      response: `### What is a Linked List?

A **Linked List** is a linear data structure where elements (nodes) are stored non-contiguously in memory. Each node contains **data** and a **pointer** (\`next\`) to the subsequent node.

#### Types of Linked Lists:
1. **Singly Linked List**: Each node points to the next node.
2. **Doubly Linked List**: Nodes point to both next and previous nodes.
3. **Circular Linked List**: The last node points back to the head.

#### Time Complexity:
- **Access / Search**: $O(N)$
- **Insertion / Deletion at Head**: $O(1)$
- **Insertion / Deletion at Tail**: $O(1)$ with tail pointer`
    };
  }

  if (p.includes("tree") || p.includes("binary search tree") || p.includes("bst")) {
    return {
      response: `### What is a Tree / Binary Search Tree (BST)?

A **Tree** is a hierarchical non-linear data structure consisting of nodes connected by edges. A **Binary Search Tree (BST)** enforces the rule that for every node:
- Left child values are **smaller**.
- Right child values are **greater**.

#### Operations & Time Complexity:
- **Search / Insert / Delete**: $O(\log N)$ average, $O(N)$ worst-case (unbalanced).
- **In-Order Traversal**: Yields elements in **sorted ascending order**.`
    };
  }

  if (p.includes("graph") || p.includes("bfs") || p.includes("dfs")) {
    return {
      response: `### Graphs & Graph Traversals

A **Graph** consists of a set of **Vertices (Nodes)** connected by **Edges**.

#### Traversal Algorithms:
- **BFS (Breadth-First Search)**: Explores layer-by-layer using a **Queue**. Finds shortest path in unweighted graphs.
- **DFS (Depth-First Search)**: Explores as deep as possible along each branch using a **Stack** / Recursion.`
    };
  }

  if (p.includes("time complexity") || p.includes("big o") || p.includes("space complexity")) {
    return {
      response: `### Big-O Notation & Complexity Guide

Big-O measures how an algorithm's runtime or memory requirement scales with input size $N$.

#### Common Order of Growth (Fastest to Slowest):
1. $O(1)$ - **Constant**: Direct array lookup, hash map access.
2. $O(\log N)$ - **Logarithmic**: Binary search.
3. $O(N)$ - **Linear**: Simple loops, array iteration.
4. $O(N \log N)$ - **Linearithmic**: Merge Sort, Quick Sort (average).
5. $O(N^2)$ - **Quadratic**: Nested loops (Bubble Sort, Insertion Sort).
6. $O(2^N)$ - **Exponential**: Recursive Fibonacci without memoization.`
    };
  }

  if (p.includes("react") || p.includes("next") || p.includes("hook") || p.includes("component")) {
    return {
      response: `### React & Next.js Core Concepts

- **React Server Components (RSC)**: Next.js 15/16 renders components on the server by default for zero client bundle overhead.
- **Client Components (\`'use client'\`)**: Required when using hooks (\`useState\`, \`useEffect\`) or DOM event listeners.
- **Hooks Overview**:
  - \`useState\`: Manages local component state.
  - \`useEffect\`: Handles side-effects & subscriptions.
  - \`useMemo\` / \`useCallback\`: Memoizes expensive calculations and callbacks.`
    };
  }

  if (p.includes("javascript") || p.includes("js") || p.includes("async") || p.includes("promise")) {
    return {
      response: `### JavaScript Fundamentals & Async Programming

- **Promises & \`async/await\`**: Handle asynchronous tasks (API calls, DB queries) cleanly without callback hell.
- **Event Loop**: JS single-threaded event loop processes microtasks (Promises) before macrotasks (\`setTimeout\`).
- **Closures**: Functions retain access to variables from their lexical scope even after parent function returns.`
    };
  }

  if (p.includes("python")) {
    return {
      response: `### Python Quick Reference

- **Dynamic Typing**: Variables take types automatically at runtime.
- **List Comprehensions**: Elegant one-line list creation: \`[x*2 for x in range(10) if x % 2 == 0]\`
- **Dictionaries**: Hash tables with $O(1)$ average key lookup.`
    };
  }

  if (p.includes("time") && !p.includes("timeline") && !p.includes("complexity")) {
    const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      response: `The current local time is **${localTime}**. Let me know if you'd like to review your upcoming project stage deadlines or LeetCode daily target!`
    };
  }

  // General fallback response
  return {
    response: `Hello ${name}! I am LynAI, your portfolio & workspace co-pilot. 

I am equipped to help you with:
- **Data Structures & Algorithms**: Arrays, Trees, Graphs, Sorting, Big-O Complexity.
- **Web Development**: React, Next.js, JavaScript, Python, Tailwind CSS, Supabase.
- **Workspace & Projects**: Track stage timelines, repository specs, and team milestones.
- **Code Desk**: Monitor LeetCode daily targets, Codeforces, and CodeChef stats.

What topic would you like to explore today?`
  };
}

function detectActionLink(userPrompt: string, replyText: string): { label: string; href: string } | undefined {
  const combined = ((userPrompt || "") + " " + (replyText || "")).toLowerCase();

  if (combined.includes("profile") || combined.includes("handle") || combined.includes("username") || combined.includes("leetcode") || combined.includes("settings") || combined.includes("codeforces") || combined.includes("codechef") || combined.includes("bio")) {
    return { label: "Go to Profile Settings", href: "/profile" };
  }
  if (combined.includes("invite") || combined.includes("co-worker") || combined.includes("teammate") || combined.includes("directory") || combined.includes("matchmake")) {
    return { label: "Open Matchmaking Arena", href: "/explore" };
  }
  if (combined.includes("streak") || combined.includes("code desk") || combined.includes("coding desk") || combined.includes("daily challenge") || combined.includes("problem")) {
    return { label: "Open Code Desk", href: "/coding-desk" };
  }
  if (combined.includes("event desk") || combined.includes("hackathon") || combined.includes("vault")) {
    return { label: "Open Event Desk", href: "/event-desk" };
  }
  if (combined.includes("study desk") || combined.includes("tutor") || combined.includes("quiz") || combined.includes("curriculum")) {
    return { label: "Open Study Desk", href: "/study-desk" };
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  let userPrompt = "";
  let profileContext: any = null;

  try {
    const body = await req.json();
    const { messages, userPrompt: inputPrompt, profileContext: pCtx, workspaceContext } = body;
    userPrompt = inputPrompt || "";
    profileContext = pCtx;

    const now = new Date();
    const liveTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const liveDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const contextPrompt = `You are LynAI, the personal portfolio & workspace co-pilot on LynDesk.

User Profile Context:
- Name: ${profileContext?.name || "Kaizzcer"}
- College: ${profileContext?.college || "SRM Easwari"}
- Department: ${profileContext?.department || "Information Technology"}

Current System Environment:
- Live Local Time: ${liveTime} (${liveDate})
- Active Project: ${workspaceContext?.projectName || "No active project"}

LYNDESK COMPREHENSIVE PLATFORM MANUAL & FEATURE DIRECTORY:
1. **Profile, Usernames & Handles** (\`/profile\`):
   - **Change Username / Handle**: Navigate to \`/profile\`. Edit Username, Name, Department, Year, Bio, or Skills and click **Save Changes**.
   - **Competitive Handles**: Enter your LeetCode, Codeforces, or CodeChef handles on \`/profile\` to auto-sync your problem counts and ratings across LynDesk.
2. **Workspaces & Project Management** (\`/workspace/[id]\`):
   - **Rename Workspace**: Click the **Rename** button next to the workspace title header.
   - **Visit Event Page & Rules**: Click **Visit Event Page** to open the hackathon link, or **Event Brief & Rules** to view AI-analyzed guidelines.
   - **Invite Teammates**: Under the **Active Co-Workers** panel, click **+ Add Co-Worker** to add peers, OR search in **Explore Arena** (\`/explore\`) and click **Invite to Team**.
3. **Event Desk & Hackathons** (\`/event-desk\`):
   - **Hackathon Vault & URL Parser**: Paste any hackathon URL into the parser box to auto-extract timelines, deadlines, and stage guidelines into your vault.
4. **Coding Deck & Streaks** (\`/coding-deck\`):
   - **LeetCode Daily Challenge**: View the live daily LeetCode challenge with direct links and streak validation.
5. **Explore & Matchmaking Arena** (\`/explore\`):
   - **Student Directory**: Filter student developers by Tech Stack (React, Python, Node, ML), Department, and Academic Year.
6. **Study Desk & AI Tutor** (\`/study-desk\`):
   - **AI Tutor Curriculum Generator**: Enter any technical topic to generate a step-by-step curriculum with interactive quizzes after each section.

STRICT RESPONSE DIRECTIVES:
1. BE WARM, PLEASING, AND CONCISE. Keep responses friendly, encouraging, and short (1-3 sentences max).
2. Do NOT write dry, cold robotic theory. Talk like a friendly, supportive co-pilot!
3. When guiding users to perform an action (like changing handles, usernames, or inviting teammates), state it warmly in 1 short sentence and mention that an instant action button is provided below to take them directly there!
4. When asked for the time, answer directly using the Live Local Time (${liveTime}). Address the user as ${profileContext?.name || "Kaizzcer"}.
5. ABSOLUTELY DO NOT USE ANY EMOJIS (such as ⚙️, 🚀, 💻, 📚, 🤝) in your response or action link labels. Use clean text and standard markdown formatting only.`;

    // 1. Try Groq API (Hyper-fast free LLaMA 3.3 70B model)
    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (groqApiKey) {
      try {
        const groqMessages: Array<{ role: string; content: string }> = [
          { role: "system", content: contextPrompt }
        ];

        if (Array.isArray(messages) && messages.length > 0) {
          const recent = messages.slice(-6);
          recent.forEach((msg: any) => {
            if (!msg || !msg.text) return;
            const role = msg.sender === "user" ? "user" : "assistant";
            groqMessages.push({ role, content: msg.text });
          });
        }

        groqMessages.push({ role: "user", content: userPrompt });

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey.trim()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            max_tokens: 300,
            temperature: 0.5
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const replyText = groqData?.choices?.[0]?.message?.content;
          if (replyText && replyText.trim().length > 0) {
            return NextResponse.json({
              response: replyText,
              actionLink: detectActionLink(userPrompt, replyText),
              isMock: false,
              provider: "groq"
            });
          }
        } else {
          const errBody = await groqRes.text();
          console.warn("Groq API error response:", errBody);
        }
      } catch (groqErr: any) {
        console.warn("Groq API call error:", groqErr?.message || groqErr);
      }
    }
  } catch (error: any) {
    console.error("Error in LynAI chat API:", error);
  }

  // Natural Conversational Fallback Engine
  const fallbackResult = generateConversationalFallback(
    userPrompt, 
    profileContext?.name, 
    profileContext
  );

  return NextResponse.json({
    response: fallbackResult.response,
    actionLink: fallbackResult.actionLink,
    isMock: true
  });
}
