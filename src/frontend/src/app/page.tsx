'use client'

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { Newspaper, BarChart3, Bell, Zap } from "lucide-react";
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

// ── RPG Dialog System ──────────────────────────────────────────────
const DIALOG_LINES = [
  { speaker: "ANALYST", text: "凌晨 4 点，北京。金十数据第一条快讯落地。" },
  { speaker: "ANALYST", text: "华尔街的交易员还没醒。但信号已经在动了。" },
  { speaker: "ANALYST", text: "RSI 突破 70，MACD 金叉确认... 目标：NVDA。" },
  { speaker: "ANALYST", text: "这就是我们的优势 — 比西方市场早 2 小时读懂中国新闻。" },
  { speaker: "SYSTEM",  text: "AlphaEdge 已连接。实时信号就绪。你，准备好了吗？" },
]

// 8×12 pixel trader sprite (box-shadow method)
function PixelChar({ variant = "analyst" }: { variant?: "analyst" | "system" }) {
  const pixel = (x: number, y: number, color: string) =>
    `${x * 4}px ${y * 4}px 0 ${color}`

  const analyst = [
    // head
    pixel(1,0,"#FFD580"), pixel(2,0,"#FFD580"),
    pixel(0,1,"#FFD580"), pixel(1,1,"#FFD580"), pixel(2,1,"#FFD580"), pixel(3,1,"#FFD580"),
    pixel(0,2,"#FFD580"), pixel(1,2,"#1A1A2E"), pixel(2,2,"#1A1A2E"), pixel(3,2,"#FFD580"),
    pixel(0,3,"#FFD580"), pixel(1,3,"#FFD580"), pixel(2,3,"#FFD580"), pixel(3,3,"#FFD580"),
    // hair
    pixel(0,0,"#4A2800"), pixel(1,0,"#4A2800"), pixel(2,0,"#4A2800"), pixel(3,0,"#4A2800"),
    // body / suit
    pixel(0,4,"#1A3A5C"), pixel(1,4,"#1A3A5C"), pixel(2,4,"#1A3A5C"), pixel(3,4,"#1A3A5C"),
    pixel(0,5,"#1A3A5C"), pixel(1,5,"#FFFFFF"), pixel(2,5,"#FFFFFF"), pixel(3,5,"#1A3A5C"),
    pixel(0,6,"#1A3A5C"), pixel(1,6,"#1A3A5C"), pixel(2,6,"#1A3A5C"), pixel(3,6,"#1A3A5C"),
    pixel(0,7,"#1A3A5C"), pixel(1,7,"#1A3A5C"), pixel(2,7,"#1A3A5C"), pixel(3,7,"#1A3A5C"),
    // arms
    pixel(-1,5,"#FFD580"), pixel(4,5,"#FFD580"),
    pixel(-1,6,"#1A3A5C"), pixel(4,6,"#1A3A5C"),
    // legs
    pixel(0,8,"#2A2A4A"), pixel(1,8,"#2A2A4A"), pixel(2,8,"#2A2A4A"), pixel(3,8,"#2A2A4A"),
    pixel(0,9,"#2A2A4A"), pixel(1,9,"#2A2A4A"), pixel(2,9,"#2A2A4A"), pixel(3,9,"#2A2A4A"),
    // shoes
    pixel(0,10,"#1A1A1A"), pixel(1,10,"#1A1A1A"), pixel(2,10,"#1A1A1A"), pixel(3,10,"#1A1A1A"),
  ]

  const system = [
    // robot/terminal head
    pixel(0,0,"#00FF41"), pixel(1,0,"#00FF41"), pixel(2,0,"#00FF41"), pixel(3,0,"#00FF41"),
    pixel(0,1,"#00FF41"), pixel(1,1,"#060A06"), pixel(2,1,"#060A06"), pixel(3,1,"#00FF41"),
    pixel(0,2,"#00FF41"), pixel(1,2,"#00FFFF"), pixel(2,2,"#00FFFF"), pixel(3,2,"#00FF41"),
    pixel(0,3,"#00FF41"), pixel(1,3,"#060A06"), pixel(2,3,"#060A06"), pixel(3,3,"#00FF41"),
    // antenna
    pixel(1,-1,"#00FF41"), pixel(2,-1,"#00FF41"),
    pixel(1,-2,"#00FFFF"),
    // body
    pixel(0,4,"#0B160B"), pixel(1,4,"#00FF41"), pixel(2,4,"#00FF41"), pixel(3,4,"#0B160B"),
    pixel(0,5,"#00FF41"), pixel(1,5,"#0B160B"), pixel(2,5,"#0B160B"), pixel(3,5,"#00FF41"),
    pixel(0,6,"#00FF41"), pixel(1,6,"#00FF41"), pixel(2,6,"#00FF41"), pixel(3,6,"#00FF41"),
    pixel(0,7,"#0B160B"), pixel(1,7,"#00FF41"), pixel(2,7,"#00FF41"), pixel(3,7,"#0B160B"),
    // legs
    pixel(0,8,"#00FF41"), pixel(3,8,"#00FF41"),
    pixel(0,9,"#00FF41"), pixel(3,9,"#00FF41"),
    pixel(0,10,"#00FFFF"), pixel(3,10,"#00FFFF"),
  ]

  const shadows = (variant === "system" ? system : analyst).join(", ")
  const color = variant === "system" ? "#00FF41" : "#FFD580"

  return (
    <div style={{ width: 16, height: 44, position: "relative", flexShrink: 0, marginTop: 4 }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: 4, height: 4,
        background: color,
        boxShadow: shadows,
        imageRendering: "pixelated",
      }} />
    </div>
  )
}

