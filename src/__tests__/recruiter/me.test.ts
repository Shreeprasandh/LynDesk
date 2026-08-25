import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/recruiter/me/route";
import { NextRequest } from "next/server";

describe("Recruiter Me Route Handler", () => {
  it("should reject unauthenticated me requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/recruiter/me", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
