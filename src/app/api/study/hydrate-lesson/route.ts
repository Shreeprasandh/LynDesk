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
      previousMistakes = [],
      materialContext = ""
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

    const materialPromptSection = materialContext && typeof materialContext === "string" && materialContext.trim().length > 20
      ? `\n\n=== UPLOADED DOCUMENT TEXT (GROUND TRUTH MANDATE) ===\nYou MUST generate all cards, key takeaways, definitions, worked examples, and questions STRICTLY from the real document text below. Do NOT use generic web templates:\n"""\n${materialContext.slice(0, 10000)}\n"""\n`
      : "";

    const systemPrompt = `You are a world-class adaptive educator, computer science professor, and master textbook author. 
Your task is to generate ONE SINGLE, WORLD-CLASS, EXTREMELY DETAILED LESSON for the course "${pathTitle}".

Output ONLY valid JSON matching this exact schema:
{
  "title": "${lessonTitle}",
  "description": "${lessonDescription || "In-depth breakdown of primary definitions, rules, and system mechanics"}",
  "estimatedMinutes": 12,
  "videoResource": {
    "title": "Recommended Video Explainer Tutorial",
    "url": "https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle.replace(/^Lesson\s*\d+\s*[:\-]?\s*/gi, "") + " tutorial")}",
    "channelName": "Academic & Tech Educators",
    "duration": "15:30"
  },
  "practiceProblems": [], // IMPORTANT: Include practiceProblems ONLY if this lesson requires writing code or solving algorithm/data structure problems. Return [] if the lesson is purely theoretical (e.g. Operating Systems concepts, UI Design, DBMS Theory).
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
      "options": ["O(N) Linear Time", "O(1) Constant Time", "O(N log N) Log-Linear Time", "O(N^2) Quadratic Time"],
      "correctAnswerIndex": 1,
      "correctAnswerText": "O(1) Constant Time",
      "explanation": "Push and pop operate directly at the top pointer index in O(1) constant time without needing to iterate through the array."
    },
    {
      "type": "mcq",
      "prompt": "Which boundary condition occurs when attempting to pop an element from an empty data structure?",
      "options": ["Stack Overflow", "Segmentation Fault", "Stack Underflow / Empty State", "Null Pointer Dereference"],
      "correctAnswerIndex": 2,
      "correctAnswerText": "Stack Underflow / Empty State",
      "explanation": "Popping from an empty structure (top == -1) triggers an underflow condition."
    },
    {
      "type": "mcq",
      "prompt": "How does contiguous memory storage in array-based implementations improve CPU cache performance?",
      "options": [
        "By allocating memory dynamically across random heap locations",
        "By eliminating pointer dereferencing overhead",
        "By enforcing strict garbage collection sweeps",
        "By placing adjacent elements in consecutive memory addresses for spatial cache locality"
      ],
      "correctAnswerIndex": 3,
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
1. ZERO TAUTOLOGY & HIGH-YIELD KEY TAKEAWAYS:
   - NEVER write circular phrases (e.g. NEVER write "Stack implementation: using a stack to store elements"). Write real, concise academic explanations with zero fluff.
   - "keyTakeaway" MUST be a non-trivial, actionable principle, memory hook, or architectural rule (e.g. "The kernel operates in privilege Ring 0 (Kernel Mode) to isolate direct hardware access from user processes in Ring 3"). NEVER repeat the card title or topic name as the key takeaway!
2. RANDOMIZED MCQ CORRECT ANSWERS:
   - "correctAnswerIndex" MUST be randomly distributed across 0, 1, 2, and 3 for each generated question. NEVER put all correct answers at index 0 or 1! Shuffling option positions is mandatory.
2. HIGH-YIELD RICH CONTENT:
   - Card "content" MUST be thorough, deep, and educational (at least 4-6 detailed sentences explaining mechanisms, trade-offs, internal mechanics, or execution flow). NEVER write single-line or 1-2 sentence trivial definitions.
3. CONCRETE PRACTICAL EXAMPLES ONLY WHEN NEEDED:
   - Include "example" ONLY if it provides a concrete real-world scenario, numerical calculation, step-by-step example, or executable code snippet. Omit "example" if it merely repeats the definition or title verbatim.
4. DOMAIN & STYLE ADAPTABILITY:
   - For Technical/Programming topics (CS, DSA, Web Dev, DB, OS): Provide runnable Java/Python/C++/SQL code in Card 4, memory pointer calculations, and LeetCode labs.
   - For Math/Science/Economics topics: Provide Python numerical modeling scripts, formula derivations, or worked proofs in Card 4.
   - For Humanities/Social Sciences (History, Law, Philosophy): Provide concrete worked case studies, primary source analysis, event flowcharts, and analytical scenario questions instead of forcing unnatural programming code.
5. ACTIONABLE PROMPT STEM: For practice questions, write active, explicit prompts (e.g. "Implement a complete Stack class in Java with push() and pop() methods" or "Analyze how the Edict of Nantes impacted 16th-century religious freedom").
6. RUNNABLE CODE / WORKED EXAMPLE REQUIREMENT: Card 4 MUST contain actual code syntax (for tech/math) or concrete worked case study steps (for humanities) inside the "example" field.
7. MERMAID DIAGRAM REQUIREMENT: Card 3 MUST contain a valid "diagramMermaid" string.
8. TARGETED REMEDIATION: Incorporate concepts targeting the student's previous mistakes if provided: ${mistakesSummary}`;

    const userPrompt = `Hydrate Lesson:
Course: "${pathTitle}"
Section: "${sectionTitle}"
Lesson Title: "${lessonTitle}"
Description: "${lessonDescription}"
Depth Mode: "${depthMode}"
Student Remediations: ${mistakesSummary}${materialPromptSection}`;

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
            badge: "Foundational Theory",
            content: `Deep theoretical breakdown detailing core definitions, system boundaries, and execution models of ${lessonTitle} in ${pathTitle}. Understand how input payloads map to contiguous physical memory structures and privilege levels.`,
            keyTakeaway: `System execution relies on isolated privilege levels so unhandled application crashes in user space cannot corrupt system kernel memory.`,
            example: `Architecture Axiom: Operating systems enforce hardware-software abstraction by trapping system calls (e.g., sys_write) into Kernel Mode Ring 0.`
          },
          {
            title: `2. Internal System Mechanics & Execution Flow`,
            badge: "System Mechanics",
            content: `Step-by-step trace of state transitions, pointer updates, and memory offset calculations for ${lessonTitle}. Observe how contiguous memory locality minimizes cache misses.`,
            keyTakeaway: "Contiguous spatial locality maximizes CPU L1/L2 cache prefetching, achieving O(1) direct memory access time complexity.",
            example: `Memory Derivation: Base_Address + (Index * Element_Size) computes physical RAM offsets directly without requiring linked list traversal.`
          },
          {
            title: `3. Visual System Flowchart & Dependency Architecture`,
            badge: "Visual Architecture",
            content: `Structural flowchart depicting input payload validation, state transitions, and memory write cycles for ${lessonTitle}. Trace failure boundaries and data dependencies across execution steps.`,
            keyTakeaway: "Enforce strict capacity boundary checks before updating write pointers to prevent buffer overflows and heap corruption.",
            diagramMermaid: `graph TD;\n  A[Input Payload] --> B[Validate Boundary & Capacity];\n  B -->|Valid| C[Switch to Kernel Privilege Mode];\n  C --> D[Execute Contiguous Memory Write];\n  D --> E[Return Success Execution State];\n  B -->|Invalid| F[Raise Out-Of-Bounds Exception];`
          },
          {
            title: `4. Production Code Implementation & Worked Syntax`,
            badge: "Worked Code Example",
            content: `Production-grade execution walkthrough demonstrating concrete error handling, bounds checking, and resource allocation for ${lessonTitle}.`,
            keyTakeaway: "Always validate capacity boundary limits (e.g., pointer >= capacity) before executing low-level memory writes.",
            example: `// Production Implementation Example\npublic class SystemResourceManager {\n  private final int[] buffer;\n  private int pointer = -1;\n  public SystemResourceManager(int capacity) { this.buffer = new int[capacity]; }\n  public void allocate(int resourceId) {\n    if (pointer >= buffer.length - 1) throw new IllegalStateException("Capacity Bound Exceeded");\n    buffer[++pointer] = resourceId;\n  }\n}`
          }
        ],
        questions: [
          {
            type: "mcq",
            prompt: `What primary architectural mechanism ensures user applications cannot corrupt physical hardware memory during execution?`,
            options: [
              "Linear Linked List Traversal",
              "Dual-Mode Privilege Isolation (User Mode vs Kernel Mode)",
              "Dynamic Garbage Collection Sweeps",
              "Unrestricted Hardware Registers"
            ],
            correctAnswerIndex: 1,
            correctAnswerText: "Dual-Mode Privilege Isolation (User Mode vs Kernel Mode)",
            explanation: "Dual-mode execution isolates direct hardware access to privilege Ring 0 (Kernel Mode), preventing user processes in Ring 3 from corrupting system memory."
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
      const sanitizedCards = parsed.cards.map((c: any) => {
        const title = sanitizeString(c.title) || "Core Concept";
        let kw = sanitizeString(c.keyTakeaway);
        let ex: string | undefined = sanitizeString(c.example);

        const cleanTitle = title.replace(/^\d+[\.\)]\s*/, "").replace(/^[a-z0-9\s]+:\s*/i, "").trim().toLowerCase();
        
        // Post-processing guard: If keyTakeaway matches title or is trivial, replace with high-yield insight!
        if (!kw || kw.trim().toLowerCase() === title.trim().toLowerCase() || kw.trim().toLowerCase() === cleanTitle || kw.length < 12) {
          kw = `Key Principle: ${lessonTitle} establishes isolated execution boundaries and deterministic state transitions under capacity constraints.`;
        }

        // Post-processing guard: If example matches title or is trivial, omit!
        if (ex && (ex.trim().toLowerCase() === title.trim().toLowerCase() || ex.trim().toLowerCase() === cleanTitle || ex.length < 12)) {
          ex = undefined;
        }

        return {
          title,
          badge: sanitizeString(c.badge) || "Core Concept",
          content: sanitizeString(c.content) || `Deep structural breakdown detailing definitions, execution models, and operational principles of ${lessonTitle}.`,
          keyTakeaway: kw,
          example: ex,
          diagramMermaid: c.diagramMermaid ? sanitizeString(c.diagramMermaid) : undefined,
        };
      });

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
