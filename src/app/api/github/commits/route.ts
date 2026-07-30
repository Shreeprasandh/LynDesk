import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repoUrl = searchParams.get("repoUrl");

  const headers: Record<string, string> = {
    "User-Agent": "LynDesk-App",
    "Accept": "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  if (repoUrl && repoUrl.trim()) {
    const cleanUrl = repoUrl.trim().replace(/\/$/, "");
    const repoMatch = cleanUrl.match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)$/);
    if (repoMatch) {
      const owner = repoMatch[1];
      const repo = repoMatch[2].replace(/\.git$/, "");
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
            return NextResponse.json({ commits: parsed });
          }
        }
      } catch (err) {
        console.error("Server GitHub commits fetch error:", err);
      }
    }
  }

  // Fallback to local git repository commits if external GitHub fetch fails
  try {
    const { stdout } = await execAsync('git log -n 5 --pretty=format:"%h||%an||%s||%ar"');
    const commits = stdout.trim().split("\n").filter(Boolean).map(line => {
      const [hash, author, message, time] = line.split("||");
      return { 
        hash: hash || "unknown", 
        author: author || "Author", 
        message: message || "Commit message", 
        time: time || "Recently" 
      };
    });
    return NextResponse.json({ commits });
  } catch {
    return NextResponse.json({ commits: [] });
  }
}
