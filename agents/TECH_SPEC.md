# Tech — Cycle 1 [20:31:21]

## Tech Priority: Add `res.ok` checks to all fetch calls

**File:** `src/frontend/src/app/ticker/[ticker]/page.tsx:139-144`  
**Issue:** All API fetches (`ticker`, `dashboard`, `alerts`, `LivePreview`, `MarketOverview`, `NewsFeed`) parse JSON without checking HTTP status. A 500/404 response silently fails or produces garbage state — users see blank pages with no explanation.  
**Fix:** Add `if (!res.ok) throw new Error(...)` before every `.json()` call. The ticker page is the worst offender (2 parallel fetches, zero validation). Cascade the same pattern to dashboard, alerts, and components.  
**Test:** 
1. Stop the FastAPI backend, load `/ticker/AAPL` — should show a clear error message instead of a blank/broken page.  
2. Restart backend, confirm normal flow still works.  
3. `npm run build` — zero TS errors.

Want me to implement this fix across all affected files?