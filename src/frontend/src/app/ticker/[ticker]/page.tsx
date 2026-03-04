"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart,
  Line,
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────
interface HistoryPoint {
  date: string;
  close: number;
  volume: number;
  rsi?: number;
}

interface TickerSignal {
  ticker: string;
  signal: "BUY" | "HOLD" | "SELL";
  strength: number;
  confidence: number;
  price: number;
  change: number;
  sources: {
    jin10_sentiment: number;
    rsi: number;
    macd: string;
    rsi_label: string;
    jin10_headline: string;
  };
  reasoning: string;
  updated_at: string;
}

// ── Config ─────────────────────────────────────────────────────────
const SIG = {
  BUY:  { color: "#00FF41", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.35)" },
  HOLD: { color: "#FFB800", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.35)" },
  SELL: { color: "#FF3131", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.35)" },
} as const;

// ── Custom Tooltip ─────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 text-[#666]">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="flex gap-2">
          <span>{p.dataKey === "close" ? "Price" : p.dataKey === "volume" ? "Vol" : p.dataKey}</span>
          <span className="font-bold">
            {p.dataKey === "close"
              ? `$${p.value.toFixed(2)}`
              : p.dataKey === "volume"
              ? `${(p.value / 1e6).toFixed(1)}M`
              : p.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Gauge ──────────────────────────────────────────────────────────
function Gauge({ value, max = 100, color, label, sublabel }: { value: number; max?: number; color: string; label: string; sublabel?: string }) {
  const data = [{ value, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-20 w-20">
        <RadialBarChart width={80} height={80} cx={40} cy={40} innerRadius={26} outerRadius={38}
          startAngle={90} endAngle={-270} data={data}>
          <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={5} background={{ fill: "#1C1C24" }} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-[var(--pixel-text)]">{value}</span>
          {sublabel && <span className="text-[9px] text-[#444]">{sublabel}</span>}
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">{label}</span>
    </div>
  );
}

// ── Stats ──────────────────────────────────────────────────────────
function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">{label}</div>
      <div className="mt-1 text-lg font-bold text-[var(--pixel-text)]">{value}</div>
      {sub && <div className="text-[10px] text-[#555]">{sub}</div>}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] p-6 animate-pulse space-y-6">
      <div className="h-8 w-32 rounded bg-[var(--pixel-surface)]" />
      <div className="h-24 w-full rounded-none bg-[var(--pixel-surface)]" />
      <div className="h-72 w-full rounded-none bg-[var(--pixel-surface)]" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-none bg-[var(--pixel-surface)]" />)}
      </div>
      <div className="h-48 w-full rounded-none bg-[var(--pixel-surface)]" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params?.ticker as string ?? "").toUpperCase();

  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [signal, setSignal] = useState<TickerSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      const [histRes, sigRes] = await Promise.all([
        fetch(`/api/history/${ticker}?days=30`),
        fetch(`/api/signals?tickers=${ticker}`),
      ]);
      const histData = await histRes.json();
      const sigData = await sigRes.json();

      const rawHistory: HistoryPoint[] = histData.data ?? [];
      setHistory(rawHistory);

      const s = sigData.signals?.[0];
      if (s) setSignal(s);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  if (loading) return <PageSkeleton />;
  if (error || !signal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--pixel-bg)] gap-4">
        <div className="text-[#666]">No data for {ticker}</div>
        <button onClick={() => router.back()} className="text-sm text-[#00FF41] hover:underline">← Back</button>
      </div>
    );
  }

  const cfg = SIG[signal.signal];
  const isPos = signal.change >= 0;

  // Computed stats
  const closes = history.map((h) => h.close);
  const hi = closes.length ? Math.max(...closes) : 0;
  const lo = closes.length ? Math.min(...closes) : 0;
  const avgClose = closes.length ? closes.reduce((a, b) => a + b, 0) / closes.length : 0;
  const totalVol = history.reduce((a, h) => a + (h.volume || 0), 0);

  // Sparkline color based on trend
  const priceColor = isPos ? "#00FF41" : "#FF3131";

  // Annotate history with flat RSI for visualization
  const chartData = history.map((h) => ({
    ...h,
    rsi: signal.sources.rsi, // flat line — real per-day RSI needs more data
  }));

  const macdIsBull = signal.sources.macd === "金叉";
  const macdIsBear = signal.sources.macd === "死叉";

  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] text-[var(--pixel-text)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-[#1C1C24] bg-[var(--pixel-bg)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[#666] transition hover:text-[var(--pixel-text)]">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-1.5 text-xs text-[#666] transition hover:text-[var(--pixel-text)]"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
        {/* ── Hero ── */}
        <div
          className="rounded-none p-6"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight">{ticker}</h1>
                <span
                  className="rounded-none px-3 py-1 text-sm font-black tracking-widest"
                  style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  {signal.signal}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">${signal.price.toFixed(2)}</span>
                <span
                  className={`flex items-center gap-1 text-lg font-semibold ${isPos ? "text-[#00FF41]" : "text-[#FF3131]"}`}
                >
                  {isPos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isPos ? "+" : ""}{signal.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm text-[#666]">
                Confidence {Math.round(signal.confidence * 100)}% · Strength {signal.strength}/100
              </div>
            </div>

            {/* Strength ring */}
            <div className="shrink-0">
              <Gauge value={signal.strength} color={cfg.color} label="Strength" sublabel="/ 100" />
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="30d High" value={`$${hi.toFixed(2)}`} />
          <StatBox label="30d Low" value={`$${lo.toFixed(2)}`} />
          <StatBox label="30d Avg" value={`$${avgClose.toFixed(2)}`} />
          <StatBox label="30d Vol" value={`${(totalVol / 1e9).toFixed(1)}B`} sub="shares" />
        </div>

        {/* ── Price + Volume chart ── */}
        <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#666]" />
            <span className="text-sm font-bold text-[var(--pixel-text)]">30-Day Price & Volume</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={priceColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={priceColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1C24" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="price" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#555" }}
                axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={55} />
              <YAxis yAxisId="vol" orientation="right" tick={{ fontSize: 9, fill: "#444" }}
                axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} width={45} />
              <Tooltip content={<DarkTooltip />} />
              <Bar yAxisId="vol" dataKey="volume" fill="#2A2A35" opacity={0.5} radius={[2, 2, 0, 0]} />
              <Area yAxisId="price" type="monotone" dataKey="close"
                stroke={priceColor} strokeWidth={2} fill="url(#priceGrad)"
                dot={false} activeDot={{ r: 4, fill: priceColor }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ── RSI chart ── */}
        <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--pixel-text)]">RSI (14)</span>
            <span
              className="text-sm font-bold"
              style={{ color: signal.sources.rsi < 30 ? "#00FF41" : signal.sources.rsi > 70 ? "#FF3131" : "#A0A0A0" }}
            >
              Current: {signal.sources.rsi} — {signal.sources.rsi_label}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1C24" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<DarkTooltip />} />
              <ReferenceLine y={70} stroke="#FF3131" strokeDasharray="4 4" strokeOpacity={0.6} />
              <ReferenceLine y={30} stroke="#00FF41" strokeDasharray="4 4" strokeOpacity={0.6} />
              <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={2} dot={false}
                activeDot={{ r: 3, fill: "#8B5CF6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Signal breakdown ── */}
        <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-5">
          <div className="mb-4 text-sm font-bold text-[var(--pixel-text)]">Signal Breakdown</div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Gauge
              value={Math.round(signal.sources.jin10_sentiment * 100)}
              color={signal.sources.jin10_sentiment > 0 ? "#00FF41" : "#FF3131"}
              label="Jin10"
              sublabel="%"
            />
            <Gauge
              value={signal.sources.rsi}
              color={signal.sources.rsi < 30 ? "#00FF41" : signal.sources.rsi > 70 ? "#FF3131" : "#8B5CF6"}
              label="RSI"
            />
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: macdIsBull ? "rgba(34,197,94,0.1)" : macdIsBear ? "rgba(239,68,68,0.1)" : "rgba(160,160,160,0.1)",
                  border: `2px solid ${macdIsBull ? "#00FF4155" : macdIsBear ? "#FF313155" : "#55555555"}`,
                  color: macdIsBull ? "#00FF41" : macdIsBear ? "#FF3131" : "#A0A0A0",
                }}
              >
                {signal.sources.macd}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">MACD</span>
            </div>
            <Gauge
              value={Math.round(signal.confidence * 100)}
              color={cfg.color}
              label="Confidence"
              sublabel="%"
            />
          </div>
        </div>

        {/* ── Analysis ── */}
        <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-5">
          <div className="mb-3 text-sm font-bold text-[var(--pixel-text)]">Analysis</div>
          <p className="leading-relaxed text-[#A0A0A0]">{signal.reasoning}</p>
          {signal.sources.jin10_headline && signal.sources.jin10_headline !== signal.reasoning && (
            <div className="mt-3 rounded-none bg-[var(--pixel-bg)] p-3 text-sm text-[#666]">
              <span className="mr-1 font-semibold text-[#3B82F6]">Jin10</span>
              {signal.sources.jin10_headline}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
