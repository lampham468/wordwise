# Milestone 3 · Polish, Performance & Growth

> Transform the advanced assistant into a **production-grade, scalable platform** with top-tier UX, accessibility, and collaboration features.

---

## Scope
1. Realtime collaboration (multi-cursor) via Y.js + Liveblocks.
2. Mobile optimisations and PWA installability.
3. Comprehensive accessibility (WCAG AA audit pass).
4. Observability: logging, tracing, error monitoring.
5. Monetisation hooks (feature flags for premium).

---

## Deliverables
- Multi-cursor editing with avatars.
- Offline-capable PWA: service worker, caching.
- Axe-core CI passing, Lighthouse score ≥ 90.
- Highlight.io (or Sentry+Grafana) integrated.
- Stripe checkout stub (toggle advanced AI limits).

---

## Feature Breakdown & Action Steps

### 1 · Realtime Collaboration
1. Add Y.js provider, bind TipTap `collaboration` extension.
2. Use Liveblocks for presence & awareness.
3. Conflict resolution tests.
4. Cursor colour assigned via hash(name).
5. Toggle collab only for shared docs.

### 2 · Mobile & PWA
1. Responsive tune per `ui-rules.md` small breakpoints.
2. Add `meta` tags, manifest, icons.
3. Service worker via Vite PWA plugin.
4. Cache `spellWorker` and critical assets.
5. Push notification hook (deferred).

### 3 · Accessibility Polish
1. Run Axe-core audit; fix aria-label issues.
2. Add keyboard shortcuts list modal.
3. Ensure colour contrast tokens meet 4.5:1 in dark mode.
4. Screen-reader-friendly suggestion popovers.
5. Manual QA with NVDA & VoiceOver.

### 4 · Observability Stack
1. Integrate Highlight.io for session replay.
2. Add Sentry for error tracking.
3. Create Grafana dashboard querying Supabase logs.
4. Alert rules on 5xx Edge Function spikes.
5. Docs: runbook in `project-management/ops-guide.md`.

### 5 · Monetisation & Feature Flags
1. Add Stripe checkout page (test mode).
2. Supabase `plans` table & RLS.
3. Wrap heavy GPT-4o endpoint behind `isPremium` flag.
4. UI toggle to upgrade.
5. Admin UI to manage plans.

> After **Milestone 3** the application is production-ready, competitive with established assistants, and prepared for future feature experiments. 