function RPGDialog({ onDone }: { onDone: () => void }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [typing, setTyping] = useState(true)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentLine = DIALOG_LINES[lineIdx]
  const isLast = lineIdx === DIALOG_LINES.length - 1

  // Typewriter effect
  useEffect(() => {
    setDisplayed("")
    setTyping(true)
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(currentLine.text.slice(0, i))
      if (i >= currentLine.text.length) {
        clearInterval(intervalRef.current!)
        setTyping(false)
      }
    }, 38)
    return () => clearInterval(intervalRef.current!)
  }, [lineIdx, currentLine.text])

  const advance = useCallback(() => {
    if (typing) {
      // Skip typing — show full text immediately
      clearInterval(intervalRef.current!)
      setDisplayed(currentLine.text)
      setTyping(false)
      return
    }
    if (isLast) {
      setDone(true)
      return
    }
    setLineIdx(i => i + 1)
  }, [typing, isLast, currentLine.text])

  const speakerColor = currentLine.speaker === "SYSTEM" ? "var(--pixel-accent)" : "var(--pixel-hold)"

  return (
    <div className="relative mx-auto max-w-2xl w-full" style={{ fontFamily: "var(--font-pixel)" }}>
      {/* Speaker name tag */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1 mb-0"
        style={{
          background: "var(--pixel-bg)",
          border: "2px solid var(--pixel-border)",
          borderBottom: "none",
          fontSize: "8px",
          color: speakerColor,
          textShadow: `0 0 6px ${speakerColor}`,
          letterSpacing: "0.15em",
        }}
      >
        <span style={{ opacity: 0.6 }}>▸</span> {currentLine.speaker}
      </div>

      {/* Dialog box */}
      <div
        onClick={advance}
        className="cursor-pointer relative"
        style={{
          background: "rgba(6,10,6,0.95)",
          border: "3px solid var(--pixel-border)",
          boxShadow: "0 0 0 1px var(--pixel-bg), 0 0 0 4px var(--pixel-border-dim), inset 0 0 20px rgba(0,255,65,0.03)",
          padding: "16px 20px",
          minHeight: "90px",
        }}
      >
        {/* Corner decorations */}
        <span style={{ position:"absolute", top:4, left:6, color:"var(--pixel-border-dim)", fontSize:8 }}>◤</span>
        <span style={{ position:"absolute", top:4, right:6, color:"var(--pixel-border-dim)", fontSize:8 }}>◥</span>
        <span style={{ position:"absolute", bottom:4, left:6, color:"var(--pixel-border-dim)", fontSize:8 }}>◣</span>
        <span style={{ position:"absolute", bottom:4, right:6, color:"var(--pixel-border-dim)", fontSize:8 }}>◢</span>

        <div className="flex gap-4 items-start">
          {/* Pixel character */}
          <PixelChar variant={currentLine.speaker === "SYSTEM" ? "system" : "analyst"} />

          {/* Text content */}
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: "9px",
              lineHeight: "1.9",
              color: "var(--pixel-text)",
              letterSpacing: "0.02em",
              minHeight: "52px",
            }}>
              {displayed}
              {typing && (
                <span style={{ color: "var(--pixel-buy)", animation: "blink 0.7s step-end infinite" }}>█</span>
              )}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", display:"flex", gap:4 }}>
          {DIALOG_LINES.map((_, i) => (
            <div key={i} style={{
              width: 4, height: 4,
              background: i === lineIdx ? "var(--pixel-buy)" : "var(--pixel-border-dim)",
              boxShadow: i === lineIdx ? "0 0 4px var(--pixel-buy)" : "none",
            }} />
          ))}
        </div>

        {/* Advance arrow */}
        {!typing && !done && (
          <div style={{
            position:"absolute", bottom:8, right:12,
            color:"var(--pixel-buy)", fontSize:8,
            animation:"blink 0.8s step-end infinite",
          }}>▼</div>
        )}
      </div>

      {/* "Click to skip / advance" hint */}
      <p style={{ fontSize:"7px", color:"var(--pixel-text-muted)", marginTop:6, textAlign:"right", letterSpacing:"0.1em" }}>
        点击对话框继续 · CLICK TO ADVANCE
      </p>

      {/* Final CTA — appears after last dialog */}
      {done && (
        <div style={{ marginTop:20, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/dashboard">
            <div
              style={{
                border: "2px solid var(--pixel-buy)",
                padding: "12px 28px",
                fontSize: "9px",
                color: "var(--pixel-buy)",
                background: "rgba(0,255,65,0.08)",
                boxShadow: "0 0 12px rgba(0,255,65,0.3)",
                cursor: "pointer",
                letterSpacing: "0.15em",
                animation: "blink 1.2s step-end infinite",
              }}
            >
              ▸ PRESS START — OPEN DASHBOARD
            </div>
          </Link>
          <div
            onClick={onDone}
            style={{
              border: "2px solid var(--pixel-border-dim)",
              padding: "12px 20px",
              fontSize: "9px",
              color: "var(--pixel-text-off)",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            SKIP INTRO
          </div>
        </div>
      )}
    </div>
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
            <Link
              href="/dashboard"
              className="border border-[var(--pixel-border)] px-3 py-1 font-mono text-[0.5rem] uppercase tracking-widest transition-all hover:bg-[rgba(0,255,65,0.1)]"
              style={{ color: "var(--pixel-buy)" }}
            >
              ▸ Dashboard
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
          {/* Title — short, pixel style */}
          <div className="text-center space-y-1">
            <p className="font-mono text-[0.5rem] tracking-[0.3em] uppercase" style={{ color:"var(--pixel-text-muted)" }}>
              ── ALPHAEDGE ──
            </p>
            <h1
              className="font-[var(--font-pixel)] text-[0.7rem] sm:text-[0.85rem] leading-[2] uppercase"
              style={{ color: "var(--pixel-buy)", textShadow: "0 0 10px rgba(0,255,65,0.7)" }}
            >
              Chinese Market Intelligence
            </h1>
          </div>

          {/* RPG Dialog Box */}
          <RPGDialog onDone={() => {}} />

          {/* Market status — below dialog */}
          <div className="flex justify-center pt-1">
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
