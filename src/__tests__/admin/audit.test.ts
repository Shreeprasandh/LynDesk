import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/admin/audit/route";
import { NextRequest } from "next/server";

describe("Admin Institutional Audit Ledger Handlers", () => {
  it("should reject unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/audit", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
