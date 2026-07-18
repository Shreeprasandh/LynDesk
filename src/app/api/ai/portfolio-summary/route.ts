import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leetcode, codeforces, codechef } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: If no API key is configured, return mock data with a setup warning
    if (!apiKey) {
      // Generate some nice custom mock insights based on their actual numbers
      const lcSolved = leetcode?.solved || 0;
      const lcStreak = leetcode?.leetcodeStreak || 0;
      const cfRating = codeforces?.rating || 0;
      const cfSolved = codeforces?.solved || 0;
      const ccRating = codechef?.rating || 0;

      const mockSkills = ["Problem Solving", "Data Structures"];
      if (lcStreak > 5) mockSkills.push("Consistency");
      if (cfRating > 1200 || ccRating > 1400) mockSkills.push("Competitive Programming");
      if (lcSolved > 100) mockSkills.push("Algorithm Design");

      return NextResponse.json({
        isMock: true,
        summary: `Mock AI Profile Summary: You have solved ${lcSolved} problems on LeetCode with an active streak of ${lcStreak} days. Your competitive profiles show a Codeforces rating of ${cfRating} (${cfSolved} solved) and CodeChef rating of ${ccRating}. To get a real, customized AI analysis of your portfolio, generate a free Gemini API Key and add it to your .env.local file.`,
        score: Math.min(100, Math.max(30, Math.floor((lcSolved / 5) + (cfRating / 40) + (ccRating / 40)))),
        skills: mockSkills,
        insights: [
          `Synced profiles track achievements across LeetCode, Codeforces, and CodeChef.`,
          lcSolved > 50 
            ? `Your LeetCode solve count (${lcSolved}) shows solid progress in fundamental data structures.` 
            : `Add more solved problems on LeetCode to build your foundational core.`,
          lcStreak > 0 
            ? `An active ${lcStreak}-day streak demonstrates consistent daily coding discipline.` 
            : `Try solving a daily challenge to establish a consecutive streak.`
        ]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for fast and free inference
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const statsPrompt = `
      You are a senior tech recruiter and elite coding coach. Analyze this student's coding portfolio statistics and generate a premium, concise profile summary.
      
      Coding Statistics:
      - LeetCode:
        * Total Solved: ${leetcode?.solved || 0}
        * Easy: ${leetcode?.easySolved || 0}, Medium: ${leetcode?.mediumSolved || 0}, Hard: ${leetcode?.hardSolved || 0}
        * Active Streak: ${leetcode?.leetcodeStreak || 0} days
      - Codeforces:
        * Rating: ${codeforces?.rating || 0}
        * Rank: ${codeforces?.rank || "Unrated"}
        * Total Solved: ${codeforces?.solved || 0}
      - CodeChef:
        * Rating: ${codechef?.rating || 0}
        * Global Rank: ${codechef?.globalRank || "N/A"}
        * Stars: ${codechef?.stars || "N/A"}
        * Total Solved: ${codechef?.solved || 0}

      Return a JSON object conforming strictly to this format:
      {
        "summary": "A high-impact, professional 2-3 sentence overview of their developer capability, highlight key accomplishments or growth traits based on the numbers.",
        "score": 85, // A numerical ranking from 30 to 100 representing their competitive profile strength
        "skills": ["Skill1", "Skill2", "Skill3"], // Max 4 core programming strengths identified from their performance
        "insights": [
          "Detail bullet point 1 (analysis of consistency, difficulty balance, or CP rank)",
          "Detail bullet point 2 (actionable advice on which topics/platforms to practice next to level up)"
        ]
      }

      Respond ONLY with the raw JSON string. Do not include markdown codeblocks (no \`\`\`json).
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: statsPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    
    // Clean potential markdown backticks or formatting wrappers
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    
    const data = JSON.parse(cleanedText);

    return NextResponse.json({
      isMock: false,
      summary: data.summary,
      score: data.score,
      skills: Array.isArray(data.skills) ? data.skills : [],
      insights: Array.isArray(data.insights) ? data.insights : []
    });

  } catch (error: any) {
    console.error("AI Portfolio Summary Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate portfolio summary: " + error.message },
      { status: 500 }
    );
  }
}
