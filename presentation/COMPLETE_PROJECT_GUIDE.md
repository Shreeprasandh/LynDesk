# 🌟 LynDesk (Unified Student Operating System) — Presentation & Viva Master Guide

> **Project Name**: LynDesk (`eventtracker`)  
> **Core Architecture**: Next.js 16.2 (App Router + Turbopack) • React 19 • TypeScript Strict Mode • Tailwind CSS v4 • Supabase (PostgreSQL 15+ with RLS) • Google Gemini 1.5/2.0 AI  
> **Test & Build Health**: 115 / 115 Tests Passing (`vitest`) • 94 / 94 Production Routes Compiled • 0 TypeScript Errors  

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Complete Technology Stack & Architectural Decisions](#2-complete-technology-stack--architectural-decisions)
3. [System Architecture & Data Pipelines](#3-system-architecture--data-pipelines)
4. [Step-by-Step UI Flow & User Journey](#4-step-by-step-ui-flow--user-journey)
5. [Deep Module Breakdown](#5-deep-module-breakdown)
   - 5.1 [Coding Deck (Competitive Programming & Developer Hub)](#51-coding-deck)
   - 5.2 [Event Desk & Hackathon Explorer](#52-event-desk--hackathon-explorer)
   - 5.3 [College Desk (Academic Operations ERP)](#53-college-desk)
   - 5.4 [Study Desk (AI Active Recall & Mastery Engine)](#54-study-desk)
   - 5.5 [Real-Time Workspaces (Team Collaboration Spaces)](#55-real-time-workspaces)
   - 5.6 [Student Works & Verified Portfolio](#56-student-works--verified-portfolio)
   - 5.7 [Coordinator & Faculty Portal](#57-coordinator--faculty-portal)
   - 5.8 [Recruiter Radar (Authentic Talent Discovery)](#58-recruiter-radar)
   - 5.9 [Institutional Administration & Audit Grid](#59-institutional-administration--audit-grid)
   - 5.10 [Social Network & Peer Graph](#510-social-network--peer-graph)
6. [Live Database Architecture (All 25+ Tables Documented)](#6-live-database-architecture)
7. [Upstream Data Scrapers & Resilience Strategies](#7-upstream-data-scrapers--resilience-strategies)
8. [Security, Authentication & Row Level Security (RLS)](#8-security-authentication--row-level-security)
9. [Viva / Jury / Evaluator Q&A Defense (Tough Questions & Exact Answers)](#9-viva--jury--evaluator-qa-defense)
10. [High-Impact 5-Minute Live Demo Walkthrough Script](#10-high-impact-5-minute-live-demo-walkthrough-script)

---

## 1. Executive Summary & Problem Statement

### The Problem
Engineering students face extreme digital fragmentation:
- **Coding Practice** is scattered across LeetCode, Codeforces, CodeChef, HackerRank, and GeeksforGeeks.
- **Developer Proof-of-Work** is trapped inside GitHub repositories.
- **Academic Records** (attendance, timetables, internal marks, fees) live in outdated, clunky college ERP portals.
- **Hackathons and Competitions** are spread across Unstop, Devpost, and local college notice boards.
- **Faculty Coordinators** have no easy way to track student skill milestones or verify external achievements.
- **Recruiters** waste countless hours vetting resumes padded with unverified claims.

### The Solution: LynDesk
**LynDesk** is the unified **Student Operating System** that aggregates competitive programming analytics, hackathon discovery, college operations, AI-powered study tools, verified project portfolios, and recruiter talent discovery into a single, high-performance, dark/light minimal digital headquarters.

### Core Philosophy: The Zero-Fabrication Mandate
- **100% Empirically Grounded**: No synthetic multipliers (`Math.round(total * 0.61)`), no fake contest ratings, and zero mock fallback numbers.
- **Authentic Empty States**: If a student is unrated or disconnected, the UI displays genuine zero states (`"0"`, `"Unrated"`, `"Not Synced"`).
- **Multi-Stakeholder Interoperability**: Built for Students, Faculty/Mentors, Placement Coordinators, and Technical Recruiters.

---

## 2. Complete Technology Stack & Architectural Decisions

| Layer | Technology | Why We Chose It (Architectural Justification) |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.2.10 (App Router)** | Server Components (RSC) provide near-instantaneous initial page loads, streaming SSR, and secure server-only route handlers for scrapers and AI tokens. |
| **Compiler / Bundler** | **Turbopack** | Sub-second Hot Module Replacement (HMR) and optimized multi-worker production builds (compiled 94 routes in <10s). |
| **Frontend UI** | **React 19 + TypeScript (Strict)** | React 19 primitives with zero `any` types across the entire application for robust maintainability. |
| **Styling & Design System** | **Tailwind CSS v4** | Next-generation engine with CSS variables, fluid responsive breakpoints, and dark/light mode tokens. |
| **Motion & Micro-interactions** | **Framer Motion** | Physics-based micro-animations for modal dialogs, bento cards, and tab transitions without lag. |
| **Database** | **Supabase (PostgreSQL 15+)** | Enterprise relational database with ACID compliance, relational integrity, foreign keys, and built-in Row Level Security (RLS). |
| **Realtime WebSockets** | **Supabase Realtime Channels** | Sub-100ms multi-user WebSocket synchronization for workspace presence, collaborative task updates, and broadcast alerts. |
| **Object Storage** | **Supabase Storage** | Encrypted S3-compatible cloud storage for student project screenshots, PDF specs, and certificates. |
| **AI Intelligence** | **Google Gemini (@google/generative-ai)** | High-speed Gemini 1.5/2.0 Flash models for AI curriculum hydration, active recall flashcards, and rubric-based quiz grading. |
| **Testing Suite** | **Vitest (v4)** | ESM-native testing engine executing 70 test suites and 115 tests in <16 seconds. |

---

## 3. System Architecture & Data Pipelines

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19)                         │
│  - Bento Analytics      - 365-Day Heatmap     - Dynamic SVG Curves     │
│  - Realtime Taskboard   - AI Study Modules    - Verified Portfolio     │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
         (1) Direct Supabase Query         (2) Next.js API Routes
             (RLS Protected)                   (/api/coding-stats, etc.)
                   │                                 │
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       SUPABASE (PostgreSQL 15)      │   │  SERVERLESS ROUTE HANDLERS   │
│  - 25+ Relational Tables            │   │  - Resilient Upstream Parsers│
│  - Row Level Security (RLS)         │   │  - Circuit Breakers          │
│  - Realtime WebSocket Channels      │   │  - Google Gemini AI Engine   │
└─────────────────────────────────────┘   └──────────────┬───────────────┘
                                                         │
                ┌────────────────────────────────────────┼────────────────────────────────────────┐
                ▼                                        ▼                                        ▼
    ┌───────────────────────┐                ┌───────────────────────┐                ┌───────────────────────┐
    │  UPSTREAM SCRAPERS    │                │   GOOGLE GEMINI AI    │                │  ADMIN SERVICE ROLE   │
    │  - LeetCode GraphQL   │                │  - Study Hydration    │                │  - Parity Audits      │
    │  - CodeChef HTML/JSON │                │  - Rubric Evaluator   │                │  - Recruiter Search   │
    │  - Codeforces REST    │                │  - Mistake Remediation│                │  - Broadcast Dispatch │
    │  - GitHub API         │                └───────────────────────┘                └───────────────────────┘
    │  - HackerRank & GFG   │
    └───────────────────────┘
```

---

## 4. Step-by-Step UI Flow & User Journey

1. **Landing & Onboarding (`/` & `/login`)**:
   - Students land on the high-impact dashboard, login via passwordless Magic Link or Email + OTP.
   - First-time onboarding prompts students for their college roll number, department, and platform handles.

2. **The Command Center (`/coding-deck`)**:
   - Students see their aggregated coding metric cards, 365-day universal heatmap, contest progression curves, and verified GitHub pushes.
   - Direct modal triggers allow linking or modifying external platform handles at any time.

3. **Event Discovery & Hackathons (`/event-desk` / `/explore`)**:
   - Filter through live competitions (Unstop, Devpost, Codeforces, College Symposiums).
   - Bookmark events or synchronize them into the student's personal academic wall calendar.

4. **Academic Hub (`/college-desk`)**:
   - Access period-by-period class timetables, check attendance percentages with safe bunk / required attendance calculators, and inspect internal exam marks.

5. **AI Mastery & Active Recall (`/study-desk`)**:
   - Generate structured lessons on complex technical topics, study interactive flashcards, and take dynamic quizzes evaluated by Gemini AI.

6. **Collaborative Project Spaces (`/workspace/[id]`)**:
   - Hackathon teams collaborate on Kanban task boards, markdown scratchpads, and file artifacts with live member presence indicators.

7. **Verified Proof-of-Work (`/profile` & `/works`)**:
   - Showcase projects with live URLs and GitHub repositories, earn peer star ratings, and receive official faculty verification badges.

8. **Recruiter & Coordinator Portals (`/coordinator` & `/recruiter`)**:
   - Faculty coordinators review student submissions and broadcast announcements.
   - Technical recruiters filter talent by verified coding milestones and authentic GitHub commits.

---

## 5. Deep Module Breakdown

### 5.1 Coding Deck
- **LeetCode GraphQL Integration**: Connects to `https://leetcode.com/graphql` to pull total solved, difficulty breakdown (Easy/Med/Hard), global ranking, active streaks, and full 52-week submission calendars.
- **CodeChef Historical Parser**: Parses embedded `var all_rating = [...]` JavaScript arrays to extract all historical contest rounds, ratings, stars, and global ranks.
- **Codeforces REST Connector**: Queries `user.info`, `user.status`, and `user.rating` to extract unique solved problems and rating trajectories.
- **GitHub Matrix**: Live REST queries calculate public repositories and verified annual commit pushes.
- **Contest Progression Curve**: Dynamic SVG charting engine with mathematical bounds scaling (`minR`, `maxR`, vertical padding, single-point center alignment).

### 5.2 Event Desk & Hackathon Explorer
- Centralized index of student competitions, hackathons, and technical hiring challenges.
- Tracks application states (`Applied`, `Shortlisted`, `Won`) via `user_hackathon_applications`.
- One-click synchronization to `wall_calendar_events`.

### 5.3 College Desk
- Replaces antiquated legacy ERPs with five focused tabs:
  1. **Timetable**: Room numbers, faculty names, and active period highlighting.
  2. **Attendance Tracker**: Subject-wise percentage gauges with 75% statutory threshold calculators.
  3. **Marks & Grades**: Internal test scores, assignment marks, and SGPA/CGPA forecaster.
  4. **Fee Ledger**: Institutional fee breakdown, payment receipts, and due dates.
  5. **Academic Transcripts**: Verifiable digital student credentials.

### 5.4 Study Desk
- **Curriculum Hydration**: Uses Google Gemini 1.5/2.0 Flash to convert topic keywords into structured pedagogical modules.
- **Active Recall Flashcards**: Front/back card flipping micro-interactions.
- **Semantic Quiz Grader**: AI compares open-ended student answers against structured rubrics, logging mistakes into `study_mistakes` for targeted review.

### 5.5 Real-Time Workspaces
- Project collaboration rooms for engineering hackathons and capstone teams.
- Drag-and-drop Kanban task boards (`workspace_tasks`).
- Shared Markdown notes (`workspace_notes`) with real-time auto-saving.
- File and code artifact vault (`workspace_artifacts`).
- Realtime presence bar showing active teammates via WebSockets (`workspace_presence`).

### 5.6 Student Works & Portfolio
- Project showcase with repository links, live demos, and tech tags.
- Peer star ratings (`student_work_ratings`) and view counters (`student_work_views`).
- Institutional endorsement checkmarks (`student_work_staff_reviews`).

### 5.7 Coordinator & Faculty Portal
- Placement and faculty dashboard to monitor student performance.
- Review queue for academic credit applications (`credit_applications`).
- Broadcast notice system (`staff_broadcasts`) with read receipts (`broadcast_receipts`).
- One-click CSV export for accreditation and placement reporting.

### 5.8 Recruiter Radar
- Authenticated talent acquisition portal for verified hiring partners (`recruiter_keys`).
- Filter students by genuine technical benchmarks (e.g. `>= 300 DSA solves + 500 GitHub commits`).
- Direct deep links to live profiles with zero unverified resume fluff.

### 5.9 Institutional Admin & Security Audit
- College configuration management (departments, batches, sections, academic calendars).
- Security audit log (`institutional_audit_logs`) tracking administrative actions.

---

## 6. Live Database Architecture

| Table Name | Purpose | Primary Security Policy (RLS) |
| :--- | :--- | :--- |
| `profiles` | User identity, bio, roll numbers, college ID, and platform handles | Users can edit only own profile (`auth.uid() = id`) |
| `events` | Central catalog of hackathons, contests, and webinars | Publicly readable; writable only by authorized staff |
| `user_hackathon_applications` | Student event application tracking | Accessible only by applicant student |
| `project_spaces` | Team collaboration workspace rooms | Accessible by workspace members |
| `project_members` | Workspace membership and role assignments | Restricted to workspace members |
| `workspace_tasks` | Kanban task items with status, priority, and assignees | Editable by workspace members |
| `workspace_notes` | Shared markdown notes and documentation | Editable by workspace members |
| `workspace_artifacts` | Uploaded project files, specs, and attachments | Accessible by workspace members |
| `workspace_presence` | Ephemeral heartbeat records for active online users | Managed via Realtime WebSocket channels |
| `credit_applications` | Academic credit & attendance waiver requests | Student owner + faculty coordinator review |
| `handle_verifications` | Cryptographic handshake tokens for external handles | Accessible by token owner |
| `wall_calendar_events` | Personal academic timetable and reminders | User private |
| `study_paths` | Custom AI curriculum modules | User private |
| `study_mistakes` | Spaced repetition error log for AI quizzes | User private |
| `user_dsa_progress` | Daily solved count snapshots and streak history | User private |
| `student_works` | Student portfolio showcase projects | Public read; owner edit |
| `student_work_ratings` | 5-star community ratings for portfolio items | Authenticated user vote |
| `student_work_views` | Unique view tracking analytics | Public increment |
| `student_work_staff_reviews` | Faculty verification badges and review comments | Faculty staff only |
| `college_structures` | Department, batch, and section hierarchies | College admin only |
| `college_admins` | Institutional system administrators | Superadmin only |
| `staff_accounts` | Faculty, HOD, and coordinator credentials | Institutional admin only |
| `staff_broadcasts` | College notices and urgent announcements | Staff write; enrolled student read |
| `broadcast_receipts` | Read receipts for broadcast announcements | Student owner |
| `staff_recommended_events` | Official college-endorsed competitions | Staff write; public read |
| `institutes` | Registered universities and colleges | Institutional admin |
| `friendships` | Social graph connections between peer students | Participating students |
| `recruiter_keys` | Hashed API access keys for industry partners | Superadmin only |
| `institutional_audit_logs` | Immutable audit trail of admin actions | Superadmin read-only |
| `consent_log` | Data privacy and scraping consent records | Compliance audit log |

---

## 7. Upstream Data Scrapers & Resilience Strategies

```
             ┌───────────────────────────────────────────────┐
             │         /api/coding-stats?platform=...        │
             └───────────────────────┬───────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
   [ LeetCode Query ]       [ CodeChef Scraper ]      [ Codeforces API ]
          │                          │                          │
  1. GraphQL API             1. Direct JSON API         1. user.info
  2. leetcode-stats Proxy    2. var all_rating Regex    2. user.status
  3. Alfa Proxy Fallback     3. DOM Regex Extraction    3. user.rating
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
                   ┌───────────────────────────────────┐
                   │    CIRCUIT BREAKER & TIMEOUTS     │
                   │  - 8000ms AbortController         │
                   │  - User-Agent Rotation            │
                   │  - 0ms Local Storage Cache        │
                   │  - Authentic 0-State on Failure   │
                   └───────────────────────────────────┘
```

---

## 8. Security, Authentication & Row Level Security

1. **Zero Auth Secret Leakage**:
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to Next.js server-side route handlers.
   - Client applications only receive the public anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. **100% PostgreSQL RLS Enforcement**:
   - All 25+ tables have RLS enabled with granular SELECT, INSERT, UPDATE, and DELETE policies.
3. **Cryptographic Password & Token Hashing**:
   - Recruiter keys and session tokens use secure SHA-256 / bcrypt cryptographic hashing.
4. **Input Sanitization & Attack Prevention**:
   - Comprehensive regex cleaning and Zod schema validation eliminate SQL Injection (SQLi) and Cross-Site Scripting (XSS).

---

## 9. Viva / Jury / Evaluator Q&A Defense

### Q1: "Why build this as a web platform instead of a native mobile app?"
> **Answer**:  
> "Engineering students, developers, and faculty coordinators do the vast majority of their programming, task management, and academic grading on laptops and desktops. Next.js 16 allows us to deliver a blazing-fast desktop OS experience with multi-window layouts, while remaining 100% reactive and responsive on mobile devices via Tailwind CSS v4."

### Q2: "What if LeetCode or CodeChef updates their website or blocks your scrapers?"
> **Answer**:  
> "We engineered a **Multi-Tier Resilient Fallback Architecture**. For LeetCode, our scraper first queries their official GraphQL endpoint; if blocked or rate-limited, it automatically falls back to secondary and tertiary REST proxies. For CodeChef, we parse their embedded `all_rating` JSON object rather than relying on brittle CSS selectors. Furthermore, all scraper calls use 8-second circuit breakers with graceful zero states."

### Q3: "Why did you choose Supabase (PostgreSQL) instead of MongoDB or Firebase?"
> **Answer**:  
> "LynDesk is fundamentally relational: students belong to departments, workspaces contain tasks and members, and portfolio works link to peer ratings and faculty endorsements. PostgreSQL guarantees ACID compliance, foreign key constraints, and multi-tenant security through Row Level Security (RLS) directly at the database engine level."

### Q4: "How does the AI Study Desk avoid generating incorrect or hallucinated answers?"
> **Answer**:  
> "The Study Desk uses Google Gemini constrained by strict JSON output schemas and deterministic grading rubrics. Instead of open-ended conversational generation, the AI is prompted with specific computer science topic parameters and structured evaluation criteria."

### Q5: "What stops a student from claiming tourist's Codeforces handle or another student's LeetCode profile?"
> **Answer**:  
> "LynDesk incorporates a **Handle Verification Handshake** (`handle_verifications`). For high-stakes workflows (such as recruiter shortlists or academic credit claims), students verify handle ownership by adding a temporary 6-character cryptographic token into their public platform bio or gist before linking."

### Q6: "How is student data kept private between different colleges?"
> **Answer**:  
> "All institutional data is multi-tenant partitioned using PostgreSQL Row Level Security (RLS) scoped to `college_id`. Students and faculty from College A are cryptographically restricted from querying academic records, marks, or broadcasts from College B."

---

## 10. High-Impact 5-Minute Live Demo Walkthrough Script

| Time | Stage | Action & Key Talking Points |
| :--- | :--- | :--- |
| **0:00 - 0:45** | **The Hook** | Start on the Landing Page (`/`).<br>• *"Good morning everyone. Today, an engineering student's digital life is fragmented across a dozen tabs: LeetCode, GitHub, college ERP portals, and hackathon sites. We built LynDesk: The Unified Student Operating System."* |
| **0:45 - 2:15** | **The Coding Deck** | Navigate to `/coding-deck`.<br>• Highlight the 4 Bento cards: Questions Solved, Active Days, Contests Attended, and Rankings.<br>• Hover over the Contest Progression Graph: *"Notice the dynamic SVG curve rendering real contest milestones."*<br>• Show the 365-day Heatmap & GitHub Developer Card: *"Zero fake data—all verified from live upstream APIs."* |
| **2:15 - 3:15** | **College & Study Desk** | Switch to `/college-desk` and `/study-desk`.<br>• *"Students check daily timetables, calculate safe attendance bunk margins, and use AI to generate active-recall flashcards and auto-graded quizzes."* |
| **3:15 - 4:15** | **Realtime Workspaces** | Open a workspace at `/workspace/[id]`.<br>• *"For hackathons and capstone teams: collaborative Kanban task boards, markdown scratchpads, and live WebSocket presence avatars."* |
| **4:15 - 5:00** | **Recruiter Radar & Conclusion** | Navigate to `/recruiter`.<br>• *"Recruiters and placement cells discover authentic, verified builders based on real coding solves and faculty-endorsed projects. LynDesk brings the entire student journey under one roof."*<br>• Open floor for questions.

---

*Authored for the LynDesk Presentation & Technical Defense.*
