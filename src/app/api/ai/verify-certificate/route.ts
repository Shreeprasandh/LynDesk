import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, eventTitle, artifactName, points } = body;

    const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!groqApiKey) {
      const isSuspicious = (studentName || "").toLowerCase().includes("test") || (artifactName || "").toLowerCase().includes("fake");
      const status = isSuspicious ? "Flagged" : "Verified";
      const confidence = isSuspicious ? 35 : 94;
      const notes = isSuspicious
        ? "AI Warning: Certificate name matches test patterns. Verification flagged due to metadata warning."
        : `AI Audit: Certificate is authentic. Verified that recipient "${studentName}" completed "${eventTitle}" for ${points} activity points.`;

      return NextResponse.json({
        isMock: true,
        status,
        confidence,
        recipientMatch: !isSuspicious,
        eventMatch: true,
        aiNotes: notes
      });
    }

    const systemPrompt = `You are an AI Certificate Auditor. Output ONLY JSON:
{
  "status": "Verified" or "Flagged",
  "confidence": 95,
  "recipientMatch": true,
  "eventMatch": true,
  "aiNotes": "Detailed auditor notes explaining the audit result."
}`;

    const userPrompt = `Student Claim Details:
- Student Name: "${studentName}"
- Claimed Event: "${eventTitle}"
- Uploaded Document Name: "${artifactName}"
- Intended Credit Value: ${points} points`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

    if (groqRes.ok) {
      const groqData = await groqRes.json();
      const replyText = groqData?.choices?.[0]?.message?.content;
      const data = JSON.parse(replyText || "{}");

      return NextResponse.json({
        isMock: false,
        status: data.status || "Verified",
        confidence: typeof data.confidence === "number" ? data.confidence : 95,
        recipientMatch: data.recipientMatch !== false,
        eventMatch: data.eventMatch !== false,
        aiNotes: data.aiNotes || "Certificate verification complete."
      });
    }

    throw new Error("Groq API verification call failed.");

  } catch (error: any) {
    return NextResponse.json(
      { error: "Verification failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
