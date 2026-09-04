import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface SourceFileInput {
  id?: string;
  name: string;
  type: string;
  rawTextPreview?: string;
}

function sanitizeString(str?: string): string {
  if (!str) return "";
  if (/<<|\/Filter|\/FlateDecode|Length \d+|obj|endobj|\/MediaBox|\/ExtGState|\/Catalog|\/Pages|\/Font|\/Type/i.test(str)) {
    return "";
  }
  return str
    .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, " ")
    .replace(/<<[\s\S]*?>>/g, " ")
    .replace(/stream[\s\S]*?endstream/gi, " ")
    .replace(/\/(Filter|FlateDecode|Length|MediaBox|Font|Type|Page)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeTextOutput(str?: string): string {
  if (!str || typeof str !== "string") return "";
  return str.trim();
}

function generateFallbackSections(
  pathTitle: string,
  depthMode: string = "standard",
  files: SourceFileInput[] = [],
  subtopics: string = ""
) {
  const title = pathTitle || "Academic Study Subject";
  const fileNames = files.map((f) => f.name).join(", ");
  const descPrefix = fileNames ? `Derived from ${fileNames}. ` : "";

  const parsedSubtopics = (subtopics || "")
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 1);

  let targetTotal = 16;
  let sectionsCount = 5;

  if (depthMode === "sprint") {
    targetTotal = 5;
    sectionsCount = Math.max(2, parsedSubtopics.length > 0 ? Math.min(parsedSubtopics.length, 3) : 2);
  } else if (depthMode === "deep") {
    targetTotal = 30;
    sectionsCount = Math.max(6, parsedSubtopics.length > 0 ? Math.min(parsedSubtopics.length, 9) : 8);
  } else {
    sectionsCount = Math.max(4, parsedSubtopics.length > 0 ? Math.min(parsedSubtopics.length, 6) : 5);
  }

  const defaultTopics = [
    { title: "Core Fundamentals & Terminology", badge: "Theory & Definitions", desc: "Foundational rules, core mechanics, and key terminology." },
    { title: "Step-by-Step Practical Application", badge: "Worked Example", desc: "Detailed step-by-step problem solving and practical applications." },
    { title: "Architecture & Visual Systems", badge: "Architecture Map", desc: "Diagrams, flowcharts, and structural relationships." },
    { title: "Performance, Trade-offs & Bounds", badge: "Optimization", desc: "Time/space complexity, efficiency bounds, and constraints." },
    { title: "Edge Cases & Critical Safety Rules", badge: "Edge Cases", desc: "Error handling, boundary conditions, and common pitfalls." },
    { title: "Advanced Real-World Case Studies", badge: "Real World", desc: "Production patterns, real-world case studies, and exam problems." }
  ];

  const topics = parsedSubtopics.length > 0
    ? parsedSubtopics.map(st => {
        const capitalized = st.charAt(0).toUpperCase() + st.slice(1);
        return {
          title: capitalized,
          badge: "Module Study",
          desc: `Comprehensive breakdown and practical applications of ${st.toLowerCase()} in ${title}.`
        };
      })
    : defaultTopics;

  const lessonsPerSec = Math.ceil(targetTotal / sectionsCount);
  const sections = [];
  let lessonCounter = 1;

  for (let s = 0; s < sectionsCount; s++) {
    const secNum = s + 1;
    const secTopic = topics[s % topics.length];
    const lessons = [];

    for (let l = 0; l < lessonsPerSec && lessonCounter <= targetTotal; l++) {
      const lesTopic = topics[(s + l) % topics.length];
      const lesId = `les_${secNum}_${l + 1}_${Math.random().toString(36).substring(2, 7)}`;

      lessons.push({
        id: lesId,
        sectionId: `sec_${secNum}`,
        pathId: "pending",
        title: `${secTopic.title}: Module ${l + 1}`,
        description: `${descPrefix}${lesTopic.desc}`,
        xpValue: 10,
        estimatedMinutes: 8,
        completed: false,
        videoResource: {
          title: `Video Tutorial: Master ${secTopic.title}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(secTopic.title + " tutorial")}`,
          channelName: "Academic & Tech Educators",
          duration: "14:20"
        },
        practiceProblems: /coding|program|algorithm|data structure|leetcode|python|javascript|typescript|c\+\+|java|sql|react|node|tree|graph|array/i.test(secTopic.title) ? [
          {
            title: `Practice Challenge: ${secTopic.title}`,
            url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(secTopic.title + " problem")}`,
            platform: "LeetCode",
            difficulty: l % 2 === 0 ? "Easy" : "Medium"
          }
        ] : [],
        cards: [
          {
            title: `1. Core Theoretical Foundations of ${lesTopic.title}`,
            badge: "Theory & Invariants",
            content: `Master the foundational definitions, structural invariants, and core principles of ${title} regarding ${lesTopic.title.toLowerCase()}. Understand how input state variables map deterministically to memory and system execution.`,
            keyTakeaway: `Master core terminology, variable scopes, and theoretical rules governing ${lesTopic.title.toLowerCase()}.`,
            example: `Core Principle: ${title} applies ${lesTopic.title.toLowerCase()} to transform input states under strict execution constraints.`,
          },
          {
            title: `2. Internal System Mechanics & Memory Allocation`,
            badge: "System Mechanics",
            content: `Study how memory allocation, pointer shifts, and variable stack frame updates operate under ${lesTopic.title.toLowerCase()}. Pay close attention to contiguous cache access versus dynamic pointer overhead.`,
            keyTakeaway: "Cache locality provides O(1) random access, while dynamic references trade allocation time for flexible sizing.",
            example: `Mechanics: Array indexes [0..N-1] map directly to physical memory addresses via Base_Address + Index * Element_Size.`,
          },
          {
            title: `3. Visual System Architecture & Data Flowchart`,
            badge: "Visual Architecture",
            content: `Examine the visual flowchart and structural dependencies of ${lesTopic.title.toLowerCase()}. Trace state transformations from input payload to execution output.`,
            keyTakeaway: "Visualize pointer transitions to eliminate boundary errors and memory leaks.",
            diagramMermaid: `graph TD;\n  A[Input Operations] --> B[Validate Boundary Constraints];\n  B --> C[Update Pointer State & Contiguous Memory];\n  C --> D[Execute Transformation];\n  D --> E[Return Target Output State];`
          },
          {
            title: `4. Runnable Code Implementation & Worked Proof`,
            badge: "Worked Code Example",
            content: `Walk through a concrete, production-grade implementation of ${lesTopic.title.toLowerCase()} in Java/Python. Study how error handling and bounds checks are enforced line-by-line.`,
            keyTakeaway: "Always validate capacity boundaries (e.g. top == capacity - 1) before performing write operations.",
            example: `// Java Concrete Implementation\npublic class SystemDataStructure {\n  private int[] data;\n  private int top;\n  public SystemDataStructure(int size) {\n    data = new int[size];\n    top = -1;\n  }\n  public void push(int val) {\n    if (top >= data.length - 1) throw new StackOverflowError();\n    data[++top] = val;\n  }\n  public int pop() {\n    if (top < 0) throw new IllegalStateException("Underflow");\n    return data[top--];\n  }\n}`,
          },
          {
            title: `5. Time/Space Complexity & Edge Case Analysis`,
            badge: "Complexity & Edge Cases",
            content: `Analyze the Time Complexity O(1) vs O(N) and Space Complexity O(N) for ${lesTopic.title.toLowerCase()}. Identify critical boundary states (e.g. Stack Overflow, Stack Underflow, Division by Zero).`,
            keyTakeaway: "Time Complexity for Push/Pop is O(1) amortized, but dynamic resizing incurs rare O(N) array copy operations.",
            example: `Edge Case: Push on full capacity triggers StackOverflowError. Pop on top == -1 triggers StackUnderflow.`,
          },
          {
            title: `6. Exam Cheat Sheet & High-Yield Summary`,
            badge: "Exam Cheat Sheet",
            content: `High-yield cheat sheet summarizing key formulas, complexity bounds, and exam pitfalls for ${lesTopic.title.toLowerCase()}.`,
            keyTakeaway: "Memorize O(1) push/pop operations, LIFO (Last-In-First-Out) ordering, and array capacity bounds.",
            example: `Cheat Sheet: Push = O(1), Pop = O(1), Peek = O(1). Access by index = O(N) search unless top index is tracked.`,
          }
        ],
        questions: [
          {
            type: "mcq",
            prompt: `What is a primary principle regarding ${lesTopic.title.toLowerCase()} in ${title}?`,
            options: [
              `Core principles and operational mechanics of ${lesTopic.title.toLowerCase()}`,
              "Deprecated legacy assumptions",
              "Unrelated external hardware bounds",
              "Secondary administrative overhead"
            ],
            correctAnswerIndex: 0,
            correctAnswerText: `Core principles and operational mechanics of ${lesTopic.title.toLowerCase()}`,
            explanation: `This choice accurately reflects the main focus of ${lesTopic.title.toLowerCase()} in ${title}.`
          },
          {
            type: "mcq",
            prompt: `When evaluating edge cases for ${lesTopic.title.toLowerCase()}, which condition is most critical?`,
            options: [
              "Verifying boundary constraints and non-null/non-zero denominator states",
              "Ignoring zero and negative inputs",
              "Skipping step-by-step validation",
              "Relying on implicit global assumptions"
            ],
            correctAnswerIndex: 0,
            correctAnswerText: "Verifying boundary constraints and non-null/non-zero denominator states",
            explanation: "Checking boundary conditions prevents runtime errors and undefined mathematical states."
          },
          {
            type: "mcq",
            prompt: `What is the recommended first step when solving multi-variable expressions involving ${lesTopic.title.toLowerCase()}?`,
            options: [
              "Isolate constants and group like terms",
              "Randomly guess integer substitutions",
              "Discard complex fractional terms",
              "Assume all variable values are 1"
            ],
            correctAnswerIndex: 0,
            correctAnswerText: "Isolate constants and group like terms",
            explanation: "Grouping like terms reduces complexity and simplifies isolation of the target variable."
          },
          {
            type: "short_answer",
            prompt: `In your own words, summarize the importance of ${lesTopic.title.toLowerCase()} for ${title}.`,
            modelAnswer: `It provides foundational structure, predictability, and efficiency when working with ${title}.`,
            keywords: title.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
          }
        ],
      });
      lessonCounter++;
    }

    if (lessons.length > 0) {
      sections.push({
        id: `sec_${secNum}`,
        pathId: "pending",
        title: `Section ${secNum}: ${secTopic.title}`,
        description: `Key principles, mechanisms, and practice for ${secTopic.title.toLowerCase()}.`,
        lessons,
      });
    }
  }

  return sections;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      pathTitle, 
      pathDescription, 
      subtopics = "", 
      depthMode = "standard", 
      learningStyle = "balanced",
      creationMode = "prompt",
      files = [] 
    } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (geminiApiKey || groqApiKey) {
      try {
        let sourceSummary = "";
        files.forEach((f: SourceFileInput, idx: number) => {
          const cleanedText = sanitizeString(f.rawTextPreview || "");
          sourceSummary += `--- File ${idx + 1}: ${f.name} ---\n`;
          sourceSummary += (cleanedText || f.rawTextPreview || "").slice(0, 15000) + "\n\n";
        });

        const lessonTargetCount = depthMode === "sprint" 
          ? "5 lessons total distributed across 2-3 distinct sections" 
          : depthMode === "deep" 
          ? "24 to 36 lessons total distributed across 6-9 distinct sections (each section MUST contain 3 to 5 lessons)" 
          : "15 to 20 lessons total distributed across 4-6 distinct sections (each section MUST contain 3 to 4 lessons)";

        const systemPrompt = `You are a world-class adaptive educator, textbook author, and master curriculum architect.
Learning style: ${learningStyle}. Creation mode: ${creationMode}.
Output ONLY valid JSON matching this schema:
{
  "extractedTitle": "Auto-extracted concise topic title from document or user input",
  "extractedDescription": "Auto-extracted concise 1-2 sentence description summarizing the course",
  "sections": [
    {
      "title": "Section Title (e.g. Section 1: Core Fundamentals & System Architecture)",
      "description": "Comprehensive section overview describing module goals",
      "lessons": [
        {
          "title": "Lesson 1: Foundations & Core Concepts",
          "description": "In-depth breakdown of primary definitions, rules, and system mechanics",
          "estimatedMinutes": 12,
          "videoResource": {
            "title": "Recommended Video Explainer Tutorial",
            "url": "https://www.youtube.com/results?search_query=topic_name",
            "channelName": "Verified Educational Channel",
            "duration": "15:45"
          },
          "practiceProblems": [
            {
              "title": "Relevant Practice Challenge or LeetCode/Math Exercise",
              "url": "https://leetcode.com/problemset/all/",
              "platform": "LeetCode",
              "difficulty": "Medium"
            }
          ],
          "cards": [
            {
              "title": "1. Theoretical Foundations & Core Axioms",
              "badge": "Theory",
              "content": "Comprehensive 5-6 sentence explanation of foundational definitions, theorems, historical context, and rules.",
              "keyTakeaway": "Bullet summary takeaway",
              "example": "Formal mathematical definition, theorem, or axiom",
              "diagramMermaid": "graph TD; A[Axiom] --> B[Theorem]"
            },
            {
              "title": "2. Step-by-Step Worked Example",
              "badge": "Basic Worked Example",
              "content": "Step-by-step problem walkthrough showing how to solve foundational problems line-by-line.",
              "keyTakeaway": "Step-by-step execution tip",
              "example": "Step 1: Setup equation. Step 2: Simplify. Step 3: Solve."
            }
          ],
          "questions": [
            {
              "type": "mcq",
              "prompt": "First assessment question stem",
              "options": ["Correct Choice", "Distractor 1", "Distractor 2", "Distractor 3"],
              "correctAnswerIndex": 0,
              "correctAnswerText": "Correct Choice",
              "explanation": "Detailed explanation of why choice 0 is correct"
            },
            {
              "type": "short_answer",
              "prompt": "Written conceptual question prompt",
              "modelAnswer": "Comprehensive model response",
              "keywords": ["key1", "key2"]
            }
          ]
        },
        {
          "title": "Lesson 2: Advanced Operations & Deep Mechanics",
          "description": "Detailed study of complex operations, edge cases, and practical algorithms",
          "estimatedMinutes": 15,
          "videoResource": {
            "title": "Deep Dive Video Explainer Tutorial",
            "url": "https://www.youtube.com/results?search_query=topic_advanced",
            "channelName": "Verified Educational Channel",
            "duration": "18:20"
          },
          "practiceProblems": [
            {
              "title": "Advanced Practice Challenge",
              "url": "https://leetcode.com/problemset/all/",
              "platform": "LeetCode",
              "difficulty": "Hard"
            }
          ],
          "cards": [
            {
              "title": "1. Advanced Operations & Edge Cases",
              "badge": "Advanced Mechanics",
              "content": "In-depth breakdown of complex mechanisms, boundary conditions, and state transitions.",
              "keyTakeaway": "Crucial boundary constraint rule",
              "example": "Step 1: Handle boundary state. Step 2: Execute transformation."
            }
          ],
          "questions": [
            {
              "type": "mcq",
              "prompt": "Advanced assessment question stem",
              "options": ["Correct Choice", "Distractor 1", "Distractor 2", "Distractor 3"],
              "correctAnswerIndex": 0,
              "correctAnswerText": "Correct Choice",
              "explanation": "Detailed explanation"
            }
          ]
        },
        {
          "title": "Lesson 3: Practical Industry Applications & Case Studies",
          "description": "Real-world engineering patterns, system design, and production trade-offs",
          "estimatedMinutes": 15,
          "videoResource": {
            "title": "Production Case Study Video",
            "url": "https://www.youtube.com/results?search_query=topic_case_study",
            "channelName": "Tech Engineering Channel",
            "duration": "14:10"
          },
          "cards": [
            {
              "title": "1. Production Architecture & Real World Systems",
              "badge": "Real World",
              "content": "Production case study showing how enterprise systems apply these principles.",
              "keyTakeaway": "Industry trade-off insight"
            }
          ],
          "questions": [
            {
              "type": "mcq",
              "prompt": "Case study assessment question stem",
              "options": ["Correct Choice", "Distractor 1", "Distractor 2", "Distractor 3"],
              "correctAnswerIndex": 0,
              "correctAnswerText": "Correct Choice",
              "explanation": "Detailed explanation"
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL CURRICULUM QUALITY & DEPTH DIRECTIVES:
1. ZERO TAUTOLOGY & NO REPETITIVE TEXT: NEVER produce circular or superficial descriptions (e.g. NEVER write "Array-Based Stack: using an array to store elements" or "Key Takeaway: Array-based stack in Java"). Every card MUST contain deep, high-yield academic mechanics, real worked code, formulas, and actionable insights.
2. MANDATORY CARDS PER LESSON (4 to 6 CARDS): Every single lesson MUST contain AT LEAST 4 to 6 detailed, progressive teaching cards:
   - Card 1: "Foundational Architecture & Definitions" (5-7 sentences detailing core terms, invariants, and scope).
   - Card 2: "Core Mechanics & State Transformations" (Step-by-step memory pointer shifts, variable transformations, or mathematical derivations).
   - Card 3: "Visual Architecture Flowchart" (Must include an explicit "diagramMermaid" string mapping system state transitions).
   - Card 4: "Runnable Code Implementation & Worked Example" (Must provide full runnable worked code in Java/C++/Python/SQL inside "example", e.g. "public class ArrayStack { private int[] stack; private int top = -1; ... }", OR full step-by-step worked numerical solutions for math).
   - Card 5: "Complexity Analysis, Edge Cases & Pitfalls" (Analyze Time/Space complexity O(1)/O(N), stack overflow/underflow, memory overhead, and exam trap cases).
   - Card 6: "Exam Cheat Sheet & High-Yield Summary" (Bullet takeaways and key rules).
3. MANDATORY ASSESSMENTS PER LESSON (3 to 5 QUESTIONS): Every lesson MUST contain 3 to 5 assessment questions (mixture of 4-option MCQs and written/coding exercises with complete model answers).
4. FULL TOPIC ADAPTABILITY: Let the structure expand naturally based on subject complexity, depthMode (${depthMode}), subtopics requested, and uploaded material contents.
5. PDF & MATERIALS EXTRACTION: ${creationMode === "materials" ? "Thoroughly analyze the extracted text preview from the uploaded document. Build lessons directly from the real formulas, definitions, theorems, code syntax, and case studies inside the document." : "Build lessons directly from the Provided Title and subtopics."}
6. VIDEO & PRACTICE RESOURCES: Provide specific, high-yield YouTube search/watch links and LeetCode/Khan Academy/Coursera practice problems for every lesson.
7. FINAL MILESTONE: Always append a final section titled "SECTION: GRAND PATH EXAM & FINAL MILESTONE" containing 1 comprehensive cumulative exam lesson.`;

        const userPrompt = `Build a structured study path.
Mode: ${creationMode}
Title Input: "${pathTitle || ""}"
Description Input: "${pathDescription || ""}"
Subtopics Input: "${subtopics || ""}"
Depth Mode: ${depthMode} (${lessonTargetCount})

Source text preview from uploaded files:
${sourceSummary || "None (Prompt-driven mode)"}`;

        const geminiApiKey = process.env.GEMINI_API_KEY;
        let jsonText = "";

        if (geminiApiKey) {
          try {
            const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash",
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.35,
                maxOutputTokens: 8192
              },
              systemInstruction: systemPrompt
            });

            const result = await model.generateContent(userPrompt);
            jsonText = result.response.text();
          } catch (geminiErr) {
            console.warn("Gemini study generation error, falling back to Groq:", geminiErr);
          }
        }

        if (!jsonText && groqApiKey) {
          const candidateModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
          for (const candModel of candidateModels) {
            try {
              const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${groqApiKey.trim()}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: candModel,
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                  ],
                  response_format: { type: "json_object" },
                  temperature: 0.4,
                  max_tokens: 8000,
                }),
              });

              if (groqRes.ok) {
                const groqData = await groqRes.json();
                const content = groqData?.choices?.[0]?.message?.content || "";
                if (content) {
                  jsonText = content;
                  break;
                }
              }
            } catch {
              // Try next model candidate
            }
          }
        }

        if (!jsonText) {
          return NextResponse.json({
            success: true,
            isMock: true,
            title: pathTitle || "Structured Study Path",
            description: pathDescription || "Adaptive AI learning curriculum.",
            sections: generateFallbackSections(pathTitle, depthMode, files, subtopics)
          });
        }

        const parsed = JSON.parse(jsonText || "{}");

          if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            const finalTitle = parsed.extractedTitle || pathTitle || "Structured Study Path";
            const finalDesc = parsed.extractedDescription || pathDescription || "Adaptive AI learning curriculum.";

            const processedSections = parsed.sections.map((sec: any, secIdx: number) => ({
              id: `sec_${secIdx + 1}`,
              pathId: "pending",
              title: sanitizeTextOutput(sec.title) || `Section ${secIdx + 1}`,
              description: sanitizeTextOutput(sec.description) || "Key concepts and review.",
              lessons: (sec.lessons || []).map((les: any, lesIdx: number) => ({
                id: `les_${secIdx + 1}_${lesIdx + 1}_${Math.random().toString(36).substring(2, 6)}`,
                sectionId: `sec_${secIdx + 1}`,
                pathId: "pending",
                title: sanitizeTextOutput(les.title) || `Lesson ${lesIdx + 1}`,
                description: sanitizeTextOutput(les.description) || "Practice and review.",
                xpValue: sec.title?.toUpperCase().includes("GRAND PATH EXAM") ? 50 : 10,
                estimatedMinutes: typeof les.estimatedMinutes === "number" ? les.estimatedMinutes : 5,
                completed: false,
                videoResource: les.videoResource ? {
                  title: sanitizeTextOutput(les.videoResource.title) || `Understanding ${les.title}`,
                  youtubeSearchQuery: sanitizeTextOutput(les.videoResource.youtubeSearchQuery) || `${les.title} tutorial`,
                  duration: les.videoResource.duration || "10 mins"
                } : undefined,
                practiceProblems: Array.isArray(les.practiceProblems) ? les.practiceProblems.map((p: any) => ({
                  title: sanitizeTextOutput(p.title) || "Core Practice Problem",
                  platform: p.platform || "LeetCode",
                  difficulty: p.difficulty || "Easy",
                  url: p.url || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(les.title || "")}`
                })) : [],
                cards: (les.cards || []).map((c: any) => ({
                  title: sanitizeTextOutput(c.title) || "Core Concept",
                  badge: sanitizeTextOutput(c.badge) || "Summary",
                  content: sanitizeTextOutput(c.content) || "Key definitions and operational rules.",
                  keyTakeaway: sanitizeTextOutput(c.keyTakeaway) || "Focus on primary mechanisms.",
                  diagramMermaid: c.diagramMermaid ? sanitizeTextOutput(c.diagramMermaid) : undefined,
                  example: sanitizeTextOutput(c.example) || undefined,
                })),
                questions: (les.questions || []).map((q: any) => {
                  const type = q.type === "short_answer" ? "short_answer" : "mcq";
                  if (type === "mcq") {
                    const rawOpts = Array.isArray(q.options) ? q.options.map((o: any) => sanitizeTextOutput(o)) : [];
                    const opts = rawOpts.filter((o: string) => o.length > 0);
                    while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
                    return {
                      type: "mcq",
                      prompt: sanitizeTextOutput(q.prompt) || "What is a primary principle of this topic?",
                      options: opts.slice(0, 4),
                      correctAnswerIndex: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
                      correctAnswerText: opts[0],
                      explanation: sanitizeTextOutput(q.explanation) || "Aligns directly with core concepts.",
                    };
                  } else {
                    return {
                      type: "short_answer",
                      prompt: sanitizeTextOutput(q.prompt) || "Summarize the main focus in your own words.",
                      modelAnswer: sanitizeTextOutput(q.modelAnswer) || "Understanding core mechanisms.",
                      keywords: Array.isArray(q.keywords) ? q.keywords.map((k: any) => sanitizeTextOutput(k)) : ["concept"],
                    };
                  }
                }),
              })),
            }));

            return NextResponse.json({ 
              success: true, 
              title: finalTitle, 
              description: finalDesc, 
              sections: processedSections 
            });
          }
      } catch (aiErr) {
        console.warn("AI generation error, using fallback:", aiErr);
      }
    }

    // Fallback curriculum generator
    const fallbackSections = generateFallbackSections(pathTitle, depthMode, files, subtopics);
    return NextResponse.json({ 
      success: true, 
      title: pathTitle || "Structured Study Path", 
      description: pathDescription || "Adaptive AI learning curriculum.",
      sections: fallbackSections 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate AI lessons.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
