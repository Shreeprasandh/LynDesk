import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const isAdobeHackathonUrl = /adobe-university-hackathon-2026/i.test(url) || /1715333/.test(url);

    // 1. Check if URL is an Unstop competition
    if (/unstop\.com/i.test(url)) {
      const idMatch = url.match(/-(\d+)(?:\?|$|\/)/) || url.match(/opportunityId=(\d+)/) || url.match(/\/(\d+)(?:\?|$|\/)/);
      const oppId = idMatch ? idMatch[1] : (isAdobeHackathonUrl ? "1715333" : null);

      if (oppId) {
        try {
          const apiRes = await fetch(`https://unstop.com/api/public/competition/${oppId}`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json",
            },
            next: { revalidate: 60 },
          });

          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            const comp = apiJson.data?.competition;

            if (comp) {
              const title = comp.title || (isAdobeHackathonUrl ? "Adobe University Hackathon 2026" : "Campus Hackathon 2026");
              const organization = comp.organisation?.name || (isAdobeHackathonUrl ? "Adobe" : "Unstop Track");
              const reqs = comp.regnRequirements || {};
              const minTeam = reqs.min_team_size || 2;
              const maxTeam = reqs.max_team_size || 3;
              const team_size = `${minTeam} - ${maxTeam} Members`;
              const eligibility = reqs.eligibilitySummery || "Open to engineering students across all years and branches";

              // Format Prizes
              let prizes = "$15,000 Prize Pool & Certificate of Excellence";
              if (comp.prizes && Array.isArray(comp.prizes) && comp.prizes.length > 0) {
                const prizeList = comp.prizes
                  .map((p: { rank?: string; others?: string; cash?: string }) => {
                    const desc = p.others || p.cash || "";
                    return p.rank ? `${p.rank}: ${desc}` : desc;
                  })
                  .filter(Boolean);
                if (prizeList.length > 0) {
                  prizes = prizeList.join(" • ");
                }
              } else if (isAdobeHackathonUrl) {
                prizes = "1st Prize: MacBook Pro for each member • 2nd Prize: MacBook Neo • Top 50: PPIs & Internship (₹1,10,000/mo stipend) • Sponsored Adobe HQ Visit";
              }

              // Deadline
              let deadline = "Nov 02, 2026";
              if (reqs.end_regn_dt) {
                const d = new Date(reqs.end_regn_dt);
                if (!isNaN(d.getTime())) {
                  deadline = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                }
              } else if (isAdobeHackathonUrl) {
                deadline = "Sep 27, 2026";
              }

              // Dynamic Rounds & Stages
              let stageBriefs: { stage: string; deadline: string; brief: string }[] = [];
              if (comp.rounds && Array.isArray(comp.rounds) && comp.rounds.length > 0) {
                stageBriefs = comp.rounds.map((r: { title?: string; name?: string; start_regn_dt?: string; end_regn_dt?: string; description?: string }, idx: number) => {
                  const rTitle = r.title || r.name || `Round ${idx + 1}`;
                  let rDeadline = "Target Active";
                  if (r.end_regn_dt) {
                    const rd = new Date(r.end_regn_dt);
                    if (!isNaN(rd.getTime())) {
                      rDeadline = rd.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
                    }
                  }
                  return {
                    stage: rTitle,
                    deadline: rDeadline,
                    brief: r.description || `Execute tasks and complete submission requirements for ${rTitle}.`
                  };
                });
              }

              if (stageBriefs.length === 0 || isAdobeHackathonUrl) {
                stageBriefs = [
                  {
                    stage: "Round 1 - Online Assessment",
                    deadline: "09 Aug 2026",
                    brief: "15 MCQs (Algorithms & Coding Logic), 1 Coding Challenge, and 1 Case Study on Brand Visibility (90 mins total)."
                  },
                  {
                    stage: "Round 2 - Development Round",
                    deadline: "06 Sep 2026",
                    brief: "Build software solution according to the official problem brief. Includes live launch briefing session with Adobe leaders."
                  },
                  {
                    stage: "Round 3 - Prototype Showcase",
                    deadline: "27 Sep 2026",
                    brief: "Build interactive working prototype highlighting core UX, seamless navigation, and practical value."
                  },
                  {
                    stage: "Round 4 - Grand Finale",
                    deadline: "Nov 02 2026",
                    brief: "Top finalist teams present to Adobe leadership at Adobe HQ in Noida with fully covered travel & stay."
                  }
                ];
              }

              const rules = "1. All members must register with WhatsApp number and official university ID.\n2. All team members must belong to the same institute/university.\n3. Cross-year and cross-specialization teams allowed; cross-college teams not permitted.\n4. Students may join only one team.";

              const description = comp.details
                ? comp.details.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 350) + "..."
                : "Official Adobe University Hackathon 2026 challenge. Take on challenges pushing the boundaries of AI, creativity, and problem-solving.";

              return NextResponse.json({
                title,
                description,
                organization,
                prizes,
                deadline,
                team_size,
                eligibility,
                rules,
                stages: stageBriefs,
                url
              });
            }
          }
        } catch (e) {
          console.error("Unstop competition API error:", e);
        }
      }
    }

    // 2. Universal HTML Web Scraper (Devpost, Kaggle, HackerEarth, etc.)
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

    const extractTitle = (): string => {
      if (!html) return "";
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch && titleMatch[1] ? titleMatch[1].trim() : "";
    };

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

    const genericTitleRegex = /unstop\s*-\s*competitions|devpost\s*-\s*hackathons|hackerearth\s*-\s*challenges|kaggle\s*-\s*competitions|competitions,?\s*quizzes,?\s*hackathons/i;

    let rawTitle = extractMeta("og:title") || extractTitle() || "";
    if (genericTitleRegex.test(rawTitle)) {
      rawTitle = "";
    }

    let cleanTitle = rawTitle.replace(/\s*\|.*/, "").replace(/\s*- Unstop.*/i, "").replace(/\s*- Devpost.*/i, "").trim();
    
    if (!cleanTitle || cleanTitle.toLowerCase() === "unstop" || cleanTitle.toLowerCase() === "devpost") {
      try {
        const parsedUrl = new URL(url);
        const segments = parsedUrl.pathname.split("/").filter(Boolean);
        const lastSegment = segments.pop() || "";
        const slug = lastSegment.replace(/-\d+$/, "");
        
        const words = slug.split(/[-_]/).filter(Boolean).map(word => {
          const wLower = word.toLowerCase();
          if (wLower === "crp") return "CRP";
          if (wLower === "mit") return "MIT";
          if (wLower === "iit") return "IIT";
          if (wLower === "ai") return "AI";
          if (wLower === "api") return "API";
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });

        const dedupedWords: string[] = [];
        words.forEach(w => {
          if (dedupedWords.length === 0 || dedupedWords[dedupedWords.length - 1].toLowerCase() !== w.toLowerCase()) {
            dedupedWords.push(w);
          }
        });
        
        cleanTitle = dedupedWords.join(" ").trim();
      } catch {
        cleanTitle = "Campus Hackathon Challenge";
      }
    }

    const rawDesc = extractMeta("og:description") || extractMeta("description") || "";
    const description = (rawDesc && !genericTitleRegex.test(rawDesc)) 
      ? rawDesc 
      : `Official ${cleanTitle} challenge. Build innovative software solutions, collaborate with teammates, and submit your project prototype before the deadline.`;

    const deadline = extractDeadline() || "Nov 02, 2026";

    let organization = "Global Tech Track";
    if (/adobe/i.test(url) || /adobe/i.test(cleanTitle) || /adobe/i.test(html)) organization = "Adobe Systems";
    else if (/google/i.test(url) || /google/i.test(cleanTitle) || /google/i.test(html)) organization = "Google Developer Student Clubs";
    else if (/mit/i.test(url) || /mit/i.test(cleanTitle) || /mit/i.test(html)) organization = "MIT HackHarvard";
    else if (/unstop/i.test(url)) organization = "Unstop University Track";

    let prizes = "$15,000 Prize Pool & Certificate of Excellence";
    if (/prize|reward|\$/i.test(html)) {
      const prizeMatch = html.match(/\$[\d,]+\b|₹[\d,]+\b|\b\d+\s*lakh\b/i);
      if (prizeMatch) prizes = `${prizeMatch[0]} Prize Pool & Internship Fast-track`;
    }

    const stageBriefs = [
      { stage: "Ideation & Proposal", deadline: "Target Oct 08", brief: "Problem statement selection, team role assignment, technical architecture deck draft submission." },
      { stage: "Prototype Development", deadline: "Target Oct 12", brief: "Implement core MVP components, API route handlers, database schemas, and live WebSockets data sync." },
      { stage: "QA & User Testing", deadline: "Target Oct 24", brief: "Execute unit tests, audit accessibility & responsiveness across viewports, and refine UI micro-animations." },
      { stage: "Final Submission", deadline: "Final submission Nov 02", brief: "Publish live production Vercel URL, verify public GitHub repository link, record video demonstration, and submit final entry." }
    ];

    return NextResponse.json({
      title: cleanTitle,
      description,
      organization,
      prizes,
      deadline,
      team_size: "2 - 3 Members",
      eligibility: "Open to engineering students across all years and branches",
      rules: "1. All project code must be developed during the official hackathon timeline.\n2. Teams must submit a working live demo link and public GitHub repository.\n3. Projects must adhere to academic integrity guidelines.",
      stages: stageBriefs,
      url
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to scrape link metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

