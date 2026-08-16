/**
 * Universal utility to extract user profile picture / avatar URL across
 * Supabase Auth user_metadata, OAuth identities (Google, GitHub, etc.),
 * and custom stored profile URLs.
 */
export function extractAvatarFromUser(user: any): string {
  // 0. Instant global un-sessioned cache check (prevents 1-frame hydration flash before AuthContext resolves)
  if (typeof window !== "undefined") {
    try {
      const globalActive = localStorage.getItem("ldk_active_user_avatar");
      if (globalActive && (globalActive.startsWith("http") || globalActive.startsWith("data:image/"))) {
        return globalActive.trim();
      }

      if (user?.id) {
        const rawPublic = localStorage.getItem(`ldk_public_profile_${user.id}`);
        if (rawPublic) {
          const parsed = JSON.parse(rawPublic);
          if (parsed?.avatar_url && typeof parsed.avatar_url === "string" && parsed.avatar_url.trim().length > 0) {
            return parsed.avatar_url.trim();
          }
        }

        const localCached =
          localStorage.getItem(`ldk_user_avatar_${user.id}`) ||
          localStorage.getItem(`ldk_avatar_url_${user.id}`);
        if (localCached && typeof localCached === "string" && localCached.trim().length > 0) {
          return localCached.trim();
        }
      }
    } catch {}
  }

  if (!user) return "";

  const meta = user.user_metadata || {};

  // 0b. If user explicitly removed their avatar, return empty string
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

  // 3. OAuth Identities fallback ONLY if user has never updated/customized their profile avatar
  if (meta.avatar_updated === true) {
    return "";
  }

  if (Array.isArray(user.identities)) {
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
