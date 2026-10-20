# FLUIVIX — Implementation and verification checkpoint

**Checkpoint version:** 1.0 (spec pack generated 2026-10-19)
**State:** IMPLEMENTED AND VERIFIED LOCALLY — NO DEPLOYMENT PERFORMED
**Maintainer:** Codex, 2026-10-19 (Asia/Saigon).
**Source of truth:** `AGENTS.md`, `MASTER_PROMPT.md`, `docs/01`–`docs/10`.

## What exists now
- [x] 15-file requirements/instruction/checkpoint package prepared.
- [x] User SRS v1.0 preserved verbatim in `docs/02-FUNCTIONAL-REQUIREMENTS.md`.
- [x] Five languages required: Vietnamese, English, Korean, Simplified Chinese, Japanese.
- [x] React/Vite source app created, built and exercised in Chromium.
- [x] All 34 routes implemented; 170 route × locale smoke combinations passed.
- [x] Five bundled locales; dictionary/placeholder parity and localized purchase flows passed.
- [x] Unit/component and production Chromium E2E checks executed successfully.
- [x] Responsive, automated accessibility and internal-link audits completed; manual limits stated below.

## Phase table — Codex fills evidence; never pre-mark pass
| Phase | Status | Changes delivered | Tests actually run | Blocker / next action |
| --- | --- | --- | --- | --- |
| 0 Foundation, domain, i18n | COMPLETE | Strict locked frontend stack, domain, persistence and five locales | install/type/lint/unit/build PASS | No backend |
| 1 Catalog/PDP | COMPLETE | Editorial home/catalog/search/collections/PDP | Shopping and five-locale route tests PASS | Local original illustrations |
| 2 Wishlist/cart/Buy Now | COMPLETE | Owner-scoped shopping, stock guards, isolated intents | Unit and browser journeys PASS | Storage limitations disclosed |
| 3 Account/address | COMPLETE | Demo auth/profile/address CRUD/default | Account browser/no-secret tests PASS | No real authentication |
| 4 Checkout/orders | COMPLETE | COD, online retry, snapshots, tracking and returns | Checkout and five-language commerce tests PASS | No real payments |
| 5 Brand/support/reviews | COMPLETE | Localized support prose/forms/reviews/lookbook | Content, responsive, axe and resilience tests PASS | Final regression run pending |
| 6 QA/performance/release | COMPLETE | Formatted source, split bundles, run guide, expanded tests | 42 unit/component and 37 production E2E PASS | No deployment; manual review limits below |

