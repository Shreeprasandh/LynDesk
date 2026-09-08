import { describe, it, expect, vi } from "vitest";
import { POST } from "../../app/api/institutional/handle-ai-audit/route";
import { NextRequest } from "next/server";

// Mock Supabase admin client
vi.mock("@/app/lib/supabaseServer", () => {
  const createQueryMock = () => {
    const chain: any = {
      select: () => chain,
      ilike: () => chain,
      eq: () => chain,
      neq: () => chain,
      order: () => chain,
      limit: async () => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null })
    };
    return chain;
  };

  return {
    createAdminClient: () => ({
      from: () => createQueryMock()
    })
  };
});

describe("Handle AI Deduplication & Platform Audit Route", () => {
  it("should reject requests missing platform or handle", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/handle-ai-audit", {
      method: "POST",
      body: JSON.stringify({ platform: "", handle: "" })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("should normalize pasted URLs and audit successfully", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/handle-ai-audit", {
      method: "POST",
      body: JSON.stringify({
        platform: "leetcode",
        handle: "https://leetcode.com/u/valid_dev_user"
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cleanHandle).toBe("valid_dev_user");
    expect(data.verdict).toBeDefined();
  });
});
