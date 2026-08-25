import { describe, it, expect } from "vitest";
import { GET, DELETE } from "../../app/api/works/[id]/route";
import { NextRequest } from "next/server";

describe("Work Item Route Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works/work_123", { method: "GET" });
    const res = await GET(req, { params: Promise.resolve({ id: "work_123" }) });
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated DELETE requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/works/work_123", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "work_123" }) });
    expect(res.status).toBe(401);
  });
});
