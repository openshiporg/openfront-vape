# Product

<!-- impeccable:product-schema 1 -->

Inferred from the repository and the owner's redesign brief (`~/Code/Euler/state/briefs/batches-2-6-full-redesign-2026-10-25.md`) on 2026-10-25. The owner ordered the work without an approval stage, so no interview took place. Every line below is inferred, not confirmed.

## Platform

web

## Users
- **Adult shopper (storefront):** someone 21+ buying devices, e-liquids and accessories from this shop, often reordering a known product, on a phone. Passes an age gate first.
- **Operator (platform):** the shop owner or manager running the store; a compliance lead maintaining merchant authority, jurisdictions, product classifications and evidence, provider approvals, the compliance ledger and reports; fulfilment staff working orders.

## Product Purpose
Openfront Vape is self-hostable commerce for regulated vapor products: catalog, inventory, accounts, orders, plus regulated-product controls (merchant profiles, jurisdictions, product evidence and classification, provider approvals, a compliance ledger and reports, a sales kill switch). Regulated transactions are disabled by the current release gate until the blockers are cleared. Success is an operator knowing whether the shop can sell right now and what to clear next, and a shopper finding the right product fast.

## Positioning
Compliance is the operating model, not a bolt-on: every blocker names its fix, every sale decision is recorded in the ledger, and checkout opens only when the evidence exists.

## Operating Context
- Release gate: sales stay disabled while blockers exist (merchant profile, policies, product evidence/classification, provider approvals); a kill switch can stop sales at any time.
- Products need classification and evidence per variant before they can publish in a jurisdiction.
- Orders need age verification and carrier rules per ship-to jurisdiction.

## Capabilities and Constraints
- Platform routes under `/dashboard/platform/*` inside the shared Openfront dashboard shell, which must stay byte-identical to Openfront E-commerce.
- Storefront under `/[countryCode]/**` with an age gate, store, categories, collections, product, cart, checkout, account and order pages. Storefront styles live in the `vp-*` section of `app/globals.css` plus `features/storefront/**`.
- Never claim sales are open, that products are compliant, or invent regulatory warning copy; required warning text is an owner decision.

## Brand Commitments
- Store name, logo and logo colour come from store settings.
- Owner direction (2026-10-25): no pill-shaped or heavily rounded tabs, chips or cards on platform pages (radii ≤6px, flat or underline tabs, dense tables, real status columns). UI copy is labels, states and errors only.

## Evidence on Hand
Demo catalog (products may be draft), store settings, compliance records from onboarding. No reviews, testimonials, lab results or certifications may be invented.

## Product Principles
1. Lead with "can I sell, and what's next", then the work queue.
2. Every compliance state is shown as a word with its fix, never colour alone.
3. Every route, state and workflow stays. Presentation changes; behaviour doesn't.
