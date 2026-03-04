# Design — Cycle 11 [21:29:39]

## Task 1: Dynamic ticker tape (replace hardcoded text)
File: `src/frontend/src/app/dashboard/page.tsx:670`
Change: Replace the hardcoded string `'MSFT ▲1.35% BUY ◆ NVDA ▼1.22% HOLD ◆ ...'` with a dynamic string built from the `signals` state: `signals.map(s => \`${s.ticker} ${s.change >= 0 ? '▲' : '▼'}${Math.abs(s.change).toFixed(2)}% ${s.signal}\`).join(' ◆ ')` repeated for seamless scroll.
Why: The ticker tape is frozen mock data that never reflects actual signal state.

## Task 2: Pixel-stepped summary mini bars
File: `src/frontend/src/app/dashboard/page.tsx:231`
Change: On the inner `<div>` fill bar (line 232), replace `background: color` with `background: repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 4px)` and add `imageRendering: 'pixelated'`.
Why: Smooth fill bars break the CRT pixel-art aesthetic — stepped blocks match the rest of the dashboard.