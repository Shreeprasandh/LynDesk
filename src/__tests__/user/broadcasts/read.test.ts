import { describe, it, expect } from "vitest";
import { POST } from "../../../app/api/user/broadcasts/read/route";
import { NextRequest } from "next/server";

describe("User Broadcasts Read Receipt Handler", () => {
  it("should confirm read receipt", async () => {
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
