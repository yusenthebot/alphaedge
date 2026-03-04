# Tech — Cycle 14 [21:46:57]

## Tech Priority: RSI OVERSOLD color mismatch

**File:** `src/frontend/src/app/dashboard/page.tsx:59`

**Issue:** Cycle 13 theme overhaul changed `--pixel-buy` from `#00FF41` to `#00FF88`, but the hardcoded OVERSOLD color in `rsiLabel()` still uses the stale `#00FF41`. Visual inconsistency — OVERSOLD badges show old green instead of the new cyan-green used everywhere else.

**Fix:** Line 59, change `#00FF41` → `#00FF88`:
```ts
if (rsi < 30) return { label: "OVERSOLD", color: "#00FF88" };
```

**Test:** 
1. `npm run build` — confirm no regression
2. Dashboard → find any ticker with RSI < 30 → OVERSOLD badge should render `#00FF88` matching the buy-signal color across the app