import { NextResponse } from "next/server";

function sanitizeString(str: any): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/[\uE000-\uF8FF]/g, "")
    .replace(/[\uD83C-\uD83E][\uDC00-\uDFFF]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      pathTitle = "Study Path", 
      sectionTitle = "Core Module", 
      lessonTitle = "Lesson Topic", 
      lessonDescription = "",
      depthMode = "standard",
      previousMistakes = []
    } = body;

    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({
        success: false,
        message: "Missing GROQ_API_KEY"
      }, { status: 500 });
    }

    const mistakesSummary = Array.isArray(previousMistakes) && previousMistakes.length > 0
      ? `Recent Student Mistakes to target and remediate:\n` + previousMistakes.slice(0, 3).map((m: any) => `- Prompt: "${m.questionPrompt}" | Correct Answer: "${m.correctAnswer}"`).join("\n")
      : "No recent student mistakes.";

    const systemPrompt = `You are a world-class adaptive educator, computer science professor, and master textbook author. 
Your task is to generate ONE SINGLE, WORLD-CLASS, EXTREMELY DETAILED LESSON for the course "${pathTitle}".

Output ONLY valid JSON matching this exact schema:
{
  "title": "${lessonTitle}",
  "description": "${lessonDescription || "In-depth breakdown of primary definitions, rules, and system mechanics"}",
  "estimatedMinutes": 12,
  "videoResource": {
    "title": "Recommended Video Explainer Tutorial",
    "url": "https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle)}",
    "channelName": "Academic & Tech Educators",
    "duration": "15:30"
  },
  "practiceProblems": [
    {
      "title": "Practice Challenge: ${lessonTitle}",
      "url": "https://leetcode.com/problemset/all/?search=${encodeURIComponent(lessonTitle)}",
      "platform": "LeetCode",
      "difficulty": "Medium"
    }
  ],
  "cards": [
    {
      "title": "1. Theoretical Architecture & Core Definitions",
      "badge": "Foundational Theory",
      "content": "Deep 5-7 sentence explanation detailing fundamental definitions, scope, structural invariants, and theoretical rules.",
      "keyTakeaway": "High-yield summary rule",
      "example": "Formal mathematical or architectural axiom definition"
    },
    {
      "title": "2. Internal System Mechanics & Pointer/Memory Derivations",
      "badge": "System Mechanics",
      "content": "Step-by-step breakdown of pointer movements, state transitions, array index calculations (Base_Address + Index * Size), and contiguous cache memory locality.",
      "keyTakeaway": "Cache locality optimization tip",
      "example": "Step 1: Check boundary condition. Step 2: Compute address offset. Step 3: Perform memory write."
    },
    {
      "title": "3. Visual Architecture Diagram & State Flowchart",
      "badge": "Visual Architecture",
      "content": "Comprehensive explanation of system flow.",
      "keyTakeaway": "Visualize pointer bounds to avoid memory leaks and out-of-bounds exceptions.",
      "diagramMermaid": "graph TD;\\n  A[Input Payload] --> B[Validate Capacity Bound];\\n  B --> C[Update Pointer State];\\n  C --> D[Execute Memory Write];\\n  D --> E[Return Target Output];"
    },
    {
      "title": "4. Runnable Executable Code & Concrete Syntax Walkthrough",
      "badge": "Executable Syntax",
      "content": "Line-by-line breakdown of a concrete production-grade implementation in Java/Python/C++.",
      "keyTakeaway": "Always validate array boundaries before performing write operations.",
      "example": "public class ConcreteModule {\\n  private int[] data;\\n  private int top = -1;\\n  public ConcreteModule(int size) { data = new int[size]; }\\n  public void push(int x) { if (top >= data.length - 1) throw new StackOverflowError(); data[++top] = x; }\\n}"
    },
    {
      "title": "5. Time/Space Complexity & Critical Edge Cases",
      "badge": "Complexity & Boundary Checks",
      "content": "Detailed Time Complexity analysis (O(1) vs O(N)), Space Complexity (O(N)), and boundary failure modes (Stack Overflow, Stack Underflow, Division by Zero).",
      "keyTakeaway": "Time Complexity for Push/Pop is O(1) amortized, but dynamic resizing incurs rare O(N) array copy operations.",
      "example": "Edge Case: Push on full capacity triggers StackOverflowError. Pop on top == -1 triggers StackUnderflow."
    },
    {
      "title": "6. High-Yield Exam Cheat Sheet & Production Trade-Offs",
      "badge": "Exam Cheat Sheet",
      "content": "High-yield cheat sheet summarizing key rules, complexity bounds, and exam trap cases.",
      "keyTakeaway": "Memorize O(1) time bounds, LIFO/FIFO ordering, and contiguous array capacity constraints.",
      "example": "Cheat Sheet Summary: Time = O(1), Space = O(N), Access = O(N) unless top pointer index is tracked."
    }
  ],
  "questions": [
    {
      "type": "mcq",
      "prompt": "What is the primary Time Complexity for push and pop operations in an array-based implementation?",
      "options": ["O(1) Constant Time", "O(N) Linear Time", "O(N log N) Log-Linear Time", "O(N^2) Quadratic Time"],
      "correctAnswerIndex": 0,
      "correctAnswerText": "O(1) Constant Time",
      "explanation": "Push and pop operate directly at the top pointer index in O(1) constant time without needing to iterate through the array."
    },
    {
      "type": "mcq",
      "prompt": "Which boundary condition occurs when attempting to pop an element from an empty data structure?",
      "options": ["Stack Underflow / Empty State", "Stack Overflow", "Segmentation Fault", "Null Pointer Dereference"],
      "correctAnswerIndex": 0,
      "correctAnswerText": "Stack Underflow / Empty State",
      "explanation": "Popping from an empty structure (top == -1) triggers an underflow condition."
    },
    {
      "type": "mcq",
      "prompt": "How does contiguous memory storage in array-based implementations improve CPU cache performance?",
      "options": [
        "By placing adjacent elements in consecutive memory addresses for spatial cache locality",
        "By allocating memory dynamically across random heap locations",
        "By eliminating pointer dereferencing overhead",
        "By enforcing strict garbage collection sweeps"
      ],
      "correctAnswerIndex": 0,
      "correctAnswerText": "By placing adjacent elements in consecutive memory addresses for spatial cache locality",
      "explanation": "Contiguous array storage enables CPU cache prefetching due to high spatial locality of reference."
    },
    {
      "type": "short_answer",
      "prompt": "Explain the key difference between fixed-size allocation and dynamic array resizing.",
      "modelAnswer": "Fixed-size allocation sets a static capacity at initialization with zero resizing overhead. Dynamic array resizing automatically doubles capacity when full, providing flexibility at the cost of occasional O(N) array copy operations.",
      "keywords": ["capacity", "allocation", "resizing", "copy", "array"]
    }
  ]
}

STRICT QUALITY RULES:
1. ZERO TAUTOLOGY: NEVER write circular phrases (e.g. NEVER write "Stack implementation: using a stack to store elements"). Write real, concise academic explanations with zero fluff.
2. DOMAIN & STYLE ADAPTABILITY:
   - For Technical/Programming topics (CS, DSA, Web Dev, DB, OS): Provide runnable Java/Python/C++/SQL code in Card 4, memory pointer calculations, and LeetCode labs.
   - For Math/Science/Economics topics: Provide Python numerical modeling scripts, formula derivations, or worked proofs in Card 4.
   - For Humanities/Social Sciences (History, Law, Philosophy): Provide concrete worked case studies, primary source analysis, event flowcharts, and analytical scenario questions instead of forcing unnatural programming code.
3. ACTIONABLE PROMPT STEM: For practice questions, write active, explicit prompts (e.g. "Implement a complete Stack class in Java with push() and pop() methods" or "Analyze how the Edict of Nantes impacted 16th-century religious freedom").
4. RUNNABLE CODE / WORKED EXAMPLE REQUIREMENT: Card 4 MUST contain actual code syntax (for tech/math) or concrete worked case study steps (for humanities) inside the "example" field.
5. MERMAID DIAGRAM REQUIREMENT: Card 3 MUST contain a valid "diagramMermaid" string.
6. TARGETED REMEDIATION: Incorporate concepts targeting the student's previous mistakes if provided: ${mistakesSummary}`;

    const userPrompt = `Hydrate Lesson:
Course: "${pathTitle}"
Section: "${sectionTitle}"
Lesson Title: "${lessonTitle}"
Description: "${lessonDescription}"
Depth Mode: "${depthMode}"
Student Remediations: ${mistakesSummary}`;

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
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.35,
          max_tokens: 4000,
        }),
      });
    } catch (fetchErr) {
      console.error("Groq single lesson hydration fetch error:", fetchErr);
      return NextResponse.json({
        success: true,
        cards: [
          {
            title: `1. Core Theoretical Architecture of ${lessonTitle}`,
            badge: "Theory",
            content: `Master the foundational definitions, structural invariants, and operational principles of ${lessonTitle} in ${pathTitle}.`,
            keyTakeaway: `Understand primary definitions and variable scopes for ${lessonTitle}.`,
            example: `Core Rule: ${lessonTitle} establishes deterministic state transformations under strict capacity bounds.`
          },
          {
            title: `2. Internal System Mechanics & Pointer Calculations`,
            badge: "Mechanics",
            content: `Study memory allocation, pointer updates, and array index offsets operating under ${lessonTitle}.`,
            keyTakeaway: "Contiguous array storage provides O(1) random access time complexity.",
            example: `Base_Address + (Index * Element_Size) calculates physical memory offsets directly.`
          },
          {
            title: `3. Visual Architecture Diagram & State Flowchart`,
            badge: "Visual Architecture",
            content: `Examine the visual flowchart and structural dependencies of ${lessonTitle}.`,
            keyTakeaway: "Visualize pointer bounds to avoid memory leaks and index errors.",
            diagramMermaid: `graph TD;\n  A[Input Payload] --> B[Validate Capacity Bounds];\n  B --> C[Update Pointer State];\n  C --> D[Return Execution Result];`
          },
          {
            title: `4. Concrete Code Implementation & Worked Syntax`,
            badge: "Executable Code",
            content: `Line-by-line breakdown of a concrete production-grade implementation in Java/Python.`,
            keyTakeaway: "Always validate array boundary limits before performing write operations.",
            example: `// Java Concrete Implementation\npublic class ConcreteModule {\n  private int[] data;\n  private int top = -1;\n  public ConcreteModule(int size) { data = new int[size]; }\n  public void push(int x) { if (top >= data.length - 1) throw new StackOverflowError(); data[++top] = x; }\n}`
          }
        ],
        questions: [
          {
            type: "mcq",
            prompt: `What is the primary Time Complexity for operations in ${lessonTitle}?`,
            options: ["O(1) Constant Time", "O(N) Linear Time", "O(N log N) Log-Linear Time", "O(N^2) Quadratic Time"],
            correctAnswerIndex: 0,
            correctAnswerText: "O(1) Constant Time",
            explanation: "Direct pointer indexing operates in O(1) constant time."
          }
        ]
      });
    }

    if (!groqRes.ok) {
      return NextResponse.json({ success: false, message: "Groq API request failed" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const jsonText = groqData?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(jsonText || "{}");

    if (parsed.cards && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
      const sanitizedCards = parsed.cards.map((c: any) => ({
        title: sanitizeString(c.title) || "Core Concept",
        badge: sanitizeString(c.badge) || "Summary",
        content: sanitizeString(c.content) || "Key definitions and operational rules.",
        keyTakeaway: sanitizeString(c.keyTakeaway) || "Focus on primary mechanisms.",
        example: sanitizeString(c.example) || undefined,
        diagramMermaid: c.diagramMermaid ? sanitizeString(c.diagramMermaid) : undefined,
      }));

      const sanitizedQuestions = (parsed.questions || []).map((q: any) => {
        const type = q.type === "short_answer" ? "short_answer" : "mcq";
        if (type === "mcq") {
          const rawOpts = Array.isArray(q.options) ? q.options.map((o: any) => sanitizeString(o)) : [];
          const opts = rawOpts.filter((o: string) => o.length > 1);
          while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
          return {
            type: "mcq",
            prompt: sanitizeString(q.prompt) || "What is a primary principle of this topic?",
            options: opts.slice(0, 4),
            correctAnswerIndex: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
            correctAnswerText: sanitizeString(q.correctAnswerText) || opts[0],
            explanation: sanitizeString(q.explanation) || "Detailed explanation of core principles."
          };
        }
        return {
          type: "short_answer",
          prompt: sanitizeString(q.prompt) || "Summarize the core mechanism in your own words.",
          modelAnswer: sanitizeString(q.modelAnswer) || "Key operational principles apply.",
          keywords: Array.isArray(q.keywords) ? q.keywords.map((k: any) => sanitizeString(k)) : ["concept"]
        };
      });

      return NextResponse.json({
        success: true,
        cards: sanitizedCards,
        questions: sanitizedQuestions,
        practiceProblems: parsed.practiceProblems || [],
        videoResource: parsed.videoResource || undefined
      });
    }

    return NextResponse.json({ success: false, message: "Invalid payload from AI" }, { status: 500 });
  } catch (err: any) {
    console.error("Single lesson hydration error:", err);
    return NextResponse.json({ success: false, message: err?.message || "Server Error" }, { status: 500 });
  }
}
