# Engineer Task — Cycle 8

# Sprint — Cycle 8 [21:17:45]

# SPRINT 8

## Task 1: Kill remaining rounded corners on portfolio signal badges & buttons
File: `src/frontend/src/app/portfolio/page.tsx`
Change: Replace `rounded-md` → `rounded-none` on signal badges (lines 532, 554) and `rounded` → `rounded-none` on trash buttons (lines 541, 562).
Done when: All four elements render with sharp 0px corners; no `rounded-md` or `rounded` classes remain on signal badges or trash buttons in the portfolio page.

## Task 2: (CTO timed out — no tech task this cycle)

Only 1 task this sprint. Designer's request is clear and surgical; CTO provided no input before timeout.

Design context: # Design — Cycle 8 [21:15:59]

## Task 1: Kill remaining rounded corners on portfolio signal badges & buttons
File: `src/frontend/src/app/portfolio/page.tsx`
Change: Replace `rounded-md` → `rounded-none` on signal badges (lines 532, 554) and `rounded` → `rounded-none` on trash buttons (lines 541, 56

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c8): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
