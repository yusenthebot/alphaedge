"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Zap, RefreshCw, Clock } from "lucide-react";
import type { Signal } from "@/types/signal";

// ── Types ──────────────────────────────────────────────────────────
interface HistoryPoint {
  date: string;
  close: number;
}

interface SignalWithHistory extends Signal {
  history?: HistoryPoint[];
}

// ── Constants ────────────────────────────────────────────────────
const WATCHLIST = ["NVDA", "TSLA", "AAPL", "BABA", "SPY", "MSFT", "AMD", "META"];
const POLL_INTERVAL = 60_000;

const SIGNAL_CONFIG = {
  BUY:  { bg: "#22C55E", text: "text-[#22C55E]", glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",  border: "border-[#22C55E]/40" },
  HOLD: { bg: "#F59E0B", text: "text-[#F59E0B]", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]", border: "border-[#F59E0B]/40" },
  SELL: { bg: "#EF4444", text: "text-[#EF4444]", glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",  border: "border-[#EF4444]/40" },
} as const;

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function rsiLabel(rsi: number) {
  if (rsi < 30) return { label: "超卖", color: "#22C55E" };
  if (rsi > 70) return { label: "超买", color: "#EF4444" };
  return { label: "中性", color: "#A0A0A0" };
}

// ── RSI Gauge ────────────────────────────────────────────────────
function RSIGauge({ rsi }: { rsi: number }) {
  const { color } = rsiLabel(rsi);
  const data = [{ value: rsi, fill: color }];
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <RadialBarChart
        width={64}
        height={64}
        cx={32}
        cy={32}
        innerRadius={22}
        outerRadius={30}
        startAngle={180}
        endAngle={-180}
        data={data}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#2A2A35" }} />
      </RadialBarChart>
      <span className="absolute text-xs font-bold text-white">{rsi}</span>
    </div>
  );
}

// ── Strength Ring ────────────────────────────────────────────────
function StrengthRing({ strength, signal }: { strength: number; signal: string }) {
  const cfg = SIGNAL_CONFIG[signal as keyof typeof SIGNAL_CONFIG];
  const data = [{ value: strength, fill: cfg?.bg ?? "#22C55E" }];
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <RadialBarChart
        width={80}
        height={80}
        cx={40}
        cy={40}
        innerRadius={28}
        outerRadius={38}
        startAngle={90}
        endAngle={-270}
        data={data}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#2A2A35" }} />
      </RadialBarChart>
      <div className="absolute text-center">
        <div className="text-sm font-bold text-white">{strength}</div>
        <div className="text-[9px] text-[#666]">/ 100</div>
      </div>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: HistoryPoint[]; color: string }) {
  if (!data || data.length < 2) {
    return <div className="h-14 w-full animate-pulse rounded bg-[#1C1C24]" />;
  }
  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${color.replace("#", "")})`}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
        <Tooltip
          contentStyle={{ background: "#15151B", border: "1px solid #2A2A35", borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: "#666" }}
          formatter={(v: number) => [`$${v.toFixed(2)}`, ""]}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── MACD Badge ───────────────────────────────────────────────────
function MacdBadge({ macd }: { macd: string }) {
  const isBull = macd === "金叉";
  const isBear = macd === "死叉";
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold ${
        isBull ? "bg-[#22C55E]/15 text-[#22C55E]"
        : isBear ? "bg-[#EF4444]/15 text-[#EF4444]"
        : "bg-[#2A2A35] text-[#A0A0A0]"
      }`}
    >
      MACD {macd}
    </span>
  );
}

