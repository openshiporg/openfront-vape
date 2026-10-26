---
name: Openfront Vape
description: Self-hosted commerce for regulated vapor products; a shop-window storefront and an excise-stamp operator console.
colors:
  sf-glass: "#0d1513"
  sf-glass-2: "#16201d"
  sf-glass-line: "#2a3631"
  sf-gold: "#d8b35e"
  sf-gold-2: "#a9853a"
  sf-neon: "hsl(178 95% 64%)"
  sf-accent: "hsl(178 62% 30%)"
  sf-tint: "hsl(178 38% 92%)"
  sf-bg: "#f2f4f3"
  sf-surface: "#ffffff"
  sf-well: "#e8ecea"
  sf-ink: "#121816"
  sf-ink-2: "#3c4743"
  sf-ink-3: "#5b6763"
  sf-line: "#d3d9d6"
  sf-input-line: "#b9c2be"
  sf-on-ink: "#ffffff"
  sf-ok: "#1d6f48"
  sf-warn: "#8a5a00"
  sf-danger: "#b3261e"
  pf-cleared: "oklch(0.48 0.1 160)"
  pf-cleared-text: "oklch(0.42 0.1 160)"
  pf-pending: "oklch(0.7 0.13 75)"
  pf-pending-text: "oklch(0.5 0.12 70)"
  pf-denied: "oklch(0.52 0.17 27)"
  pf-denied-text: "oklch(0.5 0.17 27)"
  pf-denied-deep: "oklch(0.46 0.17 27)"
  pf-info: "#0284c7"
  pf-void: "#a1a1aa"
typography:
  sf-display:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "96px"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  sf-headline:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  sf-title:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  sf-body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
  sf-label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "18px"
  sf-figure:
    fontFamily: "Spline Sans Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "tnum"
  pf-headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    letterSpacing: "-0.015em"
  pf-title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  pf-body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  pf-label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  pf-serial:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  dot: "1px"
  stamp: "2px"
  plate: "4px"
  panel: "6px"
spacing:
  gutter-phone: "16px"
  gutter: "24px"
  container: "1320px"
  shelf-gap: "16px"
  shelf-row-gap: "40px"
  pf-row: "36px"
  pf-control: "32px"
  pf-control-touch: "40px"
components:
  sf-button-primary:
    backgroundColor: "{colors.sf-ink}"
    textColor: "{colors.sf-on-ink}"
    typography: "{typography.sf-body}"
    rounded: "{rounded.plate}"
    padding: "0 24px"
    height: "48px"
  sf-button-primary-disabled:
    backgroundColor: "{colors.sf-well}"
    textColor: "{colors.sf-ink-3}"
  sf-button-secondary:
    backgroundColor: "{colors.sf-well}"
    textColor: "{colors.sf-ink}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  sf-button-secondary-hover:
    backgroundColor: "{colors.sf-line}"
  sf-button-gold:
    backgroundColor: "{colors.sf-gold}"
    textColor: "{colors.sf-ink}"
    rounded: "{rounded.plate}"
    height: "48px"
  sf-input:
    backgroundColor: "{colors.sf-surface}"
    textColor: "{colors.sf-ink}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "48px"
  sf-segment:
    backgroundColor: "{colors.sf-surface}"
    textColor: "{colors.sf-ink}"
    rounded: "{rounded.plate}"
    padding: "0 14px"
    height: "36px"
  sf-segment-hover:
    backgroundColor: "{colors.sf-well}"
  sf-segment-active:
    backgroundColor: "{colors.sf-ink}"
    textColor: "{colors.sf-on-ink}"
  sf-segment-active-glass:
    backgroundColor: "{colors.sf-gold}"
    textColor: "{colors.sf-ink}"
  sf-window-band:
    backgroundColor: "{colors.sf-glass}"
    textColor: "{colors.sf-gold}"
    typography: "{typography.sf-display}"
  sf-vinyl-note:
    textColor: "{colors.sf-on-ink}"
    rounded: "{rounded.stamp}"
    padding: "2px 8px"
  pf-stamp-cleared:
    textColor: "{colors.pf-cleared-text}"
    typography: "{typography.pf-label}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
    height: "22px"
  pf-stamp-pending:
    textColor: "{colors.pf-pending-text}"
    typography: "{typography.pf-label}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
    height: "22px"
  pf-stamp-denied:
    textColor: "{colors.pf-denied-text}"
    typography: "{typography.pf-label}"
    rounded: "{rounded.stamp}"
    padding: "3px 6px"
    height: "22px"
  pf-button-danger:
    backgroundColor: "{colors.pf-denied}"
    textColor: "#ffffff"
    rounded: "{rounded.plate}"
    padding: "0 12px"
    height: "32px"
  pf-button-danger-hover:
    backgroundColor: "{colors.pf-denied-deep}"
  pf-table-row:
    typography: "{typography.pf-body}"
    height: "{spacing.pf-row}"
