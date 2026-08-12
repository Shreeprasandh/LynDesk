/**
 * Universal utility to extract user profile picture / avatar URL across
 * Supabase Auth user_metadata, OAuth identities (Google, GitHub, etc.),
 * and custom stored profile URLs.
 */
export function extractAvatarFromUser(user: any): string {
  if (!user) return "";

  const meta = user.user_metadata || {};

  // 0. If user explicitly removed their avatar or set it to empty/null, do NOT fall back to OAuth pictures
  if (meta.avatar_removed === true || meta.avatar_url === null || meta.avatar_url === "") {
    return "";
  }

  // 1. Direct metadata avatar_url (newest user-chosen avatar)
  if (meta.avatar_url && typeof meta.avatar_url === "string" && meta.avatar_url.trim().length > 0) {
    return meta.avatar_url.trim();
  }

  // 2. User top-level properties
  if (user.avatar_url && typeof user.avatar_url === "string" && user.avatar_url.trim().length > 0) {
    return user.avatar_url.trim();
  }

  // 3. OAuth Identities fallback ONLY if never removed or custom updated
  if (!meta.avatar_updated && Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      const idData = identity?.identity_data || {};
      const idUrl = idData.avatar_url || idData.picture || idData.avatarUrl || idData.avatar || idData.image || "";
      if (idUrl && typeof idUrl === "string" && (idUrl.startsWith("http") || idUrl.startsWith("data:image/"))) {
        return idUrl.trim();
      }
    }
  }

  return "";
}
