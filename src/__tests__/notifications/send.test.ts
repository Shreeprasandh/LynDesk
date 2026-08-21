import { describe, it, expect } from 'vitest';
import { POST } from "../../app/api/notifications/send/route";

describe("POST /api/notifications/send", () => {
  it("should return 401 if authorization header is missing", async () => {
    const req = new Request("http://localhost:3000/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: "user_test_123",
        title: "Test",
        message: "Hello"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Authorization credentials required");
  });

  it("should return 400 if required fields are missing on authorized request", async () => {
    const req = new Request("http://localhost:3000/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer test_mock_token"
      },
      body: JSON.stringify({})
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required fields");
  });
});

