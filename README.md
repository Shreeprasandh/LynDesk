# 🌌 LynDesk (EventTracker)

> **The collaborative event tracking and verified project portfolio platform for engineering students.**

LynDesk is a premium, minimal, and fully integrated platform designed to bridge the gap between engineering student accomplishments in hackathons and college-credit coordination, ultimately facilitating verified professional hiring pipelines.

---

## 🎨 Visual Identity

LynDesk features a handcrafted, minimal, obsidian-to-alabaster interface utilizing CSS hardware acceleration (120Hz smooth layouts) and strict typography styling:

*   **Headings**: `Outfit` (Geometric serif cleanliness)
*   **Body & UI**: `Inter`
*   **Code & Logs**: `JetBrains Mono`

---

## 🚀 Key Features

### 1. 📂 Collaborative Workspaces
*   **P2P WebRTC Voice & Video Rooms**: Live, ultra-low latency peer-to-peer audio/video calling built directly into rooms. Uses Supabase Realtime as a signaling channel, enabling direct browser-to-browser media streaming with no server lag.
*   **Live Git Commit Feed**: Live ticker that polls local Git logs or queries the GitHub API directly to display real-time commit history without page refreshes.
*   **Interactive Configurations**: Quick-edit toggles for Git repository links and hosted demo URLs that auto-sync to Supabase with click-to-launch safety formatters.
*   **Artifact Registry**: Supports version-controlled uploads of project PDF/PPT pitch decks with rollback and download options.

### 2. 🧠 AI Programming Portfolio Analyst (Google Gemini 1.5 Flash)
*   Evaluates synced developer profiles (LeetCode, Codeforces, CodeChef).
*   Synthesizes recruiter-ready summaries and a standardized 1-100 Coding Index score.
*   Provides key insights and automated tags representing user strengths (e.g., *Dynamic Programming*, *Concurrency*).

### 3. 🏢 Faculty & Coordinator Dashboard
*   **AI Report Assistant**: Input natural language requests (e.g. *"I want to download the LeetCode performance of CS department from 101 to 104 roll numbers"*).
*   **Auto-compiled CSV Exports**: Filters the student registry based on natural language queries and complies a exportable CSV file.
*   **Audit Ledgers**: Records access keys and coordination events in a secure live compliance logs ledger.

### 4. 💅 Unified Themed Dialog Framework
*   Replaces native browser `alert()` and `confirm()` panels with a custom-styled, glassmorphic modal overlay.
*   Dynamically switches layout states to support simple system alerts or critical verification prompts.

---

## 🛠️ Tech Stack

*   **Frontend Framework**: Next.js 16 (App Router)
*   **Realtime Signaling & Database**: Supabase (PostgreSQL with Realtime Broadcast Channels)
*   **AI Orchestration**: Google Gemini 1.5 Flash SDK (`@google/generative-ai`)
*   **Styling**: TailwindCSS & Custom CSS Variables (supporting sync-safe Light/Dark mode)
*   **Icons**: Lucide React
*   **Communication protocol**: Peer-to-Peer WebRTC (MediaStream API + RTCPeerConnection)

---

## 🚀 Getting Started

### Prerequisites

*   Node.js 18.x or later
*   npm or yarn

### Installation & Configuration

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory and configure your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
   > [!NOTE]
   > If `GEMINI_API_KEY` is not present, the portfolio summaries and coordinator reports will gracefully fall back to local mock evaluators.

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏢 Supabase Schema Overview

The database uses the migration layout defined in `supabase_migration.sql`. Key tables include:
*   `profiles`: Contains developer usernames (LeetCode, Codeforces, CodeChef handles) linked to Supabase authentication.
*   `project_spaces`: Holds hackathon team metadata (project names, git repository links, and hosted deployment URLs).
*   `chat_messages`: Handles collaborative logs synced in real-time between project members.
*   `artifacts`: Version-controlled files and slide-decks.

---

## 📄 License

This project is licensed under the MIT License.
