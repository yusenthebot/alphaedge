# Round 3 — Visual Polish + Remaining Bugs
# Focus: Heatmap colors, signal card sparklines, landing page, pulse rings on BUY

## Project
- Root: ~/Projects/alphaedge
- Frontend: ~/Projects/alphaedge/src/frontend
- CSS vars: --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-text(#C8E6C9)

## TASK-01: Fix MarketOverview heatmap tile colors
File: src/frontend/src/components/MarketOverview.tsx
Problem: Heatmap tiles show as gray/blank even after fallback data fix. The tiles need visible colored backgrounds.
Fix: For each heatmap tile, set inline background based on change%:
```tsx
const tileColor = item.change > 2 ? '#003D00' : item.change > 0 ? '#001A00' : item.change < -2 ? '#3D0000' : '#1A0000'
const textColor = item.change > 0 ? 'var(--pixel-buy)' : 'var(--pixel-sell)'
// Apply as: style={{ background: tileColor, border: '1px solid ' + textColor, padding: '8px', fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
```
Each tile shows: symbol (top), change% (bottom, colored)
Also make the heatmap section visible height — add minHeight: '120px' to the grid container.

## TASK-02: Remove Recharts area/line charts from signal cards
File: src/frontend/src/app/dashboard/page.tsx
Problem: Each signal card (SignalCard component) still shows a dark Recharts AreaChart/LineChart for price history. This breaks the pixel art aesthetic.
Fix: Find the SignalCard component function. Remove or comment out any <AreaChart>, <LineChart>, <ResponsiveContainer> that renders inside the card. 
Replace with a simple ASCII sparkline using the history data:
```tsx
// Simple ASCII spark: take last 7 history points, normalize to 0-7 blocks
const spark = history.slice(-7).map(h => h.close)
const min = Math.min(...spark), max = Math.max(...spark)
const bars = ['▁','▂','▃','▄','▅','▆','▇','█']
const sparkline = spark.map(v => bars[Math.round((v-min)/(max-min||1)*7)] || '▄').join('')
// Display: <span style={{fontFamily:'monospace', color:'var(--pixel-buy)', fontSize:'10px', letterSpacing:'1px'}}>{sparkline}</span>
```
If history data isn't available, show: `'▄▄▄▄▄▄▄'` as placeholder.

## TASK-03: Add pulse rings on high-confidence BUY signal cards
File: src/frontend/src/app/dashboard/page.tsx
The CSS classes `signal-pulse-ring`, `signal-pulse-ring-2`, `signal-pulse-ring-3` are already defined in globals.css.
In the SignalCard component, when `signal.signal === 'BUY' && signal.strength > 70`:
Wrap the card's outermost div in a `<div style={{position:'relative'}}>` and add inside it (as first children):
```tsx
{signal.signal === 'BUY' && (signal.strength || 0) > 70 && (
  <>
    <div className="signal-pulse-ring" style={{borderColor:'var(--pixel-buy)'}} />
    <div className="signal-pulse-ring signal-pulse-ring-2" style={{borderColor:'var(--pixel-buy)'}} />
  </>
)}
```

## TASK-04: Add glitch effect to SELL signal badges  
File: src/frontend/src/app/dashboard/page.tsx
The CSS class `glitch-sell` is already defined in globals.css.
In SignalCard, when signal.signal === 'SELL', add className="glitch-sell" to the signal badge element (the <Badge> or <span> that shows "SELL").

## TASK-05: Fix landing page (/) to show actual landing content
File: src/frontend/src/app/page.tsx
Check if the root page redirects to /dashboard. If so, remove the redirect.
The page should show: boot sequence → matrix rain hero → landing content (features, pricing).
If page.tsx has `redirect('/dashboard')` or `permanentRedirect`, remove it.
Make sure the file has 'use client' at top since it uses useState for boot sequence.

## TASK-06: Make signal cards show MACD label properly
File: src/frontend/src/app/dashboard/page.tsx
In SignalCard, the MACD indicator should show a colored badge:
- MACD bullish → small badge with pixel-buy color, text "MACD ▲"  
- MACD bearish → small badge with pixel-sell color, text "MACD ▼"
- MACD neutral → amber color, text "MACD ─"

## AFTER ALL TASKS:
1. cd ~/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -10
2. Fix ALL TypeScript errors
3. cd ~/Projects/alphaedge && git add -A && git commit -m "fix: heatmap colors, ASCII sparklines, BUY pulse rings, SELL glitch, landing page"
4. echo "DONE" > ~/Projects/alphaedge/agents/ROUND3_DONE.md
