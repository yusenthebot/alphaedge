# Sprint — Cycle 2 [20:39:33]

Clear picture. Here's the sprint:

# SPRINT 2

## Task 1: Add AbortController to cancel stale dashboard fetches
File: `src/frontend/src/app/dashboard/page.tsx:486-510`
Change: Add an `AbortController` parameter to `fetchSignals`. Pass `signal` to both the `/api/signals` fetch (line 489) and each `/api/history/{ticker}` fetch (line 477 via `fetchHistory`). In the `useEffect` at line 513-518, create an `AbortController`, pass it to `fetchSignals` and the interval calls, and call `controller.abort()` in the cleanup return. In the catch blocks, ignore `AbortError` (don't log it or set error state).
Done when: Rapidly toggling watchlist tickers produces no stale/out-of-order signal renders; only the latest request's data is applied.

## Task 2: Suppress AbortError logging in fetchSignals catch block
File: `src/frontend/src/app/dashboard/page.tsx:504-505`
Change: In the catch block of `fetchSignals`, check `if (err instanceof DOMException && err.name === 'AbortError') return;` before the `console.error` call. This prevents aborted requests from polluting the console.
Done when: Aborting an in-flight fetch does not log any error to the console.