/**
 * Utility functions for text normalization, acronym correction,
 * and fuzzy spelling suggestions (Levenshtein distance matching).
 * Extensive dictionary of Indian Universities, Colleges, and Departments.
 */

// Comprehensive engineering & academic department dictionary
const KNOWN_DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Computer Science and Engineering (AI & ML)",
  "Computer Science and Engineering (Data Science)",
  "Computer Science and Engineering (Cyber Security)",
  "Computer Science and Engineering (IoT)",
  "Computer Science and Business Systems (CSBS)",
  "Information Technology (IT)",
  "Software Engineering",
  "Artificial Intelligence and Data Science (AI & DS)",
  "Artificial Intelligence and Machine Learning (AI & ML)",
  "Electronics and Communication Engineering (ECE)",
  "Electrical and Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Robotics and Automation",
  "Mechatronics Engineering",
  "Aerospace Engineering",
  "Aeronautical Engineering",
  "Biomedical Engineering",
  "Biotechnology",
  "Chemical Engineering",
  "Industrial and Production Engineering",
  "Metallurgical and Materials Engineering",
  "Instrumentation and Control Engineering",
  "Automotive Engineering",
  "Marine Engineering",
  "Agricultural Engineering",
  "Mining Engineering",
  "Food Technology",
  "Environmental Engineering",
  "Telecommunication Engineering",
  "Information Science and Engineering (ISE)",
  "Bachelor of Computer Applications (BCA)",
  "Master of Computer Applications (MCA)",
  "Bachelor of Science in Computer Science (B.Sc CS)",
  "Master of Science in Computer Science (M.Sc CS)",
  "Business Administration (MBA / BBA)",
  "Human Computer Interaction (HCI)"
];

// Common Indian & Global university acronym mappings for auto-expansion
const UNIVERSITY_MAP: Record<string, string> = {
  "mit": "Massachusetts Institute of Technology (MIT)",
  "stanford": "Stanford University",
  "harvard": "Harvard University",
  "berkeley": "UC Berkeley",
  "caltech": "California Institute of Technology (Caltech)",
  "cmu": "Carnegie Mellon University (CMU)",
  "oxford": "University of Oxford",
  "cambridge": "University of Cambridge",
  "srm": "SRM Institute of Science and Technology (SRM IST)",
  "eec": "SRM Easwari Engineering College (Chennai)",
  "vit": "Vellore Institute of Technology (VIT)",
  "bits": "Birla Institute of Technology and Science (BITS Pilani)",
  "dtu": "Delhi Technological University (DTU)",
  "nsut": "Netaji Subhas University of Technology (NSUT)",
  "nit": "National Institute of Technology (NIT)",
  "iit": "Indian Institute of Technology (IIT)",
  "iiit": "Indian Institute of Information Technology (IIIT)"
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
  "it", "cs", "se", "cse", "ece", "eee", "me", "ds", "mit", "iit", "iiit", "nit", "bits", "srm", "vit", "cmu", "hci", "ui", "ux", "api", "pdf", "url", "db", "sql"
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
  if (UNIVERSITY_MAP[cleaned]) {
    return UNIVERSITY_MAP[cleaned];
  }
  if (cleaned === "it" || cleaned === "information tech") return "Information Technology (IT)";
  if (cleaned === "cs" || cleaned === "comp sci" || cleaned === "cse") return "Computer Science and Engineering (CSE)";
  if (cleaned === "se" || cleaned === "software eng") return "Software Engineering";
  if (cleaned === "ds" || cleaned === "data sci") return "Computer Science and Engineering (Data Science)";
  if (cleaned === "ece") return "Electronics and Communication Engineering (ECE)";
  if (cleaned === "eee") return "Electrical and Electronics Engineering (EEE)";
  if (cleaned === "ai") return "Artificial Intelligence and Data Science (AI & DS)";
  return null;
}

/**
 * Searches for a spelling match in the list of known departments.
 */
