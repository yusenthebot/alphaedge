# Sprint — Cycle 15 [21:52:18]

# SPRINT 15

## Task 1: Fix sort dropdown shadow using stale green
File: `src/frontend/src/app/dashboard/page.tsx:331`
Change: Replace `boxShadow: "4px 4px 0px rgba(0,255,65,0.1)"` with `boxShadow: "4px 4px 0px rgba(0,212,255,0.1)"`
Done when: Sort dropdown shadow uses cyan `rgba(0,212,255,0.1)` instead of green `rgba(0,255,65,0.1)`.

## Task 2: Fix ALL filter tab using stale green
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Find the "ALL" filter tab/button styling that still uses the old green theme color (`#00FF41` or `rgba(0,255,65,...)`) and update it to the cyan theme equivalent (`#00D4FF` or `rgba(0,212,255,...)`).
Done when: The ALL filter tab's colors (background, border, glow, or shadow) use cyan theme values instead of legacy green.