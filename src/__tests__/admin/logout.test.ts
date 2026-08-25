import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/admin/logout/route";

describe("Admin Logout Route Handler", () => {
  it("should clear session on logout", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
