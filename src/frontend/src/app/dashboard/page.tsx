"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Zap, RefreshCw, Clock, Plus, X, ChevronDown, Bell, Search, Briefcase, BarChart3 } from "lucide-react";
import type { Signal } from "@/types/signal";
import NewsFeed from "@/components/NewsFeed";
import SearchBar from "@/components/SearchBar";
import MarketOverview from "@/components/MarketOverview";
import { SignalStrengthBar } from "@/components/PixelProgress";

// ── Types ──────────────────────────────────────────────────────────
interface HistoryPoint {
  date: string;
  close: number;
}

interface SignalWithHistory extends Signal {
  history?: HistoryPoint[];
}

type SignalFilter = "ALL" | "BUY" | "HOLD" | "SELL";
type SortMode = "strength" | "change" | "alpha";

// ── Constants ────────────────────────────────────────────────────
const DEFAULT_WATCHLIST = ["NVDA", "TSLA", "AAPL", "BABA", "SPY", "MSFT", "AMD", "META"];
const STORAGE_KEY = "alphaedge-watchlist";
const POLL_INTERVAL = 60_000;

const SIGNAL_CONFIG = {
  BUY:  { bg: "#00FF41", text: "text-[#00FF41]", glow: "shadow-[0_0_16px_rgba(0,255,65,0.4),_0_0_32px_rgba(0,255,65,0.15)]",  border: "border-[#00FF41]/50" },
  HOLD: { bg: "#FFB800", text: "text-[#FFB800]", glow: "shadow-[0_0_16px_rgba(255,184,0,0.35),_0_0_24px_rgba(255,184,0,0.12)]", border: "border-[#FFB800]/50" },
  SELL: { bg: "#FF3131", text: "text-[#FF3131]", glow: "shadow-[0_0_16px_rgba(255,49,49,0.4),_0_0_32px_rgba(255,49,49,0.15)]",  border: "border-[#FF3131]/50" },
} as const;

const FILTER_COLORS: Record<SignalFilter, string> = {
  ALL: "#00AA2B",
  BUY: "#00FF41",
  HOLD: "#FFB800",
  SELL: "#FF3131",
};

const SORT_LABELS: Record<SortMode, string> = {
  strength: "Strength ↓",
  change: "Change %",
  alpha: "Alphabetical",
};

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

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_WATCHLIST;
}

function saveWatchlist(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
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
        <RadialBar dataKey="value" cornerRadius={0} background={{ fill: "#0B160B" }} />
      </RadialBarChart>
      <span className="absolute text-xs font-mono font-bold" style={{ color }}>{rsi}</span>
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
        <RadialBar dataKey="value" cornerRadius={0} background={{ fill: "#0B160B" }} />
      </RadialBarChart>
      <div className="absolute text-center">
        <div className="text-sm font-mono font-bold" style={{ color: cfg?.bg }}>{strength}</div>
        <div className="text-[9px] font-mono" style={{ color: "var(--pixel-text-muted)" }}>/ 100</div>
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
          contentStyle={{ background: "var(--pixel-surface)", border: "1px solid var(--pixel-border-dim)", borderRadius: 0, fontSize: 10, fontFamily: "var(--font-mono)" }}
          labelStyle={{ color: "var(--pixel-text-muted)" }}
          formatter={(v) => [`$${Number(v).toFixed(2)}`, ""]}
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
      className={`border-2 px-1.5 py-0.5 font-mono text-[0.5rem] font-semibold uppercase tracking-widest ${
        isBull ? "border-[#00FF41]/50 text-[#00FF41] bg-[#00FF41]/08"
        : isBear ? "border-[#FF3131]/50 text-[#FF3131] bg-[#FF3131]/08"
        : "border-[var(--pixel-border-dim)] text-[var(--pixel-text-off)]"
      }`}
    >
      MACD {macd}
    </span>
  );
}

