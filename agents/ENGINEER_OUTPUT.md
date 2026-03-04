# Engineer — Cycle 7 [21:13:13]
Build: PASS
Last commit: ff487cc feat(c7): sprint tasks - Replace PieChart with pixel-art stacked bar on Accuracy page - Remove PieChart/Pie/Cell imports and pieData useMemo - Fix rounded corners (radius, borderRadius, rounded-md → rounded-none) Build: 0 TypeScript errors, 13+ pages
Output excerpt:  `pieData` useMemo
- Replaced the donut chart in "Overall Distribution" with a horizontal stacked `<div>` showing BUY (green), HOLD (yellow), SELL (red) segments with percentage labels
- Kept the legend row with inline data

**Task 2 — Fix rounded corners:**
- `radius={[4, 4, 0, 0]}` → `radius={[0, 0, 0, 0]}` on the SELL bar
- `rounded-md` → `rounded-none` on SignalBadge
- `borderRadius: 8` was in
