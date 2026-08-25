import { describe, it, expect } from "vitest";
import { POST } from "../../../app/api/coordinator/works-review/[id]/route";
import { NextRequest } from "next/server";

describe("Staff Works Review Decision Handler", () => {
  it("should reject unauthenticated POST review decisions", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/works-review/work_123", {
      method: "POST",
      body: JSON.stringify({ decision: "approved" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "work_123" }) });
    expect(res.status).toBe(401);
  });
});
