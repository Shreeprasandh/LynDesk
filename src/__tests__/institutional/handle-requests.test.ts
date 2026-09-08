import { describe, it, expect, vi } from "vitest";
import { GET, POST, PATCH } from "../../app/api/institutional/handle-requests/route";
import { NextRequest } from "next/server";

// Mock Supabase admin client
vi.mock("@/app/lib/supabaseServer", () => {
  const createQueryMock = (tableName: string) => {
    const chain: any = {
      select: () => chain,
      order: () => chain,
      eq: () => chain,
      neq: () => chain,
      ilike: () => chain,
      in: () => chain,
      limit: async () => {
        if (tableName === "handle_verifications") {
          return {
            data: [
              {
                id: "req_1",
                user_id: "u_1",
                student_id: "u_1",
                platform: "leetcode",
                handle: "alex_dev",
                status: "pending",
                created_at: new Date().toISOString()
              }
            ],
            error: null
          };
        }
        return { data: [], error: null };
      },
      single: async () => {
        if (tableName === "handle_verifications") {
          return {
            data: {
              id: "req_1",
              user_id: "u_1",
              student_id: "u_1",
              platform: "leetcode",
              handle: "alex_dev",
              status: "verified"
            },
            error: null
          };
        }
        return { data: null, error: null };
      },
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: { id: "new_req_1", platform: "leetcode", handle: "alex_dev", status: "pending" },
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: { id: "req_1", status: "verified" }, error: null })
          }),
          then: (resolve: any) => resolve({ data: null, error: null })
        }),
        select: () => ({
          single: async () => ({ data: { id: "req_1", status: "verified" }, error: null })
        })
      })
    };

    // Support await directly on query for profiles lookup
    chain.then = (resolve: any) => {
      if (tableName === "profiles") {
        resolve({
          data: [
            {
              id: "u_1",
              full_name: "Alex Carter",
              roll_number: "RA2311003010001",
              email: "alex@mit.edu",
              college_name: "SRM Easwari Engineering College",
              department: "Computer Science and Engineering",
              academic_year: "1st Year",
              section: "Section B"
            }
          ],
          error: null
        });
      } else {
        resolve({ data: [], error: null });
      }
    };

    return chain;
  };

  return {
    createAdminClient: () => ({
      from: (tableName: string) => createQueryMock(tableName)
    })
  };
});

describe("Handle Requests CRUD Route Handler", () => {
  it("should fetch handle requests with enriched profile metadata", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/handle-requests");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.requests)).toBe(true);
    expect(data.requests.length).toBeGreaterThan(0);
    expect(data.requests[0].studentName).toBe("Alex Carter");
  });

  it("should submit a new handle verification request", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/handle-requests", {
      method: "POST",
      body: JSON.stringify({
        userId: "u_1",
        platform: "leetcode",
        handle: "alex_dev"
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("should approve a handle verification request", async () => {
    const req = new NextRequest("http://localhost:3000/api/institutional/handle-requests", {
      method: "PATCH",
      body: JSON.stringify({
        requestId: "req_1",
        action: "approve"
      })
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("verified");
  });
});
