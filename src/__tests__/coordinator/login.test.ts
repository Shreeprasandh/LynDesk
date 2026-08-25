import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/coordinator/login/route";
import { NextRequest } from "next/server";

describe("Coordinator Login Route Handler", () => {
  it("should reject login with missing credentials", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/login", {
      method: "POST",
      body: JSON.stringify({ email: "", passkey: "" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should authenticate default coordinator credentials", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/login", {
      method: "POST",
      body: JSON.stringify({ email: "coordinator.it@srmist.edu.in", passkey: "COORD_SEC_E" })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.staff.role).toBe("coordinator");
  });
});
