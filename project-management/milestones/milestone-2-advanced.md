# Milestone 2 · Advanced Suggestions & Context Awareness

> Elevate the assistant from rule-based hints to **AI-powered, context-aware guidance**.  Introduces lightweight and heavyweight OpenAI models, and document referencing as context.

---

## Scope
1. OpenAI integration for "Improve Sentence" and full-doc suggestions.
2. Context system: reference other docs via `@DocName` syntax.
3. Suggestions panel with accept/replace UX.
4. Streaming completions for perceived speed.
5. Basic cost monitoring.

---

## Deliverables
- Supabase Edge Function `suggest-rewrite` proxying OpenAI.
- Env vars & rate-limit logic (per user, 30 req/min).
- TipTap extension to mark context references as pills.
- Suggestions panel slide-over (desktop) / bottom-sheet (tablet).
- Usage dashboard (admin-only).

---

## Feature Breakdown & Action Steps

### 1 · OpenAI Proxy Function
1. Create `/functions/suggest-rewrite/index.ts`.
2. Pull user doc + referenced docs via Supabase.
3. Construct prompt; include style guide.
4. Call GPT-3.5-turbo (light) or GPT-4o (heavy) based on endpoint.
5. Stream chunks back via SSE.

### 2 · Context Reference System
1. TipTap autocomplete: detect `@` then fuzzy search docs.
2. Insert pill node storing `docId`.
3. Persist reference array in `documents.context` JSONB.
4. Edge Function merges referenced text into prompt.
5. Highlight pill on hover to show preview.

### 3 · Suggestion Panel
1. Add right-side drawer (`Dialog` component).
2. Display streaming suggestion; update as chunks arrive.
3. Buttons: Replace Selection, Insert Below, Dismiss.
4. Keyboard short-cuts: `Cmd+Enter` accept.
5. Unit tests: panel opens/closes, actions mutate editor state.

### 4 · Streaming UX Enhancements
1. Show ghost text in lighter gray while streaming.
2. Abort controller on Esc.
3. Spinner inline at caret.
4. Handle rate-limit errors with toast.
5. Log latency metrics to Supabase `metrics`.

### 5 · Cost & Usage Dashboard
1. Table `usage(user_id, tokens, cost, created_at)`.
2. Log each OpenAI call cost estimate.
3. Admin page `/admin/usage` with chart.js.
4. Alert when monthly cost > threshold.
5. Cypress e2e: admin views chart.

> Completion of **Milestone 2** positions the product ahead of basic grammar tools, offering contextual intelligence. 
