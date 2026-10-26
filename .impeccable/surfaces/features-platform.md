---
version: 1
slug: "features-platform"
primary_target: "features/platform"
related_targets: []
---

# Surface: vape platform pages (`features/platform/**`)

Mode: Operate. Users: shop owner/manager, compliance lead, fulfilment staff. Job: know whether the shop can sell right now, clear the next blocker, and work the queues (unclassified variants, missing approvals, held orders, ledger denials). Constraints: shared dashboard shell fixed and byte-identical to E-commerce; owner bans pill or heavily rounded tabs, chips and cards (radii ≤6px, flat or underline tabs, dense tables, real status columns). Inferred without interview (owner ordered no approval stage).

## Direction contract
THESIS: The excise stamp. Regulated product is cleared one serial-numbered, colour-coded stamp at a time; every compliance state on these pages is a small stamp plate (perforated edge, state colour, serial) carrying its word, and every page opens on the release state and the ordered list of what still needs a stamp, instead of the category default of a settings page of recessed pill filters over rounded list bands.
OWN-WORLD: Shell neutrals, carbon ink, stamp colours used only for state: cleared green oklch(0.48 0.1 160), pending ochre oklch(0.7 0.13 75), denied red oklch(0.52 0.17 27), void grey. Geist for UI at 12/13/14/20/24px, Geist Mono for serials and record ids. 4px controls, 6px panels, underline tabs, hairline tables with sticky headers; stamps 2px with a perforated top and bottom edge.
STORY: The operator sees the release bar (selling or not, why, kill switch state with its action), then the blockers in severity order each with its fix, then the queue for this page as a table, and the full record below.
FIRST VIEWPORT: Title and one primary action; a full-width release bar on Overview and Compliance Center; on every list page a "needs you" queue table first, then underline status tabs, search and the full table; filter groups beyond one row fold into a compact select row.
FORM: candidate 7 of 7 (state excise tax stamps), seed:798b96efc46301f0. Raises: from brand-identity-canon-saville-catalog-sleeve, every record shows its catalog number (serial ids visible in mono on every row); from notation-diagram-systems-star-atlas, rank by magnitude (blockers and queues ordered by severity, not alphabet); from ikeda-datamatics, density courage (tables at 36px rows, no padding bands). Declined: wayfinding-cartography-signage-terminal-yellow-wayfinding, rw-manual-acetate-tab-board, emigre-bitmap-specimen.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
