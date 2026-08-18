import { describe, it, expect } from "@jest/globals";
import { POST } from "../../app/api/auth/send-otp/route";

describe("Auth Send-OTP API Route Handler", () => {
  it("should return 400 error when input field is missing or empty", async () => {
    const request = new Request("http://localhost:3000/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(request);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Email or username is required.");
  });

  it("should return 400 error for invalid email format", async () => {
    const request = new Request("http://localhost:3000/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ input: "invalid-email-format" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(request);
    expect([400, 404]).toContain(res.status);
  });
});
