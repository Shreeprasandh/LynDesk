# 🚨 Whole-Project Audit Findings Report

**Last Run**: 6/9/2026, 9:34:32 am
**Files Scanned**: 243
**Logic Issues Found**: 47
**Type / Runtime Bugs Found**: 0
**Improvement Suggestions**: 83

---

## ⚡ Critical & High Logic Issues (47)

### 1. [HIGH LOGIC ISSUE] `scripts/council_engine.js:59`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 2. [HIGH LOGIC ISSUE] `src/app/admin/page.tsx:125`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 3. [HIGH LOGIC ISSUE] `src/app/admin/page.tsx:131`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 4. [HIGH LOGIC ISSUE] `src/app/admin/page.tsx:137`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 5. [HIGH LOGIC ISSUE] `src/app/admin/page.tsx:143`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 6. [HIGH LOGIC ISSUE] `src/app/api/ai/verify-certificate/route.ts:66`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 7. [CRITICAL LOGIC ISSUE] `src/app/api/college/attendance/route.ts:26`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 8. [CRITICAL LOGIC ISSUE] `src/app/api/college/attendance/route.ts:27`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 9. [CRITICAL LOGIC ISSUE] `src/app/api/college/attendance/route.ts:28`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 10. [CRITICAL LOGIC ISSUE] `src/app/api/college/classroom/route.ts:34`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 11. [CRITICAL LOGIC ISSUE] `src/app/api/college/classroom/route.ts:35`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 12. [CRITICAL LOGIC ISSUE] `src/app/api/college/classroom/route.ts:36`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 13. [CRITICAL LOGIC ISSUE] `src/app/api/college/classroom/route.ts:37`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 14. [CRITICAL LOGIC ISSUE] `src/app/api/college/fees/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 15. [CRITICAL LOGIC ISSUE] `src/app/api/college/leave/route.ts:19`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 16. [CRITICAL LOGIC ISSUE] `src/app/api/college/leave/route.ts:20`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 17. [CRITICAL LOGIC ISSUE] `src/app/api/college/marks/route.ts:27`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 18. [CRITICAL LOGIC ISSUE] `src/app/api/college/marks/route.ts:28`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 19. [CRITICAL LOGIC ISSUE] `src/app/api/college/timetable/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 20. [CRITICAL LOGIC ISSUE] `src/app/api/college/timetable/route.ts:12`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 21. [CRITICAL LOGIC ISSUE] `src/app/api/college/timetable/route.ts:13`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 22. [CRITICAL LOGIC ISSUE] `src/app/api/college/transcripts/route.ts:11`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 23. [HIGH LOGIC ISSUE] `src/app/api/study/grade-answer/route.ts:37`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 24. [CRITICAL LOGIC ISSUE] `src/app/api/user/applied-hackathons/route.ts:238`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 25. [HIGH LOGIC ISSUE] `src/app/auth/callback/page.tsx:23`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 26. [HIGH LOGIC ISSUE] `src/app/coding-deck/page.tsx:240`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 27. [HIGH LOGIC ISSUE] `src/app/coding-deck/page.tsx:244`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 28. [HIGH LOGIC ISSUE] `src/app/components/coding-desk/AppliedHackathonsModal.tsx:198`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 29. [HIGH LOGIC ISSUE] `src/app/components/Header.tsx:767`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 30. [HIGH LOGIC ISSUE] `src/app/components/Header.tsx:1103`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 31. [HIGH LOGIC ISSUE] `src/app/components/Header.tsx:1106`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 32. [HIGH LOGIC ISSUE] `src/app/components/PreferencePresetModal.tsx:107`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 33. [HIGH LOGIC ISSUE] `src/app/components/PreferencePresetModal.tsx:141`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 34. [CRITICAL LOGIC ISSUE] `src/app/coordinator/page.tsx:182`
- **Issue**: Un-awaited Next.js 15/16 route params/searchParams
- **Impact**: In Next.js 15+, route params & searchParams are Promises. Synchronous access causes runtime errors or undefined values.

### 35. [HIGH LOGIC ISSUE] `src/app/event-desk/page.tsx:1494`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 36. [HIGH LOGIC ISSUE] `src/app/explore/page.tsx:260`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 37. [HIGH LOGIC ISSUE] `src/app/explore/page.tsx:786`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 38. [HIGH LOGIC ISSUE] `src/app/explore/page.tsx:883`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 39. [HIGH LOGIC ISSUE] `src/app/explore/page.tsx:897`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 40. [HIGH LOGIC ISSUE] `src/app/lib/wallCalendarSync.ts:167`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 41. [HIGH LOGIC ISSUE] `src/app/study-desk/page.tsx:563`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 42. [HIGH LOGIC ISSUE] `src/app/study-desk/page.tsx:650`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 43. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:797`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 44. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:1229`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 45. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:2107`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 46. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:2176`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 47. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:2822`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

## 💡 Improvement Suggestions (User Approval Required) (83)

- **scripts/apply_college_desk_migration.js:26**: Remove leftover debug console.log statement.
- **scripts/apply_college_desk_migration.js:27**: Remove leftover debug console.log statement.
- **scripts/apply_college_desk_migration.js:38**: Remove leftover debug console.log statement.
- **scripts/apply_college_desk_migration.js:45**: Remove leftover debug console.log statement.
- **scripts/apply_college_desk_migration.js:47**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:385**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:386**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:387**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:406**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:412**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:421**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:427**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:428**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:429**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:430**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:431**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:432**: Remove leftover debug console.log statement.
- **scripts/council_engine.js:164**: Remove leftover debug console.log statement.
- **scripts/council_engine.js:173**: Remove leftover debug console.log statement.
- **scripts/council_engine.js:180**: Remove leftover debug console.log statement.
- **scripts/council_engine.js:244**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:8**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:9**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:10**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:35**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:97**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:142**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:143**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:144**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:145**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:146**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:147**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:148**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:151**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:152**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:154**: Remove leftover debug console.log statement.
- **scripts/full_project_audit.js:156**: Remove leftover debug console.log statement.
- **scripts/generate_favicon.js:41**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:33**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:39**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:43**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:45**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:47**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:49**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:70**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:292**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:456**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:457**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:458**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:459**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:460**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:461**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:462**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:463**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:464**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:465**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:466**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:468**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:469**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:470**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:8**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:19**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:23**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:24**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:78**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:97**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:106**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:114**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:121**: Remove leftover debug console.log statement.
- **seed_db.js:55**: Remove leftover debug console.log statement.
- **seed_db.js:71**: Remove leftover debug console.log statement.
- **seed_db.js:79**: Remove leftover debug console.log statement.
- **seed_db.js:91**: Remove leftover debug console.log statement.
- **seed_db.js:148**: Remove leftover debug console.log statement.
- **seed_db.js:153**: Remove leftover debug console.log statement.
- **seed_db.js:158**: Remove leftover debug console.log statement.
- **seed_db.js:162**: Remove leftover debug console.log statement.
- **seed_db.js:163**: Remove leftover debug console.log statement.
- **seed_db.js:164**: Remove leftover debug console.log statement.
- **seed_db.js:165**: Remove leftover debug console.log statement.
- **seed_db.js:169**: Remove leftover debug console.log statement.
- **seed_db.js:170**: Remove leftover debug console.log statement.
- **src/app/components/LynAI.tsx:174**: Check Hook dependency array for potential stale variables.

