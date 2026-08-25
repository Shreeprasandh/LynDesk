import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/recruiter/talent/route";
import { NextRequest } from "next/server";

describe("Recruiter Talent Benchmark Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/recruiter/talent", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
