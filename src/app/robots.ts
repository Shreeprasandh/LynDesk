import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lyndesk.tech";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/event-desk", "/coding-deck", "/study-desk", "/explore", "/leaderboard", "/news-contests", "/help", "/privacy", "/terms"],
        disallow: ["/api/", "/admin/", "/coordinator/", "/recruiter/", "/auth/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
