import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, students } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: If no API key is configured, perform basic regex/mock matching
    if (!apiKey) {
      const queryLower = query.toLowerCase();
      
      let filtered = [...students];
      let matches = "Filtered using fallback engine. ";

      // Basic regex filter for department
      if (queryLower.includes("computer science") || queryLower.includes("cs")) {
        filtered = filtered.filter(s => s.department.toLowerCase().includes("computer science"));
        matches += "Matching department: Computer Science. ";
      } else if (queryLower.includes("information technology") || queryLower.includes("it")) {
        filtered = filtered.filter(s => s.department.toLowerCase().includes("information technology"));
        matches += "Matching department: Information Technology. ";
      } else if (queryLower.includes("electrical") || queryLower.includes("ee")) {
        filtered = filtered.filter(s => s.department.toLowerCase().includes("electrical"));
        matches += "Matching department: Electrical Engineering. ";
      }

      // Basic filter for roll numbers
      if (queryLower.includes("101") && queryLower.includes("102")) {
        filtered = filtered.filter(s => s.rollNo === "101" || s.rollNo === "102");
        matches += "Matching roll numbers: 101 to 102. ";
      } else if (queryLower.includes("101")) {
        filtered = filtered.filter(s => s.rollNo === "101");
        matches += "Matching roll number: 101. ";
      } else if (queryLower.includes("102")) {
        filtered = filtered.filter(s => s.rollNo === "102");
        matches += "Matching roll number: 102. ";
      }

      return NextResponse.json({
        isMock: true,
        explanation: `${matches}Found ${filtered.length} student(s). To get full AI capabilities, add your free GEMINI_API_KEY to your .env.local file.`,
        header: ["Roll No", "Name", "Department", "LeetCode Solved", "Codeforces Rating"],
        rows: filtered.map(s => [
          s.rollNo || "N/A",
          s.name,
          s.department,
          s.leetcodeSolved?.toString() || "0",
          s.codeforcesRating?.toString() || "0"
        ])
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
      1. Carefully parse the user's request. Find which department, roll number range, batch, or solved threshold they are filtering for.
      2. Filter the matching students from the list.
      3. Format the result as a downloadable report, returning:
         - An "explanation" summarizing what filters were applied and who was found.
         - A "header" array representing the columns of the report.
         - A "rows" 2D array representing the table rows matching the headers.
      
      Respond strictly in JSON matching this schema:
      {
        "explanation": "Brief explanation of what filter was applied and count of students found.",
        "header": ["Roll No", "Name", "Department", "LeetCode Solved", "Codeforces Rating", "CodeChef Rating"],
        "rows": [
          ["101", "Student Name", "Department Name", "120", "1400", "1350"]
        ]
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
