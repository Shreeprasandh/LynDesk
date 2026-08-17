# 🚨 Whole-Project Audit Findings Report

**Last Run**: 17/8/2026, 8:06:55 pm
**Files Scanned**: 115
**Logic Issues Found**: 17
**Type / Runtime Bugs Found**: 0
**Improvement Suggestions**: 110

---

## ⚡ Critical & High Logic Issues (17)

### 1. [HIGH LOGIC ISSUE] `src/app/api/ai/chat/route.ts:297`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 2. [HIGH LOGIC ISSUE] `src/app/api/ai/verify-certificate/route.ts:43`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 3. [HIGH LOGIC ISSUE] `src/app/api/study/grade-answer/route.ts:37`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 4. [HIGH LOGIC ISSUE] `src/app/components/coding-desk/AppliedHackathonsModal.tsx:189`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 5. [HIGH LOGIC ISSUE] `src/app/components/Header.tsx:767`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 6. [HIGH LOGIC ISSUE] `src/app/components/Header.tsx:770`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 7. [HIGH LOGIC ISSUE] `src/app/components/PreferencePresetModal.tsx:107`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 8. [HIGH LOGIC ISSUE] `src/app/components/PreferencePresetModal.tsx:141`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 9. [HIGH LOGIC ISSUE] `src/app/event-desk/page.tsx:1483`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 10. [HIGH LOGIC ISSUE] `src/app/study-desk/page.tsx:521`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 11. [HIGH LOGIC ISSUE] `src/app/study-desk/page.tsx:608`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 12. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:729`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 13. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:1147`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 14. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:1437`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 15. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:2030`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 16. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:2107`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

### 17. [HIGH LOGIC ISSUE] `src/app/workspace/[id]/page.tsx:2789`
- **Issue**: Unhandled async database/fetch execution
- **Impact**: Network or query failures will throw unhandled promise rejections.

## 💡 Improvement Suggestions (User Approval Required) (110)

- **scripts/apply_presence_migration.js:34**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:51**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:53**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:56**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:63**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:65**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:70**: Remove leftover debug console.log statement.
- **scripts/apply_presence_migration.js:72**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:34**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:35**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:36**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:45**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:52**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:54**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:58**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:61**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:62**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:63**: Remove leftover debug console.log statement.
- **scripts/apply_sql_migration.js:64**: Remove leftover debug console.log statement.
- **scripts/apply_wall_calendar_migration.js:34**: Remove leftover debug console.log statement.
- **scripts/apply_wall_calendar_migration.js:60**: Remove leftover debug console.log statement.
- **scripts/apply_wall_calendar_migration.js:62**: Remove leftover debug console.log statement.
- **scripts/apply_wall_calendar_migration.js:65**: Remove leftover debug console.log statement.
- **scripts/apply_wall_calendar_migration.js:72**: Remove leftover debug console.log statement.
- **scripts/apply_wall_calendar_migration.js:74**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:149**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:150**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:151**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:165**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:171**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:180**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:186**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:187**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:188**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:189**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:190**: Remove leftover debug console.log statement.
- **scripts/audit_all_db_columns.js:191**: Remove leftover debug console.log statement.
- **scripts/check_and_update_schema.js:34**: Remove leftover debug console.log statement.
- **scripts/check_and_update_schema.js:60**: Remove leftover debug console.log statement.
- **scripts/check_and_update_schema.js:62**: Remove leftover debug console.log statement.
- **scripts/check_and_update_schema.js:65**: Remove leftover debug console.log statement.
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
- **scripts/mob_audit.js:19**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:25**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:29**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:31**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:33**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:35**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:56**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:186**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:329**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:330**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:331**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:332**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:333**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:334**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:335**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:336**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:337**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:338**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:339**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:341**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:342**: Remove leftover debug console.log statement.
- **scripts/mob_audit.js:343**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:8**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:19**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:23**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:24**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:78**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:97**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:106**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:114**: Remove leftover debug console.log statement.
- **scripts/pre_commit_audit.js:121**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:27**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:33**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:40**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:42**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:45**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:52**: Remove leftover debug console.log statement.
- **scripts/test_failing_queries.js:54**: Remove leftover debug console.log statement.
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
- **src/app/components/LynAI.tsx:87**: Check Hook dependency array for potential stale variables.

