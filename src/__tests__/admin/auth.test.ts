import { describe, it, expect } from "vitest";
import { POST as loginPost } from "../../app/api/admin/login/route";
import { POST as logoutPost } from "../../app/api/admin/logout/route";
import { GET as meGet } from "../../app/api/admin/me/route";
import { NextRequest } from "next/server";

describe("Admin Authentication Route Handlers", () => {
  it("should reject login with missing credentials", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: "", password: "" })
    });
    const res = await loginPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should allow valid default admin credentials and set session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@srmist.edu.in", password: "Admin@LynDesk2026" })
    });
    const res = await loginPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.admin.email).toBe("admin@srmist.edu.in");
  });

  it("should clear session on logout", async () => {
    const res = await logoutPost();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("should reject unauthenticated me requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/me", { method: "GET" });
    const res = await meGet(req);
    expect(res.status).toBe(401);
  });
});
