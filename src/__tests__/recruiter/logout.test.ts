import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/recruiter/logout/route";

describe("Recruiter Logout Route Handler", () => {
  it("should terminate corporate session", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
