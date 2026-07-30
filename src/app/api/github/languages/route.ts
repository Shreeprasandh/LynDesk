import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repoUrl = searchParams.get("repoUrl");

  if (!repoUrl || !repoUrl.trim()) {
    return NextResponse.json({ languages: [] });
  }

  const githubMatch = repoUrl.trim().match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)/);
  if (!githubMatch) {
    return NextResponse.json({ languages: [] });
  }

  const owner = githubMatch[1];
  const repo = githubMatch[2].replace(/\.git$/, "");

  const headers: Record<string, string> = {
    "User-Agent": "LynDesk-App",
    "Accept": "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { 
      headers,
      next: { revalidate: 300 } 
    });
    if (res.ok) {
      const data = await res.json();
      const total = Object.values(data).reduce((acc: number, val: any) => acc + Number(val), 0) as number;
      if (total > 0) {
        const languages = Object.entries(data).map(([name, bytes]) => ({
          name,
          bytes: Number(bytes),
          percentage: Number(((Number(bytes) / total) * 100).toFixed(1))
        })).sort((a, b) => b.bytes - a.bytes);
        return NextResponse.json({ languages });
      }
    }
  } catch (err) {
    console.error("Server GitHub languages fetch error:", err);
  }

  return NextResponse.json({ languages: [] });
}
