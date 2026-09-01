import { NextResponse } from "next/server";

function sanitizeString(str?: string): string {
  if (!str) return "";
  return str.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionPrompt, modelAnswer, keywords = [], userAnswer } = body;

    if (!userAnswer || !userAnswer.trim()) {
      return NextResponse.json({
        isCorrect: false,
        feedback: "Please enter your response before submitting.",
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const cleanUserAns = sanitizeString(userAnswer);

    if (groqApiKey) {
      try {
        const systemPrompt = `Grade this student's short answer response for an interactive study app. Return ONLY JSON:
{
  "isCorrect": boolean,
  "feedback": "1-2 sentence friendly explanation"
}`;

        const userContent = `Question: "${sanitizeString(questionPrompt) || "Explain the concept"}"
Model Answer: "${sanitizeString(modelAnswer) || "Core principles"}"
Expected Keywords: ${JSON.stringify(keywords)}

Student's Answer: "${cleanUserAns}"`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 300,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const replyText = groqData?.choices?.[0]?.message?.content || "{}";
          const cleanJson = replyText.replace(/```json/gi, "").replace(/```/g, "").trim();
          let parsed: any = {};
          try {
            parsed = JSON.parse(cleanJson);
          } catch {
            parsed = {};
          }

          if (typeof parsed.isCorrect === "boolean") {
            return NextResponse.json({
              isCorrect: parsed.isCorrect,
              feedback: sanitizeString(parsed.feedback) || (parsed.isCorrect ? "Great job!" : "Model Answer: " + modelAnswer),
            });
          }
        }
      } catch (groqErr) {
        console.warn("Groq AI answer grading failed, using keyword fallback:", groqErr);
      }
    }

    // Keyword & substring matching fallback
    const lowerInput = cleanUserAns.toLowerCase();
    const validKeywords = (Array.isArray(keywords) ? keywords : []).map((k: string) => k.toLowerCase());
    const matchedCount = validKeywords.filter((k) => lowerInput.includes(k)).length;
    const isCorrect = matchedCount >= Math.max(1, Math.floor(validKeywords.length / 2));

    return NextResponse.json({
      isCorrect,
      feedback: isCorrect
        ? "Good effort! Your response captures the core concepts."
        : `Model Answer: ${sanitizeString(modelAnswer) || "Key principles and definitions."}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error grading response.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
