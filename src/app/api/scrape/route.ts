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
        next: { revalidate: 60 }, // Cache response for 60 seconds
      });
      if (response.ok) {
        html = await response.text();
      }
    } catch (e) {
      console.error("Scraper fetch error: ", e);
    }

    if (!html) {
      // Fallback response with basic hostname parsing
      try {
        const parsedUrl = new URL(url);
        const namePart = parsedUrl.hostname.replace("www.", "").split(".")[0];
        const formattedTitle = `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} Event`;
        return NextResponse.json({
          title: formattedTitle,
          description: "Details from " + parsedUrl.hostname,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
        });
      } catch {
        return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
      }
    }

    // Helper to extract meta tags
    const extractMeta = (property: string): string => {
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
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch && titleMatch[1] ? titleMatch[1].trim() : "";
    };

    // Helper to extract deadline dates from body text
    const extractDeadline = (): string => {
      // Look for dates like YYYY-MM-DD or DD-MM-YYYY
      const ymdRegex = /\b\d{4}-\d{2}-\d{2}\b/;
      const ymdMatch = html.match(ymdRegex);
      if (ymdMatch) {
        const d = new Date(ymdMatch[0]);
        if (!isNaN(d.getTime())) return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }

      // Look for dates like "Oct 12, 2026" or "October 12, 2026"
      const months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
      const writtenDateRegex = new RegExp(`\\b(?:${months})[a-z]*\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}\\b`, "i");
      const writtenMatch = html.match(writtenDateRegex);
      if (writtenMatch) return writtenMatch[0];

      // Fallback: 14 days from now
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    };

    const title = extractMeta("og:title") || extractTitle() || "Scraped Hackathon Event";
    const description = extractMeta("og:description") || extractMeta("description") || "No description provided.";
    const deadline = extractDeadline();

    return NextResponse.json({
      title,
      description,
      deadline,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to scrape link metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
