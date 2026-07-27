import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Run git log to fetch the last 5 commits formatted with || delimiter
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
    // Return empty commits list if Git is not initialized or accessible
    return NextResponse.json({ commits: [] });
  }
}
