# 🌑 THE SEVEN SHADOWS: Master Security & Architecture Report

**Last Scan**: 8/9/2026, 7:48:01 am
**Files Inspected**: 256
**Active Target**: ALL 7 SHADOWS (Full Grid)

### 📊 Master Executive Summary
| Shadow | Domain & Security Pillar | Focus & Mandate | Findings Count | Status |
| :--- | :--- | :--- | :--- | :--- |
| 🕵️‍♂️ **Alpha** | 🔐 Secure Authentication & Logic | Next.js 16 Async, Auth Secrets & Sessions | **25** | ⚠️ Action Required |
| 🛡️ **Beta** | 🔑 Secret & Credential Sentinel | API Keys, DB Secrets & Client Leaks | **2** | 🚨 Critical Risk |
| 🎯 **Gamma** | 🧹 Input Validation & Schema Parity | Zod Runtime Validation, XSS & SQLi Defense | **22** | ⚠️ Check Payloads |
| ♿ **Delta** | ♿ UI & Accessibility Inspector | WCAG Standards, ARIA & Image Alt Tags | **0** | ✅ Accessible |
| 🧪 **Epsilon** | 🚀 Deployment, Headers & Tests | Security Headers, CSP & Route Test Suites | **10** | 🧪 Needs Coverage |
| ⚡ **Zeta** | 🤖 Rate-Limiting & Anti-Abuse | Bot Throttling, DoS Defense & Log Cleanliness | **0** | ✅ Optimized |
| 🔒 **Eta** | 🚪 Anti-IDOR & Supabase RLS | User Data Isolation & DB Table Policies | **0** | ✅ Secured |

---

## 🕵️‍♂️ 1. Alpha (Logic & Secure Authentication) Findings (25)

### 1. `src/app/api/ai/verify-certificate/route.ts:66`
- **Issue**: Unhandled async database/fetch operation
- **Impact**: Network failure or DB error will trigger an unhandled promise rejection.

### 2. `src/app/api/college/attendance/route.ts:26`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 3. `src/app/api/college/attendance/route.ts:27`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 4. `src/app/api/college/attendance/route.ts:28`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 5. `src/app/api/college/classroom/route.ts:34`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 6. `src/app/api/college/classroom/route.ts:35`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 7. `src/app/api/college/classroom/route.ts:36`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 8. `src/app/api/college/classroom/route.ts:37`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 9. `src/app/api/college/fees/route.ts:19`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 10. `src/app/api/college/identity/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 11. `src/app/api/college/leave/route.ts:19`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 12. `src/app/api/college/leave/route.ts:20`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 13. `src/app/api/college/marks/route.ts:27`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 14. `src/app/api/college/marks/route.ts:28`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 15. `src/app/api/college/timetable/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 16. `src/app/api/college/timetable/route.ts:12`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 17. `src/app/api/college/timetable/route.ts:13`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 18. `src/app/api/college/transcripts/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 19. `src/app/api/institutional/handle-requests/route.ts:27`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 20. `src/app/api/institutional/handle-requests/route.ts:28`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 21. `src/app/api/recruiter/drives/route.ts:28`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 22. `src/app/api/recruiter/drives/route.ts:29`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 23. `src/app/api/user/applied-hackathons/route.ts:238`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 24. `src/app/coordinator/page.tsx:197`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params are Promises. Direct property access causes runtime failure.

### 25. `src/app/lib/passwordValidation.ts:17`
- **Issue**: Potential plaintext password comparison detected
- **Impact**: Passwords must be securely hashed and compared using constant-time cryptographic functions.

## 🛡️ 2. Beta (Secret & Credential Sentinel) Findings (2)

### 1. ⚠️ `.env:3`
- **Leak**: Hardcoded API key or private secret detected in source code
- **Risk**: CRITICAL - Secrets must reside strictly in server-only process.env or .env.mcp

### 2. ⚠️ `.env:7`
- **Leak**: Hardcoded API key or private secret detected in source code
- **Risk**: CRITICAL - Secrets must reside strictly in server-only process.env or .env.mcp

