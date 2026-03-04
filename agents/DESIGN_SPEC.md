# Design — Cycle 4 [20:48:41]

## Task 1: Fix invisible heatmap timestamp
File: `src/frontend/src/components/MarketOverview.tsx`
Change: Line 92 — replace `text-[#333]` with `text-[var(--pixel-text-muted)]`
Why: `#333` on the dark CRT background is effectively invisible; should use the design system's muted text token.

## Task 2: Replace Chinese MACD labels with English
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Lines 123–134 in `MacdBadge` — replace `macd === "金叉"` / `"死叉"` checks with a mapping that displays `BULLISH` / `BEARISH`, and line 133 render `{englishLabel}` instead of raw `{macd}`. Also update `rsiLabel` (lines 64–68) to return `"Oversold"` / `"Overbought"` / `"Neutral"` since those strings could leak if the function is reused.
Why: Chinese-language indicators break the English CRT terminal aesthetic and confuse non-Chinese-reading users.