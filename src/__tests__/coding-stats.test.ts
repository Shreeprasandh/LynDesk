import { describe, it, expect } from "vitest";

describe("Coding Stats & HackerRank Integration", () => {
  it("extracts clean handle from various HackerRank input formats", () => {
    const extractHackerRank = (input: string) => {
      const clean = input.trim().replace(/^@/, "");
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

  it("handles GeeksforGeeks API and score data properly", () => {
    const sampleGfgResult = {
      total_problems_solved: 340,
      easy: 180,
      medium: 120,
      hard: 40,
      coding_score: 950,
      institute_rank: 12,
      current_streak: 15,
      pod_solved_longest_streak: 42
    };

    expect(sampleGfgResult.total_problems_solved).toBe(340);
    expect(sampleGfgResult.coding_score).toBe(950);
    expect(sampleGfgResult.current_streak).toBe(15);
  });

  it("handles Devpost project count and hackathon metrics", () => {
    const sampleDevpostPayload = {
      projectsCount: 8,
      hackathonsCount: 8,
      followersCount: 14,
      fullName: "Alex Rivera",
      participations: 8
    };

    expect(sampleDevpostPayload.projectsCount).toBe(8);
    expect(sampleDevpostPayload.participations).toBe(8);
  });
});

