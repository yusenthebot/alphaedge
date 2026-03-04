# Tech — Cycle 12 [21:35:31]

## Tech Priority: SearchBar fetch abort on unmount

**File:** `src/frontend/src/components/SearchBar.tsx`
**Issue:** `fetchPreview` (line 87–99) fires a `fetch()` inside a `setTimeout` with no `AbortController`. When the search modal closes or the component unmounts, in-flight requests continue and call `setPreview`/`setLoadingPreview` on an unmounted component — causing React state-update-after-unmount warnings and a minor memory leak.

**Fix:** Create an `AbortController` in the `useEffect` cleanup scope. Pass its `signal` to `fetch`. Abort on unmount/close:

```tsx
// Add ref at component level
const abortRef = useRef<AbortController | null>(null);

// In fetchPreview, before fetch:
abortRef.current?.abort();
abortRef.current = new AbortController();
const res = await fetch(`/api/signals?tickers=${ticker}`, { signal: abortRef.current.signal });

// In the open useEffect cleanup (or a dedicated useEffect):
return () => { abortRef.current?.abort(); };
```

**Test:** Open SearchBar, type a ticker, immediately press Escape — no console warnings about unmounted state updates.