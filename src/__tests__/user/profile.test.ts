import { GET } from "../../app/api/user/profile/route";

describe("GET /api/user/profile", () => {
  it("should return 400 if userId parameter is missing", async () => {
    const req = new Request("http://localhost:3000/api/user/profile", {
      method: "GET"
    });

    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing userId parameter");
  });

  it("should handle profile query when userId is provided", async () => {
    const req = new Request("http://localhost:3000/api/user/profile?userId=test_user_456", {
      method: "GET"
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("profile");
  });
});
