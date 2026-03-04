'use client'

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Newspaper, BarChart3, Bell, Zap, Check, TrendingUp } from "lucide-react";
import { LivePreview } from "@/components/LivePreview";
import { MarketStatus } from "@/components/MarketStatus";

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

const FEATURES = [
  {
    icon: Newspaper,
    tag: "01",
    title: "Jin10 Signal Engine",
    description:
      "Chinese financial news decoded into actionable US stock signals. Get the edge before the Western market reacts.",
  },
  {
    icon: BarChart3,
    tag: "02",
    title: "Technical Analysis",
    description:
      "RSI, MACD, and momentum indicators fused with sentiment for high-confidence BUY/HOLD/SELL signals.",
  },
  {
    icon: Bell,
    tag: "03",
    title: "Smart Alerts",
    description:
      "Instant notifications when signal strength crosses your threshold. Never miss a high-conviction move.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tag: "STARTER",
    color: "var(--pixel-text-off)",
    features: [
      "5 stock watchlist",
      "1-hour delayed signals",
      "Daily signal of the day",
      "Basic technical indicators",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    tag: "RECOMMENDED",
    color: "var(--pixel-buy)",
    features: [
      "Unlimited watchlist",
      "Real-time signals",
      "Jin10 + Reddit sentiment",
      "Advanced technical analysis",
      "Email & push alerts",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$79",
    period: "/month",
    tag: "POWER USER",
    color: "var(--pixel-accent)",
    features: [
      "Everything in Pro",
      "API access",
      "Custom signal weights",
      "Priority data feed",
      "1-on-1 onboarding",
    ],
    cta: "Contact Us",
    highlight: false,
  },
];

const STATS = [
  { label: "Signal Accuracy", value: "73%", color: "var(--pixel-buy)" },
  { label: "Avg Lead Time", value: "2.4h", color: "var(--pixel-accent)" },
  { label: "Stocks Covered", value: "500+", color: "var(--pixel-hold)" },
  { label: "Signals / Day", value: "~12", color: "var(--pixel-buy)" },
];

export default function LandingPage() {
  const [booting, setBooting] = useState(true)
  const handleBootDone = useCallback(() => setBooting(false), [])

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

  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] text-[var(--pixel-text)]">
      {booting && <BootSequence onDone={handleBootDone} />}

      {/* ── Nav ── */}
      <nav className="border-b-2 border-[var(--pixel-border-dim)] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center border-2 border-[var(--pixel-border)] bg-[var(--pixel-surface)]"
              style={{ boxShadow: "var(--pixel-glow-green)" }}
            >
              <Zap className="h-4 w-4 text-[var(--pixel-buy)]" />
            </div>
            <span className="pixel-title text-[0.65rem]">AlphaEdge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signal-of-the-day"
              className="pixel-label hover:text-[var(--pixel-text)] transition-colors"
            >
              Signal of the Day
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                ▸ Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <ParallaxStars />
        <MatrixRain />
        {/* Background grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(var(--pixel-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--pixel-border) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-3xl space-y-8">
          {/* Beta badge */}
          <div className="flex justify-center">
            <span
              className="border-2 border-[var(--pixel-border)] bg-[rgba(0,255,65,0.08)] px-3 py-1 font-mono text-[0.55rem] uppercase tracking-widest"
              style={{ boxShadow: "var(--pixel-glow-green)", color: "var(--pixel-buy)" }}
            >
              ▸ Now in Beta — Free Access
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1
              className="font-[var(--font-pixel)] text-[0.75rem] sm:text-[0.9rem] lg:text-[1rem] leading-[2] uppercase tracking-wider"
              style={{ color: "var(--pixel-text)", textShadow: "var(--pixel-glow-green)" }}
            >
              Trade US stocks with
            </h1>
            <h1
              className="font-[var(--font-pixel)] text-[0.75rem] sm:text-[0.9rem] lg:text-[1rem] leading-[2] uppercase tracking-wider"
              style={{ color: "var(--pixel-buy)", textShadow: "0 0 12px rgba(0,255,65,0.8), 0 0 24px rgba(0,255,65,0.4)" }}
            >
              Chinese Market Intelligence
            </h1>
          </div>

          <p className="mx-auto max-w-xl font-mono text-[0.7rem] leading-relaxed text-[var(--pixel-text-off)]">
            AI-powered signals combining Jin10 financial news, sentiment
            analysis, and technical indicators. Get the edge before the
            Western market catches up.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg">
                ▸ Open Dashboard
              </Button>
            </Link>
            <Link href="/signal-of-the-day">
              <Button variant="ghost" size="lg">
                Signal of the Day
              </Button>
            </Link>
          </div>

          {/* Market status */}
          <div className="flex justify-center pt-2">
            <MarketStatus />
          </div>
        </div>
      </section>

      {/* ── Stats row ── */}
      <section className="scroll-fade border-t-2 border-b-2 border-[var(--pixel-border-dim)] px-6 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-4 text-center transition hover:border-[var(--pixel-border-mid)]"
            >
              <div
                className="font-[var(--font-pixel)] text-lg"
                style={{ color: s.color, textShadow: `0 0 8px ${s.color}88` }}
              >
                {s.value}
              </div>
              <div className="pixel-label mt-1 text-[0.45rem]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live signals preview ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-[var(--pixel-border-mid)] font-mono text-[0.6rem]">══</span>
            <h2 className="pixel-title text-[0.5rem]">Live Signals</h2>
            <div className="flex-1 h-px bg-[var(--pixel-border-dim)]" />
            <span className="pixel-label text-[0.45rem]">Updates every 5 min</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-[var(--pixel-buy)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-[var(--pixel-buy)]" style={{ boxShadow: "var(--pixel-glow-green)" }} />
            </span>
          </div>
          <LivePreview />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="scroll-fade border-t-2 border-[var(--pixel-border-dim)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center gap-3">
            <span className="text-[var(--pixel-border-mid)] font-mono text-[0.6rem]">══</span>
            <h2 className="pixel-title text-[0.5rem]">Your Unfair Advantage</h2>
            <div className="flex-1 h-px bg-[var(--pixel-border-dim)]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-6 transition-all duration-150 hover:border-[var(--pixel-border-mid)] hover:shadow-[0_0_8px_rgba(0,255,65,0.15)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]"
                    style={{ boxShadow: "inset 0 0 8px rgba(0,255,65,0.05)" }}
                  >
                    <f.icon className="h-5 w-5 text-[var(--pixel-buy)]" />
                  </div>
                  <span className="pixel-label text-[0.45rem]">{f.tag}</span>
                </div>
                <h3 className="pixel-title mb-3 text-[0.5rem]">{f.title}</h3>
                <p className="font-mono text-[0.6rem] leading-relaxed text-[var(--pixel-text-off)]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="scroll-fade border-t-2 border-[var(--pixel-border-dim)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[var(--pixel-border-mid)] font-mono text-[0.6rem]">══</span>
            <h2 className="pixel-title text-[0.5rem]">Pricing</h2>
            <div className="flex-1 h-px bg-[var(--pixel-border-dim)]" />
          </div>
          <p className="mb-12 pixel-label text-center">Start free. Upgrade when ready.</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="border-2 bg-[var(--pixel-surface)] p-6 flex flex-col transition-all"
                style={{
                  borderColor: plan.highlight ? plan.color + "88" : "var(--pixel-border-dim)",
                  boxShadow: plan.highlight ? `0 0 16px ${plan.color}22, 0 0 32px ${plan.color}0A` : "none",
                }}
              >
                <div className="mb-6">
                  <span
                    className="border px-1.5 py-0.5 font-mono text-[0.45rem] uppercase tracking-widest"
                    style={{ borderColor: plan.color + "66", color: plan.color }}
                  >
                    {plan.tag}
                  </span>
                  <h3 className="mt-3 pixel-title text-[0.55rem]" style={{ color: plan.color }}>{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className="font-[var(--font-pixel)] text-2xl"
                      style={{ color: plan.color, textShadow: `0 0 8px ${plan.color}66` }}
                    >
                      {plan.price}
                    </span>
                    <span className="pixel-label">{plan.period}</span>
                  </div>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 font-mono text-[0.6rem] text-[var(--pixel-text-off)]">
                      <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: plan.color }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="block">
                  <div
                    className="w-full border-2 py-2.5 text-center font-mono text-[0.55rem] uppercase tracking-widest transition-all cursor-pointer"
                    style={
                      plan.highlight
                        ? { borderColor: plan.color, background: plan.color + "14", color: plan.color, boxShadow: `0 0 8px ${plan.color}44` }
                        : { borderColor: "var(--pixel-border-dim)", background: "transparent", color: "var(--pixel-text-off)" }
                    }
                  >
                    {plan.cta}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="scroll-fade border-t-2 border-[var(--pixel-border-dim)] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--pixel-buy)]" />
            <span className="pixel-label">AlphaEdge {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/signal-of-the-day" className="pixel-label hover:text-[var(--pixel-text)] transition-colors">
              Signal of the Day
            </Link>
            <Link href="/dashboard" className="pixel-label hover:text-[var(--pixel-text)] transition-colors">
              Dashboard
            </Link>
          </div>
          <span className="pixel-label text-[0.45rem]">Trade US stocks with Chinese Market Intelligence</span>
        </div>
        {/* Terminal status line */}
        <div className="mx-auto mt-4 max-w-6xl border-t border-[var(--pixel-border-dim)] pt-4">
          <p className="font-mono text-[0.5rem] text-[var(--pixel-text-muted)]">
            <span className="text-[var(--pixel-border)]">$</span> alphaedge --status <span className="text-[var(--pixel-buy)]">ONLINE</span>
            <span className="blink ml-1 text-[var(--pixel-buy)]">█</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
