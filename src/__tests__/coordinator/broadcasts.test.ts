import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "../../app/api/coordinator/broadcasts/route";
import { NextRequest } from "next/server";

describe("Coordinator Broadcasts Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/broadcasts", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/broadcasts", {
      method: "POST",
      body: JSON.stringify({ title: "Contest", body: "Please participate." })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated DELETE requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/broadcasts?id=123", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
