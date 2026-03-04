# Design — Cycle 3 [20:43:00]

## Task 1: Remove duplicate SignalStrengthBar in signal cards
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Delete lines 195 (`<SignalStrengthBar value={signal.strength || 50} signal={signal.signal} />`) — the RSI/MACD row already has a strength bar at line 185 (top-right). Two bars per card is redundant and clutters the layout.
Why: Duplicate strength indicators waste vertical space and confuse the visual hierarchy.

## Task 2: Fix invisible timestamp in MarketOverview
File: `src/frontend/src/components/MarketOverview.tsx`
Change: Line 91, replace `text-[#333]` with `text-[var(--pixel-text-muted)]` on the `<span>` wrapping the clock icon and time.
Why: `#333` is nearly invisible on the dark CRT background — should use the standard muted text token for readability.