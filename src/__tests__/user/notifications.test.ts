import { GET } from "../../app/api/user/notifications/route";

describe("GET /api/user/notifications", () => {
  it("should return empty notifications list if userId is missing", async () => {
    const req = new Request("http://localhost:3000/api/user/notifications", {
      method: "GET"
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notifications).toEqual([]);
  });

  it("should return notification payload structure when userId is provided", async () => {
    const req = new Request("http://localhost:3000/api/user/notifications?userId=test_user_123", {
      method: "GET"
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.notifications)).toBe(true);
  });
});
