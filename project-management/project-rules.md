# Project Rules & Conventions

> **Purpose** — Define the directory layout, naming patterns, documentation standards, and general conventions that keep this AI-first codebase maintainable and "tool-ready."  All contributors must adhere to these rules unless a PR explicitly proposes an amendment.

---

## 1 · Directory Structure

```
root
├─ app/                     # Vite + React front-end
│  ├─ src/
│  │  ├─ components/        # Presentational UI components with colocated tests
│  │  │   ├─ Button.tsx
│  │  │   └─ Button.spec.tsx
│  │  ├─ features/          # Feature folders (editor, auth, docs)
│  │  │   └─ editor/
│  │  │       ├─ Editor.tsx
│  │  │       ├─ Editor.spec.tsx
│  │  │       ├─ hooks/
│  │  │       └─ api/
│  │  ├─ hooks/             # Reusable generic hooks (e.g., useDebounce)
│  │  ├─ stores/            # Zustand slices, each in its own file
│  │  ├─ utils/             # Pure helper functions (no React)
│  │  ├─ types/             # Global TS types & interfaces
│  │  ├─ styles/            # Tailwind config extensions & CSS modules
│  │  ├─ test/              # Test utilities and setup
│  │  └─ main.tsx           # App entry (Vite convention)
│  ├─ public/               # Static assets served as-is
│  └─ tailwind.config.ts    # Theme tokens (see theme-rules.md)
│
├─ supabase/                # Backend infrastructure
│  ├─ migrations/           # SQL migration scripts (timestamp-prefixed)
│  └─ functions/            # Edge Functions (one folder per function)
│      └─ suggest-rewrite/
│          └─ index.ts
│
├─ tests/                   # End-to-end tests (separate from unit tests)
│  └─ e2e/                  # Playwright spec files for integration testing
│
├─ project-management/      # Docs (this folder)
│  └─ *.md                  # Overview, flows, rules
│
├─ .github/                 # GitHub workflows, issue/PR templates
└─ package.json             # NPM workspace configuration
```

### Folder Guidelines
1. **Feature-first** at `src/features/*` — each feature owns its child components, hooks, and api files to keep boundaries clear.
2. **Absolute Imports** via TS path alias: `@/features/editor/Editor`.
3. **Hybrid Testing** — Unit tests colocated with components (`*.spec.tsx`), E2E tests in dedicated `/tests/e2e/` directory.
4. **Edge Functions** live under `supabase/functions/<name>/index.ts` to avoid bundle-size collisions.

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

> These rules balance developer velocity with long-term maintainability.  Revisit quarterly or when new tech-stack updates warrant adjustments. 
