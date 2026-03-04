# Engineer Task — Cycle 9

# Sprint — Cycle 9 [21:22:01]

Sprint 9 is ready. Here's the output:

---

# SPRINT 9

## Task 1: Fix skeleton base component rounded corners
**File:** `src/frontend/src/components/ui/skeleton.tsx`
**Change:** On line 7, replace `rounded-md` with `rounded-none` in the `cn()` call. This single change sharpens all skeleton loaders app-wide.
**Done when:** `rounded-md` no longer appears in skeleton.tsx and build passes with 0 TypeScript errors.

## Task 2: Add AbortController to LivePreview fetch
**File:** `src/frontend/src/components/LivePreview.tsx`
**Change:** In the `useEffect` (line 23), create an `AbortController`, pass its `signal` to the `fetch()` call, and return a cleanup function that calls `controller.abort()`. In the `.catch()`, ignore `AbortError` so unmount doesn't log spurious

Design context: # Design — Cycle 9 [21:20:32]

## Task 1: Fix skeleton base component rounded corners
File: `src/frontend/src/components/ui/skeleton.tsx` line 7
Change: `rounded-md` → `rounded-none` in the base `cn()` call
Why: Every skeleton loader across the entire app inherits this class, so one fix sharpens all

Tech constraints:
- NO border-radius (pixel art = square corners)
- Colors: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#00FF41), --pixel-text-dim, --pixel-text-off, --pixel-text-muted
- Pixel font: font-[var(--font-pixel)] | Mono: font-mono | Data: pixel-data class
- Available components: PixelBorder, PixelProgress, PixelText (in src/components/)

Steps:
1. Implement BOTH tasks exactly as specified
2. Run: cd /Users/yusenthebot/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -5
3. Fix any TypeScript errors
4. Run: cd /Users/yusenthebot/Projects/alphaedge && git add -A && git commit -m "feat(c9): sprint tasks"
5. Write one line summary to /Users/yusenthebot/Projects/alphaedge/agents/ENGINEER_OUTPUT.md
