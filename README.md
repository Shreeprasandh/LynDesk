# 🌌 LynDesk — Link Your Next Desk

> **Link Your Next Desk**: The unified academic engine, collaborative workspace platform, and AI-powered engineering portfolio hub for student developers, faculty coordinators, and tech recruiters.

LynDesk (**L**ink **Y**our **N**ext **Desk**) bridges student accomplishments in hackathons, daily competitive coding, and coursework directly into verified, recruiter-ready engineering portfolios and academic records.

---

## 🏛️ The Three Core Desks

LynDesk is structured around three dedicated productivity desks tailored for engineering excellence:

```
                          ┌───────────────────────────┐
                          │   🌌 LynDesk Architecture │
                          └─────────────┬─────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
 🚀 Event Desk                  💻 Coding Desk                 📚 Study Desk
 (Workspaces & Hackathons)       (Competitive Ratings)          (Adaptive AI Paths)
```

### 1. 🚀 Event Desk (`/event-desk`)
* **Collaborative Project Workspaces**: Dedicated team spaces for hackathon deliverables, stage management (*Ideation → MVP → Polished Demo*), and active task tracking.
* **P2P WebRTC Video & Voice Rooms**: Embedded low-latency peer-to-peer audio and video rooms powered by Supabase Realtime signaling.
* **Live GitHub Commit Ticker**: Synchronized commit feeds polling local Git logs or the GitHub API in real time.
* **Deliverable Artifact Registry**: Version-controlled pitch decks (PDF/PPTX), hosted demo URLs, and code repository links.

### 2. 💻 Coding Desk (`/coding-desk`)
* **Multi-Platform Handle Sync**: Automated aggregation across **LeetCode**, **Codeforces**, and **CodeChef**.
* **Streak & Activity Verification**: Live daily challenge streak tracking with verified problem solve counters.
* **Competitive Index**: Standardized scoring algorithm evaluating difficulty distribution (Easy, Medium, Hard) and rating brackets.

### 3. 📚 Study Desk (`/study-desk`)
* **AI Path Studio**: Drag-and-drop file uploader for lecture notes, PDFs, DOCX, and spreadsheets that automatically generates structured Duolingo-style study paths.
* **Interactive Session Player**: Full-screen lesson overlay featuring concept teaching cards, multiple-choice questions, short-answer items, 5-heart life system, and celebration confetti.
* **Depth & Pace Controls**: Generate targeted paths tuned for **Sprint (5 lessons)**, **Standard (15–20 lessons)**, or **Deep Dive (25–50 lessons)**.
* **Error Bank & Adaptive Review**: Automated mistake queue for targeted re-testing and knowledge retention.
* **30-Day Activity Grid & Leagues**: Visual heatmap tracking daily study habits and rank progression (*Bronze, Silver, Gold, Diamond*).

---

## 🧠 AI Engine & Co-Pilot (Groq Llama 3.3)

LynDesk is powered by the **Groq AI Engine** (`llama-3.3-70b-versatile`), driving zero-latency intelligent workflows across the platform:

* **LynAI Co-Pilot (`/api/ai/chat`)**: Context-aware assistant providing CS algorithm guidance, workspace navigation, and daily challenge tips.
* **Curriculum Generator (`/api/study/generate-lessons`)**: High-speed JSON schema generation for bite-sized teaching cards and assessment quizzes.
* **Short-Answer Evaluator (`/api/study/grade-answer`)**: Intelligent grading of written responses against model answers and key concepts.
* **Faculty Coordinator Assistant (`/api/ai/coordinator-query`)**: Natural language query engine translating faculty prompts (e.g., *"Export LeetCode stats for CS roll 1001 to 2000"*) into instant CSV downloads.
* **Recruiter Portfolio Summary (`/api/ai/portfolio-summary`)**: Synthesizes verified platform stats into executive recruiter overviews and skill tags.

---

## 🎨 Visual Identity & Aesthetic Directives

LynDesk is built with a Swiss-grid minimalist aesthetic, dark mode precision, CSS hardware acceleration (120Hz smooth layouts), and curated Google Fonts typography:

* **Headings**: `Outfit` (Clean, geometric elegance)
* **Body & UI**: `Inter` (Humanist legibility)
* **Code & Monospace**: `JetBrains Mono` / `Font Mono`
* **Animations**: Micro-interactions and spring transitions powered by `framer-motion`

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 16 (App Router with Turbopack) & React 19
* **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime Broadcast Channels)
* **AI Orchestration**: Groq AI SDK (`llama-3.3-70b-versatile`)
* **Styling**: Tailwind CSS v4 & Custom CSS Design Tokens
* **Document Processing**: `pdf-parse`, `mammoth`, `xlsx`
* **Icons**: Lucide React
* **Realtime Media**: WebRTC (MediaStream API + RTCPeerConnection)

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18.x or later
* npm or yarn

### Installation & Local Setup

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GROQ_API_KEY=gsk_your_groq_api_key
   ```

3. **Apply Database Migrations**:
   Run the SQL migration scripts in your Supabase SQL Editor:
   - `supabase_migration.sql` — Core database tables (`profiles`, `events`, `project_spaces`, `workspace_tasks`)
   - `supabase_study_desk.sql` — Study Desk tables (`study_paths`, `study_mistakes`, profile gamification columns)

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

5. **Verify Production Build**:
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the MIT License.
