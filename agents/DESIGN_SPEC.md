# Design — Cycle 8 [21:15:59]

## Task 1: Kill remaining rounded corners on portfolio signal badges & buttons
File: `src/frontend/src/app/portfolio/page.tsx`
Change: Replace `rounded-md` → `rounded-none` on signal badges (lines 532, 554) and `rounded` → `rounded-none` on trash buttons (lines 541, 562).
Why: Four elements still use soft corners, breaking the hard-edge pixel-art CRT aesthetic everywhere else.

## Task 2: Kill rounded corners on search result signal badges & skeleton
File: `src/frontend/src/components/SearchBar.tsx` (line 197) and `src/frontend/src/components/ui/skeleton.tsx` (line 7)
Change: Replace `rounded-md` → `rounded-none` in both files.
Why: Search result badges and loading skeletons still render with soft corners, inconsistent with the global `border-radius: 0px !important` intent.