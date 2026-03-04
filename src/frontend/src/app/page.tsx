'use client'

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { Newspaper, BarChart3, Bell, Zap, TrendingUp, RefreshCw } from "lucide-react";
import { LivePreview } from "@/components/LivePreview";
import { MarketStatus } from "@/components/MarketStatus";
import { GlitchSection } from "@/components/GlitchSection";
import { ScrollReveal } from "@/components/ScrollReveal";

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
      ctx.fillStyle = '#00D4FF'
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
  const p = (x: number, y: number, color: string) =>
    `${x * 4}px ${y * 4}px 0 ${color}`

  // ANALYST-BOT — sleek humanoid robot with cyan visor & data screen on chest
  const analystBot = [
    // antenna
    p(1,-2,"#00D4FF"), p(2,-2,"#00D4FF"),
    p(1,-1,"#5599BB"),
    // head — steel frame
    p(0,0,"#1A3A5C"), p(1,0,"#1A3A5C"), p(2,0,"#1A3A5C"), p(3,0,"#1A3A5C"),
    // visor strip — glowing cyan eyes
    p(0,1,"#0A2040"), p(1,1,"#00D4FF"), p(2,1,"#00D4FF"), p(3,1,"#0A2040"),
    p(0,2,"#0A2040"), p(1,2,"#00EEFF"), p(2,2,"#00EEFF"), p(3,2,"#0A2040"),
    // chin
    p(0,3,"#1A3A5C"), p(1,3,"#0A2040"), p(2,3,"#0A2040"), p(3,3,"#1A3A5C"),
    // neck
    p(1,4,"#0D2035"), p(2,4,"#0D2035"),
    // shoulders
    p(-1,5,"#1A3A5C"), p(0,5,"#1A3A5C"), p(1,5,"#1A3A5C"), p(2,5,"#1A3A5C"), p(3,5,"#1A3A5C"), p(4,5,"#1A3A5C"),
    // chest — data screen
    p(0,6,"#0A1A30"), p(1,6,"#00D4FF"), p(2,6,"#00D4FF"), p(3,6,"#0A1A30"),
    p(0,7,"#0A1A30"), p(1,7,"#0A2040"), p(2,7,"#0A2040"), p(3,7,"#0A1A30"),
    // waist
    p(0,8,"#1A3A5C"), p(1,8,"#1A3A5C"), p(2,8,"#1A3A5C"), p(3,8,"#1A3A5C"),
    // arms
    p(-1,6,"#0D2035"), p(-1,7,"#0D2035"), p(-1,8,"#00D4FF"),
    p(4,6,"#0D2035"),  p(4,7,"#0D2035"),  p(4,8,"#00D4FF"),
    // legs
    p(0,9,"#0D2035"), p(1,9,"#0D2035"), p(2,9,"#0D2035"), p(3,9,"#0D2035"),
    p(0,10,"#1A3A5C"), p(3,10,"#1A3A5C"),
    // feet
    p(0,11,"#00D4FF"), p(3,11,"#00D4FF"),
  ]

  // SYSTEM-BOT — boxy mainframe AI with glowing core & multiple sensors
  const systemBot = [
    // sensor array top
    p(0,-1,"#7B61FF"), p(1,-1,"#00D4FF"), p(2,-1,"#00D4FF"), p(3,-1,"#7B61FF"),
    // head — wide square
    p(0,0,"#061428"), p(1,0,"#061428"), p(2,0,"#061428"), p(3,0,"#061428"),
    // sensor eyes (3 dots)
    p(0,1,"#7B61FF"), p(1,1,"#00FFFF"), p(2,1,"#00FFFF"), p(3,1,"#7B61FF"),
    // speaker grille
    p(0,2,"#0A1A38"), p(1,2,"#00D4FF"), p(2,2,"#00D4FF"), p(3,2,"#0A1A38"),
    p(0,3,"#061428"), p(1,3,"#061428"), p(2,3,"#061428"), p(3,3,"#061428"),
    // neck joint
    p(1,4,"#00D4FF"), p(2,4,"#00D4FF"),
    // wide body — mainframe chassis
    p(-1,5,"#061428"), p(0,5,"#061428"), p(1,5,"#061428"), p(2,5,"#061428"), p(3,5,"#061428"), p(4,5,"#061428"),
    // core reactor — glowing purple
    p(0,6,"#0A1A38"), p(1,6,"#7B61FF"), p(2,6,"#7B61FF"), p(3,6,"#0A1A38"),
    p(0,7,"#0A1A38"), p(1,7,"#00D4FF"), p(2,7,"#00D4FF"), p(3,7,"#0A1A38"),
    // lower body
    p(0,8,"#061428"), p(1,8,"#061428"), p(2,8,"#061428"), p(3,8,"#061428"),
    // hover jets instead of legs
    p(-1,9,"#00D4FF"), p(0,9,"#00D4FF"), p(1,9,"#7B61FF"), p(2,9,"#7B61FF"), p(3,9,"#00D4FF"), p(4,9,"#00D4FF"),
    p(0,10,"#0A1A38"), p(1,10,"#00D4FF"), p(2,10,"#00D4FF"), p(3,10,"#0A1A38"),
  ]

  const shadows = (variant === "system" ? systemBot : analystBot).join(", ")
  const baseColor = variant === "system" ? "#7B61FF" : "#00D4FF"

  return (
    <div style={{ width: 24, height: 52, position: "relative", flexShrink: 0, marginTop: 4 }}>
      <div style={{
        position: "absolute",
        top: 8, left: 4,
        width: 4, height: 4,
        background: baseColor,
        boxShadow: shadows,
        imageRendering: "pixelated",
        filter: `drop-shadow(0 0 3px ${baseColor})`,
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

  const speakerColor = currentLine.speaker === "SYSTEM" ? "var(--pixel-accent)" : "var(--pixel-border)"

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
          boxShadow: "0 0 0 1px var(--pixel-bg), 0 0 0 4px var(--pixel-border-dim), inset 0 0 20px rgba(0,212,255,0.03)",
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
                background: "rgba(0,212,255,0.08)",
                boxShadow: "0 0 12px rgba(0,212,255,0.3)",
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

// ── Jin10 24h Digest Component ───────────────────────────────────────────────
interface DigestEntry {
  text: string
  time_str: string
  is_important: boolean
}
interface DigestData {
  total_24h: number
  important_count: number
  top_headlines: DigestEntry[]
  categories: Record<string, DigestEntry[]>
  generated_at: string
}

const CAT_ICONS: Record<string, string> = {
  "央行/政策": "🏦",
  "地缘政治": "🌐",
  "贵金属/商品": "🥇",
  "科技/AI":  "🤖",
  "经济数据": "📊",
  "市场异动": "⚡",
  "其他重要": "📌",
}

function Jin10Digest() {
  const [data, setData] = useState<DigestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8765"
    fetch(`${API}/api/news/digest`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-8" style={{ color: "var(--pixel-border)" }}>
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px" }}>LOADING 24H DIGEST...</span>
    </div>
  )
  if (!data) return null

  const cats = Object.entries(data.categories)

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-center">
        {[
          { label: "过去24小时", value: `${data.total_24h}条`, color: "var(--pixel-border)" },
          { label: "重要快讯", value: `${data.important_count}条`, color: "var(--pixel-hold)" },
          { label: "分类", value: `${cats.length}个`, color: "var(--pixel-accent)" },
        ].map(s => (
          <div key={s.label} style={{
            border: "1px solid var(--pixel-border-dim)",
            background: "var(--pixel-surface)",
            padding: "8px 16px",
            flex: 1, minWidth: 80,
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: "11px", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "var(--pixel-text-muted)", marginTop: 4, letterSpacing: "0.1em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top headlines */}
      <div style={{
        border: "2px solid var(--pixel-border-dim)",
        background: "var(--pixel-surface)",
      }}>
        <div style={{
          padding: "8px 14px",
          borderBottom: "1px solid var(--pixel-border-dim)",
          fontFamily: "var(--font-pixel)",
          fontSize: "7px",
          color: "var(--pixel-border)",
          letterSpacing: "0.15em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <TrendingUp className="h-3 w-3" /> TOP HEADLINES · 精选头条
        </div>
        <div>
          {data.top_headlines.slice(0, expanded ? 10 : 5).map((h, i) => (
            <div key={i} style={{
              padding: "8px 14px",
              borderBottom: i < (expanded ? 9 : 4) ? "1px solid var(--pixel-border-dim)" : "none",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--pixel-text-muted)",
                flexShrink: 0,
                marginTop: 1,
              }}>{h.time_str}</span>
              {h.is_important && (
                <span style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: "6px",
                  color: "var(--pixel-hold)",
                  border: "1px solid var(--pixel-hold)",
                  padding: "1px 4px",
                  flexShrink: 0,
                  marginTop: 1,
                }}>重要</span>
              )}
              <span style={{ fontSize: "11px", color: "var(--pixel-text)", lineHeight: 1.6 }}>{h.text}</span>
            </div>
          ))}
        </div>
        {data.top_headlines.length > 5 && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: "100%",
              padding: "8px",
              borderTop: "1px solid var(--pixel-border-dim)",
              background: "none",
              color: "var(--pixel-border)",
              fontFamily: "var(--font-pixel)",
              fontSize: "7px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            {expanded ? "▲ 收起" : `▼ 展开全部 ${data.top_headlines.length} 条`}
          </button>
        )}
      </div>

      {/* Category grid */}
      {cats.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cats.map(([cat, items]) => (
            <div key={cat} style={{
              border: "1px solid var(--pixel-border-dim)",
              background: "var(--pixel-surface)",
            }}>
              <div style={{
                padding: "6px 12px",
                borderBottom: "1px solid var(--pixel-border-dim)",
                fontFamily: "var(--font-pixel)",
                fontSize: "6px",
                color: "var(--pixel-text-off)",
                letterSpacing: "0.12em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <span>{CAT_ICONS[cat] || "📋"}</span> {cat}
              </div>
              <div>
                {items.slice(0, 3).map((item, i) => (
                  <div key={i} style={{
                    padding: "6px 12px",
                    borderBottom: i < Math.min(items.length, 3) - 1 ? "1px solid rgba(0,212,255,0.06)" : "none",
                    fontSize: "10px",
                    color: "var(--pixel-text)",
                    lineHeight: 1.6,
                    display: "flex",
                    gap: 8,
                  }}>
                    <span style={{ color: "var(--pixel-text-muted)", fontSize: "8px", flexShrink: 0, marginTop: 1 }}>
                      {item.time_str}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
              className="border border-[var(--pixel-border)] px-3 py-1 font-mono text-[0.5rem] uppercase tracking-widest transition-all hover:bg-[rgba(0,212,255,0.1)]"
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
              style={{ color: "var(--pixel-buy)", textShadow: "0 0 10px rgba(0,212,255,0.7)" }}
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
        <ScrollReveal direction="up" stagger>
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
        </ScrollReveal>
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
          <ScrollReveal stagger>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="pixel-hover-glow group border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-6 transition-all duration-150 hover:border-[var(--pixel-border-mid)] hover:shadow-[0_0_8px_rgba(0,212,255,0.15)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]"
                    style={{ boxShadow: "inset 0 0 8px rgba(0,212,255,0.05)" }}
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
          </ScrollReveal>
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
          <ScrollReveal direction="right" stagger>
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
          </ScrollReveal>

          {/* GitHub CTA */}
          <div
            className="border-2 p-8 text-center"
            style={{
              borderColor: "var(--pixel-buy)",
              background: "rgba(0,212,255,0.03)",
              boxShadow: "0 0 24px rgba(0,212,255,0.08)",
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
              className="inline-block border-2 px-8 py-3 font-mono text-[0.55rem] uppercase tracking-widest transition-all hover:bg-[rgba(0,212,255,0.08)]"
              style={{
                borderColor: "var(--pixel-buy)",
                color: "var(--pixel-buy)",
                boxShadow: "0 0 8px rgba(0,212,255,0.3)",
              }}
            >
              github.com/yusenthebot/alphaedge →
            </a>
          </div>
        </div>
      </section>

      {/* ── Jin10 24h Digest ── */}
      <section className="scroll-fade border-t-2 border-[var(--pixel-border-dim)] px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header */}
          <GlitchSection delay={200}>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Newspaper className="h-4 w-4" style={{ color: "var(--pixel-border)" }} />
              <span style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "7px",
                color: "var(--pixel-border)",
                textShadow: "var(--pixel-glow-cyan)",
                letterSpacing: "0.2em",
              }}>
                JIN10 · 过去24小时精选
              </span>
              <Newspaper className="h-4 w-4" style={{ color: "var(--pixel-border)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-pixel)", fontSize: "6px", color: "var(--pixel-text-muted)", letterSpacing: "0.1em" }}>
              REAL-TIME CHINESE MARKET INTELLIGENCE — AUTO CURATED
            </p>
          </div>
          </GlitchSection>

          <Jin10Digest />
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
