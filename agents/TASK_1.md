# Engineer Task — Cycle 1

# Sprint — Cycle 1 [20:32:33]

# SPRINT 1

## Task 1: Add `res.ok` guards to all unsafe fetch calls
File: `src/frontend/src/app/ticker/[ticker]/page.tsx`, `src/frontend/src/app/dashboard/page.tsx`, `src/frontend/src/app/alerts/page.tsx`, `src/frontend/src/components/NewsFeed.tsx`, `src/frontend/src/components/MarketOverview.tsx`, `src/frontend/src/components/SearchBar.tsx`, `src/frontend/src/components/LivePreview.tsx`
Change: After every `fetch()` call, add `if (!res.ok) throw new Error(\`HTTP ${res.status}\`)` before calling `.json()`. 11 unsafe calls total across 7 files. Ticker page (lines 143-144): check `histRes.ok` and `sigRes.ok`. Dashboard (lines 457, 476, 487): check each `res.ok`. Alerts (line 115), NewsFeed (line 23), MarketOverview (line 53), SearchBar (line 90), LivePreview (

Design context: # Design — Cycle 1 [20:30:14]

## Task 1: Signal strength animated pixel progress bars
File: `src/frontend/src/app/dashboard/page.tsx`
Change: In `SignalCard` (~line 250), replace the `<StrengthRing>` Recharts radial chart with `<SignalStrengthBar value={s.signal_strength} signal={s.signal} />` (alr

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c1): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
