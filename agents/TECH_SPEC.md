# Tech — Cycle 9 [21:21:28]

## Tech Priority: AbortController for LivePreview fetch

**File:** `src/frontend/src/components/LivePreview.tsx`  
**Issue:** `useEffect` fetch has no `AbortController` — if the component unmounts before the request completes, `setSignals()`/`setLoading()` fire on an unmounted component, causing a memory leak and React warnings.  
**Fix:** Add `AbortController`, pass its signal to `fetch`, abort on cleanup:

```tsx
useEffect(() => {
  const ac = new AbortController();
  fetch("/api/signals?tickers=NVDA,TSLA,AAPL,BABA,SPY", { signal: ac.signal })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(d => { setSignals((d.signals ?? []).map(…)); })
    .catch(() => {})
    .finally(() => setLoading(false));
  return () => ac.abort();
}, []);
```

**Test:** Navigate to landing page, quickly click away before signals load — no console warnings about unmounted state updates. Build passes (`npm run build`).