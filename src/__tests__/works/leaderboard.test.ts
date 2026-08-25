import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/works/leaderboard/route";
import { NextRequest } from "next/server";

describe("Student Works Leaderboard API Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works/leaderboard", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
