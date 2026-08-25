import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/works/upload/route";
import { NextRequest } from "next/server";

describe("Student Work File Upload API Handler", () => {
  it("should reject unauthenticated POST upload requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works/upload", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
