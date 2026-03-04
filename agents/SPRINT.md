# Sprint — Cycle 7 [21:11:00]

Sprint ready. Here it is for your review:

---

# SPRINT 7

## Task 1: Replace PieChart with pixel-art horizontal stacked bar on Accuracy page
File: `src/frontend/src/app/accuracy/page.tsx`
Change: Remove `PieChart`, `Pie` imports (lines 14–15) and the `pieData` useMemo (lines 212–220). Replace the `<PieChart>` block (lines 410–438) with a horizontal stacked `<div className="flex h-8 w-full overflow-hidden">` where each segment (`BUY`, `HOLD`, `SELL`) is a `<div>` with `style={{ width: pct(totals.buy, totals.signals) + '%' }}` and background colors `bg-[#00ff41]` / `bg-[#FFB800]` / `bg-[#FF3131]`. Keep the legend row (lines 440–447) and the empty-state fallback. Remove `Cell` from the recharts import if no longer used elsewhere.
Done when: No `PieChart` or `Pie` imports remain; "Overall Distribution" panel shows a horizontal stacked bar with three colored segments and percentage labels; build has 0 TypeScript errors.

## Task 2: Fix rounded corners violating pixel-art theme in Accuracy charts
File: `src/frontend/src/app/accuracy/page.tsx`
Change: On line 395, change `radius={[4, 4, 0, 0]}` to `radius={[0, 0, 0, 0]}`. On line 429, change `borderRadius: 8` to `borderRadius: 0`. On line 153, change `rounded-md` to `rounded-none` in the SignalBadge component.
Done when: No `rounded-md`, `borderRadius: 8`, or non-zero `radius` values remain in the file; build has 0 TypeScript errors.

---

Need write permission to save to `agents/SPRINT.md`.