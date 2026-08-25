import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "../../app/api/admin/structure/route";
import { NextRequest } from "next/server";

describe("Admin Campus Structure Route Handlers", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/structure", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/structure", {
      method: "POST",
      body: JSON.stringify({ department: "CSE", section: "A" })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated DELETE requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/structure?id=123", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
