"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Zap, ArrowLeft, TrendingUp, BarChart3, Activity, RefreshCw } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface AccuracyStat {
  ticker: string;
  total_signals: number;
  buy_signals: number;
  hold_signals: number;
  sell_signals: number;
  signal_changes: number;
  win_rate_approx: number | null;
  most_common_signal: string;
  stability_score: number;
}

type SortKey = "ticker" | "total_signals" | "buy_pct" | "hold_pct" | "sell_pct" | "signal_changes" | "stability_score";
type SortDir = "asc" | "desc";

// ── Constants ──────────────────────────────────────────────────────
const SIGNAL_COLORS = {
  BUY: "#00FF41",
  HOLD: "#FFB800",
  SELL: "#FF3131",
};

// ── Helpers ────────────────────────────────────────────────────────
function pct(n: number, total: number): string {
  if (total === 0) return "0";
  return ((n / total) * 100).toFixed(1);
}

function stabilityColor(score: number): string {
  if (score >= 80) return "#00FF41";
  if (score >= 50) return "#FFB800";
  return "#FF3131";
}

// ── Custom Tooltip ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-[var(--pixel-text)]">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-none" style={{ background: entry.fill }} />
          <span className="text-[#A0A0A0]">{entry.name}:</span>
          <span className="font-medium text-[var(--pixel-text)]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-none border border-[#1C1C24] bg-[var(--pixel-surface)] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[#666] uppercase tracking-wider">{label}</div>
          <div className="mt-1 text-2xl font-bold text-[var(--pixel-text)]">{value}</div>
          {sub && <div className="mt-0.5 text-xs" style={{ color }}>{sub}</div>}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-none"
          style={{ background: `${color}15` }}
        >
          <span style={{ color }}><Icon className="h-5 w-5" /></span>
        </div>
      </div>
    </div>
  );
}

// ── Stability Bar ──────────────────────────────────────────────────
function StabilityBar({ score }: { score: number }) {
  const color = stabilityColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-none bg-[var(--pixel-surface-2)]">
        <div
          className="h-full rounded-none transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{score.toFixed(0)}</span>
    </div>
  );
}

// ── Sort Header ────────────────────────────────────────────────────
function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <th
      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#666] transition hover:text-[var(--pixel-text)]"
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active && (
        <span className="ml-1">{currentDir === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );
}

