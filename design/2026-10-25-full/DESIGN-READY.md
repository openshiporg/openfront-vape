# Vape (Cloud Nine Vapor): full redesign of platform pages and storefront (2026-10-25)

**Brief:** `~/Code/Euler/state/briefs/batches-2-6-full-redesign-2026-10-25.md`.

**Live:** https://openfront-vape-production.up.railway.app/us (vape.openship.org once DNS is in).

This is a redesign, not a polish. The earlier "spec sheet at night" storefront and the recessed-pill platform kit were treated as evidence and replaced. The shared dashboard shell is byte-identical to E-commerce (parity drift 0).

## Process (impeccable)
- **Context and product record.** I ran `impeccable context`, then wrote PRODUCT.md from inference. The owner ordered no approval stage, so the interview was skipped and every line is marked inferred.
- **Critique.** Two isolated sub-agents. The synthesis is in `CRITIQUE.md`.
  - The detector found nothing.
  - Greps found 256 `rounded-full`, 64 `rounded-lg`/`rounded-xl` and 46 arbitrary 14–28px radii.
  - One `<table>` existed in the whole platform.
  - The release state was buried as 13px grey text.
- **Direction rolls (`concept-seed`).**
  - Platform (Operate): candidate 7 of 7, state excise tax stamps. Seed `798b96efc46301f0`.
  - Storefront (Persuade): candidate 4 of 7, the shop's front window with neon and window lettering. Seed `9e4eac5c73a159f7`.
  - The contracts are in `.impeccable/surfaces/features-{platform,storefront}.md`, including challenger verdicts and the raises they donated.
- **Build.**
  - I rewrote the kit myself (`vape-primitives.tsx`, `vape-ui.tsx`), plus the storefront theme (the `vp-*` section of `app/globals.css`) and its fonts.
  - Six platform agents and one storefront agent then worked on disjoint directories.
- **Gates.**
  - `tsc --noEmit` exit 0 (full non-incremental run, plus the runner after every batch).
  - Unit tests 22/22.
  - Parity drift 0.
  - `impeccable detect` returns `[]` on `features/platform` and `features/storefront`.
- **Finish review.** A fresh `impeccable-finish-reviewer` returned **fix** with 8 items.
  - Batch 1 was deployed. My first recapture caught the deploy mid-switch, and the reviewer rejected it. A clean recapture followed.
  - The verdict pass scored **7 resolved and 1 partial**, and found 3 regressions: product names hidden on phone, a clipped queue row on phone, and inventory names crowded by the SKU column.
  - Batch 2 fixed those and the partial item (the 21+ note, now lettered like door vinyl).
  - Two rounds is the budget for an unattended run, so batch 2 has not been through a third review.
- **Documentation.** `impeccable-documenter` wrote `DESIGN.md` and `.impeccable/design.json`.

## Platform: the excise stamp
- **Release bar.** Overview and Compliance Center open on a full-width release bar.
  - It shows "Sales disabled" or "Sales enabled" as a stamp, the reason, and the kill-switch state.
  - The kill-switch action sits right there. Its confirmation (a 10–500 character reason) is unchanged.
- **Launch steps.** Blockers follow as ordered launch steps, each with its own fix link:
  - kill switch;
  - store details;
  - merchant profile;
  - rule set;
  - product evidence;
  - the five providers (identity, registry, tax, payment, carrier).
- **Stamps.** Every compliance state is a flat 2px plate in its state colour with its word, a dotted state rule, and the record serial in mono. Stamp colours: cleared green, pending ochre, denied red, void grey.
- **Controls.** Underline tabs replace recessed pill tracks. Buttons are flat 4px with one ink primary per page. Tables are dense with 36px rows and status columns. Empty states share one form.

