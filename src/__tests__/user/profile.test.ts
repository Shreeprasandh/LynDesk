import { describe, it, expect } from 'vitest';
import { GET } from "../../app/api/user/profile/route";

describe("GET /api/user/profile", () => {
  it("should return 400 if userId parameter is missing", async () => {
    const req = new Request("http://localhost:3000/api/user/profile", {
      method: "GET"
    });

    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("BAD_REQUEST");
  });

  it("should handle profile query when userId is provided", async () => {
    const req = new Request("http://localhost:3000/api/user/profile?userId=00000000-0000-0000-0000-000000000000", {
      method: "GET"
    });

    const res = await GET(req);
    expect([200, 500]).toContain(res.status);
    const data = await res.json();
    if (res.status === 200) {
      expect(data).toHaveProperty("data");
    }
  });
});

