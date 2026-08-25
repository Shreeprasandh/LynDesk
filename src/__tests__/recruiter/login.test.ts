import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/recruiter/login/route";
import { NextRequest } from "next/server";

describe("Recruiter Login Route Handler", () => {
  it("should reject login with missing PIN", async () => {
    const req = new NextRequest("http://localhost:3000/api/recruiter/login", {
      method: "POST",
      body: JSON.stringify({ pin: "" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should authenticate default Google India recruiter PIN", async () => {
    const req = new NextRequest("http://localhost:3000/api/recruiter/login", {
      method: "POST",
      body: JSON.stringify({ pin: "847291" })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.company.companyName).toBe("Google India");
  });
});
