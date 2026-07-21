---
name: pre-flight-check
description: Automated verification runbook to check linting, TypeScript type-checking, and Next.js build status before completing code tasks.
---

# Pre-Flight Verification Skill

Run this verification process whenever completing feature additions or refactoring code in `eventtracker` to ensure zero compilation or lint errors.

## 1. Step 1: Run Linter
Execute the project linter:
```bash
npm run lint
```
If linting fails, inspect the flagged files and fix any ESLint warnings or errors.

## 2. Step 2: Run Production Build Validation
Execute the Next.js build check:
```bash
npm run build
```
Verify that:
- Server and client components compile without syntax or import errors.
- All TypeScript types validate successfully.
- Dynamic route pages and SSG/SSR pages generate without errors.

## 3. Step 3: Environment Check
Ensure `.env.local` contains all required keys (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) without exposing secrets.
