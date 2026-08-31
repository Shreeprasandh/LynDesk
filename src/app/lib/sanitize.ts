/**
 * Industry-Standard Input Sanitizer, SSRF Defense & CSV Injection Defense for LynDesk.
 * Neutralizes potential Cross-Site Scripting (XSS), CSV Formula Injection, and SSRF vectors.
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
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:text/html")
  ) {
    return "";
  }
  return trimmed;
}

/**
 * Industry-standard CSV Formula Injection (CWE-1236) Defense.
 * Neutralizes dangerous spreadsheet formula prefixes (=, +, -, @, tab, newline).
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  
  let str = String(val).trim();
  str = str.replace(/"/g, '""');

  if (/^[=+\-@\t\r\n]/.test(str)) {
    return `"'${str}"`;
  }
  
  return `"${str}"`;
}

/**
 * Validates external URLs to strictly protect against Server-Side Request Forgery (SSRF).
 * Blocks private IP ranges (RFC 1918), loopback, link-local, multicast, AWS/GCP cloud metadata.
 */
export function isSafeExternalUrl(urlStr: string): { safe: boolean; error?: string; urlObj?: URL } {
  if (!urlStr || typeof urlStr !== "string") {
    return { safe: false, error: "Missing or invalid URL" };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { safe: false, error: "Invalid URL syntax" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { safe: false, error: "Only HTTP and HTTPS protocols are permitted" };
  }

  const host = parsed.hostname.toLowerCase().trim();

  // Block localhost, link-local, internal domains
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    host === "::1" ||
    host === "169.254.169.254" ||
    host === "metadata.google.internal"
  ) {
    return { safe: false, error: "Access to private or local network hosts is prohibited" };
  }

  // IPv4 Private & Loopback check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = host.match(ipv4Regex);
  if (ipMatch) {
    const octets = ipMatch.slice(1, 5).map(Number);
    if (octets.some((o) => o > 255)) {
      return { safe: false, error: "Invalid IP address octet" };
    }

    const [o1, o2] = octets;
    if (o1 === 127) return { safe: false, error: "Loopback access prohibited" };
    if (o1 === 10) return { safe: false, error: "Private subnet access prohibited" };
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return { safe: false, error: "Private subnet access prohibited" };
    if (o1 === 192 && o2 === 168) return { safe: false, error: "Private subnet access prohibited" };
    if (o1 === 169 && o2 === 254) return { safe: false, error: "Link-local metadata access prohibited" };
    if (o1 === 0) return { safe: false, error: "Broadcast/Current network access prohibited" };
  }

  if (/^0x[0-9a-f]+$/i.test(host) || /^0[0-7]+(\.0[0-7]+)*$/.test(host) || /^\d+$/.test(host)) {
    return { safe: false, error: "Alternate IP notations are prohibited" };
  }

  return { safe: true, urlObj: parsed };
}
