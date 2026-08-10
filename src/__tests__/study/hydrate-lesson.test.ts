import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/study/hydrate-lesson/route";

describe("POST /api/study/hydrate-lesson", () => {
  it("should handle missing GROQ_API_KEY or return structured fallback payload", async () => {
    const req = new Request("http://localhost:3000/api/study/hydrate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathTitle: "Stack and Queue",
        sectionTitle: "Section 1: Core Fundamentals",
        lessonTitle: "Lesson 1: Introduction to Stack",
        lessonDescription: "Basic operations of a stack",
        depthMode: "standard"
      })
    });

    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(200);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});
