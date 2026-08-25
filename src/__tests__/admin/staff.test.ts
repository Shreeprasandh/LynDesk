import { describe, it, expect } from "vitest";
import { GET, POST, DELETE } from "../../app/api/admin/staff/route";
import { NextRequest } from "next/server";

describe("Admin Staff Passkey Handlers", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/staff", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/staff", {
      method: "POST",
      body: JSON.stringify({ name: "Staff", email: "staff@test.com", role: "hod", department_scope: "IT" })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated DELETE requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/staff?id=123", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
