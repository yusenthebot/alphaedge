"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Newspaper,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LiveSignal {
  ticker: string;
  signal: "BUY" | "SELL" | "HOLD";
  strength: number;
  confidence: number;
  price: number;
  change_pct: number;
  rsi: number;
  macd_signal: string;
  jin10_score: number;
  reasoning: string;
  timestamp: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? ""
    : "http://localhost:8765");

function macdLabel(raw: string): string {
  if (raw === "bullish_cross") return "金叉 (Golden Cross)";
  if (raw === "bearish_cross") return "死叉 (Death Cross)";
  return "中性 (Neutral)";
}

function rsiLabel(rsi: number): string {
  if (rsi < 30) return "超卖回升 (Oversold Recovery)";
  if (rsi > 70) return "超买回落 (Overbought)";
  return "中性区间 (Neutral Range)";
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SIGNAL_STYLES: Record<string, { border: string; badge: string; glow: string }> = {
  BUY:  { border: "var(--pixel-buy)",  badge: "bg-[var(--pixel-buy)] text-[var(--pixel-bg)]",   glow: "0 0 12px rgba(0,255,136,0.4)" },
  SELL: { border: "var(--pixel-sell)", badge: "bg-[var(--pixel-sell)] text-white",               glow: "0 0 12px rgba(255,49,49,0.4)" },
  HOLD: { border: "var(--pixel-hold)", badge: "bg-[var(--pixel-hold)] text-[var(--pixel-bg)]",   glow: "0 0 12px rgba(255,184,0,0.4)" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function SignalOfTheDayPage() {
  const [signal, setSignal] = useState<LiveSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchSignal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/signals`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const list: LiveSignal[] = data.signals ?? [];

      if (!list.length) throw new Error("No signals returned");

      // Pick highest confidence signal
      const best = list.reduce((a, b) =>
        (b.confidence ?? 0) > (a.confidence ?? 0) ? b : a
      );
      setSignal(best);
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal();
    const interval = setInterval(fetchSignal, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const styles = signal ? (SIGNAL_STYLES[signal.signal] ?? SIGNAL_STYLES.HOLD) : SIGNAL_STYLES.HOLD;
  const changePositive = signal ? signal.change_pct >= 0 : true;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--pixel-bg)", fontFamily: "var(--font-mono)" }}
    >
      {/* Nav */}
      <nav
        className="px-4 py-3 sm:px-6"
        style={{ borderBottom: "2px solid var(--pixel-border-dim)" }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span style={{ color: "var(--pixel-border)", fontFamily: "var(--font-pixel)", fontSize: "9px" }}>
              ▸ ALPHAEDGE
            </span>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">Open Dashboard</Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <p
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "7px",
              color: "var(--pixel-hold)",
              textShadow: "0 0 6px rgba(255,184,0,0.5)",
              letterSpacing: "0.2em",
            }}
          >
            ── SIGNAL OF THE DAY ──
          </p>
          <h1
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "8px",
              color: "var(--pixel-text)",
              lineHeight: 2,
            }}
          >
            {todayLabel()}
          </h1>
          <p style={{ color: "var(--pixel-text-off)", fontSize: "11px" }}>
            Highest-confidence signal from our AI analysis engine
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="flex items-center justify-center gap-3 py-16"
            style={{ color: "var(--pixel-border)" }}
          >
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: "8px" }}>
              FETCHING LIVE SIGNAL...
            </span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="py-8 text-center space-y-3"
            style={{
              border: "2px solid var(--pixel-sell)",
              background: "rgba(255,49,49,0.05)",
              padding: "24px",
            }}
          >
            <p style={{ color: "var(--pixel-sell)", fontFamily: "var(--font-pixel)", fontSize: "8px" }}>
              ⚠ SIGNAL FETCH FAILED
            </p>
            <p style={{ color: "var(--pixel-text-off)", fontSize: "11px" }}>{error}</p>
            <Button variant="outline" onClick={fetchSignal}>Retry</Button>
          </div>
        )}

        {/* Live Signal Card */}
        {!loading && signal && (
          <>
            <Card
              className="mb-6"
              style={{
                background: "var(--pixel-surface)",
                border: `2px solid ${styles.border}`,
                boxShadow: styles.glow,
              }}
            >
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Ticker + Price row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: "20px",
                        color: "var(--pixel-text)",
                        textShadow: `0 0 8px ${styles.border}44`,
                      }}
                    >
                      {signal.ticker}
                    </span>
                    <Badge
                      className={`${styles.badge} px-3 py-1`}
                      style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: "8px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {signal.signal}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <div
                      style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: "18px",
                        color: "var(--pixel-text)",
                      }}
                    >
                      ${signal.price.toFixed(2)}
                    </div>
                    <div
                      className="flex items-center justify-end gap-1 mt-1"
                      style={{
                        color: changePositive ? "var(--pixel-buy)" : "var(--pixel-sell)",
                        fontSize: "11px",
                      }}
                    >
                      {changePositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {changePositive ? "+" : ""}{signal.change_pct.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Strength", value: `${signal.strength}/100`, color: styles.border },
                    { label: "Confidence", value: `${Math.round(signal.confidence * 100)}%`, color: "var(--pixel-text)" },
                    { label: "RSI", value: String(signal.rsi), color: signal.rsi < 30 ? "var(--pixel-buy)" : signal.rsi > 70 ? "var(--pixel-sell)" : "var(--pixel-text)" },
                    { label: "Jin10 Score", value: `${Math.round(signal.jin10_score * 100)}%`, color: "var(--pixel-accent)" },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      style={{
                        background: "var(--pixel-bg)",
                        border: "1px solid var(--pixel-border-dim)",
                        padding: "12px",
                      }}
                    >
                      <div style={{ fontSize: "8px", color: "var(--pixel-text-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>
                        {label.toUpperCase()}
                      </div>
                      <div style={{ fontFamily: "var(--font-pixel)", fontSize: "13px", color }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicators */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Newspaper
                      className="mt-1 h-4 w-4 shrink-0"
                      style={{ color: "var(--pixel-border)" }}
                    />
                    <div>
                      <div style={{ fontSize: "9px", fontFamily: "var(--font-pixel)", color: "var(--pixel-text)", marginBottom: 4 }}>
                        JIN10 SENTIMENT
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--pixel-text-off)" }}>
                        Score: {(signal.jin10_score * 100).toFixed(0)}% —{" "}
                        {signal.jin10_score > 0.6
                          ? "积极 (Positive)"
                          : signal.jin10_score < 0.4
                          ? "消极 (Negative)"
                          : "中性 (Neutral)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BarChart3
                      className="mt-1 h-4 w-4 shrink-0"
                      style={{ color: "var(--pixel-accent)" }}
                    />
                    <div>
                      <div style={{ fontSize: "9px", fontFamily: "var(--font-pixel)", color: "var(--pixel-text)", marginBottom: 4 }}>
                        TECHNICAL INDICATORS
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--pixel-text-off)" }}>
                        RSI {signal.rsi} — {rsiLabel(signal.rsi)} &nbsp;|&nbsp; MACD: {macdLabel(signal.macd_signal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div
                  style={{
                    background: "var(--pixel-bg)",
                    border: "1px solid var(--pixel-border-dim)",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-pixel)",
                      fontSize: "7px",
                      color: "var(--pixel-text-off)",
                      marginBottom: 8,
                      letterSpacing: "0.15em",
                    }}
                  >
                    ▸ AI ANALYSIS
                  </div>
                  <p style={{ fontSize: "11px", lineHeight: 1.7, color: "var(--pixel-text)" }}>
                    {signal.reasoning}
                  </p>
                </div>

                {/* Last updated */}
                <div style={{ fontSize: "9px", color: "var(--pixel-text-muted)", textAlign: "right" }}>
                  Updated {lastUpdated} ·{" "}
                  <button
                    onClick={fetchSignal}
                    style={{ color: "var(--pixel-border)", cursor: "pointer", background: "none", border: "none" }}
                  >
                    Refresh ↺
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center space-y-4">
              <p style={{ color: "var(--pixel-text-off)", fontSize: "11px" }}>
                View signals for your full watchlist — updated every 5 minutes.
              </p>
              <Link href="/dashboard">
                <Button size="lg" style={{ fontFamily: "var(--font-pixel)", fontSize: "8px" }}>
                  ▸ Open Dashboard <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <p
          className="mt-14 text-center"
          style={{ fontSize: "9px", color: "var(--pixel-text-muted)", lineHeight: 1.8 }}
        >
          Not financial advice. AI-generated signals for informational purposes only.
          <br />Past performance does not guarantee future results.
        </p>
      </main>
    </div>
  );
}
