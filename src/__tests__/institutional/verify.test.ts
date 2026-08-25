import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/institutional/verify/route";
import { NextRequest } from "next/server";

describe("Institutional Verification Route Handler", () => {
  it("should reject requests missing roll number", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/verify", {
      method: "POST",
      body: JSON.stringify({ rollNumber: "", collegeKey: "COLLEGE_SRM" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should reject requests missing college registrar key", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/verify", {
      method: "POST",
      body: JSON.stringify({ rollNumber: "RA2311003010045", collegeKey: "" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should verify valid roll number and college key with auto-resolved fields", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/verify", {
      method: "POST",
      body: JSON.stringify({ rollNumber: "RA2311003010045", collegeKey: "COLLEGE_SRM" })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.rollNumber).toBe("RA2311003010045");
    expect(data.department).toBeDefined();
    expect(data.academicYear).toBeDefined();
    expect(data.section).toBeDefined();
  });
});
