import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const urlParams = req.nextUrl.searchParams;
  const repoUrl = urlParams.get("repoUrl");

  if (!repoUrl || !repoUrl.trim()) {
    return NextResponse.json({ commits: [], exists: false, error: "No repository link provided" });
  }

  const cleanUrl = repoUrl.trim().replace(/\/$/, "");
  const repoMatch = cleanUrl.match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)$/);
  if (!repoMatch) {
    return NextResponse.json({ commits: [], exists: false, error: "Invalid GitHub repository link format" });
  }

  const owner = repoMatch[1];
  const repo = repoMatch[2].replace(/\.git$/, "");

  const headers: Record<string, string> = {
    "User-Agent": "LynDesk-App",
    "Accept": "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { 
      headers,
      next: { revalidate: 60 } 
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const parsed = data.map((item: any) => {
          const dateObj = new Date(item.commit?.author?.date || item.commit?.committer?.date);
          const relative = dateObj.toLocaleDateString(undefined, {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
          });
          return {
            hash: item.sha ? item.sha.substring(0, 7) : "commit",
            author: item.commit?.author?.name || item.commit?.committer?.name || owner,
            message: item.commit?.message ? item.commit.message.split("\n")[0] : "Update codebase",
            time: relative
          };
        });
        return NextResponse.json({ commits: parsed, exists: true, error: null });
      }
      return NextResponse.json({ commits: [], exists: true, error: "No commits found in this repository" });
    }

    if (res.status === 404) {
      return NextResponse.json({ commits: [], exists: false, error: "Repository not found or is private" }, { status: 404 });
    }

    return NextResponse.json({ commits: [], exists: false, error: `GitHub API error (${res.status})` }, { status: res.status });
  } catch (err: any) {
    console.error("Server GitHub commits fetch error:", err);
    return NextResponse.json({ commits: [], exists: false, error: "Failed to connect to GitHub" }, { status: 500 });
  }
}
