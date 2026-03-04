# PARALLEL FEATURE ENGINEER — AlphaEdge
# Add cool pixel art animations and effects. Build must pass at end.

## Project
- Root: ~/Projects/alphaedge  
- Frontend: ~/Projects/alphaedge/src/frontend (Next.js 16 + Tailwind v4)
- globals.css: ~/Projects/alphaedge/src/frontend/src/app/globals.css
- CSS vars: --pixel-buy(#00FF41), --pixel-sell(#FF3131), --pixel-hold(#FFB800), --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-border(#00FF41), --pixel-text(#C8E6C9)
- Font: var(--font-pixel) = Press Start 2P, font-mono = Geist Mono

## FEATURE-01: Matrix Rain on Landing Page
File: src/frontend/src/app/page.tsx
Add a matrix digital rain canvas behind the hero section:

```tsx
'use client'
// Add this MatrixRain component at TOP of page.tsx:
import { useEffect, useRef } from 'react'

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const cols = Math.floor(canvas.width / 16)
    const drops = Array(cols).fill(0).map(() => Math.random() * -50)
    const chars = '01アイウエオABCDEF▲▼◆█░▓'
    let raf: number
    const draw = () => {
      ctx.fillStyle = 'rgba(6,10,6,0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#00FF41'
      ctx.font = '12px monospace'
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.globalAlpha = Math.random() * 0.8 + 0.2
        ctx.fillText(char, i * 16, y * 16)
        drops[i] = y > canvas.height / 16 + Math.random() * 20 ? 0 : y + 1
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.4, pointerEvents:'none' }} />
}
```

In the hero section JSX, add `position: 'relative'` to the outer div and insert `<MatrixRain />` as first child.

## FEATURE-02: Price Flash Animation
File: src/frontend/src/app/globals.css

Add these keyframes and classes:
```css
@keyframes priceUp {
  0%, 100% { color: var(--pixel-text); text-shadow: none; }
  20% { color: var(--pixel-buy); text-shadow: 0 0 16px var(--pixel-buy); }
}
@keyframes priceDown {
  0%, 100% { color: var(--pixel-text); text-shadow: none; }
  20% { color: var(--pixel-sell); text-shadow: 0 0 16px var(--pixel-sell); }
}
.price-flash-up { animation: priceUp 0.8s ease-out; }
.price-flash-down { animation: priceDown 0.8s ease-out; }

@keyframes tickerScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-33.33%); }
}

@keyframes signalPulseRing {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}
.signal-pulse-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid var(--pixel-buy);
  animation: signalPulseRing 1.2s ease-out infinite;
  pointer-events: none;
}
.signal-pulse-ring-2 {
  animation-delay: 0.4s;
}
.signal-pulse-ring-3 {
  animation-delay: 0.8s;
}

@keyframes glitchText {
  0%, 90%, 100% { clip-path: none; transform: none; color: var(--pixel-sell); }
  91% { clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%); transform: translateX(-2px); color: #ff0000; }
  93% { clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); transform: translateX(2px); color: #ff6666; }
  95% { clip-path: none; transform: none; }
}
.glitch-sell {
  animation: glitchText 3s infinite;
  position: relative;
}

@keyframes bootType {
  from { width: 0; }
  to { width: 100%; }
}
.boot-line {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid var(--pixel-buy);
  animation: bootType 0.8s steps(40, end) forwards;
}

@keyframes scanlineIntensify {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.08; }
}
.pixel-panel:hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,255,65,0.06) 2px,
    rgba(0,255,65,0.06) 4px
  );
  pointer-events: none;
  animation: scanlineIntensify 0.3s ease;
}

@keyframes dataStream {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}
.news-item-enter {
  animation: dataStream 0.4s ease-out forwards;
}

@keyframes numberCount {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.number-animate {
  animation: numberCount 0.3s ease-out;
}
```

## FEATURE-03: Glitch effect on SELL badges
File: src/frontend/src/app/dashboard/page.tsx
Find where SELL badges render (signal === 'SELL' or signal === 'sell').
Add `className="glitch-sell"` to the signal badge/text for SELL signals.

## FEATURE-04: Pulse rings on high-confidence BUY signals  
File: src/frontend/src/app/dashboard/page.tsx
In the signal card rendering, when `signal.signal === 'BUY' && signal.strength > 75`:
Wrap the card's outer div with `position: 'relative'` and add inside:
```tsx
{signal.signal === 'BUY' && signal.strength > 75 && (
  <>
    <div className="signal-pulse-ring" />
    <div className="signal-pulse-ring signal-pulse-ring-2" />
    <div className="signal-pulse-ring signal-pulse-ring-3" />
  </>
)}
```

## FEATURE-05: Boot sequence on landing page
File: src/frontend/src/app/page.tsx
Add a boot sequence component that shows for 2.5s before the main content:
```tsx
function BootSequence({ onDone }: { onDone: () => void }) {
  const lines = [
    'ALPHAEDGE v2.0 INITIALIZING...',
    'LOADING MARKET DATA FEEDS...',
    'CONNECTING TO SIGNAL ENGINE...',
    'CALIBRATING RSI THRESHOLDS...',
    'MARKET CONNECTION ESTABLISHED.',
    '> READY'
  ]
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{ position:'fixed', inset:0, background:'var(--pixel-bg)', zIndex:9999, display:'flex', flexDirection:'column', justifyContent:'center', padding:'2rem', fontFamily:'var(--font-pixel)', fontSize:'10px', color:'var(--pixel-buy)' }}>
      {lines.map((line, i) => (
        <div key={i} className="boot-line" style={{ animationDelay: `${i * 0.4}s`, marginBottom:'12px', animationFillMode:'both' }}>
          {line}
        </div>
      ))}
    </div>
  )
}
```
In the main page component, add `const [booting, setBooting] = useState(true)` and render `{booting && <BootSequence onDone={() => setBooting(false)} />}` before main content.

## AFTER ALL FEATURES:
1. cd ~/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -15
2. Fix ALL TypeScript errors (do NOT skip)
3. cd ~/Projects/alphaedge && git add -A && git commit -m "feat: pixel animations - matrix rain, boot sequence, glitch, pulse rings, scanlines"
4. Write completion summary to: ~/Projects/alphaedge/agents/FEATURE_DONE.md
