import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

interface IngestedEvent {
  title: string;
  category: "hackathon" | "contest" | "opportunity";
  source_url: string;
  registration_deadline: string | null;
  location: "online" | "hybrid" | "in_person";
  level: "global" | "national";
  description: string;
  faculty_recommended: boolean;
}

// 1. Fetch Codeforces upcoming contests
async function fetchCodeforcesEvents(): Promise<IngestedEvent[]> {
  try {
    const res = await fetch("https://codeforces.com/api/contest.list", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "LynDesk-Ingest/1.0" }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "OK" || !Array.isArray(data.result)) return [];

    const upcoming = data.result.filter((c: any) => c.phase === "BEFORE");
    return upcoming.map((c: any) => {
      const startTime = new Date(c.startTimeSeconds * 1000).toISOString();
      return {
        title: c.name || "Codeforces Rated Contest",
        category: "contest",
        source_url: `https://codeforces.com/contest/${c.id}`,
        registration_deadline: startTime,
        location: "online",
        level: "global",
        description: `Official Codeforces rated round (${c.type || "Competitive Programming"}). Duration: ${Math.round((c.durationSeconds || 7200) / 60)} minutes.`,
        faculty_recommended: false
      };
    });
  } catch (err) {
    console.warn("[Sync] Codeforces fetch error:", err);
    return [];
  }
}

// 2. Fetch LeetCode upcoming contests
async function fetchLeetCodeEvents(): Promise<IngestedEvent[]> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LynDesk/1.0"
      },
      body: JSON.stringify({
        query: "query { upcomingContests { title titleSlug startTime duration } }"
      })
    });
    if (!res.ok) return [];
    const data = await res.json();
    const contests = data?.data?.upcomingContests;
    if (!Array.isArray(contests)) return [];

    return contests.map((c: any) => {
      const startTime = new Date(c.startTime * 1000).toISOString();
      return {
        title: c.title || "LeetCode Contest",
        category: "contest",
        source_url: `https://leetcode.com/contest/${c.titleSlug}`,
        registration_deadline: startTime,
        location: "online",
        level: "global",
        description: `Official LeetCode 90-minute live competition featuring 4 algorithmic problem sets and global rating updates.`,
        faculty_recommended: false
      };
    });
  } catch (err) {
    console.warn("[Sync] LeetCode fetch error:", err);
    return [];
  }
}

// 3. Core flagship global hackathons & programs
const CORE_GLOBAL_EVENTS: IngestedEvent[] = [
  {
    title: "Google Summer of Code 2026",
    category: "contest",
    source_url: "https://summerofcode.withgoogle.com",
    registration_deadline: "2026-10-15T18:00:00.000Z",
    location: "online",
    level: "global",
    description: "Global open-source software development mentorship program sponsored by Google Open Source.",
    faculty_recommended: true
  },
  {
    title: "Smart India Hackathon 2026 (SIH)",
    category: "hackathon",
    source_url: "https://sih.gov.in",
    registration_deadline: "2026-11-20T18:30:00.000Z",
    location: "in_person",
    level: "national",
    description: "Nationwide government initiative providing students a platform to solve pressing real-world challenges across AI, CleanTech, and Security.",
    faculty_recommended: true
  },
  {
    title: "Devpost Global AI & Agents Hackathon",
    category: "hackathon",
    source_url: "https://devpost.com/hackathons",
    registration_deadline: "2026-11-05T23:59:00.000Z",
    location: "online",
    level: "global",
    description: "Build autonomous multi-agent systems and full-stack AI applications with global developer teams.",
    faculty_recommended: true
  },
  {
    title: "Unstop National Innovation Hackathons 2026",
    category: "hackathon",
    source_url: "https://unstop.com/hackathons",
    registration_deadline: "2026-12-01T18:30:00.000Z",
    location: "hybrid",
    level: "national",
    description: "Active national software engineering and product innovation hackathons with company PPI tracks.",
    faculty_recommended: true
  },
  {
    title: "ACM ICPC Regional Preliminary 2026",
    category: "contest",
    source_url: "https://icpc.global",
    registration_deadline: "2026-10-28T18:30:00.000Z",
    location: "hybrid",
    level: "global",
    description: "The premier global collegiate programming competition. Algorithmic problem-solving with departmental sponsorship.",
    faculty_recommended: true
  }
];

export async function POST() {
  try {
    const cfEvents = await fetchCodeforcesEvents();
    const lcEvents = await fetchLeetCodeEvents();
    const allIngested = [...CORE_GLOBAL_EVENTS, ...cfEvents, ...lcEvents];

    let upsertedCount = 0;

    for (const evt of allIngested) {
      if (!evt.source_url) continue;

      // Check if event already exists by source_url or title
      const { data: existing } = await supabaseAdmin
        .from("events")
        .select("id")
        .or(`source_url.eq.${evt.source_url},title.eq.${evt.title}`)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabaseAdmin
          .from("events")
          .update({
            title: evt.title,
            category: evt.category,
            source_url: evt.source_url,
            registration_deadline: evt.registration_deadline,
            location: evt.location,
            level: evt.level,
            description: evt.description,
            faculty_recommended: evt.faculty_recommended
          })
          .eq("id", existing.id);
      } else {
        // Insert new record
        await supabaseAdmin
          .from("events")
          .insert({
            title: evt.title,
            category: evt.category,
            source_url: evt.source_url,
            registration_deadline: evt.registration_deadline,
            location: evt.location,
            level: evt.level,
            description: evt.description,
            faculty_recommended: evt.faculty_recommended
          });
      }
      upsertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${upsertedCount} live events into database.`,
      count: upsertedCount,
      sources: {
        codeforces: cfEvents.length,
        leetcode: lcEvents.length,
        core_global: CORE_GLOBAL_EVENTS.length
      }
    });
  } catch (error: any) {
    console.error("[POST /api/events/sync] Sync error:", error);
    return NextResponse.json({ error: error?.message || "Event sync failed." }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
