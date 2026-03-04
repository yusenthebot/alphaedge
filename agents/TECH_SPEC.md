# Tech — Cycle 3 [20:44:17]

Confirmed both bugs. Here's the priority:

## Tech Priority: Fix manual-refresh missing AbortSignal (BUG-1)

**File:** `src/frontend/src/app/dashboard/page.tsx:634`

**Issue:** The manual refresh button calls `fetchSignals(watchlist, true)` without passing the AbortController's signal. If the user changes their watchlist while a manual refresh is in-flight, the stale request won't cancel — it will resolve and overwrite the new watchlist's data with stale results. Every other call site (lines 462–463) correctly passes `controller.signal`.

**Fix:** Store the AbortController in a `useRef` so the refresh button can access the current signal:
```ts
const controllerRef = useRef<AbortController>();
// In the useEffect: controllerRef.current = controller;
// Line 634: fetchSignals(watchlist, true, controllerRef.current?.signal)
```

**Test:** 
1. Add 5+ tickers, click Refresh, immediately remove a ticker
2. Verify the response doesn't re-add the removed ticker's card
3. Check console: no fetch errors or stale state writes

**Bonus (1-line):** Also remove duplicate `SignalStrengthBar` at line 185 (BUG-2 from QA report) — leftover from the C1 StrengthRing refactor.