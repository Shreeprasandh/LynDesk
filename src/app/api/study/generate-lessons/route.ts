import { NextResponse } from "next/server";

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
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateFallbackSections(
  pathTitle: string,
  depthMode: string = "standard",
  files: SourceFileInput[] = []
) {
  const title = pathTitle || "Computer Science Fundamentals";
  const fileNames = files.map((f) => f.name).join(", ");
  const descPrefix = fileNames ? `Derived from ${fileNames}. ` : "";

  let targetTotal = 16;
  if (depthMode === "sprint") targetTotal = 5;
  else if (depthMode === "deep") targetTotal = 30;

  const topics = [
    { title: "Core Definitions & Syntax", badge: "Key Concept", desc: "Fundamental terminology and syntax rules." },
    { title: "Architectural Principles", badge: "Architecture", desc: "System structure and modular organization." },
    { title: "Algorithmic Operations", badge: "Algorithm", desc: "Step-by-step processing and execution rules." },
    { title: "Performance & Complexity", badge: "Optimization", desc: "Time/space trade-offs and latency bounds." },
    { title: "Edge Cases & Safety", badge: "Security", desc: "Error handling, boundary conditions, and concurrency." },
    { title: "Practical Application", badge: "Real World", desc: "Production usage patterns and industry practice." },
  ];

  const sectionsCount = depthMode === "sprint" ? 2 : depthMode === "deep" ? 6 : 4;
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
        title: `${secTopic.title}: Part ${l + 1}`,
        description: `${descPrefix}${lesTopic.desc}`,
        xpValue: 10,
        estimatedMinutes: 4 + (l % 3),
        completed: false,
        cards: [
          {
            title: `Overview of ${lesTopic.title}`,
            badge: lesTopic.badge,
            content: `Master the essential principles of ${title} regarding ${lesTopic.title.toLowerCase()}. Focus on foundational mechanisms and key definitions.`,
            keyTakeaway: `Understand how ${lesTopic.title.toLowerCase()} connects to the main system of ${title}.`,
            example: `In production, ${lesTopic.title.toLowerCase()} ensures efficient resource utilization and minimal overhead.`,
          },
          {
            title: "Summary & Practical Rule",
            badge: "Pro Tip",
            content: `Always verify boundary conditions when working with ${title}. Keep execution paths deterministic and trace state changes carefully.`,
            keyTakeaway: "Prioritize memory efficiency, clear state bounds, and predictable execution flow.",
          },
        ],
        questions: [
          {
            type: "mcq",
            prompt: `What is a primary principle regarding ${lesTopic.title.toLowerCase()} in ${title}?`,
            options: [
              `Core principles and operational mechanics of ${lesTopic.title.toLowerCase()}`,
              "Deprecated legacy implementation details",
              "Unrelated external hardware assumptions",
              "Secondary administrative overhead",
            ],
            correctAnswerIndex: 0,
            correctAnswerText: `Core principles and operational mechanics of ${lesTopic.title.toLowerCase()}`,
            explanation: `This choice accurately reflects the main focus of ${lesTopic.title.toLowerCase()} in ${title}.`,
          },
          {
            type: "short_answer",
            prompt: `In your own words, summarize the importance of ${lesTopic.title.toLowerCase()} for ${title}.`,
            modelAnswer: `It provides foundational structure, predictability, and efficiency when working with ${title}.`,
            keywords: title.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
          },
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
    const { pathTitle, pathDescription, depthMode = "standard", files = [] } = body;

    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (groqApiKey) {
      try {
        let sourceSummary = "";
        files.forEach((f: SourceFileInput, idx: number) => {
          sourceSummary += `--- File ${idx + 1}: ${f.name} ---\n`;
          sourceSummary += (f.rawTextPreview || "").slice(0, 4000) + "\n\n";
        });

        const systemPrompt = `You are a world-class CS educator. Output ONLY valid JSON matching this schema:
{
  "sections": [
    {
      "title": "Section Title",
      "description": "Section overview",
      "lessons": [
        {
          "title": "Bite-sized Lesson Title",
          "description": "Short 1-sentence description",
          "estimatedMinutes": 5,
          "cards": [
            {
              "title": "Concept Heading",
              "badge": "Key Concept",
              "content": "2-3 sentence clear explanation",
              "keyTakeaway": "Bullet summary",
              "example": "Practical example"
            }
          ],
          "questions": [
            {
              "type": "mcq",
              "prompt": "Clear question stem",
              "options": ["Correct Choice", "Distractor 1", "Distractor 2", "Distractor 3"],
              "correctAnswerIndex": 0,
              "correctAnswerText": "Correct Choice",
              "explanation": "Why choice 0 is correct"
            },
            {
              "type": "short_answer",
              "prompt": "Short written answer prompt",
              "modelAnswer": "Ideal answer",
              "keywords": ["key1", "key2"]
            }
          ]
        }
      ]
    }
  ]
}`;

        const userPrompt = `Build a structured study path titled "${pathTitle || "Study Path"}".
Description/Context: ${pathDescription || "Study Guide"}
Depth Mode: ${depthMode}

Source text preview:
${sourceSummary || "General CS Topic"}`;

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
              max_tokens: 3500,
            }),
          });
        } catch (fetchErr) {
          console.error("Groq study fetch error:", fetchErr);
          return NextResponse.json(generateLocalFallbackLessons(pathTitle, depthMode));
        }

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const jsonText = groqData?.choices?.[0]?.message?.content;
          const parsed = JSON.parse(jsonText || "{}");

          if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            const processedSections = parsed.sections.map((sec: any, secIdx: number) => ({
              id: `sec_${secIdx + 1}`,
              pathId: "pending",
              title: sanitizeString(sec.title) || `Section ${secIdx + 1}`,
              description: sanitizeString(sec.description) || "Key concepts and review.",
              lessons: (sec.lessons || []).map((les: any, lesIdx: number) => ({
                id: `les_${secIdx + 1}_${lesIdx + 1}_${Math.random().toString(36).substring(2, 6)}`,
                sectionId: `sec_${secIdx + 1}`,
                pathId: "pending",
                title: sanitizeString(les.title) || `Lesson ${lesIdx + 1}`,
                description: sanitizeString(les.description) || "Practice and review.",
                xpValue: 10,
                estimatedMinutes: typeof les.estimatedMinutes === "number" ? les.estimatedMinutes : 5,
                completed: false,
                cards: (les.cards || []).map((c: any) => ({
                  title: sanitizeString(c.title) || "Core Concept",
                  badge: sanitizeString(c.badge) || "Summary",
                  content: sanitizeString(c.content) || "Key definitions and operational rules.",
                  keyTakeaway: sanitizeString(c.keyTakeaway) || "Focus on primary mechanisms.",
                  example: sanitizeString(c.example) || undefined,
                })),
                questions: (les.questions || []).map((q: any) => {
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
                      correctAnswerText: opts[0],
                      explanation: sanitizeString(q.explanation) || "Aligns directly with core concepts.",
                    };
                  } else {
                    return {
                      type: "short_answer",
                      prompt: sanitizeString(q.prompt) || "Summarize the main focus in your own words.",
                      modelAnswer: sanitizeString(q.modelAnswer) || "Understanding core mechanisms.",
                      keywords: Array.isArray(q.keywords) ? q.keywords.map((k: any) => sanitizeString(k)) : ["concept"],
                    };
                  }
                }),
              })),
            }));

            return NextResponse.json({ success: true, sections: processedSections });
          }
        }
      } catch (groqErr) {
        console.warn("Groq AI generation error, using fallback:", groqErr);
      }
    }

    // Fallback curriculum generator
    const fallbackSections = generateFallbackSections(pathTitle, depthMode, files);
    return NextResponse.json({ success: true, sections: fallbackSections });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate AI lessons.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