// ── Signal Card ──────────────────────────────────────────────────
function SignalCard({ signal }: { signal: SignalWithHistory }) {
  const cfg = SIGNAL_CONFIG[signal.signal];
  const isPos = signal.change >= 0;
  const sparkColor = isPos ? "#22C55E" : "#EF4444";
  const { label: rsiLbl, color: rsiColor } = rsiLabel(signal.sources.rsi);

  return (
    <div
      className={`rounded-2xl border bg-[#15151B] p-5 transition-all duration-200 hover:bg-[#1C1C24] ${cfg.border} ${cfg.glow}`}
    >
      {/* ── Top row: ticker + price + signal badge ── */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wide text-white">{signal.ticker}</span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-black tracking-widest`}
              style={{ background: cfg.bg + "22", color: cfg.bg, border: `1px solid ${cfg.bg}55` }}
            >
              {signal.signal}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-white">${signal.price.toFixed(2)}</span>
            <span className={`flex items-center gap-0.5 text-sm font-semibold ${isPos ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {isPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isPos ? "+" : ""}{signal.change.toFixed(2)}%
            </span>
          </div>
        </div>
        {/* Strength ring */}
        <StrengthRing strength={signal.strength} signal={signal.signal} />
      </div>

      {/* ── Sparkline ── */}
      <div className="mb-3">
        <Sparkline data={signal.history ?? []} color={sparkColor} />
      </div>

      {/* ── RSI + MACD row ── */}
      <div className="mb-3 flex items-center gap-3">
        <RSIGauge rsi={signal.sources.rsi} />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666]">RSI</span>
            <span className="text-xs font-semibold" style={{ color: rsiColor }}>{rsiLbl}</span>
          </div>
          <MacdBadge macd={signal.sources.macd} />
          <div className="text-xs text-[#666]">
            Conf. <span className="text-[#A0A0A0] font-semibold">{Math.round(signal.confidence * 100)}%</span>
          </div>
        </div>
      </div>

      {/* ── Jin10 headline ── */}
      <div className="rounded-lg bg-[#0D0D0D] p-2.5 text-xs leading-relaxed text-[#888]">
        <span className="mr-1 text-[#3B82F6] font-semibold">Jin10</span>
        {signal.sources.jin10_headline}
      </div>

      {/* ── Footer ── */}
      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#444]">
        <Clock className="h-3 w-3" />
        {timeAgo(signal.updated_at)}
      </div>
    </div>
  );
}

// ── Summary Bar ──────────────────────────────────────────────────
function SummaryBar({ signals }: { signals: Signal[] }) {
  const buy  = signals.filter((s) => s.signal === "BUY").length;
  const hold = signals.filter((s) => s.signal === "HOLD").length;
  const sell = signals.filter((s) => s.signal === "SELL").length;
  const total = signals.length || 1;

  return (
    <div className="mb-6 grid grid-cols-3 gap-3">
      {[
        { label: "BUY",  count: buy,  color: "#22C55E", pct: Math.round(buy  / total * 100) },
        { label: "HOLD", count: hold, color: "#F59E0B", pct: Math.round(hold / total * 100) },
        { label: "SELL", count: sell, color: "#EF4444", pct: Math.round(sell / total * 100) },
      ].map(({ label, count, color, pct }) => (
        <div key={label} className="rounded-xl border border-[#2A2A35] bg-[#15151B] px-4 py-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-black text-white">{count}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">{pct}%</div>
              {/* Mini bar */}
              <div className="mt-1 h-1.5 w-16 rounded-full bg-[#2A2A35]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Signal of Day ────────────────────────────────────────────────
function TopSignal({ signal }: { signal: SignalWithHistory }) {
  const cfg = SIGNAL_CONFIG[signal.signal];
  const isPos = signal.change >= 0;

  return (
    <div className={`mb-6 rounded-2xl border bg-gradient-to-br from-[#15151B] to-[#0D0D0D] p-6 ${cfg.border} ${cfg.glow}`}>
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4" style={{ color: cfg.bg }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: cfg.bg }}>
          Strongest Signal Today
        </span>
      </div>

      <div className="flex items-center gap-6">
        <StrengthRing strength={signal.strength} signal={signal.signal} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-white">{signal.ticker}</span>
            <span
              className="rounded-lg px-3 py-1 text-base font-black tracking-widest"
              style={{ background: cfg.bg + "22", color: cfg.bg, border: `1px solid ${cfg.bg}55` }}
            >
              {signal.signal}
            </span>
            <span className={`text-xl font-bold ${isPos ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {isPos ? "+" : ""}{signal.change.toFixed(2)}%
            </span>
          </div>
          <div className="mt-1 text-sm text-[#A0A0A0]">${signal.price.toFixed(2)} · Confidence {Math.round(signal.confidence * 100)}%</div>
          <div className="mt-2 h-8 w-full">
            <Sparkline data={signal.history ?? []} color={cfg.bg} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#2A2A35] bg-[#15151B] p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded bg-[#2A2A35]" />
          <div className="h-4 w-32 rounded bg-[#2A2A35]" />
        </div>
        <div className="h-20 w-20 rounded-full bg-[#2A2A35]" />
      </div>
      <div className="h-14 w-full rounded bg-[#2A2A35]" />
      <div className="flex gap-3">
        <div className="h-16 w-16 rounded-full bg-[#2A2A35]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-[#2A2A35]" />
          <div className="h-4 w-24 rounded bg-[#2A2A35]" />
          <div className="h-3 w-16 rounded bg-[#2A2A35]" />
        </div>
      </div>
      <div className="h-10 w-full rounded-lg bg-[#2A2A35]" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [signals, setSignals] = useState<SignalWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchHistory = useCallback(async (ticker: string): Promise<HistoryPoint[]> => {
    try {
      const res = await fetch(`/api/history/${ticker}`);
      const data = await res.json();
      return data.data ?? [];
    } catch {
      return [];
    }
  }, []);

  const fetchSignals = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch(`/api/signals?tickers=${WATCHLIST.join(",")}`);
      const data = await res.json();
      const sigs: Signal[] = data.signals ?? [];

      // Fetch history in parallel
      const withHistory: SignalWithHistory[] = await Promise.all(
        sigs.map(async (s) => ({
          ...s,
          history: await fetchHistory(s.ticker),
        }))
      );

      setSignals(withHistory);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchHistory]);

  useEffect(() => {
    fetchSignals();
    const iv = setInterval(() => fetchSignals(), POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchSignals]);

  const topSignal = signals.length
    ? signals.reduce((best, s) => (s.strength > best.strength ? s : best))
    : null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-[#1C1C24] bg-[#0D0D0D]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/15">
              <Zap className="h-4 w-4 text-[#22C55E]" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">AlphaEdge</h1>
              <div className="text-[10px] text-[#444] tracking-widest uppercase">Signal Dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="hidden text-xs text-[#444] sm:block">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchSignals(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#2A2A35] bg-[#15151B] px-3 py-1.5 text-xs text-[#A0A0A0] transition hover:bg-[#1C1C24] disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#22C55E]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              Live
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ── Summary bar ── */}
        {!loading && signals.length > 0 && <SummaryBar signals={signals} />}

        {/* ── Top signal ── */}
        {!loading && topSignal && <TopSignal signal={topSignal} />}

        {/* ── Watchlist grid ── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#444]">Watchlist</h2>
          <span className="text-xs text-[#333]">Auto-refresh 60s</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? WATCHLIST.map((t) => <CardSkeleton key={t} />)
            : signals.map((s) => <SignalCard key={s.ticker} signal={s} />)}
        </div>
      </main>
    </div>
  );
}
