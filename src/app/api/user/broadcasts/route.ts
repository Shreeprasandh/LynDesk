import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const DEFAULT_BROADCASTS = [
  {
    id: "b1",
    title: "Mandatory LeetCode Biweekly Contest Registration",
    body: "All 3rd Year Section E students must register for this weekend's contest before Friday 6 PM.",
    priority: "urgent",
    staff_name: "Prof. R. Venkatesh",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    isRead: false
  },
  {
    id: "b2",
    title: "Smart India Hackathon 2026 Team Formation",
    body: "Submit internal team nominations via the Coding Deck before the deadline.",
    priority: "info",
    staff_name: "Dr. S. Malathi",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    isRead: true
  }
];

export async function GET(req: NextRequest) {
  try {
    // Next.js Route Handler parameter extraction
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const department = searchParams.get("department");
    const year = searchParams.get("year");
    const section = searchParams.get("section");
    const rollNumber = searchParams.get("roll");

    let broadcasts: any[] = [];
    try {
      const { data } = await supabaseServer
        .from("staff_broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) broadcasts = data;
    } catch {}

    if (broadcasts.length === 0) {
      broadcasts = DEFAULT_BROADCASTS;
    }

    // Match broadcast target_scope against student metadata
    const filtered = broadcasts.filter(b => {
      const scope = b.target_scope || {};
      if (b.target_type === "all") return true;
      if (department && scope.department && scope.department !== "ALL" && scope.department !== department) return false;
      if (year && scope.year && scope.year !== year) return false;
      if (section && scope.section && scope.section !== section) return false;
      if (rollNumber && scope.roll_start && scope.roll_end) {
        if (rollNumber < scope.roll_start || rollNumber > scope.roll_end) return false;
      }
      return true;
    });

    return NextResponse.json({ success: true, broadcasts: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching broadcasts." }, { status: 500 });
  }
}
