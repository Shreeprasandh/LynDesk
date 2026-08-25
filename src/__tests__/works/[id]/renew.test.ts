import { describe, it, expect } from "vitest";
import { POST } from "../../../app/api/works/[id]/renew/route";
import { NextRequest } from "next/server";

describe("Work Renew Route Handler", () => {
  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works/work_123/renew", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "work_123" }) });
    expect(res.status).toBe(401);
  });
});
