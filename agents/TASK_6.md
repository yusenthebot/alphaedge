# Engineer Task — Cycle 6

# Sprint — Cycle 6 [21:03:56]

Here's the sprint:

---

# SPRINT 6

## Task 1: Replace RadialBarChart Gauge with SignalStrengthBar on ticker detail page
File: `src/frontend/src/app/ticker/[ticker]/page.tsx`
Change: Delete the `Gauge` component (lines 80–98) and its `RadialBarChart`, `RadialBar`, `PolarAngleAxis` imports (lines 15–17). Replace the `<Gauge value={signal.strength} color={cfg.color} label="Strength" sublabel="/ 100" />` call site (line 254) with `<SignalStrengthBar value={signal.strength} max={100} />`. Import `SignalStrengthBar` from `@/components/SignalStrengthBar`. Remove any other unused Recharts imports.
Done when: No `Gauge` component or `RadialBarChart` imports remain in the file; ticker detail page renders strength using `SignalStrengthBar`; build has 0 TypeScript erro

Design context: # Design — Cycle 6 [21:01:22]

## Task 1: Replace circular RadialBarChart gauges on ticker detail page
File: `src/frontend/src/app/ticker/[ticker]/page.tsx` (lines 80–98 definition, used at ~325, 331, 349)
Change: Delete the `Gauge` component that wraps `<RadialBarChart>/<RadialBar>/<PolarAngleAxis>

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c6): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
