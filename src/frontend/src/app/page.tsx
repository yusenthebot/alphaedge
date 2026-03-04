'use client'

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Newspaper, BarChart3, Bell, Zap, TrendingUp } from "lucide-react";
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

const OPEN_SOURCE_FEATURES = [
  { icon: "◆", label: "完全免费", desc: "永久免费，无付费计划，无广告" },
  { icon: "◈", label: "MIT 开源", desc: "GitHub 完整源码，Fork / Star / PR 欢迎" },
  { icon: "▲", label: "自托管", desc: "本地运行或部署到自己的服务器，数据完全自主" },
  { icon: "░", label: "社区驱动", desc: "Issue / 讨论 / 贡献者共同打磨信号质量" },
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

      {/* ── Open Source ── */}
      <section className="scroll-fade border-t-2 border-[var(--pixel-border-dim)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[var(--pixel-border-mid)] font-mono text-[0.6rem]">══</span>
            <h2 className="pixel-title text-[0.5rem]" style={{ color: "var(--pixel-buy)" }}>100% Free &amp; Open Source</h2>
            <div className="flex-1 h-px bg-[var(--pixel-border-dim)]" />
          </div>
          <p className="mb-10 pixel-label text-center" style={{ color: "var(--pixel-text-off)" }}>
            无付费计划 · 无广告 · 无数据收集 · 永久免费
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-12">
            {OPEN_SOURCE_FEATURES.map((f) => (
              <div
                key={f.label}
                className="border-2 bg-[var(--pixel-surface)] p-5 flex flex-col gap-2 transition-all hover:border-[var(--pixel-border)]"
                style={{ borderColor: "var(--pixel-border-dim)" }}
              >
                <span className="font-mono text-lg" style={{ color: "var(--pixel-buy)", textShadow: "0 0 8px var(--pixel-buy)" }}>
                  {f.icon}
                </span>
                <span className="pixel-label" style={{ color: "var(--pixel-text)" }}>{f.label}</span>
                <span className="font-mono text-[0.5rem] leading-relaxed" style={{ color: "var(--pixel-text-off)" }}>{f.desc}</span>
              </div>
            ))}
          </div>

          {/* GitHub CTA */}
          <div
            className="border-2 p-8 text-center"
            style={{
              borderColor: "var(--pixel-buy)",
              background: "rgba(0,255,65,0.03)",
              boxShadow: "0 0 24px rgba(0,255,65,0.08)",
            }}
          >
            <p className="pixel-title text-[0.5rem] mb-2" style={{ color: "var(--pixel-buy)" }}>
              ★ Star on GitHub
            </p>
            <p className="font-mono text-[0.55rem] mb-6" style={{ color: "var(--pixel-text-off)" }}>
              Clone · Fork · Self-host · Contribute
            </p>
            <a
              href="https://github.com/yusenthebot/alphaedge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 px-8 py-3 font-mono text-[0.55rem] uppercase tracking-widest transition-all hover:bg-[rgba(0,255,65,0.08)]"
              style={{
                borderColor: "var(--pixel-buy)",
                color: "var(--pixel-buy)",
                boxShadow: "0 0 8px rgba(0,255,65,0.3)",
              }}
            >
              github.com/yusenthebot/alphaedge →
            </a>
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
