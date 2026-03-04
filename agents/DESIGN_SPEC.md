# Design — Cycle 10 [21:25:13]

## Task 1: Fix RSI Chinese labels → English
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Lines 58–62 — replace Chinese strings in `rsiLabel()`:
- `"超卖"` → `"OVERSOLD"`
- `"超买"` → `"OVERBOUGHT"`
- `"中性"` → `"NEUTRAL"`

Also display the label next to the RSI value on line 182: `{signal.sources.rsi} <span style={{ color: rsiColor, fontSize:'0.5rem' }}>{rsiTag}</span>` (destructure `label` at line 120).
Why: BUG-07 — Chinese characters break the English pixel-art aesthetic and confuse non-Chinese users.

## Task 2: Add CRT scanline hover effect on signal cards
File: `src/frontend/src/app/globals.css` (or wherever CRT styles live)
Change: Add to signal card's outer `div` a class `signal-card-hover` with CSS:
```css
.signal-card-hover:hover::after {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px);
  opacity: 0.5;
  pointer-events: none;
  animation: scanlineFlicker 0.3s ease-in-out;
}
```
Apply `signal-card-hover` class + `position: relative` to the card wrapper in `SignalCard` (line 123).
Why: FEAT-05 — intensifying scanlines on hover reinforces the CRT terminal theme on interaction.