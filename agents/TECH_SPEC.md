# Tech — Cycle 10 [21:26:07]

## Tech Priority: AbortController on NewsFeed fetch

**File:** `src/frontend/src/components/NewsFeed.tsx`

**Issue:** `fetchNews` has no `AbortController` — if the component unmounts mid-fetch (e.g. page navigation), React will attempt `setState` on an unmounted component causing a memory leak. The recent c9 commit added `AbortController` to `LivePreview` for the same reason, but `NewsFeed` was missed. Its 60s polling interval makes in-flight requests during unmount likely.

**Fix:** Wire an `AbortController` into the `useEffect`, pass its signal to `fetch`, and ignore `AbortError` in the catch block:

```tsx
useEffect(() => {
  const ctrl = new AbortController();
  const run = async () => {
    try {
      const res = await fetch("/api/news", { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNews(data.news ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("news fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  run();
  const iv = setInterval(run, POLL_INTERVAL);
  return () => { ctrl.abort(); clearInterval(iv); };
}, []);
```

**Test:** `npm run build` — zero TS errors; navigate away from dashboard during loading to confirm no React warnings in console.