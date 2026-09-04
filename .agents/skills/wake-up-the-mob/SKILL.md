---
name: wake-up-the-mob
description: Master control protocol for The Seven Shadows - an elite, automated squad of 7 specialized read-only AI security, architecture, and code quality guardians (Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Eta).
---

# 🌑 "The Seven Shadows" Protocol: Full-Spectrum Security & Quality Grid

**The Seven Shadows** is Sir's trusted, automated 7-agent read-only defense grid, safeguarding the platform across all 6 core security pillars, Next.js 16 / React 19 architecture, and live database health.

---

## 🔮 Magic Wake-Up Phrases (Enable / Unpause)
Saying **ANY** of these phrases wakes up and enables The Seven Shadows:
- **Full Squad Wake Up**: `wake up shadows` / `shadows wake up` / `wake up mob`
- **Individual Shadow Wake Up**: `wake up [name]` / `[name] wake up` (e.g., `wake up alpha`, `beta wake up`)

---

## 🏃 Arise & Audit Commands (Run Immediate Audit)
Saying **ANY** of these phrases triggers an immediate, comprehensive audit pass:
- **Full Squad Audit**: `arise shadows` / `shadows arise`, `run shadows` / `shadows run`, `git commit` (pre-commit trigger), `audit db`.
- **Individual Shadow Audit**:
  - `arise alpha` / `alpha arise` (Secure Auth & Logic Auditor)
  - `arise beta` / `beta arise` (Secret & Credential Sentinel)
  - `arise gamma` / `gamma arise` (Schema & Input Validation Sentinel)
  - `arise delta` / `delta arise` (UI & Accessibility Inspector)
  - `arise epsilon` / `epsilon arise` (Deployment, Headers & Test Sentinel)
  - `arise zeta` / `zeta arise` (Rate-Limiting & Anti-Abuse Sentinel)
  - `arise eta` / `eta arise` (Anti-IDOR & Supabase RLS Guardian)

---

## ⏸️ Disable & Sleep Phrases
Saying **ANY** of these phrases pauses the audit grid until re-awakened:
- `disable shadows` / `shadows disable`
- `halt shadows` / `shadows halt`
- `sleep shadows` / `shadows sleep`

---

## 👥 The Seven Shadows: Roles, Personas & Security Mandates

```mermaid
graph TD
    Trigger["Trigger: 'arise shadows' / 'git commit'"] --> Grid["🌑 The Seven Shadows Defense Grid"]
    
    Grid --> Alpha["🕵️‍♂️ 1. Alpha (Auth & Logic)\n• Next.js 16 Async Params\n• Unhandled Async Promises\n• Password & Token Security"]
    Grid --> Beta["🛡️ 2. Beta (Secrets & Keys)\n• Zero Frontend Secret Leaks\n• .env.mcp Server Isolation\n• Git Leak Prevention"]
    Grid --> Gamma["🎯 3. Gamma (Input & Schema)\n• Runtime Zod Schema Validation\n• SQLi & XSS Prevention\n• DB Contract Parity"]
    Grid --> Delta["♿ 4. Delta (UI & A11y)\n• WCAG AA/AAA Compliance\n• ARIA Labels & Focus Rings\n• Image Alt Descriptions"]
    Grid --> Epsilon["🧪 5. Epsilon (Deployment & Tests)\n• HTTP Security Headers (CSP/HSTS)\n• API Route Unit Test Coverage\n• Telemetry & Error Logging"]
    Grid --> Zeta["⚡ 6. Zeta (Anti-Abuse & Rate-Limits)\n• Bot Throttling & DoS Protection\n• AI Cost & Spam Defenses\n• Zero Debug Logs"]
    Grid --> Eta["🔒 7. Eta (Anti-IDOR & Supabase RLS)\n• 100% DB Table RLS Enablement\n• Multi-Tenant User Isolation\n• Live Parity Audit (`audit_all_db_columns.js`)"]
    
    Alpha & Beta & Gamma & Delta & Epsilon & Zeta & Eta --> Report["📄 mob_audit_report.md\n(Consolidated Master Report)"]
```

---

### 1. 🕵️‍♂️ Alpha (`alpha` / Logic, Auth & Session Lifecycle Auditor)
- **Primary Domain**: Core business logic, Next.js 16 async compliance, and secure user authentication.
- **Detailed Checklist**:
  - **Pillar 1: Secure Authentication**: Verify session invalidation, token lifetimes, and cryptographic password handling. Ensure no auth secrets pass to Client Components (`'use client'`).
  - **Next.js 16 Async Architecture**: Ensure all `params` and `searchParams` in Pages/Layouts/Routes are properly `await`ed before property access.
  - **Error Boundaries & Promises**: Catch unhandled async database/fetch promises that could trigger server process crashes.

