import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/coordinator/me/route";
import { NextRequest } from "next/server";

describe("Coordinator Me Route Handler", () => {
  it("should reject unauthenticated me requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/me", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
