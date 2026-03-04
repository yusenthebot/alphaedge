# Engineer Task — Cycle 11

# Sprint — Cycle 11 [21:30:58]

# SPRINT 11

## Task 1: LivePreview error state (bug fix)
File: `src/frontend/src/components/LivePreview.tsx`
Change: Add `const [error, setError] = useState(false);` next to line 21. In the `.catch()` at line 38, add `setError(true)` after the console.error. After the loading guard (line 51), add an error guard: `if (error) return <div className="text-center text-xs text-[#FF3131] py-4">Signal fetch failed — retrying…</div>;` — and wrap the fetch in a retry: on catch, `setTimeout(() => { setError(false); setLoading(true); /* re-run fetch */ }, 5000)`.
Done when: Network/5xx failure shows red error text instead of blank div, and auto-retries after 5s.

## Task 2: Dynamic ticker tape
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Replace the hardcode

Design context: # Design — Cycle 11 [21:29:39]

## Task 1: Dynamic ticker tape (replace hardcoded text)
File: `src/frontend/src/app/dashboard/page.tsx:670`
Change: Replace the hardcoded string `'MSFT ▲1.35% BUY ◆ NVDA ▼1.22% HOLD ◆ ...'` with a dynamic string built from the `signals` state: `signals.map(s => \`${s.

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c11): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
