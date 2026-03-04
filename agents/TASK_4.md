# Engineer Task — Cycle 4

# Sprint — Cycle 4 [20:50:30]

Both issues confirmed. Here's the sprint:

---

# SPRINT 4

## Task 1: Fix invisible heatmap timestamp
File: `src/frontend/src/components/MarketOverview.tsx`
Change: Line 92 — replace `text-[#333]` with `text-[var(--pixel-text-muted)]`. The `#333` color is invisible against the dark CRT background.
Done when: The "Last updated" timestamp next to "Market Heatmap" is readable on the dark background.

## Task 2: Add AbortController to ticker page fetches
File: `src/frontend/src/app/ticker/[ticker]/page.tsx`
Change: In the `useEffect` (line 161–164), create an `AbortController`, pass its `signal` to both `fetch` calls inside `fetchData` (lines 140–141), and return a cleanup function that calls `controller.abort()`. Ignore `AbortError` in the catch block.
Done whe

Design context: # Design — Cycle 4 [20:48:41]

## Task 1: Fix invisible heatmap timestamp
File: `src/frontend/src/components/MarketOverview.tsx`
Change: Line 92 — replace `text-[#333]` with `text-[var(--pixel-text-muted)]`
Why: `#333` on the dark CRT background is effectively invisible; should use the design system

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c4): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
