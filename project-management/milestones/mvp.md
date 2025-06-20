# Milestone 1 · MVP – Core Writing Assistant  _(formerly Phase 1)_

> Deliver the **first usable version** that lets a user sign up, create documents, write with real-time spelling and grammar hints, and have their work auto-saved.  This aligns with "Phase 1 (MVP)" in `user-flow.md`.

---

## Scope
1. Authentication (email + password).
2. Document CRUD with auto-naming and sidebar list.
3. TipTap-based editor with nspell + write-good in Web Worker.
4. Autosave every 30 s / 3 s idle.
5. Basic readability metrics (word + char count).

---

## Deliverables
- Responsive layout following `ui-rules.md`.
- Auth flow routed (`/login`, `/signup`, protected `/app`).
- Supabase `documents` table + RLS policies.
- `spellWorker.ts` bundled and messaging to editor.
- CI green; preview deployed to Vercel.

---

## Feature Breakdown & Action Steps

### 1 · User Authentication
1. Implement Supabase auth provider in `useAuth.ts` hook.
2. Build `AuthForm` component (email/psw).
3. Set up route guard `RequireAuth`.
4. Handle password reset email flow.
5. Add logout button in sidebar.

### 2 · Document Management
1. SQL migration: `documents(id, owner, title, content, updated_at)`.
2. Implement RLS: owner can `select`, `update`, `delete` own rows.
3. `useDocs` Zustand slice: `docs`, `createDoc`, `updateDoc`.
4. Sidebar component with search + new button.
5. Delete & rename via context menu.

### 3 · Editor + Spell Check
1. Add TipTap starter-kit; set placeholder.
2. Spawn `spellWorker` on mount.
3. On `update` event throttle 500 ms → send changed text to worker.
4. Render underlines via TipTap decorations.
5. Popover list of suggestions with accept/ignore.

### 4 · Autosave & Persistence
1. In `useDocs` slice, debounce `updateDoc` 3 s idle.
2. Show "Saving…/Saved" status by doc title.
3. Implement offline draft in `localStorage` fallback.
4. Restore on reconnect.
5. Unit tests for debounce logic.

### 5 · Readability Indicator
1. Compute word/char count in editor callback.
2. Display in toolbar.
3. Add Flesch-Kincaid grade via `readability-score` lib.
4. Colour code (gray/green/yellow/red).
5. Cypress test to assert counts.

> Users can now compose and store texts with live feedback—ready for small closed-beta. This completes **Milestone 1**. 
