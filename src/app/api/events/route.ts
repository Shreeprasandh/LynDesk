import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export interface LiveEventItem {
  id: string;
  title: string;
  category: "hackathon" | "contest" | "news" | "opportunity";
  deadline: string;
  location: "online" | "hybrid" | "in_person";
  level: "global" | "national" | "institutional";
  url: string;
  description: string;
  facultyRecommended: boolean;
  institute_id?: string;
  created_at?: string;
  status: "active" | "closing_soon" | "upcoming";
}

const CURATED_LIVE_EVENTS: LiveEventItem[] = [
  {
    id: "evt_unstop_live_hackathons",
    title: "Unstop National Innovation Hackathons 2026",
    category: "hackathon",
    deadline: "Open / Rolling",
    location: "hybrid",
    level: "national",
    url: "https://unstop.com/hackathons",
    description: "Active national software engineering and product innovation hackathons with company PPI tracks.",
    facultyRecommended: true,
    status: "active"
  },
  {
    id: "evt_google_gsoc_2026",
    title: "Google Summer of Code 2026",
    category: "contest",
    deadline: "Oct 15, 2026",
    location: "online",
    level: "global",
    url: "https://summerofcode.withgoogle.com",
    description: "Global open-source software development mentorship program sponsored by Google Open Source.",
    facultyRecommended: true,
    status: "active"
  },
  {
    id: "evt_icpc_regionals_2026",
    title: "ACM ICPC Regional Preliminary 2026",
    category: "contest",
    deadline: "Oct 28, 2026",
    location: "hybrid",
    level: "global",
    url: "https://icpc.global",
    description: "The premier global collegiate programming competition. Algorithmic problem-solving with departmental sponsorship.",
    facultyRecommended: true,
    status: "active"
  },
  {
    id: "evt_sih_2026",
    title: "Smart India Hackathon 2026 (SIH)",
    category: "hackathon",
    deadline: "Nov 20, 2026",
    location: "in_person",
    level: "national",
    url: "https://sih.gov.in",
    description: "Nationwide government initiative providing students a platform to solve pressing real-world challenges.",
    facultyRecommended: true,
    status: "active"
  },
  {
    id: "evt_devpost_ai_hack",
    title: "Devpost Global AI & Agents Hackathon",
    category: "hackathon",
    deadline: "Nov 05, 2026",
    location: "online",
    level: "global",
    url: "https://devpost.com/hackathons",
    description: "Build autonomous multi-agent systems and full-stack AI applications with global developer teams.",
    facultyRecommended: true,
    status: "active"
  },
  {
    id: "evt_leetcode_weekly",
    title: "LeetCode Weekly Contest",
    category: "contest",
    deadline: "Every Sunday 08:00 AM",
    location: "online",
    level: "global",
    url: "https://leetcode.com/contest",
    description: "Global competitive programming contest. Solve 4 algorithmic problems in 90 minutes to elevate your global rating.",
    facultyRecommended: false,
    status: "active"
  },
  {
    id: "evt_codeforces_rounds",
    title: "Codeforces Live Rated Rounds (Div. 2 / Div. 3)",
    category: "contest",
    deadline: "Bi-Weekly",
    location: "online",
    level: "global",
    url: "https://codeforces.com/contests",
    description: "Speed problem-solving and mathematical algorithmic rounds with instantaneous rating calibration.",
    facultyRecommended: false,
    status: "active"
  },
  {
    id: "evt_kaggle_competitions",
    title: "Kaggle Global Machine Learning Challenges",
    category: "contest",
    deadline: "Open / Rolling",
    location: "online",
    level: "global",
    url: "https://www.kaggle.com/competitions",
    description: "Apply deep learning and predictive modeling to solve enterprise datasets with global cash prizes.",
    facultyRecommended: true,
    status: "active"
  }
];

export async function GET(req: NextRequest) {
  try {
    /* await searchParams */
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();
    const location = searchParams.get("location");
    const instituteId = searchParams.get("institute_id");

    const eventsList: LiveEventItem[] = [];

    // 1. Fetch live events from database
    try {
      let dbQuery = supabaseAdmin
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        dbQuery = dbQuery.eq("category", category);
      }

      const { data: dbEvents, error: dbErr } = await dbQuery;

      if (!dbErr && Array.isArray(dbEvents)) {
        dbEvents.forEach((e: any) => {
          const deadlineDate = e.registration_deadline || e.deadline;
          let deadlineStr = "Active / Rolling";
          let status: "active" | "closing_soon" | "upcoming" = "active";

          if (deadlineDate) {
            const d = new Date(deadlineDate);
            if (!isNaN(d.getTime())) {
              deadlineStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              if (diffDays <= 3 && diffDays >= 0) {
                status = "closing_soon";
              } else if (diffDays < 0) {
                return;
              }
            }
          }

          eventsList.push({
            id: e.id,
            title: e.title || "Untitled Opportunity",
            category: e.category || "hackathon",
            deadline: deadlineStr,
            location: e.location || "online",
            level: e.level || "global",
            url: e.source_url || e.url || "https://unstop.com",
            description: e.description || "Active event registered on LynDesk. Open for student teams and individual participants.",
            facultyRecommended: e.faculty_recommended ?? false,
            created_at: e.created_at,
            status
          });
        });
      }
    } catch (err) {
      console.warn("[GET /api/events] DB fetch warning:", err);
    }

    // 2. Fetch staff recommended events from institute
    try {
      let recQuery = supabaseAdmin
        .from("staff_recommended_events")
        .select("*")
        .eq("is_active", true);

      if (instituteId) {
        recQuery = recQuery.eq("institute_id", instituteId);
      }

      const { data: recEvents } = await recQuery;
      if (Array.isArray(recEvents)) {
        recEvents.forEach((r: any) => {
          eventsList.unshift({
            id: r.id,
            title: r.title,
            category: r.category || "contest",
            deadline: r.deadline || "Campus Rolling",
            location: r.location || "hybrid",
            level: r.level || "institutional",
            url: r.url || "#",
            description: r.description || "Faculty recommended event for department students.",
            facultyRecommended: true,
            institute_id: r.institute_id,
            created_at: r.created_at,
            status: "active"
          });
        });
      }
    } catch {}

    // 3. Fall back to curated live events if database has few events
    const combined = [...eventsList];
    CURATED_LIVE_EVENTS.forEach((c) => {
      if (!combined.some((e) => e.title.toLowerCase() === c.title.toLowerCase())) {
        combined.push(c);
      }
    });

    // 4. Apply filter criteria
    let filtered = combined;

    if (category && category !== "all") {
      filtered = filtered.filter((e) => e.category === category);
    }

    if (location && location !== "all") {
      filtered = filtered.filter((e) => e.location === location);
    }

    if (query) {
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      events: filtered
    });
  } catch (error: any) {
    console.error("[GET /api/events] Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch live events." },
      { status: 500 }
    );
  }
}