// ── Signal Badge ───────────────────────────────────────────────────
function SignalBadge({ signal }: { signal: string }) {
  const color = SIGNAL_COLORS[signal as keyof typeof SIGNAL_COLORS] || "#A0A0A0";
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
      style={{ background: `${color}15`, color }}
    >
      {signal}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────
export default function AccuracyPage() {
  const [stats, setStats] = useState<AccuracyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total_signals");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  async function fetchAccuracy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/accuracy");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data.stats || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load accuracy data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccuracy();
  }, []);

  // ── Aggregates ────────────────────────────────────────────────
  const totals = useMemo(() => {
    const t = { signals: 0, buy: 0, hold: 0, sell: 0 };
    for (const s of stats) {
      t.signals += s.total_signals;
      t.buy += s.buy_signals;
      t.hold += s.hold_signals;
      t.sell += s.sell_signals;
    }
    return t;
  }, [stats]);

  // ── Stacked bar chart data ────────────────────────────────────
  const barData = useMemo(
    () =>
      stats.map((s) => ({
        ticker: s.ticker,
        BUY: s.buy_signals,
        HOLD: s.hold_signals,
        SELL: s.sell_signals,
      })),
    [stats]
  );

  // ── Pie chart data ─────────────────────────────────────────────
  const pieData = useMemo(
    () => [
      { name: "BUY", value: totals.buy, fill: SIGNAL_COLORS.BUY },
      { name: "HOLD", value: totals.hold, fill: SIGNAL_COLORS.HOLD },
      { name: "SELL", value: totals.sell, fill: SIGNAL_COLORS.SELL },
    ],
    [totals]
  );

  // ── Sorting ──────────────────────────────────────────────────
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedStats = useMemo(() => {
    const arr = [...stats];
    arr.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "ticker":
          av = a.ticker;
          bv = b.ticker;
          return sortDir === "asc" ? (av as string).localeCompare(bv as string) : (bv as string).localeCompare(av as string);
        case "total_signals":
          av = a.total_signals;
          bv = b.total_signals;
          break;
        case "buy_pct":
          av = a.total_signals ? a.buy_signals / a.total_signals : 0;
          bv = b.total_signals ? b.buy_signals / b.total_signals : 0;
          break;
        case "hold_pct":
          av = a.total_signals ? a.hold_signals / a.total_signals : 0;
          bv = b.total_signals ? b.hold_signals / b.total_signals : 0;
          break;
        case "sell_pct":
          av = a.total_signals ? a.sell_signals / a.total_signals : 0;
          bv = b.total_signals ? b.sell_signals / b.total_signals : 0;
          break;
        case "signal_changes":
          av = a.signal_changes;
          bv = b.signal_changes;
          break;
        case "stability_score":
          av = a.stability_score;
          bv = b.stability_score;
          break;
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [stats, sortKey, sortDir]);

  // ── Skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pixel-bg)]">
        <header className="sticky top-0 z-20 border-b-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#00FF41]/15">
                <Zap className="h-4 w-4 text-[#00FF41]" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-[var(--pixel-text)]">AlphaEdge</h1>
                <div className="text-[10px] text-[#444] tracking-widest uppercase">Signal Accuracy</div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-none bg-[var(--pixel-surface)]" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-none bg-[var(--pixel-surface)]" />
            <div className="h-72 animate-pulse rounded-none bg-[var(--pixel-surface)]" />
          </div>
          <div className="mt-6 h-64 animate-pulse rounded-none bg-[var(--pixel-surface)]" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pixel-bg)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#00FF41]/15">
              <Zap className="h-4 w-4 text-[#00FF41]" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[var(--pixel-text)]">AlphaEdge</h1>
              <div className="text-[10px] text-[#444] tracking-widest uppercase">Signal Accuracy</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-1.5 text-xs text-[#A0A0A0] transition hover:bg-[var(--pixel-surface-2)] hover:text-[var(--pixel-text)]"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </Link>
            <button
              onClick={fetchAccuracy}
              className="flex items-center gap-1.5 rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-1.5 text-xs text-[#A0A0A0] transition hover:bg-[var(--pixel-surface-2)] hover:text-[var(--pixel-text)]"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-6 rounded-none bg-[#FF3131]/10 px-4 py-3 text-sm text-[#FF3131]">
            {error}
          </div>
        )}

        {/* ── Top Stats Row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Signals"
            value={totals.signals.toLocaleString()}
            sub={`${stats.length} tickers tracked`}
            color="#3B82F6"
            icon={BarChart3}
          />
          <StatCard
            label="BUY Signals"
            value={totals.buy.toLocaleString()}
            sub={`${pct(totals.buy, totals.signals)}%`}
            color={SIGNAL_COLORS.BUY}
            icon={TrendingUp}
          />
          <StatCard
            label="HOLD Signals"
            value={totals.hold.toLocaleString()}
            sub={`${pct(totals.hold, totals.signals)}%`}
            color={SIGNAL_COLORS.HOLD}
            icon={Activity}
          />
          <StatCard
            label="SELL Signals"
            value={totals.sell.toLocaleString()}
            sub={`${pct(totals.sell, totals.signals)}%`}
            color={SIGNAL_COLORS.SELL}
            icon={TrendingUp}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stacked Bar Chart */}
          <div className="col-span-1 rounded-none border border-[#1C1C24] bg-[var(--pixel-surface)] p-5 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-[var(--pixel-text)]">Signal Distribution by Ticker</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                  <XAxis dataKey="ticker" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "#A0A0A0" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="BUY" stackId="a" fill={SIGNAL_COLORS.BUY} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="HOLD" stackId="a" fill={SIGNAL_COLORS.HOLD} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="SELL" stackId="a" fill={SIGNAL_COLORS.SELL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-[#444]">
                No signal data yet
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="rounded-none border border-[#1C1C24] bg-[var(--pixel-surface)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[var(--pixel-text)]">Overall Distribution</h2>
            {totals.signals > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#15151B",
                        border: "1px solid #2A2A35",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) => [
                        `${value ?? 0} (${pct(value ?? 0, totals.signals)}%)`,
                        name ?? "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex gap-4">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
                      <span className="h-2.5 w-2.5 rounded-none" style={{ background: d.fill }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-[#444]">
                No data
              </div>
            )}
          </div>
        </div>

        {/* ── Stability Scores ── */}
        <div className="mt-6 rounded-none border border-[#1C1C24] bg-[var(--pixel-surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--pixel-text)]">Signal Stability Score</h2>
          <p className="mb-4 text-xs text-[#666]">
            Low signal changes = stable = higher quality signals. Score: 0 (volatile) → 100 (stable).
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.ticker}
                className="flex items-center justify-between rounded-none border border-[#1C1C24] bg-[var(--pixel-bg)] px-4 py-3"
              >
                <div>
                  <Link
                    href={`/ticker/${s.ticker}`}
                    className="text-sm font-bold text-[var(--pixel-text)] transition hover:text-[#00FF41]"
                  >
                    {s.ticker}
                  </Link>
                  <div className="text-[10px] text-[#444]">{s.signal_changes} changes</div>
                </div>
                <StabilityBar score={s.stability_score} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Signal History Table ── */}
        <div className="mt-6 rounded-none border border-[#1C1C24] bg-[var(--pixel-surface)]">
          <div className="border-b-2 border-[var(--pixel-border-dim)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--pixel-text)]">Signal History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--pixel-border-dim)]">
                  <SortHeader label="Ticker" sortKey="ticker" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
                    Most Common
                  </th>
                  <SortHeader label="Total" sortKey="total_signals" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="BUY%" sortKey="buy_pct" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="HOLD%" sortKey="hold_pct" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="SELL%" sortKey="sell_pct" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Changes" sortKey="signal_changes" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Stability" sortKey="stability_score" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((s) => (
                  <tr
                    key={s.ticker}
                    className="border-b-2 border-[var(--pixel-border-dim)] transition hover:bg-[var(--pixel-surface-2)]/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/ticker/${s.ticker}`}
                        className="font-bold text-[var(--pixel-text)] transition hover:text-[#00FF41]"
                      >
                        {s.ticker}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <SignalBadge signal={s.most_common_signal} />
                    </td>
                    <td className="px-4 py-3 text-[var(--pixel-text)]">{s.total_signals}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: SIGNAL_COLORS.BUY }}>
                        {pct(s.buy_signals, s.total_signals)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: SIGNAL_COLORS.HOLD }}>
                        {pct(s.hold_signals, s.total_signals)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: SIGNAL_COLORS.SELL }}>
                        {pct(s.sell_signals, s.total_signals)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#A0A0A0]">{s.signal_changes}</td>
                    <td className="px-4 py-3">
                      <StabilityBar score={s.stability_score} />
                    </td>
                  </tr>
                ))}
                {sortedStats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#444]">
                      No signal history available. Signals will appear here after the backend generates them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
