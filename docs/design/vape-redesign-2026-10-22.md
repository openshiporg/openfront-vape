# Openfront Vape: storefront and platform direction (2026-10-22)

## Who comes first
- **Customer:** an adult (21+) reordering what they already use (pods, coils, an e-liquid at a known nicotine strength and bottle size) or picking a first device. They shop by category and by spec, not by mood.
- **Merchant:** a licensed vape retailer whose first question every morning is "am I allowed to sell today?", then orders to ship, then stock on strength and size variants.

## Direction: "spec sheet"
Calm, cool and exact, like a well-made lab label. Numbers (mg, ml, ohm, price) are set in mono and carry the page; type is plain and confident; colour is one store accent on a misted neutral ground. No dark shader hero, no stock template layout.

### Type (Google Fonts, OFL)
- **Schibsted Grotesk** for everything set in words: display 40/44 to 64/64 at -0.02em, titles 24/30, body 15/24, labels 13/18 medium.
- **IBM Plex Mono** for specs, prices, counts, order numbers and section indices: 12/16 to 15/20, tabular figures.

### Palette (light)
| Token | Value | Use |
| --- | --- | --- |
| `vp-bg` | `#F1F2EF` | Page ground (mist) |
| `vp-surface` | `#FFFFFF` | Raised: pills, panels, inputs on wells |
| `vp-well` | `#E6E8E4` | Recessed: tracks, image wells, list bands |
| `vp-ink` | `#141816` | Text, primary buttons |
| `vp-ink-2` | `#525955` | Secondary text |
| `vp-ink-3` | `#878D89` | Tertiary text, disabled |
| `vp-line` | `#D9DCD7` | Hairlines |
| `vp-accent` | `hsl(var(--vp-h) 46% 34%)` | Store accent, from the saved logo colour |
| `vp-tint` | `hsl(var(--vp-h) 38% 90%)` | Accent wash for selected and empty states |

`--vp-h` = (221 + saved logo hue rotation) mod 360, so the accent always matches the merchant's logo. Vape's onboarding default is the Untitled UI **AlphaWave** mark (a flowing wave) rotated to teal.

### Core components
- **Segmented control:** a recessed `vp-well` track with a raised white pill on the active item. Used for variant options (nicotine strength, bottle size, resistance, colour), sort, category switches and every in-page tab.
- **Spec tile:** product art when a product has no photo: the accent wash, the category in mono, and the product's real option ranges (for example `3 · 6 · 12 mg`). Never invented copy.
- **Status dot:** 8px, on the title line (baseline-aligned with the title), never vertically centred in a row.
- **List band:** one recessed band with hairline-divided rows instead of stacked cards.
- **Buttons:** ink pill for primary, white pill on a well for secondary. 44px minimum height on phone.
- **Up-right arrow** for links out; no emoji or Unicode arrows as icons.

### Layouts
- **Header:** 21+ strip, then logo lockup, category links (desktop), account and bag. Phone: logo, bag, menu sheet with categories, collections, account and region.
- **Home:** store title and description set large; a numbered category index (01 Devices, 02 E-liquids...) that is the main way in; then collection rails.
- **Shop / category / collection:** title with product count in mono, a category segmented track, sort track, 2-up grid on phone, 4-up on desktop.
- **Product:** image well or spec tile; title with stock dot; price in mono; each option as a segmented track; add to bag; facts list (category, collection, delivery and age); related rail.
- **Cart and checkout:** single column on phone, summary panel on the right on desktop; prices and totals in mono.
- **Account:** segmented section nav; orders as a list band with status dots on the title line.

## Platform (dashboard pages under `/dashboard/platform`)
Inside the unchanged shared shell. The dashboard's own fonts and tokens stay, so pages sit naturally in the shell in light and dark; the vape kit (`features/platform/components/vape-ui.tsx`) supplies the same segmented control, title-line dots and list bands as the storefront.
- **Page header:** title with a status dot where the page has a state (Compliance: sales enabled or disabled).
- **Status filters:** the segmented track with counts in mono.
- **Compliance Center first:** launch state, blockers, safety controls, provider status and record links, laid out as list bands.
