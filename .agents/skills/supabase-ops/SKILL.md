---
name: supabase-ops
description: Operations runbook for running Supabase database migrations, checking schema, and executing seed scripts in eventtracker.
---

# Supabase Operations Runbook

This skill outlines procedures for database migrations, schema inspection, and seed data execution for `eventtracker`.

## 1. Migration Execution
When applying schema changes in `supabase_migration.sql`:
- Verify all table creation SQL includes Row Level Security (RLS) policies.
- Ensure primary keys, foreign keys, and indexes are defined.

## 2. Seed Data Execution
To populate test data using the node seed script:
```bash
node seed_db.js
```
Verify `seed_logins.txt` and `seed_data.sql` are referenced accurately.

## 3. Client Initialization Rules
- **Client Side Components**:
  Use `@supabase/supabase-js` initialized with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Server Side & Node Scripts**:
  Use `SUPABASE_SERVICE_ROLE_KEY` inside server route handlers or scripts. Never expose service keys to client bundles or `NEXT_PUBLIC_` prefixed environment variables.
