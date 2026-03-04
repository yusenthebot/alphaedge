# Sprint — Cycle 13 [21:42:40]

Here's the sprint — 1 task this cycle (CTO timed out, only 1 designer request):

---

# SPRINT 13

## Task 1: Fix RSI color mismatch — use CRT palette
File: `src/frontend/src/app/dashboard/page.tsx`
Change: In `rsiLabel()` (lines 58–62), replace the Tailwind default colors with the project's CRT variables: `#22C55E` → `#00FF88` (matches `--pixel-buy`) and `#EF4444` → `#FF3131` (matches `--pixel-sell`). Keep NEUTRAL at `#A0A0A0`.
Done when: OVERSOLD shows `#00FF88` and OVERBOUGHT shows `#FF3131`, matching the signal card and ticker detail colors exactly.

---

Only 1 task because the CTO timed out and the designer submitted a single fix. Clean 2-line change — engineer should be done in under a minute.