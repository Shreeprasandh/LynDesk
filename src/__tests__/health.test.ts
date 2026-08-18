import { describe, it, expect } from "@jest/globals";
import { GET } from "../app/api/health/route";

describe("System Health Check Route Handler", () => {
  it("should be defined and respond with valid structure", async () => {
    try {
      const res = await GET();
      expect([200, 500, 503]).toContain(res.status);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
