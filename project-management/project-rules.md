# Project Rules & Conventions

> **Purpose** — Define the directory layout, naming patterns, documentation standards, and general conventions that keep this AI-first codebase maintainable and "tool-ready."  All contributors must adhere to these rules unless a PR explicitly proposes an amendment.

---

## 1 · Directory Structure

```
root
├─ app/                     # Vite + React front-end
│  ├─ src/
│  │  ├─ features/          # Feature folders with modular components
│  │  │   ├─ auth/          # Authentication feature
│  │  │   │   ├─ hooks/
│  │  │   │   └─ ...
│  │  │   ├─ documents/     # Document management feature
│  │  │   │   ├─ components/    # Document-specific components
│  │  │   │   ├─ hooks/
│  │  │   │   ├─ services/
│  │  │   │   ├─ stores/
│  │  │   │   └─ ...
│  │  │   ├─ editor/        # Rich text editor feature
│  │  │   │   ├─ components/    # Editor-specific components
│  │  │   │   ├─ extensions/
│  │  │   │   ├─ hooks/
│  │  │   │   ├─ services/
│  │  │   │   ├─ stores/
│  │  │   │   └─ ...
│  │  │   ├─ suggestions/   # AI suggestions feature
│  │  │   │   ├─ components/
│  │  │   │   ├─ hooks/
│  │  │   │   ├─ services/
│  │  │   │   ├─ stores/
│  │  │   │   └─ ...
│  │  │   └─ marketing/     # Landing page feature
│  │  │       └─ ...
│  │  ├─ shared/            # Shared/reusable components
│  │  │   ├─ components/
│  │  │   │   └─ layout/
│  │  │   └─ hooks/         # Generic hooks (e.g., useDebounce)
│  │  ├─ lib/              # External library configurations
│  │  ├─ utils/            # Pure helper functions (no React)
│  │  ├─ types/            # Global TS types & interfaces
│  │  ├─ styles/           # Tailwind config extensions & CSS modules
│  │  ├─ workers/          # Web Workers (spell check, etc.)
│  │  ├─ test/             # Test utilities and setup
│  │  └─ main.tsx          # App entry (Vite convention)
│  ├─ public/              # Static assets served as-is
│  └─ tailwind.config.ts   # Theme tokens (see theme-rules.md)
│
├─ supabase/               # Backend infrastructure
│  ├─ migrations/          # SQL migration scripts (timestamp-prefixed)
│  └─ functions/           # Edge Functions (one folder per function)
│      └─ suggest-rewrite/
│          └─ index.ts
│
├─ tests/                  # End-to-end tests (separate from unit tests)
│  └─ e2e/                 # Playwright spec files for integration testing
│
├─ project-management/     # Docs (this folder)
│  └─ *.md                 # Overview, flows, rules
│
├─ .github/                # GitHub workflows, issue/PR templates
└─ package.json            # NPM workspace configuration
```

### Folder Guidelines
1. **Feature-first** at `src/features/*` — each feature owns its child components, hooks, services, stores, and api files to keep boundaries clear.
2. **Modular Components** — each feature has a `components/` directory for feature-specific UI components with proper separation of concerns.
3. **Absolute Imports** via TS path alias: `@/features/editor/Editor`, `@/shared/components/layout/AppLayout`.
4. **Hybrid Testing** — Unit tests colocated with components (`*.spec.tsx`), E2E tests in dedicated `/tests/e2e/` directory.
5. **Edge Functions** live under `supabase/functions/<name>/index.ts` to avoid bundle-size collisions.
6. **Shared Resources** — reusable components, hooks, and utilities in `shared/` for cross-feature use.

---

## 2 · File Naming Conventions

| Context | Pattern | Example |
|---------|---------|---------|
| React components | `PascalCase.tsx` | `DocumentSidebar.tsx` |
| Hooks | `useKebabCase.ts` | `useSpellCheck.ts` |
| Pure util / helper | `kebab-case.ts` | `string-slugify.ts` |
| Zustand slices | `<domain>.slice.ts` | `editor.slice.ts` |
| Edge Function | `index.ts` in folder | `functions/suggest-rewrite/index.ts` |
| CSS / SCSS | `kebab-case.module.css` | `editor-toolbar.module.css` |
| Test files | `*.spec.ts[x]` | `editor.spec.ts` |

*Avoid hungarian notation or numeric suffixes (`Component2`).  If a file grows unwieldy, split it.*

---

## 3 · Documentation & Comments

1. **Header Block** — every source file starts with a JSDoc/TSDoc banner:
   ```ts
   /**
    * Editor.tsx – Rich-text editor wrapper around TipTap.
    * Renders the main writing surface and wires spell-check worker.
    */
   ```
2. **Function Docs** — exportable functions & hooks require JSDoc with parameters & return types.
3. **Edge Functions** include `@supabase` tags describing route, method, auth guard.
4. Inline comments are acceptable for non-obvious logic, but keep them concise.

---

## 4 · File Size & Modularity

- Hard limit: **500 lines** excluding license/header.
- One React component per file (except tiny sub-components ≤ 20 lines).
- Pure logic lives in `utils/` or `features/*/api` — never embed fetch logic inside components.
- Duplicate code? Extract to shared util before copy-pasting.

---

## 5 · Import Ordering

1. Node built-ins (`fs`, `path`)
2. External packages (`react`, `@supabase/*`)
3. Absolute imports from `@/…`
4. Relative siblings (`./utils`)
5. Styles (`./*.css`)

Use ESLint plugin **import/order** with the above groups.

---

## 6 · Testing & CI

- **Vitest** for unit tests (colocated `*.spec.tsx` files).
- **Playwright** for e2e flows (`tests/e2e/`).
- All new components need ≥80% line coverage.
- PR must pass: type-check → lint → test → build.
- Test utilities and setup live in `app/src/test/`.

---

## 7 · Git & Branching

- `main` is always deployable.
- Feature branches: `feat/<scope>`; fixes: `fix/<scope>`.
- Use conventional commits for auto-changelog.
- NPM workspace setup enables running commands with `npm run <script> --workspace=app`.

---

## 8 · Environment Variables

- All front-end vars prefixed with `VITE_`.
- Store secrets only in Vercel / Supabase dashboard; never commit `.env.local`.

---

## 9 · Accessibility & Linting

- Enforced via **eslint-plugin-jsx-a11y** & automated Lighthouse CI.
- No failing a11y rules allowed on PR merge.

---

## 10 · Data Models & Migrations

1. **Single Source of Truth** — The file `project-management/data-models.md` **is** the canonical specification for all database tables, columns, and policies in Phase 1.  Any migration affecting the schema **must** be reflected in that markdown file in the same PR.
2. **Migration Ordering** — Timestamp-prefixed SQL files under `supabase/migrations/` remain the executable history.  Keep them atomic and reversible when possible.
3. **RLS Policies** — If you add or modify a table, include Row-Level Security in both the migration *and* the markdown spec.
4. **Supabase Type Generation** — After schema changes run `npx supabase gen types typescript --linked` so the front-end gets updated types.

---

> These rules balance developer velocity with long-term maintainability.  Revisit quarterly or when new tech-stack updates warrant adjustments. 
