/**
 * Industry-Standard Input Sanitizer & XSS Defense Utility for LynDesk.
 * Neutralizes potential Cross-Site Scripting (XSS) vectors in user-generated text fields.
 */

/**
 * Escapes dangerous HTML entities in plain text strings.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Validates and normalizes safe URLs to prevent javascript: or data: URI XSS injection.
 */
export function sanitizeUrl(urlStr: string): string {
  if (!urlStr || typeof urlStr !== "string") return "";
  const trimmed = urlStr.trim();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("vbscript:") || trimmed.startsWith("data:text/html")) {
    return "";
  }
  return trimmed;
}
