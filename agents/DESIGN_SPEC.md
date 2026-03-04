# Design — Cycle 14 [21:45:44]

Here are two concrete improvements:

## Task 1: Fix rounded badge in SearchBar (breaks pixel aesthetic)
**File:** `src/frontend/src/components/SearchBar.tsx:218`
**Change:** Replace `rounded-md` with nothing (remove it) — the signal badge in the search preview uses a soft border-radius, which clashes with the hard-edged CRT pixel look every other badge in the app uses.
**Why:** Every dashboard signal badge uses square corners with `border-2`; this is the only badge with `rounded-md`, breaking visual consistency.

## Task 2: Add pixel-label class to RSI/MACD column for tighter hierarchy
**File:** `src/frontend/src/app/dashboard/page.tsx:179-189`
**Change:** On the `<div className="mb-3 flex items-center gap-3">` wrapper (line 179), add `justify-between` and move the confidence badge (`CONF`) onto the same row as RSI/MACD by pulling it out of the nested `space-y-1.5` div and placing it right-aligned — currently all three indicators (RSI, MACD, CONF) stack vertically wasting horizontal space in the card.
**Why:** Cards are narrow; putting CONF right-aligned on the RSI row uses whitespace better and reduces card height, fitting more content above the fold.