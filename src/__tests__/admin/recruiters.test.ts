import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "../../app/api/admin/recruiters/route";
import { NextRequest } from "next/server";

describe("Admin Recruiter PIN Handlers", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/recruiters", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/recruiters", {
      method: "POST",
      body: JSON.stringify({ company_name: "Google" })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated DELETE requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/recruiters?id=123", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