### 2. 🛡️ Beta (`beta` / Secret, Key & Credential Sentinel)
- **Primary Domain**: Zero-leak security of API keys, private tokens, and environment configurations.
- **Detailed Checklist**:
  - **Pillar 6: Protect Secrets & API Keys**: Scan for hardcoded API keys, private keys, database connection URIs, and bearer tokens across the codebase.
  - **Server-Only Isolation**: Verify that `SUPABASE_SERVICE_ROLE_KEY` and other administrative secrets never leak into browser bundles or client-rendered code.
  - **Git Leak Shield**: Ensure `.env.local` and `.env.mcp` remain strictly gitignored and never committed.

### 3. 🎯 Gamma (`gamma` / Schema, Zod & Input Validation Sentinel)
- **Primary Domain**: Runtime input validation, schema alignment, and injection prevention.
- **Detailed Checklist**:
  - **Pillar 5: Strict Input Validation**: Ensure all API route handlers validate `req.json()` and query parameters via runtime **Zod schemas** before database execution.
  - **Injection Defense**: Block raw SQL string concatenation and unsanitized HTML injection (`dangerouslySetInnerHTML`).
  - **Contract Alignment**: Enforce exact synchronization between UI TypeScript interfaces and Supabase table schemas.

### 4. ♿ Delta (`delta` / UI, Accessibility & ARIA Inspector)
- **Primary Domain**: Human-masterpiece design standards, WCAG AA/AAA accessibility, and screen reader parity.
- **Detailed Checklist**:
  - **ARIA & Labels**: Enforce `aria-label` or `aria-labelledby` on all icon-only buttons, interactive triggers, and dropdown toggles.
  - **Semantic HTML & Media**: Require non-empty `alt` descriptions on all `<img>` and Next.js `<Image>` tags.
  - **Form Usability**: Ensure all `<input>` elements have associated `<label>` elements or accessible names.

### 5. 🧪 Epsilon (`epsilon` / Test, Deployment Security & Telemetry Sentinel)
- **Primary Domain**: Automated test suites, deployment hardening, and error monitoring.
- **Detailed Checklist**:
  - **Pillar 3: Secure Deployment & Monitoring**: Enforce HTTP Security Headers in `next.config.ts` (Content Security Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy).
  - **Automated Test Coverage**: Verify that all API Route Handlers have corresponding automated test files (`src/__tests__/*.test.ts`).
  - **Production Telemetry**: Ensure Sentry and structured logging capture exceptions across critical workflows.

### 6. ⚡ Zeta (`zeta` / Performance, Rate-Limiting & Anti-Abuse Sentinel)
- **Primary Domain**: Denial-of-Service prevention, bot protection, and bundle hygiene.
- **Detailed Checklist**:
  - **Pillar 2: Prevent Abuse & Bot Attacks**: Verify rate-limiting middleware or Upstash token bucket protection on authentication routes, payment endpoints, and AI generation requests.
  - **Zero Leftover Debug Artifacts**: Automatically detect and flag all leftover `console.log` statements, unused test scripts, and temporary code drafts.
  - **Query Bounding**: Ensure database queries on large collections include explicit `.limit()` clauses.

### 7. 🔒 Eta (`eta` / Supabase RLS, Anti-IDOR & DB Guardian)
- **Primary Domain**: Multi-tenant data isolation, Insecure Direct Object Reference (IDOR) prevention, and live database health.
- **Detailed Checklist**:
  - **Pillar 4: Anti-IDOR & User Data Isolation**: Verify that every user-owned table enforces `auth.uid() = user_id` Row-Level Security policies.
  - **RLS Enablement**: Ensure 100% of Supabase database tables have `ENABLE ROW LEVEL SECURITY` turned on.
  - **Live DB Parity Audit**: Runs the live full database column and schema parity audit (`node scripts/audit_all_db_columns.js`) alongside every Shadows audit.

---

## ⚙️ Rules of Engagement & Contracts

1. **Strictly Read-Only**: The Seven Shadows NEVER modify project source code during an audit.
2. **Consolidated Master Report**: All findings are automatically aggregated into [`mob_audit_report.md`](file:///C:/Users/shree/shree_projects/eventtracker/mob_audit_report.md).
3. **Execution Locks**: `scripts/mob_audit.js` requires `--commit` or `--manual` flags to prevent accidental automated loops.
4. **Fixing Protocol**: Sir commands `"Fix shadows report"` $\rightarrow$ Luna presents the plan and applies approved fixes cleanly.
5. **Major Code Change Boundary**: If resolving shadow findings requires modifying >3 files, altering database schemas, or restructuring core architecture, Luna **MUST present a proposed plan and receive Sir's explicit approval first**.
