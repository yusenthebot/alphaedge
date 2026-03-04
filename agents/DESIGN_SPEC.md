# Design — Cycle 16 [21:55:37]

## Task 1: SearchBar skeleton loaders use soft corners
File: `src/frontend/src/components/SearchBar.tsx`
Change: Lines 189, 194, 206, 207 — replace `rounded` with `rounded-none`. Also line 263: change `hover:border-[#00FF41]/30` → `hover:border-[#00D4FF]/30`.
Why: Skeleton placeholders and dropdown still render with soft border-radius, breaking the pixel-sharp CRT aesthetic established everywhere else.

## Task 2: Dashboard BUY signal color not migrated
File: `src/frontend/src/app/dashboard/page.tsx`
Change: In `SIGNAL_CONFIG` (line ~31), replace all `#00FF41` with `#00FF88` for the BUY entry — bg, text class, glow rgba values, and border. Same for `FILTER_COLORS.BUY` (line ~38).
Why: Theme commit `5e95a72` defined buy signal as `#00FF88` (`--pixel-buy`), but the dashboard still uses the old `#00FF41` green, creating an inconsistent palette against the cyan theme.