# Design — Cycle 15 [21:50:31]

## Task 1: Sort dropdown shadow uses stale green
File: `src/frontend/src/app/dashboard/page.tsx:331`
Change: `boxShadow: "4px 4px 0px rgba(0,255,65,0.1)"` → `"4px 4px 0px rgba(0,212,255,0.1)"`
Why: Dropdown shadow still glows green from the old theme; should match the cyan overhaul from C14.

## Task 2: ALL filter tab uses old green accent
File: `src/frontend/src/app/dashboard/page.tsx:37`
Change: `ALL: "#00AA2B"` → `ALL: "#00D4FF"`
Why: The ALL filter pill uses a dark green that clashes with the new cyan primary; every non-signal UI accent should be cyan.