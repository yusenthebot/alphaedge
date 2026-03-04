# Design — Cycle 13 [21:40:21]

## Task 1: Fix RSI color mismatch (dashboard vs ticker detail)
**File:** `src/frontend/src/app/dashboard/page.tsx` (lines 58–62, `rsiLabel()`)
**Change:** Replace `#22C55E` → `#00FF41` and `#EF4444` → `#FF3131` in `rsiLabel()` to use the project's CRT palette (`--pixel-buy` / `--pixel-sell`) instead of Tailwind defaults.
**Why:** Dashboard RSI colors clash with the pixel art theme used everywhere else (ticker detail page already uses `#00FF41`/`#FF3131`).

## Task 2: Increase scanline opacity on signal cards
**File:** `src/frontend/src/app/dashboard/page.tsx` (line ~148, scanline overlay div)
**Change:** In the `repeating-linear-gradient`, change `rgba(0,0,0,0.03)` → `rgba(0,0,0,0.06)` to match the scanline intensity in `globals.css`.
**Why:** At 0.03 the CRT scanlines are invisible on cards, breaking the retro terminal look that the rest of the app achieves at 0.06.