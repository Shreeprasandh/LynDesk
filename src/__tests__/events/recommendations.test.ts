import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/events/recommendations/route";
import { NextRequest } from "next/server";

describe("Events Recommendations Route Handler", () => {
  it("should return recommendations array with faculty_recommended flag", async () => {
    const req = new NextRequest("http://localhost:3000/api/events/recommendations", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.recommendations)).toBe(true);
    if (data.recommendations.length > 0) {
      expect(data.recommendations[0].faculty_recommended).toBe(true);
    }
  });
});
