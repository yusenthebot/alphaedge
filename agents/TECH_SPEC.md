# Tech — Cycle 4 [20:50:06]

## Tech Priority: AbortController missing on ticker page fetches

**File:** `src/frontend/src/app/ticker/[ticker]/page.tsx` (~line 137–164)

**Issue:** `fetchData` has no `AbortController` — navigating away or changing ticker mid-flight causes state updates on an unmounted component (memory leak + potential React warnings). The function also isn't wrapped in `useCallback`, and the exhaustive-deps lint rule is suppressed to hide it. Dashboard already uses the correct pattern (line 441).

**Fix:** Create `AbortController` in the `useEffect`, pass `signal` to both `fetch` calls, abort in cleanup. Wrap `fetchData` in `useCallback` and remove the lint suppression.

**Test:** 
1. Navigate to `/ticker/AAPL`, immediately click back — no console warnings.  
2. Rapid ticker switches produce no stale data flashes.  
3. Build still passes (`npm run build`).

Want me to implement this fix?