Allowed phase statuses: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETE`. Set `COMPLETE` only after exit checks reported in `docs/09-IMPLEMENTATION-PLAN.md` pass.

## Commands evidence (Codex append actual executions)
| Timestamp | Command | Result (PASS/FAIL/BLOCKED/NOT_RUN) | Observed output/error | Relevant phase |
| --- | --- | --- | --- | --- |
| 2026-10-19 | `npm.cmd install …` | PASS | Compatible runtime/dev dependencies locked; resolver v6 failure and v5 recovery recorded below | 0 |
| 2026-10-19 | `npm.cmd run typecheck` | PASS | TypeScript strict, exit 0 | 0–6 |
| 2026-10-19 | `npm.cmd run lint` | PASS | ESLint, exit 0 | 0–6 |
| 2026-10-19 | `npm.cmd run test` | PASS | 6 files, 42 unit/component tests passed, exit 0 | 0–6 |
| 2026-10-19 | `npm.cmd run build` | PASS | Vite production `dist/`; no chunk-size warning, exit 0 | 0–6 |
| 2026-10-19 | `$env:FLUIVIX_PREVIEW='1'; npm.cmd run test:e2e` | PASS | 37 Chromium scenarios passed against production preview, exit 0; task-owned server cleanup described below | 6 |
| 2026-10-19 | `npx.cmd playwright install chromium` | PASS | Chromium and headless shell installed | 6 |
| 2026-10-19 | `npx.cmd prettier --check …` | PASS | All application/test/config inputs formatted | 6 |

## Coverage ledger (Codex track numeric actual results)
- Route patterns required: **34**, plus wildcard 404. Implemented: **34/34** plus wildcard 404; full locale smoke passed.
- Locales required: **5** (`vi`, `en`, `ko`, `zh-CN`, `ja`). Route smoke and core purchase journeys verified: **5/5**. Full linguistic editorial review is not claimed.
- Route×locale coverage expected: **170** combinations plus localized wildcard/invalid slugs. Verified: **170/170** route renders, with valid demo identity/order fixtures.
- FLX-01–FLX-16 implemented: **16/16**. Automated checks and selected manual visual evidence are mapped below.
- Latest completed unit/component run: **42 passed / 0 failed / 0 blocked**.
- Latest completed production browser run: **37 passed / 0 failed / 0 blocked**. Historical failures and fixes are retained below.

## Risks/decisions (update as implemented)
1. Editorial brand tokens, demo logistics/vouchers, artwork and legal text are suggested demo content, not official Fluivix policy.
2. `zh-CN` = Simplified Chinese is explicit working assumption for unspecified "Tiếng Trung".
3. Demo passwords are **never persisted or authentically verified**; UI must say so.
4. Local browser identity is simulation only; never claim account/order security.
5. A single instruction to Codex doesn't guarantee its execution environment supports all installs, browser tests, or continuous multi-hour execution.

## Resume contract
Before continuing: read root `AGENTS.md`, this checkpoint, Phase plan, applicable docs and current code. Determine true completed tasks from files/tests rather than trusting stale checked items. Continue at earliest unverified exit gate. Preserve user modifications and report any conflicts.

## Final handoff
- Start: `npm.cmd ci` on a fresh checkout, then `npm.cmd run dev`; current workspace dependencies are already installed.
- All 34 routes are listed in `src/app/route-inventory.ts`; wildcard and invalid dynamic slugs have recovery screens.
- Five-language coverage: 170 route renders, dictionary/placeholder parity, five-language registration validation and payment/tracking journeys PASS.
- Typecheck/lint/unit/build/E2E: PASS on the source delivered by commit `46b0722`; subsequent checkpoint changes are documentation only.
- Production bundle: `dist/`, root `/`; `npm.cmd run preview` for local review. Static host must rewrite nested SPA paths to `index.html`; example in `public/_redirects`.
- Reset: footer → Reset demo data → Confirm. Clears only `fluivix:` keys; unrelated storage preservation is tested.
- Full start/demo/privacy/hosting instructions: `RUNNING.md`. Existing user README edits remain untouched and unstaged.
- Open implementation/tool blockers: **none**. No hosted deployment or hosted rewrite test was performed. Chromium is the tested browser; exhaustive human screen-reader, cross-browser and professional linguistic reviews were not performed and are not claimed as PASS.

## Execution ledger — 2026-10-19
- Existing user work preserved: modified README.md; untracked AGENTS.md, MASTER_PROMPT.md and .gitignore. These are not staged as implementation files.
- origin/main verified at 0882ca6. Fetch and dry-run push succeeded with elevated access. npm.cmd used because PowerShell execution policy blocks npm.ps1.
- Module: development tooling. Strict React/Vite/Tailwind, ESLint, Vitest/RTL, Playwright scripts and SPA fallback added. Phase 0 IN_PROGRESS; full shell/domain gates remain.
- npm install runtime attempt failed on @hookform/resolvers v6 optional-peer conflict; compatible v5 installed successfully. Dev dependencies installed. npm reported zero vulnerabilities.
- npm run check: typecheck and lint PASS; 22 unit tests PASS (includes in-progress domain files); production build result recorded below. No browser checks yet.
- Commit: chore(setup): initialize strict React storefront tooling. SHA and push verification follow in next ledger entry.
- No module is claimed fully complete until its push is verified. docs/ and progress/ are ignored by the existing user .gitignore; only the explicitly required ledger is force-added.
- Tooling commit 673d3954333e2823eb8e3b64472c40c99e789fd4 pushed and verified by git ls-remote; build PASS (Vite 8.3.4).
- Domain module: localized catalog of 48 products, 6 categories, 4 collections; stock/variant/cart helpers, coupon/shipping totals, URL guards and safe storage. 22 tests passed, typecheck/lint/build passed. BR-01–04, BR-08–10 groundwork, FLX-16 dictionary parity. UI acceptance remains pending.
- Commit: feat(domain): add localized catalog and tested commerce rules. Push SHA recorded in next entry.
- Domain commit 1d0460a17736083f9b61397c6cc9f27b0734a807 pushed and remote verified.
- Module: owner-scoped shopping persistence and demo identity services (FLX-05/06/07 groundwork, BR-05/08). Zustand persist with schema guards; isolated Buy Now; guest merge; credential-free profiles; address operations. 25 unit tests PASS, typecheck/lint/build PASS. UI coverage remains pending.
- Chromium installed successfully. First browser smoke passed: home renders in Vietnamese (1 assertion scenario); full browser suite not yet implemented.
- Phase 0 foundations delivered; shell and full locale browser gates still in progress. Phases 1–3 IN_PROGRESS, no full acceptance claim.
- Commit: feat(state): persist owner-scoped shopping and demo identities. SHA and push outcome follow.
- Shopping-state commit 9b7bb34b124dfa5be419b1c6e6f09f3feff3019e pushed and remote verified.
- UI foundation module (FLX-01/15): responsive tokens/styles, Radix accessible dialog/confirmation, shared product/summary/size UI, original SVG artwork and deterministic generator. npm run check PASS: 31 tests; typecheck/lint/build PASS. Browser dialog Escape/focus test PASS. Full shopping E2E initially 3 failed/3 passed; investigation found initial guest ID was not persisted until first identity mutation. Fixed explicit initial identity persistence; rerun pending. Also fixed allocating array selectors.
- Commit: feat(ui): add editorial design system and original local artwork. SHA/push outcome follow.
- UI commit 1b0f41c99a267f6494b64d385f6044094a049c63 pushed and verified.
- Discovery module (FLX-02/03/04/12/13): editorial home, 48-product listings/category/collections/search, URL filters/sort/page, product gallery/zoom/variants/size guide/related/recent, locally persisted demo reviews. Working-tree browser shopping run now 6/6 PASS after guest identity fix; catalog-only router smoke 1/1 PASS. npm run check PASS, 31 unit tests (some transaction tests belong to next module). Phase 1 implemented; exhaustive locale/viewport acceptance pending.
- Commit: feat(catalog): build editorial discovery and interactive product pages. SHA/push outcome follow.
- Catalog source commit 9541c720fd8882cf47dfdfaf54ecf35a5c43f588 pushed and verified. Router integration is retained locally and will ship after all imported feature modules; remote currently retains original entrypoint. Automatic review initially rejected a temporary catalog-only router due to potential regression. Inspection proved no committed router existed; restored full router, then safely pushed additions only.
- Shopping UI module (FLX-05/06): wishlist/card badges, cart quantity/variant edit/merge/remove/clear confirmation/summary, checkout intent and guest ID persistence fix. Guest merge now caps combined stock explicitly. Shopping E2E 6/6 PASS, npm run check 31 unit PASS + typecheck/lint/build PASS. Phase 2 implementation delivered; final integration and full locale tests pending.
- Commit: feat(cart): add persistent bag wishlist and safe guest identity. SHA/push outcome follow.
- Cart commit 8fb4c637fbe9812bdad18b72f4f17593e954cae8 pushed and verified.
- Order domain module (FLX-10/11 groundwork): immutable localized snapshots, synchronous intent idempotence, same-ID online payment retry, precise cart consumption, guarded fulfillment/return/refund, six seeded demo-user orders. 31 unit tests PASS; typecheck/lint/build PASS. Online failure/retry, voucher, delivered return browser scenarios observed PASS. COD browser scenario still under investigation; no completion claim.
- Commit: feat(orders): add idempotent snapshot and lifecycle services. SHA/push outcome follow.
- Order services commit 98f750c8282aaa1542b34093d0552e7abeb62973 pushed and verified.
- Auth/account UI module (FLX-07/08): login/register/forgot validation, local-only disclosure, protected routing, profile editing, saved-address CRUD/default, own account and voucher wallet. Browser account scenarios 2/2 PASS; no secrets in persisted identity assertion PASS. Typecheck/lint and previous 31 unit/build checks PASS. Phase 3 implemented; exhaustive field/error/viewport auditing continues.
- Browser locale sweep: vi/ko/zh-CN/ja 34 routes each PASS; English route assertions ran but artifact finalization failed because two concurrent Playwright commands shared output. Sequential full rerun required; this is not recorded as full locale PASS.
- Commit: feat(account): implement demo authentication profile and addresses. SHA/push outcome follow.
- Account commit 51e7dfbb21fb1a4d1af06c80727d6cd8e7f7ffd6 pushed and verified.
- Checkout/order UI module (FLX-09/10/11): validated guest/user shipping form, saved-address selection, voucher recalculation, COD receipt, online fail/cancel/retry/success, owned guest lookup, order list/detail, cancellation/returns/refund/reorder. Sequential checkout E2E 5/5 PASS; 31 unit tests PASS; typecheck/lint/build PASS. Fixed error text changing accessible field names and first-visit false persistence warning. Repeated-submit browser test now dispatches two form submissions in the same task and verifies single receipt; the earlier physical double-click navigated on its second click after the page changed.
- Phase 4 core flows implemented and verified in English; five-locale deep-flow and full responsive/accessibility gates remain.
- Commit: feat(checkout): complete demo payment receipts and order journeys. SHA/push outcome follow.
- Checkout commit c96ac0f13eba94c48bd43ac0bb77e96be7aa9db5 pushed and verified.
- Content module (FLX-14/16): complete locally authored five-language About, 4 policies, 8 FAQ answers, Contact demo form, size tables, linked lookbook. Localized body-content and 34-route title-key tests PASS. npm run check 33 unit PASS, typecheck/lint/build PASS. Phase 5 content implemented; viewport/a11y audits pending.
- Sequential locale sweep running on integrated local router; Vietnamese and English 34-route sweeps observed PASS, remaining locales pending.
- Commit: feat(content): author localized brand support and policy pages. SHA/push outcome follow.
- Content commit 99abef328f1d26d530fd6ce4b2c88db0a28b8df4 pushed and verified.
- App integration module (FLX-01–16): full 34-route React Router tree, lazy feature groups, localized titles/metadata/toast labels, accessible loading boundary; original shared images now have inline fallback; Quick View and localized newsletter/review validation integrated. Source modules are all committed; no existing routes removed.
- Sequential 170/170 route×locale smoke PASS; locale switching mid-checkout PASS. 38 unit/component tests PASS; typecheck/lint/build PASS. Responsive/image smoke at 360/390/768/1024/1440 PASS across six templates. Axe AA checks six screens PASS. Mobile menu/filter Escape PASS. MANUAL visual: inspected actual generated Japanese 390px home screenshot; CJK glyphs visible, layout readable. This is not a full manual audit of all routes.
- Resilience run initially 9/10 PASS: blocked-storage test used a full reload and incorrectly expected in-memory English to survive. Test now uses SPA links; rerun pending. Build still has a 566kB main-chunk warning; optimizing before final release.
- Commit: feat(app): connect all storefront routes and localized interactions. SHA/push outcome follow.
- App integration commit e643ee096ef4b6ec3cebcb0efe1f5aaa422ec06e pushed and remote verified.
- Final quality module: formatted readable modules; catalog keyword/identifier validation; meaningful accessory names; default-address reassignment; category-selectable size guide; home policy links; explicit empty-checkout recovery; localized checkout variants; filtered-order empty state; larger radio/checkbox targets; lazy routes and vendor chunk splitting. Build now emits no chunk-size warning (main application chunk ~145 kB; React vendor ~258 kB).
- npm run check PASS on final source: typecheck/lint PASS, 42 unit/component tests PASS, production build PASS. Prettier check PASS. Static source audit found no fetch/API calls, third-party runtime services, real credentials, localStorage.clear or unsafe HTML injection.
- Full development-server browser run: 34 PASS / 1 FAIL. The one failure was checkout radio target size in the expanded axe audit; fixed and isolated 8-screen axe rerun PASS.
- Final production-preview browser run: 37 scenarios observed PASS, including 170 route/locale combinations, all generated internal links, five localized payment/tracking flows, six widths (360/390/768/1024/1280/1440), populated cart/checkout/order templates, eight-screen axe AA audit, dialogs, variant edit/merge, corruption/blocked-storage/image fallback and reset preservation. Final command exit is checked before committing.
- MANUAL visual evidence: actual production screenshots inspected for vi/ko/zh-CN/ja at 390px and en at 1440px; CJK glyphs visible, hero/CTA readable. Also inspected full Japanese desktop home and mobile PDP. Files retained locally in .tmp/visual. This does not claim exhaustive screen-reader or linguistic review.
- Commit: fix(storefront): harden accessibility state and production bundles. SHA/push outcome follow.
- Production E2E command completed with exit 0: `FLUIVIX_PREVIEW=1 npm.cmd run test:e2e` -> 37 passed (5.0m), 0 failed, 0 blocked. Windows sandbox teardown stalled after all scenarios; Stop-Process hit a PowerShell NullReferenceException. Verified exact workspace Vite PIDs (24432 preview, 11308 earlier dev) were closed with .NET Process.Kill; both parent Playwright runs then exited 0. No unrelated processes were targeted. No runtime source changed after the validated build.

## Final requirement-to-evidence map
| Requirement | Implemented module | Evidence actually executed |
| --- | --- | --- |
| FLX-01 | Responsive shell, local search, navigation, footer | route/link sweep, mobile drawer and keyboard tests |
| FLX-02 | Editorial home, categories, collections, merchandising, newsletter | 5-locale home routes, responsive screenshots, local form validation |
| FLX-03 | Catalog/search/filters/sort/page with URL history | shopping filter/reload/back scenario, full route sweep |
| FLX-04 | Gallery/zoom, variant stock, quantity, size guide, related products | missing/sold-out tests, dialog focus, variant/domain tests |
| FLX-05 | Owner-scoped wishlist | persistence/removal/guest merge tests |
| FLX-06 | Cart quantities/variant edit/merge/clear and totals | stock/merge unit tests, browser editor/merge/persistence |
| FLX-07 | Demo signup/login/logout/reset/profile | account E2E, 5-locale registration errors, safe redirect and no-secret assertions |
| FLX-08 | Address CRUD/default and checkout selection | account browser persistence, default reassignment unit test |
| FLX-09 | Guest/user checkout, shared pricing and coupons | all worked pricing examples, valid/invalid voucher and shipping scenario |
| FLX-10 | COD and online success/fail/cancel/retry | idempotent unit tests, five-language online commerce and COD browser tests |
| FLX-11 | Snapshots/owned history/tracking/lifecycle/cancel/return/refund/reorder | order unit state/ownership/time-window tests and browser lifecycle |
| FLX-12 | Synthetic ratings/filter/local review form | localized PDP route coverage, local form/resilience browser scenario |
| FLX-13 | New/best/sale/collections/lookbook/recent views | five-language route/link sweep and shopping journeys |
| FLX-14 | Authored About/Contact/FAQ/size/shipping/returns/privacy/terms | content parity, full locale route sweep, local contact form validation |
| FLX-15 | Toasts/dialogs/empty/error/storage warning/fallback/reduced motion | blocked/corrupt storage, reset, image fallback, focus/Escape, axe; reduced-motion CSS source audit |
| FLX-16 | Five bundled locales and stable VND state | 170 route combinations, parity/interpolation, mid-checkout locale change, localized paid receipts |

## Verified implementation commits
All rows below were pushed to origin/main and verified with git ls-remote. No force push or history reset was used.
| SHA | Conventional Commit |
| --- | --- |
| 673d395 | chore(setup): initialize strict React storefront tooling |
| 1d0460a | feat(domain): add localized catalog and tested commerce rules |
| 9b7bb34 | feat(state): persist owner-scoped shopping and demo identities |
| 1b0f41c | feat(ui): add editorial design system and original local artwork |
| 9541c72 | feat(catalog): add discovery product and demo review components |
| 8fb4c63 | feat(cart): add persistent bag wishlist and safe guest identity |
| 98f750c | feat(orders): add idempotent snapshot and lifecycle services |
| 51e7dfb | feat(account): implement demo authentication profile and addresses |
| c96ac0f | feat(checkout): complete demo payment receipts and order journeys |
| 99abef3 | feat(content): author localized brand support and policy pages |
| e643ee0 | feat(app): connect all storefront routes and localized interactions |
| 46b0722 | fix(storefront): harden accessibility state and production bundles |

- Full quality commit SHA: 46b07222a09f9b39140dbd5938cd9fdc208d41db; origin/main matched after push.
- The final checkpoint/run-guide commit is documentation only. Its exact SHA is returned in the handoff and can be obtained with `git log -1 --format=%H -- progress/BUILD-STATUS.md`. A commit cannot embed its own final hash without changing that hash.
- Existing user work left unstaged: README.md, .gitignore, AGENTS.md and MASTER_PROMPT.md. Specification files under docs/ remain intact under the user's ignore rules.
- No incomplete functional module is known. Verification limits remain explicit: Chromium only; selected manual visual checks; no exhaustive human screen-reader or professional linguistic review; no hosted deployment.

## Follow-up: photorealistic imagery and larger typography
- User requested replacement of product/section illustrations with generated realistic photographs and larger text across device layouts.
- Typography module: body 18px desktop / 17px mobile; stronger heading scale; buttons/forms generally 16px; mobile product titles 16px and prices 15px; metadata/footers enlarged. Header switches earlier and mobile spacing was adjusted to prevent overflow.
- npm.cmd run check PASS (typecheck/lint, 42 unit/component tests, production build). Responsive/a11y suite initially 7 PASS / 1 FAIL at 360px header; fixed spacing, isolated 360px rerun PASS. Other 390/768/1024/1280/1440 checks and axe audit PASS. Original README/instruction changes preserved.
- Imagery still IN_PROGRESS: built-in ImageGen; original photorealistic campaign and per-product/color studio images are being generated, encoded to local WebP. No external runtime image service.
- Commit: style(typography): enlarge text across responsive storefront layouts. Commit SHA/push verification recorded next.
- Typography commit e2045cf31c762fdf4289ae1c01bdb63c0bdb765a pushed and verified on origin/main.
- Media foundation: first 41 generated photographs encoded locally (6 campaign/collection/atelier sections plus 35 product/color images). Section, category, product card, PDP and lookbook consumers now use the photography registry; ungenerated catalog entries temporarily retain the existing SVG fallback while generation continues. Product gallery index is clamped for single-image accessories. Exact prompts are stored next to the WebP files; originals remain in Codex generated_images.
- Built-in ImageGen used; Sharp only performs WebP encoding, without semantic image edits. AI-image notices and About copy updated in all five locales.
- Actual checks on this media foundation: npm.cmd run check PASS (42 unit/component tests, typecheck/lint/build); foundation/shopping/resilience browser subset 11/11 PASS. Actual desktop/mobile home and mobile PDP screenshots inspected. The mobile hero photo crop was adjusted to show the model correctly. Remaining product photos are IN_PROGRESS; no full-image completion claim yet.
- Commit: feat(media): add photorealistic campaign and catalog photography. SHA/push verification recorded next.
- Media foundation commit 9a7a6f87a0bba19ff33b6dc97fd81e194e520f3c pushed and verified on origin/main.
- Follow-up verification on expanded photography: npm.cmd run check passed 42 unit/component tests, typecheck, lint and build. Full browser suite initially could not collect because Node required a JSON import attribute for the photography registry. Added `with { type: 'json' }`; rerun completed 39/39 production browser scenarios, including 170 route/locale combinations, six responsive widths, automated accessibility and the new photography/typography checks. Complete 134-asset validation still pending at this checkpoint.
- Image generation encountered approval-service timeouts after an environment suspension; successful retry restored service. Completed WebP files were preserved and the generation manifest recovered. New source results are checkpointed individually before incremental encoding so a stopped generation cannot erase completed work.
- Photography completed: 134 original local WebP images (128 product/color images across all 48 products, plus hero, four collection images and atelier). All current category/product/section consumers resolve to photographs; legacy SVG assets remain only for graceful fallback and historical snapshots. Total photography payload is 16,712,392 bytes; images are lazy-loaded where appropriate. Exact prompts accompany every final asset.
- Final `npm.cmd run check` completed with exit 0: strict typecheck PASS, ESLint PASS, 45/45 unit/component tests PASS, production build PASS. Three new asset tests verify every variant image, all section/category paths, 134 unique prompt records and high-resolution WebP decoding. Prettier check on changed source/tests/script/run guide/manifests PASS; git diff --check PASS.
- Final production `FLUIVIX_PREVIEW=1 npm.cmd run test:e2e` completed with exit 0: 39/39 PASS (4.9m), 0 failed, 0 blocked. Includes 170 route/locale combinations, commerce, six widths, keyboard and automated WCAG AA checks, photographic variant/section loading and typography checks in five languages at 360/1440px. This final run used the complete 134-image build. No runtime source changed afterward.
- Visual evidence: inspected contact sheets covering all product groups/colors, actual desktop/mobile home and mobile PDP. Original generated photos have studio/editorial consistency. Images are explicitly labeled as AI-generated in all five locales. This remains selected manual visual inspection, not a comprehensive human linguistic or screen-reader review.
- Follow-up scope complete locally: larger responsive typography and all requested product/section imagery. No deployment or external runtime data service. Commit/push outcome follows in the handoff; exact checkpoint commit is obtainable with `git log -1 --format=%H -- progress/BUILD-STATUS.md`.

## Follow-up: uncropped hero and caption removal
- Removed the homepage `01 / 04` / AI-image corner caption as requested. Replaced fixed-height, cover-cropped hero sizing with the image's natural aspect ratio. Desktop retains centered overlay copy; tablet/mobile place copy below the image so the full photograph remains visible. Removed unused caption rules and conflicting mobile crop overrides.
- Actual verification: `npm.cmd run build` PASS (includes typecheck), `npm.cmd run lint` PASS, changed-source Prettier check PASS and `git diff --check` PASS. Temporary Playwright geometry audit PASS for 35 combinations (7 widths from 360 to 1920px × 5 locales): original image ratio, image/copy inside hero, no horizontal overflow and no caption. Desktop/mobile hero screenshots inspected.
- Targeted production browser tests PASS 3/3: photograph/variant loading, five-locale larger typography, automated WCAG AA on key screens. No full commerce rerun for this CSS/markup-only adjustment. User's unrelated README and instruction files remain unstaged.

## Follow-up: hero fits one viewport
- User requested a smaller hero that fits one screen. Hero now uses the viewport height remaining after its measured page offset (announcement/header included). A local ResizeObserver keeps this measurement current across language wrapping and window resizing. The original image is scaled with contain, without cropping or modifying the source file. Tablet/mobile copy remains separate, with a two-column layout for landscape and compact spacing on short screens.
- Actual checks: build/typecheck PASS, lint PASS, changed-source Prettier PASS, git diff --check PASS. Temporary browser geometry audit initially found overflow on 844×390 landscape; corrected with the landscape layout, then all 40 combinations PASS (8 viewport sizes × 5 locales), asserting hero ends at viewport bottom, image/copy remain visible and no horizontal overflow. Desktop, portrait mobile and landscape screenshots inspected.
- Targeted production Playwright suite PASS 3/3 (35.5s): photographic assets, five-language typography and automated WCAG AA. Full commerce tests were not rerun for this presentation adjustment. Unrelated user files remain unstaged.

## Follow-up: Georgia typography, page motion and scroll-aware header
- Changed the system typeface to Georgia with local serif/CJK fallbacks; controls and toast typography inherit the storefront font. No external font request or additional animation dependency.
- Announcement stays in document flow and scrolls away. A sticky header dock animates upward on downward scrolling and returns on upward scrolling, using passive events, requestAnimationFrame and direction thresholds to avoid jitter. Keyboard focus reveals the header; open dialogs keep navigation from disappearing. The dock retains its layout space, preserving the one-viewport hero.
- Added observer-based fades/soft blur for page sections, hero copy, cards and editorial/footer content. Dynamic/lazy content is registered; observers are cleaned up on navigation. Focused content remains visible. Dialog overlays/content have separate open and close animations. Reduced-motion preferences disable effects and changing that preference live restores all content immediately.
- Initial motion browser subset: 2 PASS / 2 FAIL; scroll direction/focus assertions passed, but the final logo-to-home assertion exposed that activating the logo while already on home did not scroll to top. Added explicit logo scroll-to-top behavior; full production rerun pending at this checkpoint.
- Actual local checks so far: `npm.cmd run check` PASS (45 unit/component tests, typecheck, lint, build). Temporary one-screen hero geometry audit PASS for 40 viewport/locale combinations with Georgia. Desktop/mobile home and returned-header screenshots inspected. Four meaningful browser scenarios added for scrolling/keyboard, in/out effects, dialog lifecycle and live reduced-motion changes.
- First full production suite: 42/43 PASS, including all four new motion scenarios; one contrast audit failed while entry/exit opacity transitions were active. Updated the audit to wait two animation frames and then for running document animations to finish, measuring settled text colors without disabling motion or weakening axe rules. Targeted eight-screen WCAG AA rerun PASS; separate reduced-motion audits on home/shop/PDP/login/contact PASS 5/5. The temporary reduced-motion helper initially needed an explicit browser context for AxeBuilder; corrected and reran successfully. Final full suite is in progress.
- Full production rerun completed exit 0: 43/43 PASS (5.3m), 0 failed, including all 170 route/locale combinations, six viewport widths, commerce, new motion scenarios and settled-state WCAG AA. A subsequent focused font inspection found Sonner's injected stylesheet overriding toast typography. Increased only that selector's specificity and added a real toast font assertion to the motion scenario.
- Final source `npm.cmd run check` completed exit 0: typecheck, lint, 45/45 unit/component tests and production build PASS. After the final toast-font CSS correction, targeted production motion/keyboard/reduced-motion/toast-font/WCAG AA tests PASS 5/5 (32.9s). No runtime source changed afterward. Prettier and git diff --check PASS. The complete 43-scenario run preceded that isolated toast selector adjustment; its five relevant scenarios were rerun on the final build.
- Delivered across the existing 34 routes / 16 functional modules / 5 locales. Browser evidence is Chromium; selected visual and automated accessibility checks do not replace a full human screen-reader or linguistic review. No deployment, external font download or runtime service added. User README and instruction files remain unstaged. Commit/push verification is recorded in the handoff.
