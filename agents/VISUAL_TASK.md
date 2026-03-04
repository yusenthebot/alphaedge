# Visual Enhancement Task — AlphaEdge
# Based on CRT_Pixel_技术清单.docx — 4 selected effects (tasteful, not cluttered)
# IMPORTANT: Keep data readable. These are atmosphere effects only.

## Project
- Frontend: ~/Projects/alphaedge/src/frontend
- globals.css: ~/Projects/alphaedge/src/frontend/src/app/globals.css
- layout.tsx: ~/Projects/alphaedge/src/frontend/src/app/layout.tsx
- page.tsx (landing): ~/Projects/alphaedge/src/frontend/src/app/page.tsx
- CSS vars: --pixel-bg(#060A06), --pixel-surface(#0B160B), --pixel-buy(#00FF41), --pixel-text(#C8E6C9)

---

## EFFECT-01: Subtle Screen Flicker (技术 #03)
File: src/frontend/src/app/globals.css

Add this keyframe + body rule (SUBTLE — max 2% opacity change, 4s interval):
```css
@keyframes crtFlicker {
  0%, 95%, 100% { opacity: 1; }
  96% { opacity: 0.98; }
  97% { opacity: 1; }
  98% { opacity: 0.985; }
}
body {
  animation: crtFlicker 4s infinite;
}
```
Note: body already has background-color set. Just ADD the animation, don't remove anything.

---

## EFFECT-02: SVG Static Noise Texture (技术 #04)
File: src/frontend/src/app/layout.tsx

After the existing CRT vignette div, add a noise overlay div:
```tsx
{/* CRT Static Noise */}
<div
  style={{
    position: 'fixed',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '256px 256px',
    animation: 'noiseShift 0.15s steps(1) infinite',
  }}
/>
```

Add to globals.css:
```css
@keyframes noiseShift {
  0%   { background-position: 0 0; }
  25%  { background-position: -64px 32px; }
  50%  { background-position: 32px -64px; }
  75%  { background-position: -32px -32px; }
  100% { background-position: 64px 16px; }
}
```

IMPORTANT: The noise div's opacity is 0.025 — barely visible, just adds texture. Do not increase it.

---

## EFFECT-03: Parallax Stars Background (技术 #26)
File: src/frontend/src/app/page.tsx

Add a ParallaxStars component (Canvas-based, 4 layers, mouse-reactive):
```tsx
function ParallaxStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let mouseX = 0, mouseY = 0
    let raf: number

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const W = canvas.width, H = canvas.height

    // 4 layers: [count, speed, size, opacity]
    const layers = [
      { stars: [] as {x:number,y:number}[], speed: 0.2, size: 1,   alpha: 0.3 },
      { stars: [] as {x:number,y:number}[], speed: 0.5, size: 1.5, alpha: 0.5 },
      { stars: [] as {x:number,y:number}[], speed: 1.0, size: 2,   alpha: 0.6 },
      { stars: [] as {x:number,y:number}[], speed: 1.8, size: 2.5, alpha: 0.8 },
    ]
    const counts = [80, 50, 25, 10]
    layers.forEach((l, i) => {
      for (let n = 0; n < counts[i]; n++) {
        l.stars.push({ x: Math.random() * W, y: Math.random() * H })
      }
    })

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      layers.forEach(l => {
        ctx.fillStyle = `rgba(0, 255, 65, ${l.alpha})`
        const ox = mouseX * l.speed * 12
        const oy = mouseY * l.speed * 8
        l.stars.forEach(s => {
          ctx.fillRect(
            Math.round(s.x + ox),
            Math.round(s.y + oy),
            l.size, l.size
          )
        })
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMouseMove) }
  }, [])
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.35,
        pointerEvents: 'none',
      }}
    />
  )
}
```

In the landing page hero section (the outermost hero div), add `position: 'relative'` if not already set, and insert `<ParallaxStars />` as the FIRST child inside the hero div (alongside the existing `<MatrixRain />`).

The two canvas layers stack nicely: matrix rain (opacity 0.4) + parallax stars (opacity 0.35) = layered depth.

---

## EFFECT-04: Scroll Fade-in for Landing Sections (技术 #13)
File: src/frontend/src/app/globals.css + src/frontend/src/app/page.tsx

Add to globals.css:
```css
.scroll-fade {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scroll-fade.visible {
  opacity: 1;
  transform: translateY(0);
}
```

In page.tsx, add a useEffect that sets up IntersectionObserver:
```tsx
useEffect(() => {
  if (booting) return
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible')
    }),
    { threshold: 0.15 }
  )
  document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el))
  return () => observer.disconnect()
}, [booting])
```

Then add `className="scroll-fade"` to:
1. The stats row div (73% accuracy, 2.4h, 500+ stocks, ~12 signals)
2. The "YOUR UNFAIR ADVANTAGE" features section div  
3. The "PRICING" section div
4. The footer div

---

## AFTER IMPLEMENTATION:
1. cd ~/Projects/alphaedge/src/frontend && npm run build 2>&1 | tail -8
2. Fix ALL TypeScript errors
3. cd ~/Projects/alphaedge && git add -A && git commit -m "feat: CRT visual polish - subtle flicker, SVG noise, parallax stars, scroll fade-in"
4. git push origin main
5. Write summary to ~/Projects/alphaedge/agents/VISUAL_DONE.md
