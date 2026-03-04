# Engineer Task — Cycle 10

# Sprint — Cycle 10 [21:26:19]

# SPRINT 10

## Task 1: Fix RSI labels Chinese → English
File: `src/frontend/src/app/dashboard/page.tsx`
Change: In `rsiLabel()` (lines 58–62), replace `"超卖"` → `"OVERSOLD"`, `"超买"` → `"OVERBOUGHT"`, `"中性"` → `"NEUTRAL"`. On line 182 where RSI value is displayed, append the label: `{signal.sources.rsi} <span style={{opacity:0.5}}>{rsiLabel(signal.sources.rsi)}</span>`.
Done when: RSI badge shows English label (e.g. "32.5 OVERSOLD") with no Chinese text remaining.

## Task 2: Add AbortController to NewsFeed fetch
File: `src/frontend/src/components/NewsFeed.tsx`
Change: In the `useEffect` that calls `fetchNews`, create an `AbortController`, pass `{ signal: controller.signal }` to the `fetch()` call, and return a cleanup function that calls `controller.abort()`

Design context: # Design — Cycle 10 [21:25:13]

## Task 1: Fix RSI Chinese labels → English
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Lines 58–62 — replace Chinese strings in `rsiLabel()`:
- `"超卖"` → `"OVERSOLD"`
- `"超买"` → `"OVERBOUGHT"`
- `"中性"` → `"NEUTRAL"`

Also display the label next to the RSI 

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c10): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
