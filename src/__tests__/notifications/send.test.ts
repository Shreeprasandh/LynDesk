import { POST } from "../../app/api/notifications/send/route";

describe("POST /api/notifications/send", () => {
  it("should return 400 if required fields are missing", async () => {
    const req = new Request("http://localhost:3000/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required fields");
  });

  it("should accept valid notification payloads", async () => {
    const req = new Request("http://localhost:3000/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: "user_test_123",
        senderId: "user_sender_456",
        title: "Test Notification",
        message: "This is a test notification payload."
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
