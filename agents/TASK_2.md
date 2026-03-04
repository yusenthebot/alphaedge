# Engineer Task — Cycle 2

# Sprint — Cycle 2 [20:39:33]

Clear picture. Here's the sprint:

# SPRINT 2

## Task 1: Add AbortController to cancel stale dashboard fetches
File: `src/frontend/src/app/dashboard/page.tsx:486-510`
Change: Add an `AbortController` parameter to `fetchSignals`. Pass `signal` to both the `/api/signals` fetch (line 489) and each `/api/history/{ticker}` fetch (line 477 via `fetchHistory`). In the `useEffect` at line 513-518, create an `AbortController`, pass it to `fetchSignals` and the interval calls, and call `controller.abort()` in the cleanup return. In the catch blocks, ignore `AbortError` (don't log it or set error state).
Done when: Rapidly toggling watchlist tickers produces no stale/out-of-order signal renders; only the latest request's data is applied.

## Task 2: Suppress AbortError

Design context: # Design — Cycle 2 [20:37:57]

[DESIGNER: timeout]

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c2): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
