import { describe, it, expect } from "vitest";
import { POST, GET } from "../../app/api/events/sync/route";
import { NextRequest } from "next/server";

describe("Live Events Ingestion & Sync Route Handler", () => {
  it("should trigger ingestion and return sync summary", async () => {
    const req = new NextRequest("http://localhost:3000/api/events/sync", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty("count");
    expect(data).toHaveProperty("sources");
    expect(typeof data.count).toBe("number");
  });

  it("should support GET alias for healthcheck and manual trigger", async () => {
    const req = new NextRequest("http://localhost:3000/api/events/sync", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
