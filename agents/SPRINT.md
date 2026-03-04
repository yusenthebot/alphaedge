# Sprint — Cycle 1 [20:32:33]

# SPRINT 1

## Task 1: Add `res.ok` guards to all unsafe fetch calls
File: `src/frontend/src/app/ticker/[ticker]/page.tsx`, `src/frontend/src/app/dashboard/page.tsx`, `src/frontend/src/app/alerts/page.tsx`, `src/frontend/src/components/NewsFeed.tsx`, `src/frontend/src/components/MarketOverview.tsx`, `src/frontend/src/components/SearchBar.tsx`, `src/frontend/src/components/LivePreview.tsx`
Change: After every `fetch()` call, add `if (!res.ok) throw new Error(\`HTTP ${res.status}\`)` before calling `.json()`. 11 unsafe calls total across 7 files. Ticker page (lines 143-144): check `histRes.ok` and `sigRes.ok`. Dashboard (lines 457, 476, 487): check each `res.ok`. Alerts (line 115), NewsFeed (line 23), MarketOverview (line 53), SearchBar (line 90), LivePreview (line 25): same pattern. Portfolio and accuracy pages are already safe — skip them.
Done when: Every `fetch().json()` call is preceded by a `res.ok` check; a simulated 500 response triggers the existing error/catch UI instead of a JSON parse crash.

## Task 2: Replace StrengthRing with SignalStrengthBar
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Import `SignalStrengthBar` from `../../components/PixelProgress`. Replace `<StrengthRing>` at lines 240 and 330 with `<SignalStrengthBar value={signal.strength} signal={signal.signal} />`. Delete the `StrengthRing` function (line 116). Add `animate` prop: `animate={true}`.
Done when: Dashboard signal cards show horizontal segmented pixel bars instead of radial charts; no TypeScript errors.