---

# Design System: Openfront Vape

## Overview

**Creative North Star: "The Shop Window and the Excise Stamp"**

Openfront Vape has two surfaces that share a product but not a palette. The storefront is a shop's front window: a band of deep glass green-black carrying the store name in flat gold-leaf sign-painter lettering, one neon line in the shop's logo hue, the departments painted on the glass, and the 21+ notice set like window vinyl. Below the band you step inside to bright, cool-white shelves with ink text, hairline rules and products laid out on one aligned grid. Product facts (strength, size, flavour, price) read like the table on the back of a sewing-pattern envelope: compact rows, labels left, mono figures right.

The operator platform lives inside the shared Openfront dashboard shell, which stays as it is and supplies the neutrals, the ink and Geist. Inside that shell, every regulated state is an excise stamp: a small flat 2px plate in its state colour, edged top and bottom with a dotted perforation, carrying its word and, where a record exists, a mono serial. Pages open on the release state and the ordered blockers, then a dense hairline table. Density is the point: 36px rows, no padding bands, serials visible on every row.

Both surfaces refuse soft pill geometry. Corners stay at 6px or less, tabs are joined square segments (storefront) or underlines (platform), and colour never carries a state without its word.

**Key Characteristics:**
- Storefront: dark glass window bands at top and foot, bright shelves between.
- Gold leaf is flat colour; the neon is one line per screen in the logo hue.
- Big Shoulders sign lettering for display and headings, Hanken Grotesk for reading, Spline Sans Mono for every figure.
- Platform: excise stamps for compliance state, underline tabs, 36px hairline tables with sticky headers.
- Radii from 1px marks to 6px panels; nothing rounder.

## Colors

The storefront palette is glass, gold and one neon on the window, and cool ink on white inside. The platform palette is the shell's neutrals plus four stamp colours that appear only as state.

### Primary
- **Window Glass** (sf-glass): the deep green-black of the shop window. Fills the hero band, the footer and the age gate. Text on it is gold leaf or white vinyl only. Glass Two (sf-glass-2) is the pressed or hovered segment on glass; Glass Line (sf-glass-line) draws the hairlines between painted departments and the band's bottom edge.
- **Gold Leaf** (sf-gold): sign lettering on glass (store name, first department, footer column heads), the active segment on glass, the age gate's confirm button and text selection. Burnished Gold (sf-gold-2) is its darker partner; the lettering carries a 0.5px darker keyline stroke so it reads as painted leaf.
- **Shop Ink** (sf-ink): all text inside, the primary button fill, the active segment, the 2px shelf-edge rule under shelf headings.

### Secondary
- **Logo Neon** (sf-neon): the single neon line, flat type in the store's saved logo hue (hue 178 is the fallback; the shop's own hue replaces it at runtime). One per screen, on glass only.
- **Logo Accent** (sf-accent) and **Accent Tint** (sf-tint): the same hue darkened for inline links and the input focus border, and lightened for the focus ring halo and rare selected tints. The focus outline uses this hue at 36% lightness.

