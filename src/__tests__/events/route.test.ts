import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/events/route";
import { NextRequest } from "next/server";

describe("Live Events Route Handler", () => {
  it("should return live events array with count and status", async () => {
    const req = new NextRequest("http://localhost:3000/api/events", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
    expect(data.events.length).toBeGreaterThan(0);
    expect(data.events[0]).toHaveProperty("title");
    expect(data.events[0]).toHaveProperty("category");
    expect(data.events[0]).toHaveProperty("deadline");
    expect(data.events[0]).toHaveProperty("status");
  });

  it("should filter events by category", async () => {
    const req = new NextRequest("http://localhost:3000/api/events?category=hackathon", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    data.events.forEach((evt: any) => {
      expect(evt.category).toBe("hackathon");
    });
  });
});
