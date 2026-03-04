# Engineer Task — Cycle 13

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

Design context: # Design — Cycle 13 [21:40:21]

## Task 1: Fix RSI color mismatch (dashboard vs ticker detail)
**File:** `src/frontend/src/app/dashboard/page.tsx` (lines 58–62, `rsiLabel()`)
**Change:** Replace `#22C55E` → `#00FF41` and `#EF4444` → `#FF3131` in `rsiLabel()` to use the project's CRT palette (`--pixe

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c13): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
