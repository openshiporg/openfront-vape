# Impeccable critique: Vape, before (2026-10-25)

Run as two isolated sub-agents: Assessment A (design review) and Assessment B (detector plus pattern greps). The browser overlay was skipped because the demo needs a login. Every storefront before shot is covered by the age gate, so the storefront was judged from code.

## Detector (B)
`impeccable detect` returned `[]` for both `features/platform` and `features/storefront`. The patterns are Tailwind classes the detector doesn't cover, so the grep counts are the evidence:

| Pattern | Platform | Storefront |
|---|---|---|
| `rounded-full` | 256 (108 files) | 93 |
| `rounded-lg/xl` | 64 | 0 |
| Arbitrary 14–28px radii | 0 | 46 |
| Mono uppercase labels | 20 | 0 |
| Wide tracking | 0 | 22 |
| `shadow-[inset` | 13 | 1 |

The storefront's `vp-*` layer in `app/globals.css` also uses 999px pills.

## Design review (A)
**Specificity:**
- Platform: a pleasant consumer settings app (recessed tracks, raised pills), not compliance operator software.
- Storefront: a dark template with a 112px store title and no products, flavours or strengths.

**Heuristics:** visibility 2, real-world match 2, consistency 2, recognition 2, flexibility 1, error recovery 2. There is one `<table>` in the whole platform.

**Kit sources:**
- `vape-primitives.tsx` (`Track` and `Pill`: rounded-full with inset and raised shadows).
- `vape-ui.tsx` `ListBand`: rounded-xl, used 167 times in 83 files.
- `vape-status-filter.tsx` and `StatusTabs`.
- `PlatformFilterBar` (rounded-full) and `PlatformEmptyState` (CTA).

**Priority issues:**
1. Pills and rounding are system-wide.
2. No real tables: metadata is strung together inline.
3. Overview leads with the data model; every blocker links to the generic Compliance Center.
4. The sales or kill-switch state is buried as 13px grey text.
5. Filter chrome outweighs the data (the Ledger shows 16 pill controls before any rows).

## First-10-second tasks

| Area | First-10-second task |
|---|---|
| Overview | Can I sell now, and what's the next step? |
| Compliance Center | Clear blockers in order; reach the kill switch |
| Orders | Ship paid, age-verified orders; resolve held ones |
| Products | Which products are blocked, and why |
| Inventory | Low and out-of-stock SKUs |
| Jurisdictions | Where can I sell, and under which policy |
| Product Evidence | Classify the unclassified variants (that work queue is currently the second tab) |
| Provider Approvals | The missing required providers |
| Compliance Ledger | Today's denials and manual reviews |

## Storefront
- Generic hero.
- An empty catalog renders empty boxes.
- No merchandising by strength, flavour or device.
- No nicotine warning or compliance trust cues. This is flagged for the owner, not invented: warning copy is regulatory.
- Over-rounded and monochrome.
