import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/recruiter/export/route";
import { NextRequest } from "next/server";

describe("Recruiter Export Handler", () => {
  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/recruiter/export", {
      method: "POST",
      body: JSON.stringify({ candidates: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
