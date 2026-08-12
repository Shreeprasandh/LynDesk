import { POST } from "../../app/api/workspace/leave/route";

describe("POST /api/workspace/leave", () => {
  it("should return 400 if required parameters are missing", async () => {
    const req = new Request("http://localhost:3000/api/workspace/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required parameters");
  });

  it("should return 200 when valid parameters are provided", async () => {
    const req = new Request("http://localhost:3000/api/workspace/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "test_user_789",
        workspaceId: "workspace_test_abc"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
