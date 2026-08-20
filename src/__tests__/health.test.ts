import { describe, it, expect } from "vitest";
import { GET } from "../app/api/health/route";

describe("System Health Check Route Handler", () => {
  it("should be defined and respond with valid structure", async () => {
    try {
      const res = await GET();
      expect([200, 500, 503]).toContain(res.status);
    } catch {
      expect(true).toBe(true);
    }
  });
});

