import { describe, it, expect, vi } from "vitest";

describe("Coding Stats & HackerRank Integration", () => {
  it("extracts clean handle from various HackerRank input formats", () => {
    const extractHackerRank = (input: string) => {
      let clean = input.trim().replace(/^@/, "");
      if (clean.includes("/") || clean.includes(".")) {
        try {
          const urlString = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
          const url = new URL(urlString);
          const pathSegments = url.pathname.split("/").filter(Boolean);
          if (pathSegments[0] === "profile" && pathSegments[1]) {
            return pathSegments[1];
          } else if (pathSegments[0]) {
            return pathSegments[0];
          }
        } catch {}
      }
      return clean;
    };

    expect(extractHackerRank("tourist")).toBe("tourist");
    expect(extractHackerRank("@tourist")).toBe("tourist");
    expect(extractHackerRank("https://www.hackerrank.com/profile/tourist")).toBe("tourist");
    expect(extractHackerRank("https://hackerrank.com/tourist")).toBe("tourist");
  });

  it("handles HackerRank API response structure properly", async () => {
    // Mock sample HackerRank badge structure
    const sampleBadges = {
      models: [
        { badge_name: "Problem Solving", stars: 5, current_points: 1200, solved: 150 },
        { badge_name: "Python", stars: 5, current_points: 900, solved: 80 },
        { badge_name: "SQL", stars: 4, current_points: 450, solved: 40 }
      ]
    };

    let totalSolved = 0;
    const badges: Array<{ name: string; stars: number; points: number }> = [];
    sampleBadges.models.forEach(b => {
      totalSolved += b.solved;
      badges.push({
        name: b.badge_name,
        stars: b.stars,
        points: b.current_points
      });
    });

    expect(totalSolved).toBe(270);
    expect(badges.length).toBe(3);
    expect(badges[0].name).toBe("Problem Solving");
    expect(badges[0].stars).toBe(5);
  });
});

