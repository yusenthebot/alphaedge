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
Done when: Navigating away from a ticker page mid-fetch does not cause state updates on an unmounted component. Build passes with 0 TypeScript errors.