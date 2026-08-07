/**
 * Universal utility to extract user profile picture / avatar URL across
 * Supabase Auth user_metadata, OAuth identities (Google, GitHub, etc.),
 * and custom stored profile URLs.
 */
export function extractAvatarFromUser(user: any): string {
  if (!user) return "";

  // 1. Direct metadata properties
  const meta = user.user_metadata || {};
  const metaUrl = meta.avatar_url || meta.picture || meta.avatarUrl || meta.avatar || meta.image || "";
  if (metaUrl && typeof metaUrl === "string" && (metaUrl.startsWith("http") || metaUrl.startsWith("data:image/"))) {
    return metaUrl;
  }

  // 2. OAuth Identities array (e.g. Google OAuth, GitHub OAuth linked to email)
  if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      const idData = identity?.identity_data || {};
      const idUrl = idData.avatar_url || idData.picture || idData.avatarUrl || idData.avatar || idData.image || "";
      if (idUrl && typeof idUrl === "string" && (idUrl.startsWith("http") || idUrl.startsWith("data:image/"))) {
        return idUrl;
      }
    }
  }

  // 3. User top-level properties
  if (user.avatar_url && typeof user.avatar_url === "string" && (user.avatar_url.startsWith("http") || user.avatar_url.startsWith("data:image/"))) {
    return user.avatar_url;
  }

  return "";
}
