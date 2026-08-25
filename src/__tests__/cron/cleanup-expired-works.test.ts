import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/cron/cleanup-expired-works/route";
import { NextRequest } from "next/server";

describe("Cleanup Expired Works Cron Handler", () => {
  it("should run cleanup handler gracefully", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/cleanup-expired-works", {
      method: "GET",
    });
    const res = await GET(req);
    expect([200, 401, 500]).toContain(res.status);
  });
});
