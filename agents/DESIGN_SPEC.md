# Design — Cycle 12 [21:34:33]

Now I have a clear picture. Here are my 2 picks:

---

## Task 1: Scanline overlay on signal cards
**File:** `src/frontend/src/app/dashboard/page.tsx`
**Change:** In `SignalCard` (line 146), add a CSS `::after` pseudo-element via an inline overlay div inside the card `<div>`: insert `<div className="pointer-events-none absolute inset-0" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }} />` as the first child of the card, and add `relative overflow-hidden` to the card's className.
**Why:** Reinforces the CRT aesthetic — every card gets subtle horizontal scanlines like a retro monitor, which is currently missing from the signal cards.

## Task 2: Pixelated box-shadow on SummaryBar stat boxes
**File:** `src/frontend/src/app/dashboard/page.tsx`
**Change:** In `SummaryBar` (line 222), on the stat `<div>`, add to the existing inline style: `boxShadow: \`4px 4px 0px ${color}33, inset 0 0 12px ${color}11\`` — a hard-offset shadow (no blur = pixel-perfect) plus faint inner glow.
**Why:** The 3 summary stat boxes currently look flat; a hard drop-shadow + inner glow gives them the chunky CRT-panel depth the rest of the dashboard has.