### Tertiary (platform stamp colours)
- **Cleared Green** (pf-cleared): cleared, active, kill switch off, sales enabled. Fills stamps at 12% and the status dot; its text variant (pf-cleared-text) sets the word.
- **Pending Ochre** (pf-pending): pending, in review, expiring. Fills at 18%; text in the darker ochre (pf-pending-text) so the word holds contrast.
- **Denied Red** (pf-denied): denied, stopped, sales disabled, kill switch on, and the destructive button (deepening to pf-denied-deep on hover).
- **Void Grey** (pf-void): void, draft, unknown, "unavailable"; the stamp falls back to the shell's muted fill.
- **Info Blue** (pf-info): non-regulated commerce states only (proposed, scheduled, published). It never marks a compliance state.

Each stamp colour has a lighter dark-mode partner in the build so stamps hold in the shell's dark theme.

### Neutral
- **Shelf White** (sf-bg): the page behind the shelves.
- **Surface White** (sf-surface): nav, cards, inputs, segment tracks.
- **Well** (sf-well): placeholder product art, secondary buttons, hover fill, disabled buttons.
- **Ink Two / Ink Three** (sf-ink-2, sf-ink-3): secondary text and fact labels; tertiary text, placeholders, disabled words.
- **Hairline** (sf-line) and **Input Line** (sf-input-line): rules, card rings and table rows; the slightly firmer input edge.
- **Storefront states** (sf-ok, sf-warn, sf-danger): stock, order and error states inside the shop, always with their word.

### Named Rules
**The One Neon Rule.** One neon element per screen, on glass. If a second thing wants to glow, it is gold or white instead.

**The Flat Leaf Rule.** Gold leaf is one flat colour with its keyline. No gradients, no sheen.

**The Stamp Only Means State Rule.** Platform stamp colours appear only on a stamp, a status dot or a status word, and always beside the word. Nothing decorative is green, ochre or red.

## Typography

**Display Font:** Big Shoulders (with Arial Narrow) for the storefront; the shell's Geist on the platform
**Body Font:** Hanken Grotesk (with system sans) for the storefront; Geist on the platform
**Label/Mono Font:** Spline Sans Mono (storefront figures); Geist Mono (platform serials and record ids)

**Character:** Big Shoulders comes from Chicago sign-painting: condensed, heavy, uppercase, set tight like lettering on glass. Hanken Grotesk keeps the shelves plain and readable, and Spline Sans Mono puts every strength, size and price into tabular columns. The platform stays in the shell's Geist and lets the stamps carry the character.

### Hierarchy
- **Sign Display** (sf-display): the store name on the window, 60px on phone, 84px at sm, 96px at lg, uppercase, balanced, max 12ch. The same face at 40-48px names the store on the age gate.
- **Sign Headline** (sf-headline): shelf headings, 32px on phone and 40px from sm, sitting on a 2px ink shelf edge. Painted departments on glass are 30px / 38px.
- **Sign Title** (sf-title): section titles inside pages (cart, checkout, order, policy), and footer column heads in gold at 22px.
- **Body** (sf-body): product names (15px semibold), buttons, running text. The hero description is 16px / 25px at max 52ch.
- **Label** (sf-label): form labels and secondary metadata; fact rows are 12px / 16px.
- **Figure** (sf-figure): every number a shopper compares: strength (mg/mL), size, price, bag count, the 21+ on the age gate (44px).
- **Platform Headline** (pf-headline): page titles, with the page's state stamp beside them.
- **Platform Title** (pf-title): section titles over a 15%-ink hairline.
- **Platform Body** (pf-body): table cells and list rows; 14px for blocker titles and the release reason.
- **Platform Label** (pf-label): stamp words, table headers, field labels. Counts and stamp serials step down to 11px.
- **Serial** (pf-serial): record serials (last six alphanumerics of the id, uppercased), ISO and currency codes, step numbers.

