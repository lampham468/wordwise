# Project Technology Stack

> This file captures the **final, agreed-upon technology choices** for Phase 1 of the writing-assistant web app.  It will serve as the single source of truth for tooling, versions, and high-level rationale.

---

## Frontend

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| UI Library | **React** | 19.1.0 | Latest stable release with improved performance and features. |
| Language | **TypeScript** | 5.8.3 | Latest stable features with enhanced type checking. |
| Build Tool | **Vite** | 6.3.5 | Fast HMR; use `@vitejs/plugin-react` 4.4.1. |
| Styling | **Tailwind CSS** | 4.1.10 | Latest stable v4 release with CSS-first configuration and enhanced performance. |
| State Mgmt | **Zustand** | 5.0.5 | Latest version with improved TypeScript support. |
| Rich-Text Editor | **TipTap** | 2.14.1 | Core + `@tiptap/react`; extensible ProseMirror base. |
| Spell & Grammar (Phase 1) | **nspell + write-good** | nspell 2.1.5<br/>dictionary-en-us 2.2.1<br/>write-good 1.0.8 | Runs 100% in-browser (Web Worker) with ≤200 ms latency. |

### Future (Phase 2)
* Layer nspell with OpenAI-powered style checks for deeper suggestions.

## Best Practices, Limitations & Common Pitfalls

### Frontend

**React 19**
- Prefer function components + hooks; avoid class components for consistency with modern patterns.
- Wrap expensive sub-trees with `React.memo` and leverage `useMemo`/`useCallback` to minimise re-renders.
- Always include at least one error boundary at the app-shell level; add feature-level boundaries around TipTap to catch editor crashes.
- Use **code-splitting** (`lazy` + `Suspense`) for large pages and the TipTap editor tool-bar to keep first paint under 200 kB.
- Don't mutate props—immer or deep-clone patterns belong in store logic, not UI.

**TypeScript 5.8**
- Enable `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` in `tsconfig.json`.
- Aliases via `paths` should mirror physical folders (`@/components/*` → `app/src/components/*`).
- Prefer **type utilities** (`ReturnType`, `Parameters`) over duplicating API DTOs.
- Common pitfall: forgetting to export an enum/map from `src/types` creates circular imports—keep types in leaf folders.

**Vite 6**
- All environment variables must be prefixed with `VITE_`; otherwise they won't be injected.
- Use `defineConfig({ server: { open: true, fs: { strict: true }}})` to avoid accidental FS leaks.
- Common pitfall: large vendor chunks—add `build.rollupOptions.output.manualChunks` to split TipTap + Monaco (if added) into async chunks.

**Tailwind CSS 3.4**
- Keep the **token-based colour palette** in a central `theme` object; never hard-code brand colours inside components.
- Purge/`content` paths must include the TipTap menu if it injects HTML strings.
- Use the `@apply` directive in component-level `.css`/`.scss` only for frequently reused utility clusters; over-using `@apply` negates Tailwind's purpose.
- Pitfall: **arbitrary values** (`bg-[#123456]`) can bloat CSS if not hashed; prefer custom tokens.

**Zustand 5**
- Organize store **slices** (`createUserSlice`, `createDocSlice`) to keep state modular.
- Always read data via **selectors** to avoid re-render storms: `const doc = useDocs(s => s.docs[id])`.
- Use middleware: `persist` for local-storage drafts, `subscribeWithSelector` for analytics.
- Pitfall: Storing non-serializable objects (e.g., TipTap `Editor` instance) in Zustand—keep heavy refs in React context instead.

**TipTap 2.14**
- Initialise the editor inside `useMemo` and **destroy** it in `useEffect` cleanup to prevent memory leaks during hot reloads.
- Keep extensions modular; create `/extensions` folder and re-export a typed array for the starter-kit.
- Sanitize any HTML imported into the editor (`DOMPurify`) to avoid XSS.
- Pitfall: Sending entire TipTap JSON via Zustand each keystroke; debounce or throttle persisted updates.

