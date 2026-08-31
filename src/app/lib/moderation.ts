/**
 * LynDesk Safety & Content Moderation Suite
 * 
 * Provides production-grade protection across the platform:
 * 1. Anti-Harassment & Hate Speech Heuristics
 * 2. Strict Emoji Stripper for AI Responses
 * 3. In-Memory Sliding-Window Rate Limiting
 * 4. Profanity & Malicious Pattern Filtering
 */

import { checkRateLimit } from "./rateLimit";
export { checkRateLimit };

/**
 * Strips all unicode emojis, emoticons, pictographs, and decorative symbols.
 */
export function stripEmojis(text: string): string {
  if (!text || typeof text !== "string") return "";
  
  return text
    // Strip standard unicode emoji presentation and extended pictographs
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    // Clean up any dangling double spaces left behind by stripped emojis
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// Prohibited toxic keywords, racial/ethnic slurs, threats, and harassment patterns
const HARASSMENT_PATTERNS: RegExp[] = [
  // Racial, ethnic, religious & hate slurs
  /\b(nigg[ae]r?|fagg?ot|kike|chink|spic|gook|retard|tranny)\b/i,
  // Violent threats & personal harassment
  /\b(kill\s+your\s*self|go\s+die|kys|die\s+in\s+a\s+fire|i\s+will\s+(kill|murder|attack|rape)\s+you)\b/i,
  // Severe sexual harassment & illicit solicitations
  /\b(send\s+nudes?|child\s*porn|pedophil|rape\s+you|cunt|whore|slut)\b/i,
  // Malicious phishing & dangerous payload indicators
  /\b(discord\.gg\/[a-z0-9]+|bit\.ly\/[a-z0-9]+|grabify\.link|iplogger\.(org|com)|hack\s+account)\b/i
];

/**
 * Evaluates whether text contains harassment, hate speech, severe profanity, or toxic content.
 */
export function isHarassmentOrOffensive(text: string): { safe: boolean; reason?: string } {
  if (!text || typeof text !== "string") {
    return { safe: true };
  }

  const normalized = text.toLowerCase().trim();

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        reason: "Message violates LynDesk Community Guidelines regarding harassment, hate speech, or inappropriate content."
      };
    }
  }

  return { safe: true };
}

/**
 * Masks offensive words in a string with asterisks (for non-fatal display cases).
 */
export function maskOffensiveWords(text: string): string {
  if (!text || typeof text !== "string") return "";

  let masked = text;
  for (const pattern of HARASSMENT_PATTERNS) {
    masked = masked.replace(pattern, (match) => "*".repeat(match.length));
  }
  return masked;
}