### Named Rules
**The Sign Painter Rule.** Big Shoulders is only for display, headings and painted departments, always uppercase at weight 800 with 0.92 line-height. Body, labels and buttons stay in Hanken Grotesk.

**The Figures Are Mono Rule.** A number the shopper compares, or a serial the operator matches, is set in the mono face with tabular figures and no tracking.

## Layout

The storefront runs in a 1320px container with 16px gutters on phone and 24px from sm. The window band is a 12-column grid at lg: the sign takes 7 columns, the painted department list takes 5 and sits on the band's baseline. On phone the band shortens to the name, the 21+ note and the department list; the description hides. Shelves sit on the same container: a heading row over a 2px ink rule, then products in 2 columns (4 at lg) with a 16px column gap and 40px row gap so every shelf aligns on one grid. The nav is a 32px 21+ strip over a 64px bar, sticky. Touch targets are at least 44px on phone; segments grow from 36px to 40px under 640px.

The platform keeps the shell's page frame. Each page opens with the title and one primary action, then (on Overview and Compliance Center) the full-width release bar and the ordered launch steps, then on list pages the "needs you" queue, underline status tabs, search and the full table. Tables use 36px rows and headers, 16px outer cell padding and 12px inner, and hide priority-2 columns under md and priority-3 under lg. Controls are 32px, growing to 40px on phone.

**The One Grid Rule.** Every shelf on a page shares the same columns and gaps, so a shopper can scan across shelves without realigning.

## Elevation & Depth

Both surfaces are flat at rest. Depth on the storefront comes from the dark window against the bright interior, and from hairlines: cards are a 1px inset ring of hairline that darkens to ink on hover, never a lift. Shadows appear only on things that float above the page (the age gate, dialogs, the mobile bottom sheet) and on the selected option in checkout. The platform uses borders and the shell's muted fills only; its kit explicitly cancels the shell button's gradient, bevel and drop shadow.

### Shadow Vocabulary
- **Window overlay** (`0 24px 60px rgb(13 21 19 / 0.45)`): the age gate plate over a 70% glass scrim.
- **Dialog** (`0 18px 60px rgb(20 24 22 / 0.18)`): storefront dialogs.
- **Bottom sheet** (`0 -12px 40px rgb(20 24 22 / 0.18)`): the mobile add-to-bag sheet.
- **Selected lift** (`0 1px 2px rgb(20 24 22 / 0.12), 0 0 0 0.5px rgb(20 24 22 / 0.06)`): the chosen shipping or payment option, raised out of a well.

### Named Rules
**The Hairline Not Lift Rule.** Resting cards, plates and panels are flat; hover darkens the ring, it does not raise the card.

## Shapes

Small, square-cut corners throughout. 4px is the plate: buttons, inputs, segment tracks, cards, the age gate. 6px is the platform panel (tables, list bands, the release bar). 2px is the stamp and the window-vinyl note. Status dots are 8px squares at 1px radius. Segments inside a track have no radius and are joined by 1px ink dividers. Placeholder product art is a square tile with a hairline border.

**The Six Pixel Ceiling Rule.** No corner exceeds 6px on either surface. No pill tabs, chips, badges or cards.

## Components

### Buttons
- **Shape:** plate corners (4px), flat, no shadow.
- **Storefront primary:** ink fill, white text, 48px tall, 24px side padding, 15px medium; hover drops to 90% opacity; disabled becomes a well with ink-three text. Add to bag is 56px, full width, 16px semibold.
- **Storefront secondary:** well fill, ink text, 44px, hover to hairline grey.
- **Gold:** on glass only (age gate confirm): gold fill, ink text, semibold.
- **Glass secondary:** glass-two fill, glass-line border, white text; border lightens on hover.
- **Platform:** 32px (40px on phone) flat 4px buttons in four kinds: ink primary (hover to 85%), outlined, ghost, and denied-red danger. A page header carries one 40px primary. Fix links are underlined text with an up-right arrow, the underline darkening on hover.

