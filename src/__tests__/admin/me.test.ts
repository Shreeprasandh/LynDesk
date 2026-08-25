import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/admin/me/route";
import { NextRequest } from "next/server";

describe("Admin Me Route Handler", () => {
  it("should reject unauthenticated me requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/me", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
