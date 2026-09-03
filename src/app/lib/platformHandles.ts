/**
 * Utility for parsing and extracting clean usernames from coding platform URLs and handles.
 * Supports LeetCode, CodeChef, HackerRank, GeeksforGeeks, Codeforces, Unstop, and Devpost.
 */

export interface PlatformExtractResult {
  handle: string;
  error?: string;
}

export type CodingPlatform = 
  | "LeetCode" 
  | "CodeChef" 
  | "HackerRank" 
  | "GeeksforGeeks" 
  | "GFG" 
  | "Codeforces" 
  | "Unstop" 
  | "Devpost";

const PLATFORM_IGNORED_SEGMENTS: Record<string, Set<string>> = {
  LeetCode: new Set(["u", "problems", "contest", "tag", "explore", "submissions", "discuss", "studyplan", "problemset"]),
  CodeChef: new Set(["users", "problems", "practice", "contests", "ratings", "certificates", "views"]),
  HackerRank: new Set(["profile", "challenges", "domains", "contests", "certificates", "leaderboard", "administration"]),
  GeeksforGeeks: new Set(["user", "profile", "practice", "courses", "articles", "contests", "problem-of-the-day"]),
  GFG: new Set(["user", "profile", "practice", "courses", "articles", "contests", "problem-of-the-day"]),
  Codeforces: new Set(["profile", "contest", "gym", "problemset", "groups", "rating", "edu"]),
  Unstop: new Set(["u", "user", "profile", "competitions", "hackathons", "quizzes", "internships", "jobs", "courses", "awards"]),
  Devpost: new Set(["user", "hackathons", "challenges", "software", "projects"])
};

export function extractPlatformHandle(input: string, platform: CodingPlatform | string): PlatformExtractResult {
  const raw = (input || "").trim();
  if (!raw) return { handle: "" };

  const clean = raw.startsWith("@") ? raw.slice(1).trim() : raw;

  // If input is a URL or contains domain/path separators
  if (clean.includes("/") || clean.includes(".")) {
    try {
      const urlString = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
      const urlObj = new URL(urlString);
      const host = urlObj.hostname ? urlObj.hostname.toLowerCase() : "";
      const pathSegments = urlObj.pathname ? urlObj.pathname.split("/").filter(Boolean) : [];

      const normPlatform = platform.toLowerCase();

      if (normPlatform === "leetcode") {
        if (!host.includes("leetcode")) {
          return { handle: "", error: "Invalid LeetCode URL. Must be a leetcode.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "u" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.LeetCode.has(pathSegments[0])) {
          username = pathSegments[0];
        } else if (pathSegments[1] && !PLATFORM_IGNORED_SEGMENTS.LeetCode.has(pathSegments[1])) {
          username = pathSegments[1];
        }
        if (!username) {
          return { handle: "", error: "Could not extract LeetCode username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }

      if (normPlatform === "codeforces") {
        if (!host.includes("codeforces")) {
          return { handle: "", error: "Invalid Codeforces URL. Must be a codeforces.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "profile" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.Codeforces.has(pathSegments[0])) {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract Codeforces username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }

      if (normPlatform === "codechef") {
        if (!host.includes("codechef")) {
          return { handle: "", error: "Invalid CodeChef URL. Must be a codechef.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "users" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.CodeChef.has(pathSegments[0])) {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract CodeChef username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }

      if (normPlatform === "hackerrank") {
        if (!host.includes("hackerrank")) {
          return { handle: "", error: "Invalid HackerRank URL. Must be a hackerrank.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "profile" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.HackerRank.has(pathSegments[0])) {
          username = pathSegments[0];
        }
        if (!username) {
          return { handle: "", error: "Could not extract HackerRank username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }

      if (normPlatform === "geeksforgeeks" || normPlatform === "gfg") {
        if (!host.includes("geeksforgeeks")) {
          return { handle: "", error: "Invalid GeeksforGeeks URL. Must be a geeksforgeeks.org profile link." };
        }
        let username = "";
        if ((pathSegments[0] === "user" || pathSegments[0] === "profile") && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.GeeksforGeeks.has(pathSegments[0])) {
          username = pathSegments[0];
        } else if (pathSegments.length > 0) {
          const last = pathSegments[pathSegments.length - 1];
          if (!PLATFORM_IGNORED_SEGMENTS.GeeksforGeeks.has(last)) {
            username = last;
          }
        }
        if (!username) {
          return { handle: "", error: "Could not extract GeeksforGeeks username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }

      if (normPlatform === "unstop") {
        if (!host.includes("unstop")) {
          return { handle: "", error: "Invalid Unstop URL. Must be an unstop.com profile link." };
        }
        let username = "";
        if ((pathSegments[0] === "user" || pathSegments[0] === "u" || pathSegments[0] === "profile") && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.Unstop.has(pathSegments[0])) {
          username = pathSegments[0];
        } else {
          username = pathSegments[pathSegments.length - 1] || "";
        }
        if (!username) {
          return { handle: "", error: "Could not extract Unstop username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }

      if (normPlatform === "devpost") {
        if (!host.includes("devpost")) {
          return { handle: "", error: "Invalid Devpost URL. Must be a devpost.com profile link." };
        }
        let username = "";
        if (pathSegments[0] === "user" && pathSegments[1]) {
          username = pathSegments[1];
        } else if (pathSegments[0] && !PLATFORM_IGNORED_SEGMENTS.Devpost.has(pathSegments[0])) {
          username = pathSegments[0];
        } else {
          username = pathSegments[pathSegments.length - 1] || "";
        }
        if (!username) {
          return { handle: "", error: "Could not extract Devpost username from URL." };
        }
        return { handle: username.replace(/^@/, "").trim() };
      }
    } catch {
      return { handle: "", error: `Invalid ${platform} profile URL format.` };
    }
  }

  // Basic character validity check for raw handle
  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return { handle: "", error: `Invalid ${platform} handle format. Handle contains invalid characters.` };
  }

  return { handle: clean };
}
