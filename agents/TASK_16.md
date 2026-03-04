# Engineer Task — Cycle 16

# Sprint — Cycle 16 [21:57:27]

# SPRINT 16

## Task 1: SearchBar skeleton loaders and dropdown use pixel-sharp corners
File: `src/frontend/src/components/SearchBar.tsx`
Change: Lines 189, 194, 206, 207 — replace `rounded` with `rounded-none` on skeleton loader divs. Line 263 — change `hover:border-[#00FF41]/30` to `hover:border-[#00D4FF]/30` on the dropdown container.
Done when: All skeleton placeholders and the search dropdown render with sharp corners (no border-radius), and dropdown hover border uses cyan `#00D4FF` instead of green `#00FF41`.

## Task 2: SearchBar dropdown item hover uses stale green highlight
File: `src/frontend/src/components/SearchBar.tsx`
Change: Find any `hover:bg-[#00FF41]` or `hover:border-[#00FF41]` references on dropdown result items and replace the green `#00

Design context: # Design — Cycle 16 [21:55:37]

## Task 1: SearchBar skeleton loaders use soft corners
File: `src/frontend/src/components/SearchBar.tsx`
Change: Lines 189, 194, 206, 207 — replace `rounded` with `rounded-none`. Also line 263: change `hover:border-[#00FF41]/30` → `hover:border-[#00D4FF]/30`.
Why: Ske

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c16): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
