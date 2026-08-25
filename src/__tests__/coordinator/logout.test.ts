import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/coordinator/logout/route";

describe("Coordinator Logout Route Handler", () => {
  it("should clear staff session cookie", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
