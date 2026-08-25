import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "../../app/api/coordinator/recommendations/route";
import { NextRequest } from "next/server";

describe("Coordinator Recommendations Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/recommendations", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/recommendations", {
      method: "POST",
      body: JSON.stringify({ title: "Hackathon", url: "https://example.com" })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated DELETE requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/recommendations?id=123", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
