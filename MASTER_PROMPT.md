# FLUIVIX — One-shot Codex execution prompt

## Copy the entire English prompt below into Codex while opened at repository root.

> You are the lead engineer and UI/UX implementer for FLUIVIX. **Implement the full application now**, not just a plan, prototype, scaffold, or partial page set.
>
> **Read first:** `AGENTS.md`, `README.md`, all TEN documentation files `docs/01-PROJECT-OVERVIEW.md` through `docs/10-ACCEPTANCE-TESTS.md` (read their complete contents), then `progress/BUILD-STATUS.md`. Inspect existing files safely. Treat the user-authored SRS reproduced in `docs/02-FUNCTIONAL-REQUIREMENTS.md` as the project requirements, and obey the cross-document precedence stated in `AGENTS.md`.
>
> **Scope:** Implement all 34 customer-facing route patterns, all P0 and P1 feature modules, responsive fashion-editorial design and realistic *locally bundled* catalog assets/seed data. Do NOT build admin, backend, database, real authentication, online payment provider, external courier integration or live communications. Use React + TypeScript + Vite and the documented stack. Build from the repository root without removing the specification pack.
>
> **Five full languages:** Vietnamese (default), English, Korean, Simplified Chinese and Japanese. Implement actual site-wide language switching through i18next/react-i18next. Localize UI, every route, dialogs, checkout, validation, toasts, payment/order statuses, product descriptions, collection and informational-page content; persist selection. No untranslated placeholder screens, no live translation API, no change in monetary unit (always VND). Apply RTL only if ever adding RTL locales later; no RTL is required here.
>
> **Implement in dependency order:** Phase 0 (foundation and strict typed domain, localization foundation, test harness); Phase 1 (design system, 34 routes, hero/catalog/search/filter and PDP); Phase 2 (wishlist/cart/persistence/Buy Now); Phase 3 (demo accounts/profiles/addresses); Phase 4 (checkout, coupon, COD and online payment demo, orders, tracking, cancellation, returns); Phase 5 (marketing, lookbook, localized help/policies, reviews, polish); Phase 6 (tests, accessibility, responsive QA, build/release readiness). Make each phase functional before adding the next. Do not ask me to approve individual phases.
>
> **Business correctness matters more than superficial route count:** route content must be purposeful and fully linked; selectors and forms work; stock cannot be exceeded; voucher conditions and shipping math are correct; order snapshots are immutable; buy-now does not overwrite the normal cart; payment retry never creates duplicate orders; guest/user orders remain scoped to the local simulated identity; mock account never persists or verifies secrets; all demo actions are conspicuously disclosed. A user must be able to complete real interactions in-browser without any live service.
>
> **Check work as you go:** run install, typecheck, lint, unit tests, build, Playwright E2E (if browser installation is available), verify deep-link refresh and responsive behavior. Include 5-language coverage tests, a missing-i18n-key test and negative business cases. Fix genuine regressions before considering a phase done. Do not mark unrun checks passed. Do not fake screenshots or invent command output.
>
> **Keep a durable checkpoint:** update `progress/BUILD-STATUS.md` after every phase, including files/features completed, validation evidence, blockers, what remains and clear next steps. If the environment or session limits execution, implement as much as possible and record exact unfinished tasks so future Codex turns can resume without rediscovery. Never claim complete on a partial result.
>
> **Completion criteria:** satisfy `docs/10-ACCEPTANCE-TESTS.md` including P0/P1, all 34 routes and full five-language coverage; no knowingly inert links, unverified payments, placeholder pages or runtime crash. Produce a final concise report with exact commands run, real pass/fail results, route/locale coverage, remaining issues and how to start locally. No git push or production deploy unless explicitly authorized.

## Suggested invocation
- Open terminal in this root, open Codex chat/CLI and paste the paragraph block above (without Markdown quote symbols if desired).
- A shorter equivalent invocation: `Read AGENTS.md and MASTER_PROMPT.md; implement and verify the entire FLUIVIX project according to every linked document, including 34 routes and five languages, without stopping after scaffolding.`
- A single prompt **assigns** the full job; it cannot eliminate context/time/environment constraints. Use `progress/BUILD-STATUS.md` to verify honest completion or resume.