### Segmented Plates (storefront)
- **Style:** a 1px ink track at 4px radius on white; square segments 36px tall, 14px padding, 13px semibold, divided by 1px ink rules.
- **State:** hover fills with well; the current choice is inked (ink fill, white text). Unavailable options strike through in grey. On glass the track and dividers turn glass-line and the active segment is gold.
- **Focus:** 2px outline in the logo hue, 1px offset.

### Excise Stamp (platform signature)
- **Style:** inline plate, 22px min height, 2px radius, 6px side padding, 12px semibold word in the state's text colour on its 12-18% fill, with dotted top and bottom borders at 50% of the text colour (the perforation). An optional mono serial follows at 11px, 80% opacity.
- **Use:** every regulated state (cleared, pending, denied, expired, kill switch on/off) and the page state beside the title. The release bar enlarges it to 36px and 16px.
- **Status word:** in table status columns, the square dot plus the word in the state colour at 13px medium, in place of a stamp.

### Cards / Containers
- **Product card:** square thumbnail with a 1px hairline ring that turns ink on hover; product name 15px semibold underlined on hover; a fact table below (label left in ink-two, mono value right, hairline rows, price last).
- **Placeholder art (spec tile):** a well-filled square with the product name in sign lettering and a short mono spec list. Never invented data.
- **Storefront band:** white plate at 4px with an inset hairline ring.
- **Platform list band / table panel:** 6px card with a border, hairline-divided rows, no stacked cards.

### Inputs / Fields
- **Style:** 48px, 4px, white with a hairline border, 16px text on phone (15px from sm), ink-three placeholder; hover firms the border to ink-three.
- **Focus:** border turns to the logo accent with a 2px accent-tint ring.
- **Disabled:** 60% opacity.

### Navigation
- **Storefront:** sticky 32px strip on white stating "Adults 21+ only" (and the delivery signature note from sm), over a 64px white bar with the logo, category links, Account and Bag (count in mono). Side menu below lg.
- **Window departments:** the hero's department list, each a 52px (60px from sm) row between glass hairlines in sign lettering, the first in gold and the rest white, turning gold on hover with an arrow that nudges right 4px over 150ms.
- **Footer:** a glass band with the logo sign and gold column heads over 14px white-80% links that underline on hover.
- **Platform tabs:** underline tabs on a hairline; 36px (40px on phone), 13px medium muted, the current tab in ink with a 2px ink underline; counts at 11px tabular. Extra filter groups fold into a compact select row.

### Release Bar (platform signature)
A full-width 6px panel: a large stamp stating the sales state, the reason in 14px (the first blocker and how many more), and, divided by a hairline, a kill switch row per merchant profile with its on/off stamp, the profile name and its control. Launch steps follow as an ordered list: mono step number, severity stamp, title and detail, and its fix link.

### Age Gate
A glass plate (440px max, 4px) over a 70% glass scrim: the store name in gold sign lettering, a hairline, a mono 21+ at 44px with "Age required", the question at 20px semibold, and two 48px buttons (glass secondary No, gold Yes).

## Do's and Don'ts

### Do:
- **Do** open the storefront home on the glass window band with the store name in gold leaf, then step to white shelves.
- **Do** keep the neon to a single flat line in the logo hue per screen, on glass.
- **Do** set every strength, size, price and serial in the mono face with tabular figures.
- **Do** show every compliance state as a stamp or status word with its word; pair each blocker with its fix link.
- **Do** order blockers and queues by severity, not alphabetically.
- **Do** keep platform tables at 36px rows with sticky headers and visible mono serials.

### Don't:
- **Don't** round anything past 6px; no pill tabs, chips, badges or cards on either surface.
- **Don't** paint gold leaf as a gradient.
- **Don't** use stamp green, ochre or red for anything that is not a state, or show a state as colour alone.
- **Don't** use Info Blue for a regulated state.
- **Don't** lift resting cards with shadows; shadows are for overlays and the selected checkout option.
- **Don't** set body copy, labels or buttons in Big Shoulders.
