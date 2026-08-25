import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/user/broadcasts/route";
import { POST } from "../../app/api/user/broadcasts/read/route";
import { NextRequest } from "next/server";

describe("User Broadcasts Route Handlers", () => {
  it("should fetch broadcasts list", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/broadcasts", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.broadcasts)).toBe(true);
  });

  it("should handle read receipt confirmation", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/broadcasts/read", {
      method: "POST",
      body: JSON.stringify({ broadcastId: "b1", studentId: "s1" })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
