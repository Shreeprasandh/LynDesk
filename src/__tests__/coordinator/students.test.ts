import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/coordinator/students/route";
import { NextRequest } from "next/server";

describe("Coordinator Students Roster Handler", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/coordinator/students", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
