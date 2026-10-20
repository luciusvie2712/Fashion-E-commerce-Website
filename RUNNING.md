# Run the FLUIVIX demo

This is a frontend-only fashion storefront. Accounts, payments, deliveries, reviews and policies are demonstrations. Use sample details. No password is stored or verified, no card data is collected, and no customer data is sent to a service.

## Local development

Use Node 24 LTS and npm 11, matching the verified environment. Exact dependency versions are recorded in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173`). On Windows with a restrictive PowerShell execution policy, use `npm.cmd` and `npx.cmd` for these commands.

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

`check` runs strict TypeScript, ESLint, Vitest/React Testing Library and the production build. Browser tests are separate. E2E screenshots go to `.tmp/visual/`; failure traces go to `test-results/`. These are local artifacts and are not committed.

To repeat the production-build browser verification in PowerShell:

```powershell
npm.cmd run build
$env:FLUIVIX_PREVIEW = '1'
npm.cmd run test:e2e
Remove-Item Env:FLUIVIX_PREVIEW
```

This starts Vite preview on port 4173. The default browser-test mode uses the development server on port 5173. The verified delivery has 45 passing unit/component tests and 45 passing production browser scenarios. Tests include all 170 route × locale combinations, localized commerce, storage failures, six responsive widths, photography/typography, Vietnamese glyph/font consistency, scroll direction, keyboard access, motion preferences and automated WCAG AA checks. Color-contrast audits wait for active transitions to finish. They do not replace a complete human accessibility or linguistic review.

## Try the shopping flows

- Select a language in the header: Vietnamese (default), English, Korean, Simplified Chinese or Japanese. Prices stay in VND.
- Open a product, select a color and size, then add to the bag. Each variant has its own stock. Size M / Ink on the first T-shirt is available. The final accessory is sold out deliberately.
- The bag supports quantity changes, variant edits, merge, remove and confirmed clearing. Favorites and recent views are scoped by local identity.
- Buy Now creates a separate checkout intent and keeps the regular bag intact.
- Fill the shipping form with sample details such as phone `0900000000`. Standard shipping is 30,000 VND and free from 599,000 VND **after** merchandise discounts; Express is 49,000 VND.
- `FLUIVIX10`: 10% off a merchandise subtotal from 300,000 VND, capped at 100,000 VND. `FREESHIP`: standard shipping free from 250,000 VND. Only one voucher applies. `WELCOME50`, `EXPIRED`, `DISABLED` and `PREMIUM` provide other boundary fixtures.
- COD records an unpaid demo order. Online DEMO offers success, failure, cancellation and retry on the same order ID. No real payment is processed.
- Follow the receipt to guest tracking or account orders. The visible simulation controls advance fulfillment, guard cancellation after dispatch, and allow returns within seven days of simulated delivery. Refunds are local status changes only.

## Demo accounts and local data

Sign in with `demo@fluivix.local` and **any** password of at least eight characters. This is a disclosed form simulation, not authentication. Six sample orders are available for that profile. You can also register another local profile, edit its name/phone and manage saved addresses.

On sign-in, the guest bag merges into the selected profile with quantities capped at stock; favorite IDs are combined. Guest orders stay guest-owned. Logout restores the guest view without deleting profile records.

Browser state uses versioned `fluivix:v1:` keys and schema validation. If storage is unavailable, the current SPA session works in memory with a warning; full refresh cannot preserve that session. Use **Reset demo data** in the footer and confirm to clear FLUIVIX data only. Unrelated browser keys are preserved. There is no cross-device sync or security boundary against a person who can edit browser storage.

## Architecture and assets

Feature modules live in `src/features/`. Pure pricing/cart/order rules are separate from UI and are tested with deterministic data. The catalog contains 48 products, six categories and four collections. All current product and editorial imagery uses 134 original photorealistic images generated using the built-in ImageGen tool: 128 product/color photographs and six section photographs. Local WebP files and their prompts live in `public/assets/photos/` (about 16.7 MB total). Original SVG files remain for fallback and historical order snapshots. No external image service or font request is needed at runtime.

Translations are authored locally in `src/features/i18n/dictionaries.ts`, with localized catalog and policy fixtures in `src/data/`. Currency uses `Intl` presentation only. Product/variant IDs, snapshots and integer prices do not change with language.

Typography uses the system Georgia font with local serif/CJK fallbacks. Vietnamese uses bundled Gelasio, a Georgia-compatible serif with complete Vietnamese glyph coverage, so accented letters never mix with a different system face. Regular/bold and italic variable fonts and their SIL OFL license are in `public/fonts/`. Page content fades into and out of view; dialogs animate on both open and close. The announcement scrolls away and the header hides when scrolling down, returning when scrolling up or receiving keyboard focus. Operating-system reduced-motion preferences disable transitions and keep all content visible. No font or animation service is requested at runtime.

## Static hosting

`npm run build` produces `dist/`; serve it as static files. Configure unknown non-asset paths to return `index.html` so nested SPA routes refresh correctly. `public/_redirects` provides a Netlify-compatible example. Missing assets should retain normal 404 behavior where the host supports more specific rules. No hosting account has been configured and no deployment was performed.

For a subdirectory host such as a GitHub Pages project path, configure Vite's `base` and the router basename together before deployment. The current verified configuration serves at `/`. Client-rendered metadata does not provide SSR/SSG indexing.

Verification details, commit references and remaining acceptance limits are recorded in [progress/BUILD-STATUS.md](progress/BUILD-STATUS.md).