// ── Signal Card ──────────────────────────────────────────────────
function SignalCard({ signal, onRemove }: { signal: SignalWithHistory; onRemove: (ticker: string) => void }) {
  const cfg = SIGNAL_CONFIG[signal.signal];
  const isPos = signal.change >= 0;
  const sparkColor = isPos ? "#00FF41" : "#FF3131";
  const { label: rsiLbl, color: rsiColor } = rsiLabel(signal.sources.rsi);

  return (
    <div className="group relative">
      {/* ── Remove button (hover-only) ── */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(signal.ticker);
        }}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] text-[var(--pixel-text-muted)] opacity-0 transition-opacity hover:border-[var(--pixel-sell)] hover:text-[var(--pixel-sell)] group-hover:opacity-100"
        title={`Remove ${signal.ticker}`}
      >
        <X className="h-3 w-3" />
      </button>

      <Link href={`/ticker/${signal.ticker}`}>
        <div
          className={`border-2 bg-[var(--pixel-surface)] p-5 transition-all duration-150 hover:bg-[var(--pixel-surface-2)] ${cfg.border} ${cfg.glow}`}
        >
          {/* ── Top row: ticker + price + signal badge ── */}
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="pixel-title text-[0.65rem] tracking-wide" style={{ color: cfg.bg }}>{signal.ticker}</span>
                <span
                  className="border-2 px-2 py-0.5 font-mono text-[0.5rem] font-bold tracking-widest uppercase"
                  style={{ background: cfg.bg + "14", color: cfg.bg, borderColor: cfg.bg + "88", boxShadow: `0 0 6px ${cfg.bg}44` }}
                >
                  {signal.signal}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="pixel-data text-base font-bold">${signal.price.toFixed(2)}</span>
                <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold ${isPos ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
                  {isPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {isPos ? "+" : ""}{signal.change.toFixed(2)}%
                </span>
              </div>
            </div>
            {/* Strength bar */}
            <SignalStrengthBar value={signal.strength} signal={signal.signal} className="w-20" />
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
                <span className="pixel-label">RSI</span>
                <span className="font-mono text-[0.6rem] font-semibold" style={{ color: rsiColor }}>{rsiLbl}</span>
              </div>
              <MacdBadge macd={signal.sources.macd} />
              <div className="pixel-label">
                CONF <span className="text-[var(--pixel-text-dim)]">{Math.round(signal.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* ── Jin10 headline ── */}
          <div className="border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] p-2.5 text-[0.6rem] leading-relaxed font-mono" style={{ color: "var(--pixel-text-off)" }}>
            <span className="mr-1 font-mono text-[var(--pixel-accent)] font-semibold">JIN10 ▸</span>
            {signal.sources.jin10_headline}
          </div>

          {/* ── Footer ── */}
          <div className="mt-2.5 flex items-center gap-1 pixel-label text-[0.45rem]">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(signal.updated_at)}
          </div>
        </div>
      </Link>
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
        { label: "BUY",  count: buy,  color: "#00FF41", pct: Math.round(buy  / total * 100) },
        { label: "HOLD", count: hold, color: "#FFB800", pct: Math.round(hold / total * 100) },
        { label: "SELL", count: sell, color: "#FF3131", pct: Math.round(sell / total * 100) },
      ].map(({ label, count, color, pct }) => (
        <div key={label} className="border-2 bg-[var(--pixel-surface)] px-4 py-3 transition hover:bg-[var(--pixel-surface-2)]" style={{ borderColor: color + "55" }}>
          <div className="flex items-end justify-between">
            <div>
              <div className="pixel-data text-2xl font-black" style={{ color }}>{count}</div>
              <div className="pixel-label mt-0.5 text-[0.5rem]" style={{ color }}>{label}</div>
            </div>
            <div className="text-right">
              <div className="pixel-data text-sm font-bold" style={{ color }}>{pct}%</div>
              {/* Pixel mini bar */}
              <div className="mt-1 h-1.5 w-16" style={{ background: color + "14", border: `1px solid ${color}33` }}>
                <div className="h-full" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 4px ${color}88` }} />
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
    <div className={`mb-6 border-2 bg-[var(--pixel-surface)] p-6 ${cfg.border} ${cfg.glow}`}>
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-4 w-4" style={{ color: cfg.bg }} />
        <span className="pixel-title text-[0.5rem]" style={{ color: cfg.bg }}>
          ▸ Strongest Signal Today
        </span>
        <div className="flex-1 h-px" style={{ background: cfg.bg + "33" }} />
      </div>

      <div className="flex items-center gap-6">
        <StrengthRing strength={signal.strength} signal={signal.signal} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="pixel-title text-xl" style={{ color: cfg.bg }}>{signal.ticker}</span>
            <span
              className="border-2 px-3 py-1 font-mono text-sm font-black tracking-widest uppercase"
              style={{ background: cfg.bg + "14", color: cfg.bg, borderColor: cfg.bg + "88", boxShadow: `0 0 8px ${cfg.bg}44` }}
            >
              {signal.signal}
            </span>
            <span className={`pixel-data text-base font-bold ${isPos ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
              {isPos ? "+" : ""}{signal.change.toFixed(2)}%
            </span>
          </div>
          <div className="mt-1 pixel-label">${signal.price.toFixed(2)} · CONF {Math.round(signal.confidence * 100)}%</div>
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
    <div className="border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-[var(--pixel-border-dim)]" />
          <div className="h-3 w-28 bg-[var(--pixel-border-dim)]" />
        </div>
        <div className="h-16 w-16 bg-[var(--pixel-border-dim)]" />
      </div>
      <div className="h-12 w-full bg-[var(--pixel-border-dim)]" />
      <div className="flex gap-3">
        <div className="h-14 w-14 bg-[var(--pixel-border-dim)]" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-16 bg-[var(--pixel-border-dim)]" />
          <div className="h-3 w-20 bg-[var(--pixel-border-dim)]" />
          <div className="h-2.5 w-14 bg-[var(--pixel-border-dim)]" />
        </div>
      </div>
      <div className="h-8 w-full bg-[var(--pixel-border-dim)]" />
    </div>
  );
}

// ── Sort Dropdown ─────────────────────────────────────────────────
function SortDropdown({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)]"
      >
        Sort: {SORT_LABELS[value]}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] py-1" style={{ boxShadow: "4px 4px 0px rgba(0,255,65,0.1)" }}>
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { onChange(mode); setOpen(false); }}
              className={`block w-full border-b border-[var(--pixel-border-dim)] px-3 py-1.5 text-left font-mono text-[0.55rem] uppercase tracking-wider transition last:border-b-0 hover:bg-[var(--pixel-surface-2)] hover:text-[var(--pixel-text)] ${
                value === mode ? "text-[var(--pixel-buy)] font-semibold" : "text-[var(--pixel-text-off)]"
              }`}
            >
              {value === mode && "▸ "}{SORT_LABELS[mode]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [signals, setSignals] = useState<SignalWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [filter, setFilter] = useState<SignalFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("strength");
  const [addingTicker, setAddingTicker] = useState(false);
  const [tickerInput, setTickerInput] = useState("");
  const [tickerError, setTickerError] = useState("");
  const [hasHighAlerts, setHasHighAlerts] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch alerts to check for HIGH severity
  useEffect(() => {
    async function checkAlerts() {
      try {
        const res = await fetch("/api/alerts");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const alerts = data.alerts ?? [];
        setHasHighAlerts(alerts.some((a: { severity: string }) => a.severity === "high"));
      } catch {}
    }
    checkAlerts();
  }, []);

  // Focus input when add mode is activated
  useEffect(() => {
    if (addingTicker && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [addingTicker]);

  const fetchHistory = useCallback(async (ticker: string): Promise<HistoryPoint[]> => {
    try {
      const res = await fetch(`/api/history/${ticker}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data ?? [];
    } catch {
      return [];
    }
  }, []);

  const fetchSignals = useCallback(async (tickers: string[], manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch(`/api/signals?tickers=${tickers.join(",")}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  // Fetch signals whenever watchlist changes
  useEffect(() => {
    setLoading(true);
    fetchSignals(watchlist);
    const iv = setInterval(() => fetchSignals(watchlist), POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [watchlist, fetchSignals]);

  // ── Watchlist management ──
  const addTicker = useCallback((raw: string) => {
    const ticker = raw.trim().toUpperCase();
    if (!ticker || ticker.length > 5 || !/^[A-Z]{1,5}$/.test(ticker)) {
      setTickerError("Invalid ticker (1-5 letters)");
      return;
    }
    if (watchlist.includes(ticker)) {
      setTickerError(`${ticker} already in watchlist`);
      return;
    }
    const next = [...watchlist, ticker];
    setWatchlist(next);
    saveWatchlist(next);
    setTickerInput("");
    setTickerError("");
    setAddingTicker(false);
  }, [watchlist]);

  const removeTicker = useCallback((ticker: string) => {
    const next = watchlist.filter((t) => t !== ticker);
    if (next.length === 0) return; // don't allow empty watchlist
    setWatchlist(next);
    saveWatchlist(next);
    setSignals((prev) => prev.filter((s) => s.ticker !== ticker));
  }, [watchlist]);

  // ── Filtered + sorted signals ──
  const filteredSorted = useMemo(() => {
    let result = filter === "ALL" ? signals : signals.filter((s) => s.signal === filter);

    switch (sortMode) {
      case "strength":
        result = [...result].sort((a, b) => b.strength - a.strength);
        break;
      case "change":
        result = [...result].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        break;
      case "alpha":
        result = [...result].sort((a, b) => a.ticker.localeCompare(b.ticker));
        break;
    }
    return result;
  }, [signals, filter, sortMode]);

  // Signal counts for filter badges
  const signalCounts = useMemo(() => ({
    ALL: signals.length,
    BUY: signals.filter((s) => s.signal === "BUY").length,
    HOLD: signals.filter((s) => s.signal === "HOLD").length,
    SELL: signals.filter((s) => s.signal === "SELL").length,
  }), [signals]);

  const topSignal = signals.length
    ? signals.reduce((best, s) => (s.strength > best.strength ? s : best))
    : null;

  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] text-[var(--pixel-text)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[var(--pixel-border)] bg-[var(--pixel-surface)]" style={{ boxShadow: "var(--pixel-glow-green)" }}>
              <Zap className="h-4 w-4" style={{ color: "var(--pixel-buy)" }} />
            </div>
            <div>
              <h1 className="pixel-title text-[0.6rem]">AlphaEdge</h1>
              <div className="pixel-label text-[0.45rem]">Signal Dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Alerts link */}
            <Link
              href="/alerts"
              className="relative flex items-center gap-1 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-sell)] hover:text-[var(--pixel-sell)]"
            >
              <Bell className="h-3 w-3" />
              Alerts
              {hasHighAlerts && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-[var(--pixel-sell)] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 bg-[var(--pixel-sell)]" style={{ boxShadow: "var(--pixel-glow-red)" }} />
                </span>
              )}
            </Link>

            {/* Accuracy link */}
            <Link
              href="/accuracy"
              className="flex items-center gap-1 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-accent)] hover:text-[var(--pixel-accent)]"
            >
              <BarChart3 className="h-3 w-3" />
              Accuracy
            </Link>

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)]"
            >
              <Search className="h-3 w-3" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="ml-1 hidden border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-1 py-0.5 font-mono text-[0.45rem] text-[var(--pixel-text-muted)] sm:inline">
                ⌘K
              </kbd>
            </button>

            {/* Portfolio link */}
            <Link
              href="/portfolio"
              className="flex items-center gap-1 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-accent)] hover:text-[var(--pixel-accent)]"
            >
              <Briefcase className="h-3 w-3" />
              Portfolio
            </Link>

            {/* Add Ticker button */}
            {addingTicker ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={addInputRef}
                  type="text"
                  value={tickerInput}
                  onChange={(e) => { setTickerInput(e.target.value.toUpperCase()); setTickerError(""); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTicker(tickerInput);
                    if (e.key === "Escape") { setAddingTicker(false); setTickerInput(""); setTickerError(""); }
                  }}
                  placeholder="TICKER"
                  maxLength={5}
                  className="w-20 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2 py-1.5 font-mono text-[0.6rem] uppercase text-[var(--pixel-text)] placeholder-[var(--pixel-text-muted)] outline-none focus:border-[var(--pixel-border)]"
                  style={{ boxShadow: "none" }}
                />
                <button
                  onClick={() => addTicker(tickerInput)}
                  className="border-2 border-[var(--pixel-buy)] bg-[rgba(0,255,65,0.08)] px-2 py-1.5 font-mono text-[0.55rem] font-semibold uppercase tracking-widest text-[var(--pixel-buy)] transition hover:bg-[var(--pixel-buy)] hover:text-[var(--pixel-bg)]"
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingTicker(false); setTickerInput(""); setTickerError(""); }}
                  className="border border-[var(--pixel-border-dim)] px-1.5 py-1.5 text-[var(--pixel-text-muted)] transition hover:border-[var(--pixel-sell)] hover:text-[var(--pixel-sell)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTicker(true)}
                className="flex items-center gap-1 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)]"
              >
                <Plus className="h-3 w-3" />
                + Ticker
              </button>
            )}

            {lastUpdate && (
              <span className="hidden font-mono text-[0.5rem] text-[var(--pixel-text-muted)] sm:block">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchSignals(watchlist, true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--pixel-text-off)] transition hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)] disabled:opacity-30"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-widest" style={{ color: "var(--pixel-buy)" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-[var(--pixel-buy)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-[var(--pixel-buy)]" style={{ boxShadow: "var(--pixel-glow-green)" }} />
              </span>
              Live
            </div>
          </div>
        </div>
        {/* Ticker error toast */}
        {tickerError && (
          <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6">
            <div className="border-2 border-[var(--pixel-sell)] bg-[rgba(255,49,49,0.08)] px-3 py-1.5 font-mono text-[0.55rem] uppercase text-[var(--pixel-sell)]">
              ▸ {tickerError}
            </div>
          </div>
        )}
      </header>

      {/* ── Search modal ── */}
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ── Summary bar ── */}
        {!loading && signals.length > 0 && <SummaryBar signals={signals} />}

        {/* ── Market Heatmap ── */}
        <MarketOverview />

        {/* ── Top signal ── */}
        {!loading && topSignal && <TopSignal signal={topSignal} />}

        {/* ── Watchlist header ── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="pixel-title text-[0.5rem]">▸ Watchlist</h2>
          <span className="pixel-label text-[0.45rem]">Auto-refresh 60s</span>
        </div>

        {/* ── Filter tabs + Sort controls ── */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {(["ALL", "BUY", "HOLD", "SELL"] as SignalFilter[]).map((tab) => {
              const isActive = filter === tab;
              const color = FILTER_COLORS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className="flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-widest transition"
                  style={
                    isActive
                      ? { background: color + "14", color, borderColor: color + "88", boxShadow: `0 0 6px ${color}44` }
                      : { background: "transparent", borderColor: "var(--pixel-border-dim)", color: "var(--pixel-text-muted)" }
                  }
                >
                  {isActive && "▸ "}{tab}
                  <span
                    className="border border-current px-1 py-0.5 text-[0.45rem] font-bold leading-none"
                  >
                    {signalCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
          <SortDropdown value={sortMode} onChange={setSortMode} />
        </div>

        {/* ── Card count ── */}
        {!loading && (
          <div className="mb-4 pixel-label text-[0.45rem]">
            Showing {filteredSorted.length} of {signals.length} signals
          </div>
        )}

        {/* ── Watchlist grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? watchlist.map((t) => <CardSkeleton key={t} />)
            : filteredSorted.map((s) => (
                <SignalCard key={s.ticker} signal={s} onRemove={removeTicker} />
              ))}
        </div>

        {/* Empty state for filters */}
        {!loading && filteredSorted.length === 0 && signals.length > 0 && (
          <div className="py-12 text-center pixel-label">
            No {filter} signals found.
          </div>
        )}

        {/* ── Jin10 News Feed ── */}
        <div className="mt-8">
          <NewsFeed />
        </div>
      </main>
    </div>
  );
}
