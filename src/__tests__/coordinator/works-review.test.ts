import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/coordinator/works-review/route";
import { POST } from "../../app/api/coordinator/works-review/[id]/route";
import { NextRequest } from "next/server";

describe("Staff Works Review Queue Handler", () => {
  it("should reject unauthenticated GET requests to works review queue", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/works-review", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST review decisions", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/works-review/work_123", {
      method: "POST",
      body: JSON.stringify({ decision: "approved" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "work_123" }) });
    expect(res.status).toBe(401);
  });
});
