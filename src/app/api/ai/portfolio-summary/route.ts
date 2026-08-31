import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/app/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const rateLimit = checkRateLimit(`ai_portfolio_${clientIp}`, 15, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateLimit.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { leetcode, codeforces, codechef } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    const lcSolved = leetcode?.solved || 0;
    const lcStreak = leetcode?.leetcodeStreak || 0;
    const cfRating = codeforces?.rating || 0;
    const cfSolved = codeforces?.solved || 0;
    const ccRating = codechef?.rating || 0;

    const systemPrompt = `You are a senior tech recruiter and elite coding coach. Return ONLY JSON matching this format:
{
  "summary": "High-impact 2-3 sentence overview of candidate capability.",
  "score": 85,
  "skills": ["Skill1", "Skill2", "Skill3"],
  "insights": [
    "Bullet point 1 analysis",
    "Bullet point 2 advice"
  ]
}`;

    const userPrompt = `Coding Statistics:
- LeetCode: Solved ${lcSolved} (Easy: ${leetcode?.easySolved || 0}, Med: ${leetcode?.mediumSolved || 0}, Hard: ${leetcode?.hardSolved || 0}), Streak: ${lcStreak} days
- Codeforces: Rating ${cfRating}, Rank: ${codeforces?.rank || "Unrated"}, Solved: ${cfSolved}
- CodeChef: Rating ${ccRating}, Stars: ${codechef?.stars || "N/A"}, Solved: ${codechef?.solved || 0}`;

    let replyText = "";

    // 1. Try Google Generative AI (Gemini)
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4
          },
          systemInstruction: systemPrompt
        });

        const result = await model.generateContent(userPrompt);
        replyText = result.response.text();
      } catch (geminiErr) {
        console.warn("Gemini portfolio summary error, falling back to Groq:", geminiErr);
      }
    }

    // 2. Try Groq API
    if (!replyText && groqApiKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          replyText = groqData?.choices?.[0]?.message?.content || "";
        }
      } catch (fetchErr) {
        console.error("Groq portfolio fetch error:", fetchErr);
      }
    }

    if (replyText) {
      try {
        const data = JSON.parse(replyText);
        return NextResponse.json({
          isMock: false,
          summary: data.summary || "Solid technical portfolio.",
          score: typeof data.score === "number" ? data.score : 75,
          skills: Array.isArray(data.skills) ? data.skills : ["Problem Solving", "Algorithms"],
          insights: Array.isArray(data.insights) ? data.insights : ["Keep up daily problem solving consistency."]
        });
      } catch {}
    }

    // 3. Fallback mock summary
    const mockSkills = ["Problem Solving", "Data Structures"];
    if (lcStreak > 5) mockSkills.push("Consistency");
    if (cfRating > 1200 || ccRating > 1400) mockSkills.push("Competitive Programming");
    if (lcSolved > 100) mockSkills.push("Algorithm Design");

    return NextResponse.json({
      isMock: true,
      summary: `Developer Profile Summary: Solved ${lcSolved} problems on LeetCode with an active streak of ${lcStreak} days. Competitive profile shows Codeforces rating of ${cfRating} (${cfSolved} solved) and CodeChef rating of ${ccRating}.`,
      score: Math.min(100, Math.max(30, Math.floor((lcSolved / 5) + (cfRating / 40) + (ccRating / 40)))),
      skills: mockSkills,
      insights: [
        `Synced profiles track achievements across LeetCode, Codeforces, and CodeChef.`,
        lcSolved > 50 
          ? `LeetCode solve count (${lcSolved}) demonstrates solid core data structures progress.` 
          : `Solve more problems on LeetCode to build your core algorithmic foundation.`,
        lcStreak > 0 
          ? `An active ${lcStreak}-day streak demonstrates consistent daily coding discipline.` 
          : `Solve daily challenges to establish a consecutive coding streak.`
      ]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate portfolio summary: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