| Page | Leads with |
|---|---|
| Product Evidence | The unclassified-variants queue (now the default view), with Classify as the row action |
| Provider approvals | The five required providers and which are missing, each with Add, Renew or Finish |
| Jurisdictions | Coverage by level (allowed, blocked), then rule sets needing a policy |
| Merchant profiles | Completeness, e.g. 5/7, with what is missing and a fix link |
| Compliance ledger | Today's denials and manual reviews as a dense log: time, decision stamp, rule, purpose, jurisdiction, subject, actor, serial. The three pill tracks became one tab row plus two compact selects |
| Orders | Held orders, then paid orders to ship, then the full table with payment and fulfilment status columns |
| Products | Not on sale, one row per reason with a fix, then the table with a compliance stamp |
| Inventory | The restock queue (lowest quantity first) |
| Configuration lists | Discounts, gift cards, price lists, shipping, payment, markets and stores each lead with what is misconfigured or expiring |
| Analytics | Sales now and what blocks revenue |
| Store settings | Blank required fields |
| API keys | Expired keys not yet revoked |

## Storefront: the shop's front window
- **The window band.** Deep glass, with:
  - the store name in flat gold-leaf sign lettering (Big Shoulders, from Chicago sign-painting);
  - one neon line beneath it in the logo hue (flat type, no fake glow);
  - the departments painted on the glass as links;
  - the 21+ notice lettered once like door vinyl.
- **Inside.** Bright cool-white shelves, Hanken Grotesk body, Spline Sans Mono for strength, size and price. Product cards carry a strength, size and flavour fact table, using real option data only.
- **Controls and chrome.**
  - Joined square segmented plates. They wrap on phone.
  - No pills anywhere.
  - The footer is a glass band with gold headings.
  - The age gate is a glass panel. Its cookie logic and copy are unchanged.
- **Demo state.** Every demo product is a draft, so the shelves show the designed "being stocked" state.
- **What I did not add.** No regulatory warning copy. That stays an owner decision.

## Skills used, per screen, and what each changed
- **impeccable.** All of the process above:
  - Operate rules on every platform page (type, palette, density and one signature move; never a costume layout).
  - Persuade rules on the home window (the departments are the working entry).
  - Craft floor, detector, a reviewer with a verdict pass, and the documenter.
- **design-taste-frontend / frontend-design.** The seven-candidate inventories came from the vape shop's world (bottle labels, FDA warning box, COA lab sheets, PACT shipping labels, backbar, line sheets, excise stamps). Its generated-design defaults list removed mono uppercase labels, tracked small caps (22 instances), "01/02" numbering and eyebrows.
- **industrial-brutalist-ui.** Supplied the density courage of the ledger tables and the hairline-grid discipline. I rejected its uppercase mono.
- **minimalist-ui.** Supplied the flat 4px controls and borders in place of shadows. I rejected its pill badges.
- **gpt-taste.** Supplied the meta-label ban on the storefront and the "being stocked" state in place of empty boxes.
- **high-end-visual-design / emil-design-eng.** Supplied a single motion grammar (150ms colour transitions, the department arrow nudge) with reduced motion respected. I rejected the pill CTAs.
- **color-expert.** Supplied the oklch stamp colours and the light-ground contrast checks after the switch from dark to light.
- **hallmark / creative-director.** Used as the anti-template check across the candidates.

## Commits (master, auto-deployed)
- `da7ad47` Platform redesign: release state first, excise-stamp compliance states, real tables
- `2f5e892` Storefront redesign: the shop's front window
- `a343306` Design record: product context, direction contracts, critique and before screenshots
- `26b7aa2` Redesign finish-review fixes
- `9b58faa` Redesign verdict-pass fixes and design system record

## Screenshots
- Captured from the live demo with Playwright (WebKit) at 1440x900 and 390x844, full page.
- Storefront shots after the gate were taken with the age cookie set.
- Before: `before/before-*.jpg`, where the storefront ones are behind the age gate.
- After: `after/after-*.jpg`.

## Open
- **Onboarding.** `features/platform/onboarding/**` still has rounded-full chips and step markers. Onboarding files were off-limits per the brief.
- **Small type.** The 10–11px microtype on spec tiles and counts sits below the contract's 12px minimum.
- **Batch 2 review.** The final fix batch (verdict-pass regressions) has no third review; two rounds is the unattended budget.
