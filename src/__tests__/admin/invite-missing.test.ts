import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/admin/invite-missing/route";
import { NextRequest } from "next/server";

describe("Admin Invite Missing Route Handler", () => {
  it("should reject unauthenticated invite-missing requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/invite-missing", {
      method: "POST",
      body: JSON.stringify({ department: "IT", section: "A", missingRolls: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
