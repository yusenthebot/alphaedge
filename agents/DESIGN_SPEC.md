# Design — Cycle 9 [21:20:32]

## Task 1: Fix skeleton base component rounded corners
File: `src/frontend/src/components/ui/skeleton.tsx` line 7
Change: `rounded-md` → `rounded-none` in the base `cn()` call
Why: Every skeleton loader across the entire app inherits this class, so one fix sharpens all loading states globally.

## Task 2: Fix SearchBar rounded corners (5 instances)
File: `src/frontend/src/components/SearchBar.tsx`
Change:
- Line 168: `rounded` → `rounded-none` (close button)
- Line 173: `rounded` → `rounded-none` (ESC hint badge)
- Line 185: `rounded` → `rounded-none` (skeleton loader 1)
- Line 186: `rounded` → `rounded-none` (skeleton loader 2)
- Line 197: `rounded-md` → `rounded-none` (signal badge in results)

Why: SearchBar is the last file with soft corners — these 5 fixes complete the sharp-pixel pass across the entire codebase.