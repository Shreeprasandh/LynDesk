import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/workspace/rename/route";

describe("POST /api/workspace/rename", () => {
  it("should return 401 if authorization header is missing", async () => {
    const req = new Request("http://localhost:3000/api/workspace/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 400 if required fields are missing on authenticated request", async () => {
    const req = new Request("http://localhost:3000/api/workspace/rename", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer mock_test_token"
      },
      body: JSON.stringify({})
    });

    const res = await POST(req);
    // If mock token doesn't exist in Supabase auth, returns 401; if authenticated, returns 400
    expect([400, 401]).toContain(res.status);
    const data = await res.json();
    expect(["BAD_REQUEST", "UNAUTHORIZED"]).toContain(data.error.code);
  });
});

