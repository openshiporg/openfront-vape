# Vape (Cloud Nine Vapor): storefront redesign (2026-10-25)

Brief: `Euler/state/briefs/design-skills-redesign-2026-10-25.md` (Openfront Batch 2, storefront only).

**Live:** https://openfront-vape-production.up.railway.app/us (vape.openship.org once DNS is added)

## The world
**The spec sheet at night.**
- **Ground:** a deep teal-black.
- **Ink:** bone.
- **Accent:** the saved logo colour (`--vp-h`), lifted and softened rather than an acid pop.
- **Type:** Schibsted Grotesk headline at 112px across the full width, over a category index set in large type. IBM Plex Mono stays for specs and prices.

## What changed
- `app/globals.css`, **vape storefront section only** (the `vp-*` theme and `.vape-sf` block; every diff hunk is inside it, and the dashboard tokens above it are untouched): dark values and a new `vp-on-ink` colour for text on ink fills; tracks, pills and bands re-tuned for dark.
- Every primary `bg-vp-ink` button: `text-white` became `text-vp-on-ink`, so the bone buttons carry dark text.
- `nav`: the top strip moved from an ink fill to the well colour.
- `payment`: the Stripe card element's text colours changed for the dark field.
- `cart-mismatch-banner` and the `payment-test` badge: dark fills.
- `home/hero`: full-width headline, then a rule, then the description and actions beside the category index. The 01/02 numbering was removed because categories aren't a sequence.

Every route, state and workflow is unchanged: no route, data loader, server action, form field or test was removed or renamed. The shared dashboard shell and platform pages were not touched.

## Skills used, and how
- **impeccable**: read SKILL.md and set the surface modes: Persuade for the home page, Operate for booking, cart, checkout and account. Its "redesign replaces, it doesn't polish the old look" rule set the scope: a new world (ground, type, shape, signature motif), with every route, state and workflow kept. Its design hook scanned each stylesheet as it was written and reported no deterministic issues. I did **not** run `/impeccable init`, `critique` or `polish` as separate commands.
- **frontend-design**: the two-pass plan (palette of named tokens, type roles, layout sketch, principles), then a review of that plan against its list of generated-design defaults. That review removed the single italic accent word in headlines (salon), dropped 01/02 numbering on a list that isn't a sequence (vape) and kept the "near-black plus one acid accent" look out of every palette: accents are the merchant's own hue, lifted for dark and softened.
- **design-taste-frontend (tasteskill v2)**: the "idea comes from the subject" inventory. Each world comes from a physical object in the business. I didn't run its `draw.mjs` or `inspect.mjs` scripts; the live Playwright check below did that job.
- **high-end-visual-design / emil-design-eng**: custom ease-out curves only; transform and opacity motion; grain and blur kept to fixed layers; reduced motion respected (the existing guards were kept).
- **mobile-native**: 44px+ targets, `100svh`/`dvh` instead of `100vh` for heroes, no horizontal scroll at 390px (measured: overflowX=0 on every captured page).
- **Tessier as the bar**: near-black but never flat grey, off-white ink, one restrained accent, few radii, product and photography carrying the colour.

## Checks
- `tsc --noEmit`: exit 0, 0 errors.
- `parity-check.py`: drift 0.
- The repo has no storefront unit tests.
- Live screenshots set the `vp_age_21=1` cookie to get past the 21+ gate.

## Commits (pushed to `master`, auto-deployed)
- `df8de73` Storefront redesign: the spec sheet at night
- `5aee05b` Test-payment badge on a dark amber fill

## Screenshots (Playwright 1.62, 1440x900 desktop and 390x844 phone, full page)
Before, in `design/before-20261025/`:
- `before-us-desktop.jpg`
- `before-us-phone.jpg`
- `before-us-store-desktop.jpg`
- `before-us-store-phone.jpg`

After (live), in `design/after-20261025/`:
- `after-us-cart-desktop.jpg`
- `after-us-cart-phone.jpg`
- `after-us-desktop.jpg`
- `after-us-phone.jpg`
- `after-us-store-desktop.jpg`
- `after-us-store-phone.jpg`

## Notes
A parallel session (`demo-data-reset-2026-10-25.md`) reset this demo's database and is re-onboarding it with the full seed while this redesign shipped. The before shots were taken during or after that reset, so they may show an empty or not-configured store rather than the old design with data. The old design is in git (the parent of the first commit below). **At capture time (21:2x UTC) this store had not been re-seeded yet**, so the after shots show the redesigned shell, hero and empty states rather than the demo catalogue. Re-capture once onboarding finishes: `node shot.cjs <url> design/after-20261025 after <paths> --full`.
