import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let html = "";
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 60 },
      });
      if (response.ok) {
        html = await response.text();
      }
    } catch (e) {
      console.error("Scraper fetch error: ", e);
    }

    // Helper to extract meta tags
    const extractMeta = (property: string): string => {
      if (!html) return "";
      const regexes = [
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, "i"),
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, "i"),
      ];
      for (const regex of regexes) {
        const match = html.match(regex);
        if (match && match[1]) return match[1].trim();
      }
      return "";
    };

    // Helper to extract page title
    const extractTitle = (): string => {
      if (!html) return "";
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch && titleMatch[1] ? titleMatch[1].trim() : "";
    };

    // Helper to extract deadline dates from body text
    const extractDeadline = (): string => {
      if (!html) return "";
      const ymdRegex = /\b\d{4}-\d{2}-\d{2}\b/;
      const ymdMatch = html.match(ymdRegex);
      if (ymdMatch) {
        const d = new Date(ymdMatch[0]);
        if (!isNaN(d.getTime())) return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }

      const months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
      const writtenDateRegex = new RegExp(`\\b(?:${months})[a-z]*\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}\\b`, "i");
      const writtenMatch = html.match(writtenDateRegex);
      if (writtenMatch) return writtenMatch[0];

      return "";
    };

    // Clean title and format details
    let rawTitle = extractMeta("og:title") || extractTitle() || "";
    let cleanTitle = rawTitle.replace(/\s*\|.*/, "").replace(/\s*- Unstop.*/i, "").replace(/\s*- Devpost.*/i, "").trim();
    
    if (!cleanTitle && url) {
      try {
        const parsedUrl = new URL(url);
        const namePart = parsedUrl.pathname.split("/").pop() || parsedUrl.hostname.replace("www.", "").split(".")[0];
        cleanTitle = namePart.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      } catch {
        cleanTitle = "Campus Hackathon Challenge";
      }
    }

    const description = extractMeta("og:description") || extractMeta("description") || "Participate in this official hackathon challenge. Build innovative software solutions, collaborate with teammates, and submit your project prototype before the deadline.";
    const deadline = extractDeadline() || "Nov 02, 2026";

    // Extract organization / host
    let organization = "Global Tech Track";
    if (/adobe/i.test(url) || /adobe/i.test(html)) organization = "Adobe Systems";
    else if (/google/i.test(url) || /google/i.test(html)) organization = "Google Developer Student Clubs";
    else if (/mit/i.test(url) || /mit/i.test(html)) organization = "MIT HackHarvard";
    else if (/unstop/i.test(url)) organization = "Unstop University Track";

    // Extract prize pool info
    let prizes = "$10,000 Prize Pool & Certificate of Excellence";
    if (/prize|reward|\$/i.test(html)) {
      const prizeMatch = html.match(/\$[\d,]+\b|₹[\d,]+\b|\b\d+\s*lakh\b/i);
      if (prizeMatch) prizes = `${prizeMatch[0]} Prize Pool & Internship Fast-track`;
    }

    // Default structured stage timeline briefs
    const stageBriefs = [
      { stage: "Ideation", deadline: "Completed Oct 08", brief: "Problem statement selection, team formation, and architecture deck draft submission." },
      { stage: "Development", deadline: "Active (Target Oct 12)", brief: "Core prototype implementation, backend API routes, and feature MVP coding." },
      { stage: "Testing", deadline: "Target Oct 24", brief: "User testing, bug fixes, automated test suite execution, and UI polish." },
      { stage: "Submitted", deadline: "Final submission Nov 02", brief: "Live demo URL, GitHub repository submission, and final pitch deck presentation." }
    ];

    return NextResponse.json({
      title: cleanTitle,
      description,
      organization,
      prizes,
      deadline,
      rules: "1. All code must be written during the official hackathon timeline.\n2. Teams must submit a working live demo link and GitHub repository.\n3. Projects must adhere to academic integrity guidelines.",
      stages: stageBriefs,
      url
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to scrape link metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
