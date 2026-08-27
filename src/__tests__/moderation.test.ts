import { describe, it, expect } from "vitest";
import { 
  stripEmojis, 
  isHarassmentOrOffensive, 
  maskOffensiveWords, 
  checkRateLimit 
} from "@/app/lib/moderation";

describe("Safety & Moderation Suite (src/app/lib/moderation.ts)", () => {
  describe("stripEmojis", () => {
    it("should remove all emojis from text", () => {
      const input = "Hello 🚀 world! 😊 Here is your 💻 code.";
      const clean = stripEmojis(input);
      expect(clean).toBe("Hello world! Here is your code.");
      expect(clean).not.toContain("🚀");
      expect(clean).not.toContain("😊");
      expect(clean).not.toContain("💻");
    });

    it("should preserve standard punctuation, symbols and math notation", () => {
      const input = "Big-O is O(N * log N) and time < 100ms & score = 95.5%!";
      expect(stripEmojis(input)).toBe(input);
    });

    it("should handle empty or whitespace-only strings safely", () => {
      expect(stripEmojis("")).toBe("");
      expect(stripEmojis("   ")).toBe("");
    });
  });

  describe("isHarassmentOrOffensive", () => {
    it("should permit legitimate developer, academic, and CS queries", () => {
      const goodQueries = [
        "How do I link to my college in LynDesk?",
        "Explain Dijkstra's shortest path algorithm.",
        "Where can I find teammates for HackTag 2026?",
        "Can you review my React Server Component code?"
      ];

      for (const q of goodQueries) {
        const check = isHarassmentOrOffensive(q);
        expect(check.safe).toBe(true);
      }
    });

    it("should flag toxic harassment, hate speech, and violent threats", () => {
      const toxic = [
        "go die you loser",
        "kys immediately",
        "i will attack you",
        "send nudes"
      ];

      for (const t of toxic) {
        const check = isHarassmentOrOffensive(t);
        expect(check.safe).toBe(false);
        expect(check.reason).toBeDefined();
      }
    });

    it("should flag malicious phishing and tracking links", () => {
      const phishing = "Click here: grabify.link/track and bit.ly/hack";
      const check = isHarassmentOrOffensive(phishing);
      expect(check.safe).toBe(false);
    });
  });

  describe("maskOffensiveWords", () => {
    it("should mask offensive keywords with asterisks", () => {
      const text = "Please stop or go die";
      const masked = maskOffensiveWords(text);
      expect(masked).not.toContain("go die");
      expect(masked).toContain("******");
    });
  });

  describe("checkRateLimit", () => {
    it("should allow requests under the limit", () => {
      const testId = `test_user_${Date.now()}`;
      const r1 = checkRateLimit(testId, 5, 10000);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(4);

      const r2 = checkRateLimit(testId, 5, 10000);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(3);
    });

    it("should block requests exceeding the rate limit", () => {
      const testId = `burst_user_${Date.now()}`;
      for (let i = 0; i < 3; i++) {
        checkRateLimit(testId, 3, 10000);
      }
      const blocked = checkRateLimit(testId, 3, 10000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });
});
