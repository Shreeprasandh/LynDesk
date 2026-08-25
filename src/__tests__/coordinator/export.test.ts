import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/coordinator/export/route";
import { NextRequest } from "next/server";

describe("Coordinator Export Handler", () => {
  it("should reject unauthenticated POST requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/export", {
      method: "POST",
      body: JSON.stringify({ students: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
