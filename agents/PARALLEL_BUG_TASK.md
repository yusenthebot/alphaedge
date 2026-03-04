# PARALLEL BUG-FIX ENGINEER — AlphaEdge
# Fix these SPECIFIC bugs observed in screenshots. Build must pass at end.

## Project
- Root: ~/Projects/alphaedge
- Frontend: ~/Projects/alphaedge/src/frontend (Next.js 16 + Tailwind v4)
- CSS vars: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-text(#C8E6C9)
- NO border-radius anywhere
- Components: PixelBorder, PixelProgress (has SignalStrengthBar), PixelText

## BUG-01: RSI value shows "中" instead of number
In dashboard/page.tsx, find where RSI is displayed and fix to show numeric value.
Search for "中" in that file and replace with actual RSI numeric value reference.

## BUG-02: Signal cards lower rows still have circular/radial RSI gauges
In dashboard/page.tsx, any remaining <RadialBarChart>, <PieChart>, or circular SVG gauge
that shows RSI — replace with:
```tsx
import { SignalStrengthBar } from '../../components/PixelProgress'
<SignalStrengthBar value={signal.strength || 50} signal={signal.signal} />
```

## BUG-03: "STRONGEST SIGNAL TODAY" progress bar — wrong color
Find the confidence/strength progress bar in the TopSignal or strongest-signal section.
Make sure it uses: style={{ background: 'var(--pixel-buy)' }} 
or className with the correct pixel color.

## BUG-04: Remove stray "N" icon 
Search dashboard/page.tsx and layout.tsx for any lone "N" character, <span>N</span>,
or icon that appears in bottom-left. Remove it.

## BUG-05: Market Heatmap tiles show blank
In dashboard/page.tsx, find the MARKET HEATMAP section.
If tiles are empty, ensure the mock data array includes at least 8 stocks:
[{symbol:'AAPL', change:0.8}, {symbol:'MSFT', change:1.35}, {symbol:'NVDA', change:-1.22},
 {symbol:'GOOGL', change:0.4}, {symbol:'META', change:0.23}, {symbol:'TSLA', change:-2.7},
 {symbol:'AMD', change:-2.89}, {symbol:'SPY', change:-0.88}]
Each tile: background color based on change % (green if positive, red if negative).
Tile content: ticker symbol + change% in pixel font.

## BUG-06: Add Live Ticker Tape at top of dashboard
Add a horizontally scrolling ticker above the BUY/HOLD/SELL summary bar.
```tsx
// In dashboard/page.tsx, insert before the summary stats div:
<div style={{
  overflow: 'hidden', 
  borderBottom: '1px solid var(--pixel-border)',
  background: 'var(--pixel-surface)',
  padding: '4px 0',
  fontFamily: 'var(--font-pixel)',
  fontSize: '8px',
  color: 'var(--pixel-text)',
}}>
  <div style={{ 
    display: 'inline-block',
    whiteSpace: 'nowrap',
    animation: 'tickerScroll 30s linear infinite',
  }}>
    {'MSFT ▲1.35% BUY ◆ NVDA ▼1.22% HOLD ◆ AAPL ▲0.80% HOLD ◆ AMD ▼2.89% HOLD ◆ META ▲0.23% HOLD ◆ TSLA ▼2.70% HOLD ◆ SPY ▼0.88% HOLD ◆ '.repeat(3)}
  </div>
</div>
```
Add to globals.css: `@keyframes tickerScroll { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`

## AFTER ALL FIXES:
1. cd ~/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -10
2. Fix ALL TypeScript errors before proceeding
3. cd ~/Projects/alphaedge && git add -A && git commit -m "fix: critical UI bugs - RSI gauges, heatmap, ticker tape, color fixes"
4. Write completion summary to: ~/Projects/alphaedge/agents/BUG_FIX_DONE.md
