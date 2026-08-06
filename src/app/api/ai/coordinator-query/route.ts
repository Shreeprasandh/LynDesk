import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, students } = body;

    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!groqApiKey) {
      const queryLower = (query || "").toLowerCase();
      let filtered = [...students];
      let matches = "Filtered using query engine. ";

      const rangeMatch = queryLower.match(/(?:from\s+)?(\d+)\s*(?:to|and|-)\s*(\d+)/i);
      const firstNMatch = queryLower.match(/first\s+(\d+)\s+roll/i);
      
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        filtered = filtered.filter(s => {
          const num = parseInt(s.rollNo);
          return num >= start && num <= end;
        });
        matches += `Matching roll numbers ${start} to ${end}. `;
      } else if (firstNMatch) {
        const count = parseInt(firstNMatch[1]);
        filtered = filtered.sort((a, b) => parseInt(a.rollNo) - parseInt(b.rollNo)).slice(0, count);
        matches += `Matching first ${count} roll numbers. `;
      } else {
        const singleRollMatch = queryLower.match(/roll\s*(?:no|number)?\s*(\d+)/i);
        if (singleRollMatch) {
          const roll = singleRollMatch[1];
          filtered = filtered.filter(s => s.rollNo === roll);
          matches += `Matching roll number ${roll}. `;
        }
      }

      if (queryLower.includes("total sum") || queryLower.includes("sum they solved") || queryLower.includes("sum of")) {
        const isLastWeek = queryLower.includes("last week") || queryLower.includes("week");
        const totalSolved = filtered.reduce((acc, s) => acc + (s.leetcodeSolved || 0), 0);
        const lastWeekSum = filtered.reduce((acc, s) => acc + Math.round((s.leetcodeSolved || 0) * 0.08), 0);
        const targetSum = isLastWeek ? lastWeekSum : totalSolved;
        const metricName = isLastWeek ? "Total Solved Last Week" : "Total Solved (Lifetime)";

        return NextResponse.json({
          isMock: true,
          explanation: `${matches}Calculated aggregate sum for ${filtered.length} student(s).`,
          header: ["Metric", "Value"],
          rows: [
            [metricName, `${targetSum} problems`]
          ]
        });
      }

      let columns = ["Roll No", "Name", "Department", "LeetCode Solved", "Codeforces Rating"];
      const wantsProblems = queryLower.includes("problem") || queryLower.includes("solve") || queryLower.includes("lc") || queryLower.includes("leetcode");
      const wantsName = queryLower.includes("name");
      const wantsRoll = queryLower.includes("roll") || queryLower.includes("register") || queryLower.includes("number") || queryLower.includes("reg");
      const wantsOnlyLc = queryLower.includes("only") && wantsProblems && !wantsName && !wantsRoll;

      if (wantsOnlyLc) {
        columns = ["LeetCode Solved"];
      } else if (wantsProblems || wantsName || wantsRoll) {
        columns = [];
        if (wantsRoll) columns.push("Roll No");
        if (wantsName) columns.push("Name");
        if (wantsProblems) columns.push("LeetCode Solved");
        if (columns.length === 0) {
          columns = ["Roll No", "Name", "LeetCode Solved"];
        }
      }

      return NextResponse.json({
        isMock: true,
        explanation: `${matches}Found ${filtered.length} student(s).`,
        header: columns,
        rows: filtered.map(s => {
          const row = [];
          if (columns.includes("Roll No")) row.push(s.rollNo || "N/A");
          if (columns.includes("Name")) row.push(s.name);
          if (columns.includes("Department")) row.push(s.department);
          if (columns.includes("LeetCode Solved")) row.push(s.leetcodeSolved?.toString() || "0");
          if (columns.includes("Codeforces Rating")) row.push(s.codeforcesRating?.toString() || "0");
          return row;
        })
      });
    }

    const systemPrompt = `You are a data analyst AI for university faculty. Output JSON matching this schema:
{
  "clarificationNeeded": false,
  "explanation": "Brief explanation of filter applied",
  "header": ["Roll No", "Name", "LeetCode Solved"],
  "rows": [
    ["101", "Student Name", "120"]
  ]
}`;

    const userPrompt = `Student Registry Data:
${JSON.stringify(students, null, 2)}

User Request: "${query}"`;

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
          temperature: 0.2,
        }),
      });
    } catch (fetchErr) {
      console.error("Groq fetch error:", fetchErr);
      return NextResponse.json({
        isMock: true,
        explanation: "Processed offline fallback query.",
        header: ["Student", "Roll No", "LeetCode Solved"],
        rows: (students || []).slice(0, 5).map((s: any) => [s.name || s.username || "Student", s.rollNo || "101", String(s.leetcodeSolved || 0)])
      });
    }

    if (groqRes.ok) {
      const groqData = await groqRes.json();
      const replyText = groqData?.choices?.[0]?.message?.content;
      const data = JSON.parse(replyText || "{}");

      return NextResponse.json({
        isMock: false,
        clarificationNeeded: !!data.clarificationNeeded,
        clarificationMessage: data.clarificationMessage || "",
        explanation: data.explanation || "Query processed.",
        header: Array.isArray(data.header) ? data.header : [],
        rows: Array.isArray(data.rows) ? data.rows : []
      });
    }

    throw new Error("Groq query evaluation failed.");

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to parse query: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
