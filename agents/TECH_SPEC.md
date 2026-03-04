# Tech — Cycle 2 [20:39:12]

## Tech Priority: AbortController for dashboard fetch race conditions

**File:** `src/frontend/src/app/dashboard/page.tsx:513-518`

**Issue:** When the watchlist changes, `fetchSignals` is called but the previous in-flight request isn't cancelled. Rapid watchlist edits (add/remove tickers) trigger overlapping fetches that resolve out-of-order, causing stale data to overwrite fresh data. The `Promise.all` for history (line 495-500) amplifies this — each watchlist change fires N+1 requests with no abort.

**Fix:** Add `AbortController` to the polling `useEffect`. Pass `signal` to every `fetch` call. Abort on cleanup:
```ts
useEffect(() => {
  const ac = new AbortController();
  setLoading(true);
  fetchSignals(watchlist, false, ac.signal);
  const iv = setInterval(() => fetchSignals(watchlist, false, ac.signal), POLL_INTERVAL);
  return () => { ac.abort(); clearInterval(iv); };
}, [watchlist, fetchSignals]);
```

**Test:** Add 3 tickers rapidly — verify only the final watchlist's data renders, no console errors.