export function getSpellingSuggestion(text: string): string | null {
  const cleaned = text.trim().toLowerCase();
  if (cleaned.length < 3) return null;

  const expansion = getAcronymExpansion(cleaned);
  if (expansion) return expansion;

  let bestMatch: string | null = null;
  let minDistance = 4;

  for (const dept of KNOWN_DEPARTMENTS) {
    const deptLower = dept.toLowerCase();
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
 */
export function normalizeSkillsList(skillsStr: string): string {
  if (!skillsStr) return "";
  return skillsStr
    .split(",")
    .map(skill => {
      const cleaned = skill.trim();
      const lower = cleaned.toLowerCase();
      if (SKILLS_CORRECTION_MAP[lower]) {
        return SKILLS_CORRECTION_MAP[lower];
      }
      return normalizeTitleCase(cleaned);
    })
    .filter(Boolean)
    .join(", ");
}

// Extensive list of Indian Universities, IITs, NITs, IIITs, BITS, Deemed & State Engineering Colleges
const KNOWN_COLLEGES = [
  // IITs
  "Indian Institute of Technology (IIT Bombay)",
  "Indian Institute of Technology (IIT Delhi)",
  "Indian Institute of Technology (IIT Madras)",
  "Indian Institute of Technology (IIT Kanpur)",
  "Indian Institute of Technology (IIT Kharagpur)",
  "Indian Institute of Technology (IIT Roorkee)",
  "Indian Institute of Technology (IIT Guwahati)",
  "Indian Institute of Technology (IIT Hyderabad)",
  "Indian Institute of Technology (IIT BHU Varanasi)",
  "Indian Institute of Technology (IIT Indore)",
  "Indian Institute of Technology (IIT Gandhinagar)",
  "Indian Institute of Technology (IIT Ropar)",
  "Indian Institute of Technology (IIT Patna)",
  "Indian Institute of Technology (IIT Bhubaneswar)",
  "Indian Institute of Technology (IIT Jodhpur)",
  "Indian Institute of Technology (IIT Mandi)",
  "Indian Institute of Technology (IIT Palakkad)",
  "Indian Institute of Technology (IIT Tirupati)",
  "Indian Institute of Technology (IIT Bhilai)",
  "Indian Institute of Technology (IIT Goa)",
  "Indian Institute of Technology (IIT Jammu)",
  "Indian Institute of Technology (IIT Dharwad)",
  "Indian Institute of Technology (IIT ISM Dhanbad)",

  // NITs
  "National Institute of Technology (NIT Trichy / Tiruchirappalli)",
  "National Institute of Technology (NIT Surathkal / Karnataka)",
  "National Institute of Technology (NIT Rourkela)",
  "National Institute of Technology (NIT Warangal)",
  "National Institute of Technology (NIT Calicut)",
  "National Institute of Technology (NIT Kurukshetra)",
  "National Institute of Technology (NIT Durgapur)",
  "National Institute of Technology (NIT Silchar)",
  "National Institute of Technology (NIT Jaipur - MNIT)",
  "National Institute of Technology (NIT Nagpur - VNIT)",
  "National Institute of Technology (NIT Surat - SVNIT)",
  "National Institute of Technology (NIT Allahabad - MNNIT)",
  "National Institute of Technology (NIT Bhopal - MANIT)",
  "National Institute of Technology (NIT Jalandhar - Dr B R Ambedkar)",
  "National Institute of Technology (NIT Meghalaya)",
  "National Institute of Technology (NIT Raipur)",
  "National Institute of Technology (NIT Agartala)",
  "National Institute of Technology (NIT Goa)",
  "National Institute of Technology (NIT Puducherry)",
  "National Institute of Technology (NIT Uttarakhand)",
  "National Institute of Technology (NIT Mizoram)",
  "National Institute of Technology (NIT Manipur)",
  "National Institute of Technology (NIT Nagaland)",
  "National Institute of Technology (NIT Arunachal Pradesh)",
  "National Institute of Technology (NIT Sikkim)",
  "National Institute of Technology (NIT Delhi)",
  "National Institute of Technology (NIT Hamirpur)",
  "National Institute of Technology (NIT Srinagar)",
  "National Institute of Technology (NIT Jamshedpur)",
  "National Institute of Technology (NIT Andhra Pradesh)",
  "Indian Institute of Engineering Science and Technology (IIEST Shibpur)",

  // IIITs
  "International Institute of Information Technology (IIIT Hyderabad)",
  "International Institute of Information Technology (IIIT Bangalore)",
  "Indian Institute of Information Technology (IIIT Allahabad)",
  "ABV-Indian Institute of Information Technology and Management (IIITM Gwalior)",
  "Pandit Dwarka Prasad Mishra IIITDM Jabalpur",
  "Indian Institute of Information Technology Design and Manufacturing (IIITDM Kancheepuram)",
  "Indian Institute of Information Technology (IIIT Lucknow)",
  "Indian Institute of Information Technology (IIIT Pune)",
  "Indian Institute of Information Technology (IIIT Vadodara)",
  "Indian Institute of Information Technology (IIIT Sri City)",
  "Indian Institute of Information Technology (IIIT Kota)",
  "Indian Institute of Information Technology (IIIT Guwahati)",
  "Indian Institute of Information Technology (IIIT Kalyani)",
  "Indian Institute of Information Technology (IIIT Una)",
  "Indian Institute of Information Technology (IIIT Chittoor)",
  "Indian Institute of Information Technology (IIIT Sonepat)",
  "Indian Institute of Information Technology (IIIT Bhopal)",
  "Indian Institute of Information Technology (IIIT Surat)",
  "Indian Institute of Information Technology (IIIT Nagpur)",
  "Indian Institute of Information Technology (IIIT Bhagalpur)",
  "Indian Institute of Information Technology (IIIT Raichur)",
  "Indraprastha Institute of Information Technology (IIIT Delhi)",

  // BITS, SRM, VIT & Major Deemed/Private Universities
  "SRM Institute of Science and Technology (SRM IST Kattankulathur)",
  "SRM Easwari Engineering College (Chennai)",
  "SRM Institute of Science and Technology (Ramapuram)",
  "SRM Institute of Science and Technology (Vadapalani)",
  "SRM Institute of Science and Technology (NCR Delhi)",
  "Vellore Institute of Technology (VIT Vellore)",
  "Vellore Institute of Technology (VIT Chennai)",
  "Vellore Institute of Technology (VIT AP)",
  "Vellore Institute of Technology (VIT Bhopal)",
  "Birla Institute of Technology and Science (BITS Pilani)",
  "Birla Institute of Technology and Science (BITS Goa)",
  "Birla Institute of Technology and Science (BITS Hyderabad)",
  "Delhi Technological University (DTU Delhi)",
  "Netaji Subhas University of Technology (NSUT Delhi)",
  "Indira Gandhi Delhi Technical University for Women (IGDTUW)",
  "College of Engineering Guindy (CEG Anna University, Chennai)",
  "Madras Institute of Technology (MIT Anna University, Chennai)",
  "SSN College of Engineering (Chennai)",
  "PSG College of Technology (Coimbatore)",
  "Coimbatore Institute of Technology (CIT)",
  "Thiagarajar College of Engineering (TCE Madurai)",
  "SASTRA Deemed University (Thanjavur)",
  "Amrita Vishwa Vidyapeetham (Coimbatore / Amritapuri / Bengaluru)",
  "Manipal Institute of Technology (MAHE Manipal)",
  "Thapar Institute of Engineering and Technology (TIET Patiala)",
  "RV College of Engineering (RVCE Bengaluru)",
  "BMS College of Engineering (BMSCE Bengaluru)",
  "Ramaiah Institute of Technology (MSRIT Bengaluru)",
  "PES University (Bengaluru)",
  "Dayananda Sagar College of Engineering (DSCE Bengaluru)",
  "Veermata Jijabai Technological Institute (VJTI Mumbai)",
  "COEP Technological University (College of Engineering Pune)",
  "Vishwakarma Institute of Technology (VIT Pune)",
  "Pune Institute of Computer Technology (PICT Pune)",
  "MIT World Peace University (MIT-WPU Pune)",
  "Sardar Patel Institute of Technology (SPIT Mumbai)",
  "K. J. Somaiya College of Engineering (Mumbai)",
  "Dwarkadas J. Sanghvi College of Engineering (DJSCE Mumbai)",
  "Institute of Chemical Technology (ICT Mumbai)",
  "Jawaharlal Nehru Technological University (JNTU Hyderabad)",
  "Osmania University College of Engineering (OU Hyderabad)",
  "Chaitanya Bharathi Institute of Technology (CBIT Hyderabad)",
  "Vasavi College of Engineering (Hyderabad)",
  "VNR Vignana Jyothi Institute of Engineering and Technology (VNRVJIET Hyderabad)",
  "Gokaraju Rangaraju Institute of Engineering and Technology (GRIET Hyderabad)",
  "Kalinga Institute of Industrial Technology (KIIT Bhubaneswar)",
  "Siksha 'O' Anusandhan (SOA Bhubaneswar)",
  "CV Raman Global University (Bhubaneswar)",
  "Amity University (Noida / Gurugram / Jaipur / Lucknow / Mumbai)",
  "Sharda University (Greater Noida)",
  "Shiv Nadar University (SNU Greater Noida)",
  "Jaypee Institute of Information Technology (JIIT Noida)",
  "Galgotias College of Engineering and Technology (Greater Noida)",
  "Bennett University (Greater Noida)",
  "Graphic Era University (Dehradun)",
  "UPES Dehradun",
  "Chandigarh University (CU Mohali)",
  "Lovely Professional University (LPU Phagwara)",
  "Chitkara University (Punjab / Himachal Pradesh)",
  "Punjab Engineering College (PEC Chandigarh)",
  "Harcourt Butler Technical University (HBTU Kanpur)",
  "Madan Mohan Malaviya University of Technology (MMMUT Gorakhpur)",
  "Institute of Engineering and Technology (IET Lucknow)",
  "Jamia Millia Islamia (JMI New Delhi)",
  "Jawaharlal Nehru University (JNU New Delhi)",
  "Banaras Hindu University (IIT BHU Varanasi)",
  "Aligarh Muslim University (AMU Aligarh)",
  "Visvesvaraya Technological University (VTU Belagavi)",
  "Cochin University of Science and Technology (CUSAT Kochi)",
  "College of Engineering Trivandrum (CET Thiruvananthapuram)",
  "Government College of Engineering Kannur",
  "APJ Abdul Kalam Technological University (KTU Kerala)",
  "Jadavpur University (Kolkata)",
  "Maulana Abul Kalam Azad University of Technology (MAKAUT WB)",
  "Heritage Institute of Technology (Kolkata)",
  "Techno Main Salt Lake (Kolkata)",
  "Institute of Engineering and Management (IEM Kolkata)",
  "Nirma University (Ahmedabad)",
  "Pandit Deendayal Energy University (PDEU Gandhinagar)",
  "Maharaja Sayajirao University of Baroda (MSU Baroda)",
  "Dharmsinh Desai University (DDU Nadiad)",
  "Birla Institute of Technology (BIT Mesra Ranchi)",
  "Assam Engineering College (Guwahati)",
  "Jorhat Engineering College (Assam)",
  "Christ University (Bengaluru)",
  "Symbiosis International University (SIU Pune)",
  "NMIMS University (Mumbai)",
  "Government College of Technology (GCT Coimbatore)",
  "Rajalakshmi Engineering College (REC Chennai)",
  "Sri Sairam Engineering College (Chennai)",
  "St. Joseph's College of Engineering (Chennai)",
  "Sathyabama Institute of Science and Technology (Chennai)",
  "Hindustan Institute of Technology and Science (HITS Chennai)",
  "Karunya Institute of Technology and Sciences (Coimbatore)",
  "Kumaraguru College of Technology (KCT Coimbatore)",
  "Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology",
  "Saveetha Institute of Medical and Technical Sciences (SIMATS Chennai)",
  "Massachusetts Institute of Technology (MIT)",
  "Stanford University",
  "Harvard University",
  "California Institute of Technology (Caltech)",
  "Carnegie Mellon University (CMU)",
  "University of Oxford",
  "University of Cambridge",
  "University of California, Berkeley (UC Berkeley)",
  "Princeton University",
  "Yale University",
  "Columbia University"
];

const KNOWN_COMPANIES = [
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "Meta",
  "Netflix",
  "NVIDIA",
  "TCS (Tata Consultancy Services)",
  "Infosys",
  "Wipro",
  "Cognizant",
  "Accenture",
  "Goldman Sachs",
  "J.P. Morgan",
  "Adobe",
  "Salesforce",
  "Uber",
  "Lyft",
  "Stripe",
  "Intel",
  "AMD",
  "Cisco",
  "IBM"
];

export function getAutocompleteSuggestions(text: string, type: "college" | "department" | "company"): string[] {
  const source = type === "college" 
    ? KNOWN_COLLEGES 
    : type === "department" 
    ? KNOWN_DEPARTMENTS 
    : KNOWN_COMPANIES;

  const cleaned = text.trim().toLowerCase();
  if (!cleaned) return source.slice(0, 10);
    
  return source.filter(item => item.toLowerCase().includes(cleaned)).slice(0, 12);
}
