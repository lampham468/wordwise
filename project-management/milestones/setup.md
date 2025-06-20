# Milestone 0 · Project Setup

> Establish the skeleton of the application so that **`npm run dev` starts a page**, Supabase is initialised, and CI passes.  The result is not user-facing, but provides a solid foundation for iterative work.

---

## Scope
1. Repository bootstrapped with required directories (see `project-rules.md`).
2. Toolchain configured (Vite, React, TS, Tailwind 4, ESLint, Prettier).
3. Supabase project created **remotely** (hosted instance); CLI used only for migrations—not for local Docker.
4. CI workflow running type-check, lint, and unit tests on every PR.
5. “Hello, Writer” page rendering from the app server.

---

## Deliverables
- `app/` folder with Vite starter, global Tailwind styles, `<AppShell />` layout.
- `supabase/` folder with empty migration and _ping_ Edge Function.
- GitHub Actions workflow `ci.yml` passing.
- Vercel project connected in manual deploy mode; staging URL shows placeholder page.

---

## Feature Breakdown & Action Steps

### 1 · Codebase Bootstrap
1. Initialise `pnpm workspace` + root `package.json`.
2. Run `npm create vite@latest app -- --template react-ts`.
3. Install Tailwind 4, ESLint, Prettier, Husky pre-commit.
4. Create `tsconfig.paths.json`; add `@/*` alias.
5. Set up Git repository and GitHub integration.

### 2 · Git & GitHub Setup
1. Initialize git repository: `git init`.
2. Create comprehensive `.gitignore` (exclude `node_modules/`, `dist/`, `.env*`, `.cursor/`).
3. Remove duplicate `.gitignore` files from subdirectories.
4. Create GitHub repository "wordwise" (public).
5. Add remote origin and push initial commit.
6. Verify repository structure and files are properly tracked.

### 3 · Supabase Init (Remote)
1. Run `supabase init --db-url $SUPABASE_DB_URL` to scaffold `supabase/` **without** starting Docker.
2. Store `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env` (never committed).
3. Generate initial migration: `supabase migration new init_schema` → empty SQL.
4. Push migration to remote: `supabase db push`.
5. Add Edge Function stub `functions/ping/index.ts` → returns `{ ok: true }`.

### 4 · CI / Quality Gates
1. Create `.github/workflows/ci.yml` with jobs: install → lint → type-check → unit test.
2. Add `eslint --max-warnings=0`.
3. Add `vitest` with example test.
4. Enable branch protection on `main`.
5. Push and verify green check-marks.

### 5 · Vercel Staging
1. Connect repo to Vercel (manual deploy).
2. Add project secrets place-holders (`SUPABASE_URL`, `SUPABASE_KEY`).
3. Set `build` to `vite build`.
4. Verify deployment of “Hello, Writer”.
5. Share URL with team.

> Completion of Milestone 0 means every contributor can `git clone`, `npm install`, configure remote Supabase keys, and **see the app running locally in <2 minutes**. 
