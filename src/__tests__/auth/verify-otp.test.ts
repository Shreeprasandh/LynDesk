import { describe, it, expect } from "@jest/globals";
import { POST } from "../../app/api/auth/verify-otp/route";

describe("Auth Verify-OTP API Route Handler", () => {
  it("should return 400 error when required fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ input: "test@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(request);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Email, OTP code, and new password are required.");
  });

  it("should return 400 when password validation fails", async () => {
    const request = new Request("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        input: "test@example.com",
        otp: "123456",
        newPassword: "123",
        confirmPassword: "123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});
