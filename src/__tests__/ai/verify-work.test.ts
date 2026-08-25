import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/ai/verify-work/route";
import { NextRequest } from "next/server";

describe("AI Work Verification Handler", () => {
  it("should reject unauthorized requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/verify-work", {
      method: "POST",
      body: JSON.stringify({ work_id: "work_123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
