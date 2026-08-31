import { NextRequest } from "next/server";

export type InstitutionalRole = "college_admin" | "hod" | "coordinator" | "faculty" | "recruiter";

export interface InstitutionalSessionPayload {
  sub: string;                   // Account ID or PIN key ID
  role: InstitutionalRole;
  name: string;
  instituteId: string;
  instituteName?: string;
  email?: string;
  departmentScope?: string;      // 'ALL', 'CSE', 'IT', etc.
  assignedSections?: string[];   // ['A', 'B'] or empty
  assignedYears?: string[];      // ['3rd Year', '4th Year']
  companyName?: string;          // for recruiters
  exp: number;                   // Expiry unix timestamp in seconds
  iat: number;                   // Issued at unix timestamp in seconds
}

export const INSTITUTIONAL_COOKIE_NAMES = {
  ADMIN: "lyndesk_session_admin",
  STAFF: "lyndesk_session_staff",
  RECRUITER: "lyndesk_session_recruiter"
} as const;

// Secret key resolution with fail-closed security in production
function getSessionSecret(): string {
  const secret = process.env.INSTITUTIONAL_AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("process.env.SUPABASE_SERVICE_ROLE_KEY is required for signing session tokens in production.");
    }
    return "lyndesk_dev_session_signing_key";
  }
  return secret;
}

function getIpSalt(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    return "lyndesk_dev_ip_hasher";
  }
  return secret.slice(0, 16);
}

/**
 * Derives a WebCrypto CryptoKey for HMAC-SHA256 signing
 */
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const secret = getSessionSecret();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Base64URL encoding helper
 */
function base64UrlEncode(data: Uint8Array | string): string {
  const str = typeof data === "string" ? data : String.fromCharCode(...data);
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Base64URL decoding helper
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

/**
 * Signs a payload into a secure HMAC-SHA256 JWT string
 */
export async function signInstitutionalToken(
  payload: Omit<InstitutionalSessionPayload, "iat" | "exp">,
  expiresInSeconds: number = 86400 // default 24h
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: InstitutionalSessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const message = `${headerB64}.${payloadB64}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(message)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${message}.${signatureB64}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 JWT string
 */
export async function verifyInstitutionalToken(
  token: string
): Promise<InstitutionalSessionPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const message = `${headerB64}.${payloadB64}`;

    const key = await getCryptoKey();
    const enc = new TextEncoder();
    
    // Decode signature
    const sigStr = base64UrlDecode(signatureB64);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(message)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(payloadB64);
    const payload: InstitutionalSessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired token
    }

    return payload;
  } catch (err) {
    console.warn("[InstitutionalAuth verify Exception]:", err);
    return null;
  }
}

/**
 * Hashes a client IP using SHA-256 for GDPR-compliant audit logs
 */
export async function hashClientIp(req: NextRequest): Promise<string> {
  try {
    const rawIp = 
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const enc = new TextEncoder();
    const ipSalt = getIpSalt();
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      enc.encode(`${rawIp}_${ipSalt}`)
    );

    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  } catch {
    return "anonymous_ip_hash";
  }
}
