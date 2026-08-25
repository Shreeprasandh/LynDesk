import { describe, it, expect } from "vitest";
import { GET as radarGet } from "../../app/api/admin/radar/route";
import { POST as invitePost } from "../../app/api/admin/invite-missing/route";
import { NextRequest } from "next/server";

describe("Admin Missing Student Radar Handlers", () => {
  it("should reject unauthenticated radar requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/radar", { method: "GET" });
    const res = await radarGet(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated invite-missing requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/invite-missing", {
      method: "POST",
      body: JSON.stringify({ department: "IT", section: "A", missingRolls: [] })
    });
    const res = await invitePost(req);
    expect(res.status).toBe(401);
  });
});
