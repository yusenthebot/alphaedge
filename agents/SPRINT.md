# Sprint — Cycle 3 [20:44:46]

Confirmed both issues. Here's the sprint:

---

# SPRINT 3

## Task 1: Fix manual-refresh missing AbortSignal (BUG)
File: `src/frontend/src/app/dashboard/page.tsx`
Change: On line 634, the manual refresh button calls `fetchSignals(watchlist, true)` without passing an `AbortSignal`. Create an `AbortController`, pass its `.signal` as the third argument: `fetchSignals(watchlist, true, controller.signal)`. Store the controller in a ref so clicking refresh again (or watchlist change) aborts the prior in-flight manual request.
Done when: Manual refresh passes an `AbortSignal` to `fetchSignals`, and rapid clicks or watchlist changes abort stale manual requests.

## Task 2: Remove duplicate SignalStrengthBar in signal cards
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Delete line 195 (`<SignalStrengthBar value={signal.strength || 50} signal={signal.signal} />`). The strength bar at line 185 (card header, top-right) already displays the same data. Keep the RSI/MACD row contents (lines 196–204) intact.
Done when: Each signal card renders exactly one `SignalStrengthBar` (the one at line 185), and the RSI/MACD row shows RSI value, MACD badge, and confidence without a second bar.