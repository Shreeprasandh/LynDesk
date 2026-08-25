import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/works/my/route";
import { NextRequest } from "next/server";

describe("Student Works Personal Roster API Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works/my", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
