import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leetcode, codeforces, codechef } = body;

    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!groqApiKey) {
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
    }

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
- LeetCode: Solved ${leetcode?.solved || 0} (Easy: ${leetcode?.easySolved || 0}, Med: ${leetcode?.mediumSolved || 0}, Hard: ${leetcode?.hardSolved || 0}), Streak: ${leetcode?.leetcodeStreak || 0} days
- Codeforces: Rating ${codeforces?.rating || 0}, Rank: ${codeforces?.rank || "Unrated"}, Solved: ${codeforces?.solved || 0}
- CodeChef: Rating ${codechef?.rating || 0}, Stars: ${codechef?.stars || "N/A"}, Solved: ${codechef?.solved || 0}`;

    let groqRes: Response;
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    } catch (fetchErr) {
      console.error("Groq portfolio fetch error:", fetchErr);
      return NextResponse.json(generateLocalFallback(leetcode, codeforces, codechef));
    }

    if (groqRes.ok) {
      const groqData = await groqRes.json();
      const replyText = groqData?.choices?.[0]?.message?.content;
      const data = JSON.parse(replyText || "{}");

      return NextResponse.json({
        isMock: false,
        summary: data.summary || "Solid technical portfolio.",
        score: typeof data.score === "number" ? data.score : 75,
        skills: Array.isArray(data.skills) ? data.skills : ["Problem Solving"],
        insights: Array.isArray(data.insights) ? data.insights : ["Keep practicing."]
      });
    }

    throw new Error("Groq API call failed.");
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate portfolio summary: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
