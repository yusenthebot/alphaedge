# Engineer Task — Cycle 3

# Sprint — Cycle 3 [20:44:46]

Confirmed both issues. Here's the sprint:

---

# SPRINT 3

## Task 1: Fix manual-refresh missing AbortSignal (BUG)
File: `src/frontend/src/app/dashboard/page.tsx`
Change: On line 634, the manual refresh button calls `fetchSignals(watchlist, true)` without passing an `AbortSignal`. Create an `AbortController`, pass its `.signal` as the third argument: `fetchSignals(watchlist, true, controller.signal)`. Store the controller in a ref so clicking refresh again (or watchlist change) aborts the prior in-flight manual request.
Done when: Manual refresh passes an `AbortSignal` to `fetchSignals`, and rapid clicks or watchlist changes abort stale manual requests.

## Task 2: Remove duplicate SignalStrengthBar in signal cards
File: `src/frontend/src/app/dashboard/page.

Design context: # Design — Cycle 3 [20:43:00]

## Task 1: Remove duplicate SignalStrengthBar in signal cards
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Delete lines 195 (`<SignalStrengthBar value={signal.strength || 50} signal={signal.signal} />`) — the RSI/MACD row already has a strength bar at line 1

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c3): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