## 🎯 3. Gamma (Schema & Input Validation Sentinel) Findings (22)

### 1. `scripts/mob_audit.js:209`
- **Issue**: `dangerouslySetInnerHTML` usage detected
- **Impact**: Potential Cross-Site Scripting (XSS) vulnerability if content is not sanitized with DOMPurify.

### 2. `scripts/mob_audit.js:214`
- **Issue**: `dangerouslySetInnerHTML` usage detected
- **Impact**: Potential Cross-Site Scripting (XSS) vulnerability if content is not sanitized with DOMPurify.

### 3. `src/app/api/admin/invite-missing/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 4. `src/app/api/admin/login/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 5. `src/app/api/admin/recruiters/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 6. `src/app/api/admin/staff/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 7. `src/app/api/admin/structure/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 8. `src/app/api/ai/chat/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 9. `src/app/api/auth/delete-account/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 10. `src/app/api/college/leave/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 11. `src/app/api/coordinator/broadcasts/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 12. `src/app/api/coordinator/export/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 13. `src/app/api/coordinator/login/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 14. `src/app/api/coordinator/recommendations/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 15. `src/app/api/institutional/handle-ai-audit/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 16. `src/app/api/institutional/handle-requests/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 17. `src/app/api/notifications/send/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 18. `src/app/api/recruiter/export/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 19. `src/app/api/recruiter/login/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 20. `src/app/api/user/broadcasts/read/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 21. `src/app/api/user/notifications/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

### 22. `src/app/api/vanguardz/connect/route.ts:1`
- **Issue**: API Route Handler parses JSON body without runtime Zod schema validation
- **Impact**: Vulnerable to malformed payloads, type-confusion bugs, and unvalidated parameter injection.

## 🧪 5. Epsilon (Test, Deployment & Telemetry Sentinel) Notices (10)

### 1. `src/app/api/admin/identity/route.ts:1`
- **Notice**: API Route `src/app/api/admin/identity/route.ts` is missing dedicated automated test suite (src/__tests__/admin/identity.test.ts).

### 2. `src/app/api/college/attendance/route.ts:1`
- **Notice**: API Route `src/app/api/college/attendance/route.ts` is missing dedicated automated test suite (src/__tests__/college/attendance.test.ts).

### 3. `src/app/api/college/classroom/route.ts:1`
- **Notice**: API Route `src/app/api/college/classroom/route.ts` is missing dedicated automated test suite (src/__tests__/college/classroom.test.ts).

### 4. `src/app/api/college/fees/route.ts:1`
- **Notice**: API Route `src/app/api/college/fees/route.ts` is missing dedicated automated test suite (src/__tests__/college/fees.test.ts).

### 5. `src/app/api/college/identity/route.ts:1`
- **Notice**: API Route `src/app/api/college/identity/route.ts` is missing dedicated automated test suite (src/__tests__/college/identity.test.ts).

### 6. `src/app/api/college/leave/route.ts:1`
- **Notice**: API Route `src/app/api/college/leave/route.ts` is missing dedicated automated test suite (src/__tests__/college/leave.test.ts).

### 7. `src/app/api/college/marks/route.ts:1`
- **Notice**: API Route `src/app/api/college/marks/route.ts` is missing dedicated automated test suite (src/__tests__/college/marks.test.ts).

### 8. `src/app/api/college/timetable/route.ts:1`
- **Notice**: API Route `src/app/api/college/timetable/route.ts` is missing dedicated automated test suite (src/__tests__/college/timetable.test.ts).

### 9. `src/app/api/college/transcripts/route.ts:1`
- **Notice**: API Route `src/app/api/college/transcripts/route.ts` is missing dedicated automated test suite (src/__tests__/college/transcripts.test.ts).

### 10. `src/app/api/recruiter/drives/route.ts:1`
- **Notice**: API Route `src/app/api/recruiter/drives/route.ts` is missing dedicated automated test suite (src/__tests__/recruiter/drives.test.ts).

