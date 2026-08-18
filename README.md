<div align="center">

# 🌌 LynDesk
### *Link Your Next Desk*

**The unified collaborative workspace, competitive coding tracker, and academic engineering engine.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2_(App_Router)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%7C_Realtime-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_%7C_1.5_Pro-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

</div>

## 📌 Overview

**LynDesk** is an all-in-one engineering workstation designed for student developers, faculty coordinators, and technical recruiters. It bridges hackathon collaboration, daily competitive programming streaks, and coursework into verified, recruiter-ready engineering portfolios and academic records.

---

## 🏛️ Platform Architecture & Desks

```
                               ┌───────────────────────────┐
                               │       🌌 LynDesk Hub      │
                               └─────────────┬─────────────┘
                                             │
      ┌──────────────────────────────┬───────┴──────────────────────┬──────────────────────────────┐
      ▼                              ▼                              ▼                              ▼
🚀 Event Desk                  💻 Coding Desk                 📚 Study Desk                 🎓 Coordinator Desk
(Workspaces & WebRTC)          (Ratings & Leetie Sync)        (Adaptive AI Lessons)         (Analytics & Batch CSV)
```

### 1. 🚀 Event Desk (`/event-desk`)
* **Live Project Workspaces**: Dedicated team rooms for tracking milestones (*Ideation → Prototype Development → QA → Final Submission*).
* **0ms Predictive Hydration**: Instant workspace loading powered by background pre-fetching and client-side SWR caching.
* **P2P Audio/Video Rooms**: Ultra-low latency WebRTC voice and video calls with real-time peer status indicators.
* **Artifact Vault & GitHub Ticker**: Version-controlled deliverable management for pitch decks, live demo URLs, and GitHub commit tracking.

### 2. 💻 Coding Desk (`/coding-deck`)
* **Multi-Platform Metric Aggregation**: Synchronized analytics across **LeetCode**, **Codeforces**, **CodeChef**, and **Unstop**.
* **Daily Streak & Rating Engine**: Activity heatmaps, solve distribution (*Easy, Medium, Hard*), and standardized global percentile calculations.
* **Leetie Extension (`/public/leetie-v1.0.0.zip`)**: Bundled Chrome extension that automatically archives accepted LeetCode solutions directly to your personal GitHub repository.

### 3. 📚 Study Desk (`/study-desk`)
* **AI Path Studio**: Upload lecture slides, DOCX files, or PDFs to automatically synthesize structured, interactive study paths.
* **Gamified Session Player**: Step-by-step concept flashcards, interactive multi-choice quizzes, 5-heart life system, and active recall mistake queues.
* **Adaptive Depth Controls**: Select study intensity from **Sprint** (5 lessons), **Standard** (15–20 lessons), or **Deep Dive** (25–50 lessons).

### 4. 🎓 Coordinator & Recruiter Hubs (`/coordinator`, `/recruiter`)
* **Faculty Department Analytics**: Real-time student coding activity monitoring, academic credit verification, and one-click student roster CSV exports.
* **Recruiter Search & Verified Portfolios**: Filter candidates by verified competitive ratings, hackathon accomplishments, and AI-synthesized skill tags.

---

## 🧠 Google Gemini AI Integration

LynDesk leverages the **Google Generative AI SDK** (`@google/generative-ai`) to orchestrate zero-latency developer assistance:

* **LynAI Co-Pilot (`/api/ai/chat`)**: Contextual assistant for algorithm debugging, workspace navigation, and daily practice advice.
* **Curriculum Synthesis (`/api/study/generate-lessons`)**: High-speed schema generation for bite-sized lesson paths from raw document uploads.
* **Assessment Evaluator (`/api/study/grade-answer`)**: Contextual semantic grading of open-ended student answers.
* **Natural Language Data Queries (`/api/ai/coordinator-query`)**: Translates plain-English queries from faculty into instant database reports and downloadable CSVs.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) |
| **UI Library** | [React 19](https://react.dev/) & [Framer Motion](https://www.framer.com/motion/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Custom Design Tokens |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, WebSockets) |
| **AI SDK** | [Google Generative AI](https://ai.google.dev/) (`gemini-2.0-flash`, `gemini-1.5-pro`) |
| **Realtime Media** | WebRTC (MediaStream & RTCPeerConnection) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Type Safety** | Strict [TypeScript](https://www.typescriptlang.org/) |

---

## 🛡️ The Seven Shadows Auditing Pipeline

LynDesk features an automated pre-commit audit squad known as **The Seven Shadows**:

1. 🕵️‍♂️ **Alpha (Logic Auditor)**: Next.js 16 async params, unhandled promises, and route logic.
2. 🛡️ **Beta (Secret Sentinel)**: API token isolation and zero hardcoded credentials.
3. 🎯 **Gamma (Schema Validator)**: Supabase SQL contract & UI type alignment.
4. ♿ **Delta (A11y Inspector)**: ARIA accessibility, keyboard navigation, and semantic DOM elements.
5. 🧪 **Epsilon (Test Sentinel)**: Automated test suite coverage across API route handlers.
6. ⚡ **Zeta (Performance Accelerator)**: Bundle optimization and leftover console statement audits.
7. 🔒 **Eta (RLS Guardian)**: Supabase Row Level Security policy validation.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.x` or later (Node 20+ recommended)
* **npm**: `v9.x` or later

### 1. Clone & Install
```bash
git clone https://github.com/Shreeprasandh/LynDesk.git
cd LynDesk
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# SMTP Credentials (Optional - for Email OTP resets)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
