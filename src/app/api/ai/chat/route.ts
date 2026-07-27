import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userPrompt, profileContext, workspaceContext } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      const promptLower = (userPrompt || "").toLowerCase();
      let aiResponse = "I am LynAI, your interactive portfolio & workspace co-pilot! I can answer your questions, assist with hackathon projects, review your coding stats, and guide your team collaboration.";
      let actionLink = undefined;

      if (promptLower.includes("conversation") || promptLower.includes("standby") || promptLower.includes("fixed")) {
        aiResponse = "I am fully capable of natural, interactive conversation! Add a `GEMINI_API_KEY` to your environment variables to enable live Generative AI synthesis for any prompt. In the meantime, I can help navigate your workspaces, coding deck, and campus directory.";
      } else if (promptLower.includes("profile") || promptLower.includes("settings")) {
        aiResponse = "### 👤 Profile Settings\nUpdate your profile details, academic records, and resume directly in Settings:";
        actionLink = { label: "Go to Profile Settings", href: "/profile" };
      } else if (promptLower.includes("leetcode") || promptLower.includes("stats") || promptLower.includes("coding")) {
        aiResponse = "### 💻 Coding Deck\nSync your handles and view daily challenge statuses in the Coding Deck:";
        actionLink = { label: "Go to Coding Deck", href: "/coding-deck" };
      } else if (promptLower.includes("explore") || promptLower.includes("teammates") || promptLower.includes("match")) {
        aiResponse = "### 🔍 Matchmaking Arena\nSearch student directories and invite peers to your hackathon projects:";
        actionLink = { label: "Go to Explore Arena", href: "/explore" };
      }

      return NextResponse.json({
        response: aiResponse,
        actionLink: actionLink,
        isMock: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      
      Respond directly to the user's prompt as a highly capable AI assistant agent. Be concise, professional, and use markdown formatting.
    `;

    const rawHistory: Array<{ role: "user" | "model"; text: string }> = [
      { role: "user", text: contextPrompt },
      { role: "model", text: "Understood. I will act as LynAI with the provided profile and workspace contexts." }
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

    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    });

    const text = result.response.text();

    return NextResponse.json({
      response: text,
      isMock: false
    });
  } catch (error: any) {
    console.error("Error in LynAI chat API:", error);

    const promptLower = (req.headers.get("x-user-prompt") || "").toLowerCase();
    let fallbackText = "I am LynAI, your workspace assistant! I can help you manage project spaces, track LeetCode challenges, and connect with teammates.";
    let actionLink = undefined;

    if (promptLower.includes("leetcode") || promptLower.includes("deck") || promptLower.includes("coding")) {
      fallbackText = "### 💻 Coding Deck\nSync your handles and view daily challenge statuses in the Coding Deck:";
      actionLink = { label: "Go to Coding Deck", href: "/coding-deck" };
    } else if (promptLower.includes("news") || promptLower.includes("contest") || promptLower.includes("hackathon")) {
      fallbackText = "### 🏆 News & Contests\nExplore faculty recommended opportunities and global hackathons:";
      actionLink = { label: "Go to News & Contests", href: "/news-contests" };
    }

    return NextResponse.json({
      response: fallbackText,
      actionLink: actionLink,
      isMock: true,
      error: error.message
    });
  }
}

