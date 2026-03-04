# Tech — Cycle 11 [21:30:38]

## Tech Priority: LivePreview silent failure → blank state

**File:** `src/frontend/src/components/LivePreview.tsx`

**Issue:** When the API fetch fails (network error, 5xx), the `.catch()` at line 38 swallows the error. `loading` becomes `false`, `signals` stays `[]`, and users see an empty div — no cards, no error message, no retry option.

**Fix:** Add `error` state. On catch, set it. Render a retry button when errored:

```tsx
const [error, setError] = useState(false);
// in .catch():
.catch((err) => { if (err.name !== "AbortError") { console.error(err); setError(true); } })
// after loading check:
if (error) return (
  <div className="flex justify-center">
    <button onClick={() => { setError(false); setLoading(true); /* re-fetch */ }}
      className="text-xs text-[var(--pixel-muted)] hover:text-[var(--pixel-text)]">
      Failed to load signals — tap to retry
    </button>
  </div>
);
```

**Test:** Kill backend (`Ctrl+C`), reload landing page → should show retry message instead of blank space. Click retry after restarting backend → cards appear.