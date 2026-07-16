/**
 * Utility functions for text normalization, acronym correction,
 * and fuzzy spelling suggestions (Levenshtein distance matching).
 */

// Common engineering/academic department dictionaries for spelling suggestions
const KNOWN_DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Electrical Engineering",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biomedical Engineering",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Business Administration",
  "Product Design",
  "Human Computer Interaction"
];

// Common universities for auto-expansion
const UNIVERSITY_MAP: Record<string, string> = {
  "mit": "Massachusetts Institute of Technology (MIT)",
  "stanford": "Stanford University",
  "harvard": "Harvard University",
  "berkeley": "UC Berkeley",
  "caltech": "California Institute of Technology (Caltech)",
  "cmu": "Carnegie Mellon University (CMU)",
  "oxford": "University of Oxford",
  "cambridge": "University of Cambridge",
  "iit": "Indian Institute of Technology (IIT)"
};

// Common programming skills spelling normalization maps
const SKILLS_CORRECTION_MAP: Record<string, string> = {
  "javascript": "JavaScript",
  "javscript": "JavaScript",
  "js": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "python": "Python",
  "pyton": "Python",
  "html": "HTML",
  "css": "CSS",
  "react": "React",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "rust": "Rust",
  "golang": "Go",
  "git": "Git",
  "github": "GitHub",
  "supabase": "Supabase",
  "tailwind": "TailwindCSS",
  "tailwindcss": "TailwindCSS",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "node": "Node.js",
  "nodejs": "Node.js"
};

// Acronyms that should always be fully capitalized
const ALWAYS_UPPERCASE = new Set([
  "it", "cs", "se", "cse", "ece", "eee", "me", "ds", "mit", "iit", "cmu", "hci", "ui", "ux", "api", "pdf", "url", "db", "sql"
]);

/**
 * Calculates the Levenshtein distance between two strings
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  
  for (let i = 0; i <= alen; i++) tmp[i] = [i];
  for (let j = 0; j <= blen; j++) tmp[0][j] = j;
  
  for (let i = 1; i <= alen; i++) {
    for (let j = 1; j <= blen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,      // Deletion
        tmp[i][j - 1] + 1,      // Insertion
        tmp[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  return tmp[alen][blen];
}

/**
 * Normalizes text to standard Title Case with special acronym handling.
 * e.g., "computer science" -> "Computer Science", "it" -> "IT"
 */
export function normalizeTitleCase(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (ALWAYS_UPPERCASE.has(lower)) {
        return word.toUpperCase();
      }
      // Keep words like "and", "of", "in" lowercase unless they are the first word
      if (["and", "or", "of", "in", "the", "to", "for"].includes(lower)) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Returns a corrected abbreviation name if matched
 */
export function getAcronymExpansion(text: string): string | null {
  const cleaned = text.trim().toLowerCase();
  
  // Direct matching
  if (UNIVERSITY_MAP[cleaned]) {
    return UNIVERSITY_MAP[cleaned];
  }
  
  // Specific translations
  if (cleaned === "it" || cleaned === "information tech") return "Information Technology";
  if (cleaned === "cs" || cleaned === "comp sci") return "Computer Science";
  if (cleaned === "se" || cleaned === "software eng") return "Software Engineering";
  if (cleaned === "ds" || cleaned === "data sci") return "Data Science";
  
  return null;
}

/**
 * Searches for a spelling match in the list of known departments.
 * Returns suggestion if matching closely (Levenshtein distance <= 3)
 */
export function getSpellingSuggestion(text: string): string | null {
  const cleaned = text.trim().toLowerCase();
  if (cleaned.length < 3) return null;

  // Exact abbreviation expansions take precedence
  const expansion = getAcronymExpansion(cleaned);
  if (expansion) return expansion;

  let bestMatch: string | null = null;
  let minDistance = 4; // Max distance allowed to suggest

  for (const dept of KNOWN_DEPARTMENTS) {
    const deptLower = dept.toLowerCase();
    
    // Substring match
    if (deptLower.includes(cleaned) && cleaned.length > 4) {
      return dept;
    }
    
    const distance = getLevenshteinDistance(cleaned, deptLower);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = dept;
    }
  }

  return bestMatch;
}

/**
 * Normalizes a list of skills, fixing case and common spelling issues.
 * e.g., "js, react, pyton" -> "JavaScript, React, Python"
 */
export function normalizeSkillsList(skillsStr: string): string {
  if (!skillsStr) return "";
  return skillsStr
    .split(",")
    .map(skill => {
      const cleaned = skill.trim();
      const lower = cleaned.toLowerCase();
      
      // 1. Check direct correction dictionary
      if (SKILLS_CORRECTION_MAP[lower]) {
        return SKILLS_CORRECTION_MAP[lower];
      }
      
      // 2. Fallback to normal title casing
      return normalizeTitleCase(cleaned);
    })
    .filter(Boolean)
    .join(", ");
}
