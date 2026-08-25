import { describe, it, expect } from "vitest";
import { GET, POST, PATCH, DELETE } from "../../app/api/user/applied-hackathons/route";
import { NextRequest } from "next/server";

describe("User Applied Hackathons API Route", () => {
  it("should return 401 if Authorization header is missing on GET", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/applied-hackathons", { method: "GET" });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("should return 401 if Authorization header is missing on POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/applied-hackathons", {
      method: "POST",
      body: JSON.stringify({ title: "Test Hackathon", portal_url: "https://unstop.com/hackathons" })
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 if Authorization header is missing on PATCH", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/applied-hackathons", {
      method: "PATCH",
      body: JSON.stringify({ id: "app-123", status: "Shortlisted" })
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("should return 401 if Authorization header is missing on DELETE", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/applied-hackathons?id=app-123", {
      method: "DELETE"
    });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });
});
