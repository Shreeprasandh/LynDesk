/**
 * Canonical Workspace UUID Resolver for LynDesk
 * Ensures both Client Components and API Route Handlers generate identical 128-bit compound UUIDs
 * for slug-based workspaces (e.g. "ws_unstop_uber_2026").
 */

export function getWorkspaceUuid(rawId: string): string {
  if (!rawId) return "00000000-0000-4000-8000-000000000000";
  const trimmed = rawId.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed;
  }
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 16777619);
    h2 = Math.imul(h2 ^ code, 2246822519);
  }
  const hex1 = Math.abs(h1).toString(16).padStart(8, "0");
  const hex2 = Math.abs(h2).toString(16).padStart(8, "0");
  const combined = (hex1 + hex2 + hex1 + hex2).substring(0, 32);

  const p1 = combined.substring(0, 8);
  const p2 = combined.substring(8, 12);
  const p3 = "4" + combined.substring(13, 16);
  const p4 = "8" + combined.substring(17, 20);
  const p5 = combined.substring(20, 32);
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export function isValidUuid(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}
