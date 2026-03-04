# Sprint — Cycle 14 [21:47:11]

# SPRINT 14

## Task 1: Fix RSI OVERSOLD color mismatch
File: `src/frontend/src/app/dashboard/page.tsx:59`
Change: In `rsiLabel()`, replace hardcoded `#00FF41` with `#00FF88` to match the current `--pixel-buy` theme variable set in Cycle 13.
Done when: OVERSOLD badge color is `#00FF88`, consistent with the rest of the buy-signal palette.

## Task 2: Remove rounded badge in SearchBar
File: `src/frontend/src/components/SearchBar.tsx:218`
Change: On line 218, remove `rounded-md` from the signal badge className so it renders with sharp corners matching the pixel aesthetic.
Done when: Signal badge in search preview has no border-radius class.