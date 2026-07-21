import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, students } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: If no API key is configured, perform intelligent regex matching
    if (!apiKey) {
      const queryLower = query.toLowerCase();
      
      let filtered = [...students];
      let matches = "Filtered using fallback engine. ";

      // Try to parse roll number ranges (e.g., "from 1001 to 2000", "1001-2000", "first 3 roll numbers")
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

      // Check if they asked for a total sum (e.g., "total sum they solved last week", "total sum")
      if (queryLower.includes("total sum") || queryLower.includes("sum they solved") || queryLower.includes("sum of")) {
        const isLastWeek = queryLower.includes("last week") || queryLower.includes("week");
        const totalSolved = filtered.reduce((acc, s) => acc + (s.leetcodeSolved || 0), 0);
        
        // Assume last week's count is roughly 8% of the total solved problems for mock simplicity
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

      // Check if they asked for specific columns: e.g. "leetcode total prob"
      let columns = ["Roll No", "Name", "Department", "LeetCode Solved", "Codeforces Rating"];
      
      const wantsProblems = queryLower.includes("problem") || queryLower.includes("solve") || queryLower.includes("lc") || queryLower.includes("leetcode");
      const wantsName = queryLower.includes("name");
      const wantsRoll = queryLower.includes("roll") || queryLower.includes("register") || queryLower.includes("number") || queryLower.includes("reg");

      // If user asks specifically "only for leetcode total prob" or similar
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
        explanation: `${matches}Found ${filtered.length} student(s). To get full AI capabilities, add your free GEMINI_API_KEY to your .env.local file.`,
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      You are a data analyst AI for university faculty. You are given a list of students with stats and a natural language query requesting a specific report or download.
      
      Student Registry Data:
      ${JSON.stringify(students, null, 2)}
      
      User Request:
      "${query}"
      
      Instructions:
      1. Carefully parse the user's request. Identify any roll ranges (like '1001 to 2000' or '101 to 104'), major/department, or count of problems requested.
      2. Filter the matching students and output only the columns they asked for. (E.g., if they asked for 'leetcode total prob' only, output a single column 'LeetCode Solved').
      3. If the query asks for aggregates (like 'total sum they solved last week alone'), compute the aggregate sum. (You can assume last week's count is roughly 8% of the total solved problems for each student, and output a table with 'Metric' and 'Value' fields detailing the total sum).
      4. If the query is ambiguous, confused, or you are unsure what filters/columns are being requested, set "clarificationNeeded" to true and provide a helpful prompt in "clarificationMessage".
      
      Respond strictly in JSON matching this schema:
      
      Normal Response Schema:
      {
        "clarificationNeeded": false,
        "explanation": "Brief explanation of what filter was applied and count of students found.",
        "header": ["Roll No", "Name", "LeetCode Solved"],
        "rows": [
          ["101", "Student Name", "120"]
        ]
      }
      
      Clarification Schema (use ONLY if request is confusing or lacks key info):
      {
        "clarificationNeeded": true,
        "clarificationMessage": "I'm not sure which department or roll numbers you mean. Could you please specify?"
      }

      Return ONLY the raw JSON string. Do not wrap in markdown block backticks.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
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
      clarificationNeeded: !!data.clarificationNeeded,
      clarificationMessage: data.clarificationMessage || "",
      explanation: data.explanation || "No explanation provided.",
      header: Array.isArray(data.header) ? data.header : [],
      rows: Array.isArray(data.rows) ? data.rows : []
    });

  } catch (error: any) {
    console.error("AI Coordinator Query Error:", error);
    return NextResponse.json(
      { error: "Failed to parse query: " + error.message },
      { status: 500 }
    );
  }
}
