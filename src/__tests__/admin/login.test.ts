import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/admin/login/route";
import { NextRequest } from "next/server";

describe("Admin Login Route Handler", () => {
  it("should reject login with missing credentials", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: "", password: "" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should allow valid default admin credentials", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@srmist.edu.in", password: "Admin@LynDesk2026" })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
