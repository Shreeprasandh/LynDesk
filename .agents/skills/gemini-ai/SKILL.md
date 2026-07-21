---
name: gemini-ai
description: Guidelines and runbook for integrating Google Generative AI (@google/generative-ai) into Next.js 16 server route handlers and Server Actions.
---

# Google Generative AI Integration Skill

This skill provides best practices and code patterns for using `@google/generative-ai` in `eventtracker`.

## 1. Server-Side Execution Only
- Always instantiate `GoogleGenerativeAI` in Server Components, Route Handlers (`app/api/.../route.ts`), or Server Actions (`'use server'`).
- Access the API key exclusively via `process.env.GEMINI_API_KEY`. Never prefix with `NEXT_PUBLIC_` or leak to client bundles.

## 2. Standard Model Pattern
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
```

## 3. Streaming Responses
For real-time UI updates in React 19, prefer `generateContentStream`:
```typescript
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  // Stream to client or process
}
```

## 4. Error Handling & Fallbacks
- Wrap all model calls in `try...catch` blocks.
- Provide user-friendly fallback messaging in case of quota limits or network issues.
