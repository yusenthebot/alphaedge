# Engineer Task — Cycle 15

# Sprint — Cycle 15 [21:52:18]

# SPRINT 15

## Task 1: Fix sort dropdown shadow using stale green
File: `src/frontend/src/app/dashboard/page.tsx:331`
Change: Replace `boxShadow: "4px 4px 0px rgba(0,255,65,0.1)"` with `boxShadow: "4px 4px 0px rgba(0,212,255,0.1)"`
Done when: Sort dropdown shadow uses cyan `rgba(0,212,255,0.1)` instead of green `rgba(0,255,65,0.1)`.

## Task 2: Fix ALL filter tab using stale green
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Find the "ALL" filter tab/button styling that still uses the old green theme color (`#00FF41` or `rgba(0,255,65,...)`) and update it to the cyan theme equivalent (`#00D4FF` or `rgba(0,212,255,...)`).
Done when: The ALL filter tab's colors (background, border, glow, or shadow) use cyan theme values instead of legacy green.

Design context: # Design — Cycle 15 [21:50:31]

## Task 1: Sort dropdown shadow uses stale green
File: `src/frontend/src/app/dashboard/page.tsx:331`
Change: `boxShadow: "4px 4px 0px rgba(0,255,65,0.1)"` → `"4px 4px 0px rgba(0,212,255,0.1)"`
Why: Dropdown shadow still glows green from the old theme; should match the

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c15): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
