import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  if (/what can (you|u) do|features|capabilities|help me|who are you|what are you/i.test(p)) {
    return {
      response: `### What I Can Do For You, ${name}:

- **Coding Deck & Streaks**: Track your live LeetCode daily challenge status, active streaks, and Codeforces/CodeChef ratings.
- **Workspace & Project Hub**: Manage team workspaces, assign tasks, and monitor repository presence.
- **Matchmaking Arena**: Connect with student developers by skill and invite peers to your hackathon teams.
- **AI Portfolio Analysis**: Synthesize recruiter-ready summary reports and coding index scores.`,
      actionLink: { label: "Open Coding Deck", href: "/coding-deck" }
    };
  }

  // Navigation Intents
  if (p.includes("profile") || p.includes("settings") || p.includes("resume")) {
    return {
      response: `### Profile & Portfolio Settings\nYou can update your academic details, technical skills, and resume directly in Settings:`,
      actionLink: { label: "Go to Profile Settings", href: "/profile" }
    };
  }

  if (p.includes("leetcode") || p.includes("coding") || p.includes("streak") || p.includes("problem") || p.includes("deck")) {
    return {
      response: `### Coding Deck\nSync your handles and verify your daily challenge streak on the Coding Deck:`,
      actionLink: { label: "Go to Coding Deck", href: "/coding-deck" }
    };
  }

  if (p.includes("explore") || p.includes("teammate") || p.includes("match") || p.includes("directory")) {
    return {
      response: `### Matchmaking Arena\nSearch student profiles, filter by tech stack, and build your hackathon team:`,
      actionLink: { label: "Go to Explore Arena", href: "/explore" }
    };
  }

  if (p.includes("contest") || p.includes("hackathon") || p.includes("news")) {
    return {
      response: `### Contests & Opportunities\nExplore faculty-recommended hackathons and global coding contests:`,
      actionLink: { label: "Go to News & Contests", href: "/news-contests" }
    };
  }

  // General questions fallback
  return {
    response: `I'm currently operating as your workspace assistant, ${name}. I can help you manage project spaces, track LeetCode daily challenges, explore student directories, and review portfolio metrics! How can I assist you with your workspace today?`
  };
}

export async function POST(req: NextRequest) {
  let userPrompt = "";
  let profileContext: any = null;

  try {
    const body = await req.json();
    const { messages, userPrompt: inputPrompt, profileContext: pCtx, workspaceContext } = body;
    userPrompt = inputPrompt || "";
    profileContext = pCtx;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const candidateModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest", "gemini-1.5-pro"];

      const contextPrompt = `
        You are LynAI, the elite portfolio co-pilot and coding assistant on LynDesk.
        User Profile Context:
        - Name: ${profileContext?.name || "Student Developer"}
        - College: ${profileContext?.college || "Unspecified College"}
        - Department: ${profileContext?.department || "Unspecified Department"}
        - Skills: ${profileContext?.skills || "React, JavaScript, Python"}
        - LeetCode Solved: ${profileContext?.leetcodeSolved || 0}
        - Codeforces Rating: ${profileContext?.codeforcesRating || 0}
        
        Active Project/Workspace Context:
        - Project Name: ${workspaceContext?.projectName || "No active project"}
        - Status: ${workspaceContext?.status || "None"}
        
        Respond directly to the user's prompt as a highly capable AI assistant agent. Be friendly, concise, natural, and use clear markdown formatting.
      `;

      const rawHistory: Array<{ role: "user" | "model"; text: string }> = [
        { role: "user", text: contextPrompt },
        { role: "model", text: "Understood. I am LynAI, ready to assist." }
      ];

      if (Array.isArray(messages)) {
        messages.forEach((msg: any) => {
          if (!msg || !msg.text) return;
          const role = msg.sender === "user" ? "user" : "model";
          rawHistory.push({ role, text: msg.text });
        });
      }

      rawHistory.push({ role: "user", text: userPrompt });

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      rawHistory.forEach((item) => {
        if (contents.length > 0 && contents[contents.length - 1].role === item.role) {
          contents[contents.length - 1].parts[0].text += `\n${item.text}`;
        } else {
          contents.push({
            role: item.role,
            parts: [{ text: item.text }]
          });
        }
      });

      // Try candidates in order
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent({
            contents: contents,
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.7,
            }
          });

          const text = result.response.text();
          if (text && text.trim().length > 0) {
            return NextResponse.json({
              response: text,
              isMock: false
            });
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} call failed:`, modelErr?.message || modelErr);
        }
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
