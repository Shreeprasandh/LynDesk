<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture & Guidelines (eventtracker)

## 1. Next.js 16 & React 19 Architecture
- **Server Components by Default**: Default to React Server Components (RSC). Add `'use client'` only when using React hooks (`useState`, `useEffect`, `useRef`, etc.) or interactive DOM events.
- **Async Route Params & SearchParams**: In Next.js 15+, `params` and `searchParams` in Page/Layout props are Promises. Always `await` them before reading properties (e.g. `const { id } = await params`).
- **Environment Variables**: Access server secrets only in Server Components / API routes using `process.env.SECRET_NAME`. Expose variables to client components ONLY with `NEXT_PUBLIC_` prefix.

## 2. Supabase Integration Rules
- **Browser Client**: Create browser Supabase clients using `@supabase/supabase-js` with `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Server / Admin Client**: For administrative operations (e.g. seed scripts, route handlers), use `SUPABASE_SERVICE_ROLE_KEY` on the server only. Never leak service keys to client bundles.
- **Row Level Security (RLS)**: Ensure database policies exist when creating new tables or writing migrations.

## 3. Styling & UI Conventions
- **Tailwind CSS v4**: Follow Tailwind v4 syntax. Use utility classes and Lucide React icons (`lucide-react`).
- **Animations**: Use `framer-motion` for fluid micro-animations.

## 4. Code Quality & Safety
- **Type Safety**: Ensure strict TypeScript compliance (`tsconfig.json`). Avoid explicit `any`.
- **Validation**: Run `npm run lint` and `npm run build` after implementing feature changes.