**nspell + write-good**
- Load dictionary asynchronously and run checks inside a **Web Worker** to keep the UI thread free.
- Use incremental diffing: only re-spell-check the changed sentence, not the entire document.
- Cache compiled `Spelling` instance; re-instantiating on every message adds 100 ms overhead.
- Limitation: no deep grammar (subject–verb agreement). Communicate this to users via docs until Phase 2.

---

## Backend & Services

| Concern | Choice | Version / Plan | Notes |
|---------|--------|----------------|-------|
| Database | **Supabase Postgres** | 16.x | Managed Postgres + Row-Level Security. |
| Auth | **Supabase Auth** | Built-in | Email/password + social providers. |
| Serverless | **Supabase Edge Functions** | Deno 1.x | Lives in `/supabase/functions`. |
| LLM | **OpenAI API** | openai 4.31.0 SDK | GPT-3.5-turbo (light) & GPT-4o (heavy). |

**Supabase Postgres**
- Enforce **Row-Level Security** from day 0; write policies that reference `auth.uid()`.
- Use the **Migrations API** (`supabase migration new`) and keep SQL scripts in `/supabase/migrations`—never modify schema via Dashboard without dumping the diff.
- Name indexes explicitly (`idx_docs_userId_createdAt`) to simplify query plans.
- Pitfall: forgetting `on delete cascade` on document references will leave orphans when users delete accounts.

**Supabase Auth**
- Store the access token only in `HttpOnly` cookies via Vercel Edge Middleware; avoid `localStorage` to mitigate XSS.
- Refresh session with `supabase.auth.onAuthStateChange` and rotate JWT every 55 minutes (default expiry is 60 minutes).
- Common pitfall: mixing **service-role keys** in client code—restrict them to Edge Functions.

**Supabase Edge Functions (Deno)**
- Keep each function < 1 MB bundle to avoid cold-start penalties.
- Use `Context.waitUntil()` for non-blocking analytics calls.
- Pitfall: Deno's `fetch` is **HTTP/1.1**; for HTTP/2 features (OpenAI streaming) you'll need the polyfill or edge-runtime upgrade.

**OpenAI API**
- Centralise OpenAI calls in an Edge Function proxy to avoid leaking keys to client.
- Use streaming (`{ stream: true }`) for large completions to improve perceived latency.
- Implement exponential backoff on `429` (rate-limit) and `502` errors; recommended retry delay = `(2^n) * 100 ms`.
- Pitfall: token inflation—calculate prompt + completion tokens with `tiktoken` and cap at 4 k tokens to stay within GPT-4o budget.

---

## Deployment

| Concern | Choice | Version | Notes |
|---------|--------|---------|-------|
| Hosting & CI/CD | **Vercel** | CLI 30.2.2 | Manual deploy via GitHub integration; preview URLs out-of-the-box. |

---

## Dev & Build Tooling

* **PostCSS** 8.5.6 & **Autoprefixer** 10.4.21 – required by Tailwind CSS.
* **ESLint** 9.29.0 & **eslint-plugin-react** 7.37.5 – baseline linting.
* **Prettier** 3.5.3 – code formatting.
* **Vitest** 3.2.4 & **@vitest/ui** 3.2.4 – testing framework.
* **Supabase CLI** 1.129.x – local DB & Edge Function emulation.

---

## Repository Layout (current)

```
/ app            → Vite + React frontend
|__ /src         → Application code
|__ tailwind.config.ts

/ supabase       → SQL migrations, Edge Functions
|__ /functions   → Deno function files
```

---

## Change-management

1. **Any version upgrade** must be reflected here and communicated in PR description.
2. **Experimental tools** (beta/RC) require explicit approval before adoption. 

## Reference Links
- React docs: https://react.dev/learn
- TipTap guides: https://tiptap.dev/guide
- Tailwind CSS docs: https://tailwindcss.com/docs
- Supabase RLS: https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security
- OpenAI best practices: https://platform.openai.com/docs/guides
