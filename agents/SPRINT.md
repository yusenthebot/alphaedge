# Sprint — Cycle 10 [21:26:19]

# SPRINT 10

## Task 1: Fix RSI labels Chinese → English
File: `src/frontend/src/app/dashboard/page.tsx`
Change: In `rsiLabel()` (lines 58–62), replace `"超卖"` → `"OVERSOLD"`, `"超买"` → `"OVERBOUGHT"`, `"中性"` → `"NEUTRAL"`. On line 182 where RSI value is displayed, append the label: `{signal.sources.rsi} <span style={{opacity:0.5}}>{rsiLabel(signal.sources.rsi)}</span>`.
Done when: RSI badge shows English label (e.g. "32.5 OVERSOLD") with no Chinese text remaining.

## Task 2: Add AbortController to NewsFeed fetch
File: `src/frontend/src/components/NewsFeed.tsx`
Change: In the `useEffect` that calls `fetchNews`, create an `AbortController`, pass `{ signal: controller.signal }` to the `fetch()` call, and return a cleanup function that calls `controller.abort()`. Wrap the catch block to ignore `AbortError` (do not set state or log on abort).
Done when: Navigating away mid-fetch produces no React state-update warnings; fetch is cancelled on unmount.