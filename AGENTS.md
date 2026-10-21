# FLUIVIX — Codex repository contract

## Mission and scope
Build the **entire customer-facing FLUIVIX fashion e-commerce SPA** to the specifications in `docs/01-PROJECT-OVERVIEW.md` through `docs/10-ACCEPTANCE-TESTS.md`. The result must be a **fully interactive frontend-only demonstration**, not static designs, route placeholders, or a live store.

**Absolute exclusions:** no Admin Dashboard, backend, API server/serverless handlers, database, cloud auth, merchant payment gateway, real credit-card collection, email/SMS/OTP sender, real shipping/tracking integration, analytics trackers, third-party customer-data collection or publishing without approval. Do not implement a mock backend when static TypeScript fixtures + browser-local state suffice.

**Locales (non-negotiable):** `vi` (default), `en`, `ko`, `zh-CN` (Simplified Chinese), `ja`; site-wide working language picker, complete translations for ALL meaningful customer-facing text on ALL 34 route patterns and dialogs, local content, form errors, commerce statuses, accessibility labels and navigation. No machine translation API. VND for every locale; only presentation changes. `docs/04-UI-UX-DESIGN-SYSTEM.md` contains exact language requirements.

**Critical behaviors:** product variant stock; accurate cart totals; isolated Buy Now; Guest checkout; COD; online payment success/failure/cancel/retry DEMO; durable order snapshot/tracking/return; fake account that *never persists passwords*; consistent history and URL search filters. All 34 routes in `docs/03-PAGES-AND-ROUTES.md` are required.

## Documentation reading order for a full build
1. Inspect current git/worktree; do not delete or overwrite user work.
2. Read `MASTER_PROMPT.md`, `README.md`, every file from `docs/01-...` through `docs/10-...`, and `progress/BUILD-STATUS.md` **before coding**. Use commands to read whole files, not truncated previews. Check root and nested AGENTS if created.
3. Produce a concise internal phase/requirements mapping. Execute Phase 0–6 continuously as **one assigned job**, with checks after each phase; do not pause for approval between phases.
4. Report genuine tool/network/permission blockers accurately and continue on independent work where possible. Never label an unexecuted test as PASS.

## Instruction precedence
Newest explicit user request > hard scope and security restrictions in this `AGENTS.md` > `docs/07-BUSINESS-RULES.md` for calculations/transitions > `docs/02-FUNCTIONAL-REQUIREMENTS.md` for feature coverage > `docs/03-PAGES-AND-ROUTES.md` for route inventory > `docs/06-MOCK-DATA-SCHEMA.md` for model contracts > `docs/04-UI-UX-DESIGN-SYSTEM.md` for experience and translations > remaining project docs. Preserve user-authored SRS in docs/02. Log material ambiguities and justified choices; never silently delete requirements.

## Engineering constraints
- React, TypeScript strict, Vite, Tailwind CSS v4, shadcn/ui/Radix, React Router, Zustand+persist, React Hook Form+Zod, i18next+react-i18next, Sonner, Lucide, Motion as needed, Vitest/RTL and Playwright; choose mutually compatible stable versions at execution, record exact versions in lockfile.
- No runtime requests to external application/data services; keep product images and translations local or provide bundled graceful offline fallbacks.
- Feature-first `src/features/` separation; shared types, pure domain services and price/state selectors; no duplicated checkout/cart pricing logic.
- Integer VND arithmetic; deterministic seed; schema-validated, versioned browser persistence; catch quota/parse errors; preserve snapshot history.
- Site texts from translation keys or localized seed content, never raw unlocalized visible strings. Respect pluralization, date locale, CJK font fallbacks, `document.documentElement.lang`, language persistence and selected locale on refresh.
- Accessible, mobile-first editorial design with complete keyboard navigation, responsive views, form errors, empty/loading/error states, meaningful feedback. All visible buttons must work, navigate, or be disabled with reason; no `href="#"`, demo success pretending real payments, fake merchant promises or third-party brand asset theft.
- No destructive reset, repository overwrite, commit/push, paid service, deployment or external write without approval. Local install/build/test within authorized workspace is allowed.

## Execution and evidence
- Bootstrap in repo root *without deleting these 15 files*. Implement Phase 0–6 in `docs/09-IMPLEMENTATION-PLAN.md`; after each phase record actual modifications, checked commands, results, and remaining risks in `progress/BUILD-STATUS.md`.
- Scripts to create: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`, `check` (typecheck+lint+unit tests+build). Attempt E2E with Playwright where browser setup is possible.
- Follow `docs/10-ACCEPTANCE-TESTS.md`, including full locale coverage. All mandatory items are exit gates. Failures must be fixed; if environmental blockers remain, state which assertions were not verified.
- Final report includes route/module/locale counts, commands actually run, passing/failing test totals, deployment-ready local build status, start instructions, changes and blockers. **Do not claim 100% completion without evidence.**
