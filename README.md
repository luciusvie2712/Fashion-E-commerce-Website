# FLUIVIX — Complete Codex implementation specification

This repository initially contains **15 written instruction/specification/checkpoint files**. Codex is expected to generate the actual React/Vite application **in this same directory**. No admin, backend or database.

## Quick start with Codex
1. Open the repository root in VS Code / a Codex-accessible workspace.
2. Review `MASTER_PROMPT.md`; submit its one-shot English prompt to Codex.
3. Codex must read `AGENTS.md` and all 10 docs before implementation; then finish Phase 0–6, with evidence in `progress/BUILD-STATUS.md`.
4. After coding, follow generated `package.json` scripts: `npm install`, `npm run dev`, `npm run check`, `npm run test:e2e`.
5. Check the delivery report and actual acceptance checklist. A prompt is not a guarantee that all tests passed.

## What is being built
A responsive, interactive, **customer storefront demo** for apparel brand FLUIVIX with 34 route patterns, at least 48 realistic example products, size/color/stock variants, filters, cart, favorites, demo accounts, Guest checkout, discount/shipping rules, COD, simulated online payment, order lifecycle, reviews and brand/support pages.

**Languages:** `vi` Vietnamese (default), `en` English, `ko` Korean, `zh-CN` Simplified Chinese, `ja` Japanese. Complete language-switching and translations (including product copy, policies, form errors, payment states) are required. All prices remain VND. No real personal credentials, payment transactions or shipment tracking. Do not enter real sensitive information into demo forms.

## Files / ownership
| File | Purpose |
| --- | --- |
| `AGENTS.md` | Always-on Codex constraints and execution agreement |
| `MASTER_PROMPT.md` | Full implementation task in one prompt |
| `docs/01-PROJECT-OVERVIEW.md` | Product objectives, scope, roles, non-goals |
| `docs/02-FUNCTIONAL-REQUIREMENTS.md` | Feature requirements plus preserved user SRS source |
| `docs/03-PAGES-AND-ROUTES.md` | 34-route inventory and navigation contracts |
| `docs/04-UI-UX-DESIGN-SYSTEM.md` | Brand design, responsive components, five-language i18n |
| `docs/05-USER-FLOWS.md` | End-to-end user interactions and state effects |
| `docs/06-MOCK-DATA-SCHEMA.md` | Domain types, datasets, storage/locale payloads |
| `docs/07-BUSINESS-RULES.md` | Pricing, inventory, promotions, order state machines |
| `docs/08-TECHNICAL-ARCHITECTURE.md` | Stack, code organization, storage, performance, i18n |
| `docs/09-IMPLEMENTATION-PLAN.md` | Phases, dependency graph, exit gates |
| `docs/10-ACCEPTANCE-TESTS.md` | Traceable QA including i18n matrix and E2E |
| `progress/BUILD-STATUS.md` | Phased evidence of implementation and incomplete items |
| `.gitignore` | Files ignored by version control |

## Source and assumptions
The user-authored SRS v1.0 (dated 2026-10-19) is reproduced **verbatim** inside `docs/02-FUNCTIONAL-REQUIREMENTS.md`. Requirements in its source are authoritative; technical refinements and acceptance contracts are distributed across the other documents. Five requested locales are an explicit requirement, not an optional enhancement. Seed products, shipping charges and legal-policy text are **illustrative**, not real business promises.

## Design principles
- Feature-first, strict TypeScript; cohesive editorial storefront; accessible responsive UI.
- Locally bundled media and data; app usable without external API or backend.
- Pure tested business rules; real in-browser state/persistence with sensible error handling.
- Visible DEMO markers for auth, orders, payments and sample reviews/policies.
- No `href="#"`, broken media, meaningless UI controls or generic placeholder-only route pages.

## What counts as completion
The project is complete only when Codex supplies source + usable build, passes actual automated checks where technically possible, and provides recorded evidence for requirements and locale coverage. If a tool is blocked, `BUILD-STATUS.md` must state exactly what was and wasn't verified.
