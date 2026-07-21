import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userPrompt, profileContext, workspaceContext } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Rule-based fallback if no API key is configured
      const promptLower = userPrompt.toLowerCase();
      let aiResponse = "I am LynAI, your portfolio co-pilot. I can help you with resume reviews, coding platform statistics, and project collaboration advice. Add a GEMINI_API_KEY to your environment variables to unlock my full conversational intelligence!";
      let actionLink = undefined;

      if (promptLower.includes("profile") || promptLower.includes("settings")) {
        aiResponse = "### 👤 Profile Settings\nUpdate your profile details, academic records, and resume directly in Settings:";
        actionLink = { label: "Go to Profile Settings", href: "/profile" };
      } else if (promptLower.includes("leetcode") || promptLower.includes("stats")) {
        aiResponse = "### 💻 Coding Deck\nSync your handles and view daily challenge statuses in the Coding Deck:";
        actionLink = { label: "Go to Coding Deck", href: "/coding-deck" };
      } else if (promptLower.includes("explore") || promptLower.includes("teammates")) {
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format chat history into Gemini format
    const contents = [];
    
    // Add context setup
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

    contents.push({ role: "user", parts: [{ text: contextPrompt }] });
    contents.push({ role: "model", parts: [{ text: "Understood. I will act as LynAI with the provided profile and workspace contexts." }] });

    // Add recent history messages
    if (Array.isArray(messages)) {
      messages.forEach((msg: any) => {
        const role = msg.sender === "user" ? "user" : "model";
        contents.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add final prompt
    contents.push({
      role: "user",
      parts: [{ text: userPrompt }]
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
    return NextResponse.json({
      response: "Sorry, I encountered an issue processing your request. Please try again shortly.",
      error: error.message
    }, { status: 500 });
  }
}
