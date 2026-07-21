# 🚨 Whole-Project Audit Findings Report

**Last Run**: 21/7/2026, 11:45:24 pm
**Files Scanned**: 39
**Logic Issues Found**: 21
**Type / Runtime Bugs Found**: 0
**Improvement Suggestions**: 41

---

## ⚡ Critical & High Logic Issues (21)

### 1. [HIGH LOGIC ISSUE] `seed_db.js:74`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 2. [CRITICAL LOGIC ISSUE] `src/app/api/coding-stats/route.ts:9`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 3. [CRITICAL LOGIC ISSUE] `src/app/api/coding-stats/route.ts:10`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 4. [CRITICAL LOGIC ISSUE] `src/app/api/coding-stats/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 5. [HIGH LOGIC ISSUE] `src/app/api/coding-stats/route.ts:209`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 6. [HIGH LOGIC ISSUE] `src/app/api/coding-stats/route.ts:241`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 7. [HIGH LOGIC ISSUE] `src/app/api/coding-stats/route.ts:346`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 8. [HIGH LOGIC ISSUE] `src/app/api/coding-stats/route.ts:412`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 9. [HIGH LOGIC ISSUE] `src/app/context/AuthContext.tsx:65`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 10. [CRITICAL LOGIC ISSUE] `src/app/coordinator/page.tsx:120`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 11. [HIGH LOGIC ISSUE] `src/app/page.tsx:493`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 12. [HIGH LOGIC ISSUE] `src/app/page.tsx:528`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 13. [HIGH LOGIC ISSUE] `src/app/profile/page.tsx:347`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 14. [HIGH LOGIC ISSUE] `src/app/profile/page.tsx:458`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 15. [HIGH LOGIC ISSUE] `src/app/profile/page.tsx:529`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 16. [CRITICAL LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:277`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 17. [CRITICAL LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:278`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 18. [CRITICAL LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:356`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 19. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:374`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 20. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:1143`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 21. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:1248`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

## 💡 Improvement Suggestions (User Approval Required) (41)

- **scripts/full_project_audit.js:7**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:8**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:9**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:34**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:96**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:141**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:142**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:143**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:144**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:145**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:146**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:147**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:150**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:151**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:153**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:155**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:7**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:18**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:22**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:23**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:77**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:96**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:105**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:113**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:120**: Remove leftover debug console.log statement.
- **seed_db.js:55**: Remove leftover debug console.log statement.
- **seed_db.js:72**: Remove leftover debug console.log statement.
- **seed_db.js:76**: Remove leftover debug console.log statement.
- **seed_db.js:88**: Remove leftover debug console.log statement.
- **seed_db.js:144**: Remove leftover debug console.log statement.
- **seed_db.js:149**: Remove leftover debug console.log statement.
- **seed_db.js:154**: Remove leftover debug console.log statement.
- **seed_db.js:158**: Remove leftover debug console.log statement.
- **seed_db.js:159**: Remove leftover debug console.log statement.
- **seed_db.js:160**: Remove leftover debug console.log statement.
- **seed_db.js:161**: Remove leftover debug console.log statement.
- **seed_db.js:165**: Remove leftover debug console.log statement.
- **seed_db.js:166**: Remove leftover debug console.log statement.
- **src/app/api/auth/delete-account/route.ts:83**: Remove leftover debug console.log statement.
- **src/app/api/auth/delete-account/route.ts:113**: Remove leftover debug console.log statement.
- **src/app/components/LynAI.tsx:60**: Check Hook dependency array for potential stale variables.

