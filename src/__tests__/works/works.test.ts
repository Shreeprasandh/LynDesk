import { describe, it, expect } from "vitest";
import { GET, POST } from "../../app/api/works/route";
import { NextRequest } from "next/server";

describe("Student Works Primary API Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works", {
      method: "POST",
      body: JSON.stringify({ title: "Test Book", category: "book" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
