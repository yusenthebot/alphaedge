"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Zap,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import type { Signal } from "@/types/signal";

// ── Types ──────────────────────────────────────────────────────────
interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  addedAt: string;
}

interface PositionWithSignal extends Position {
  currentPrice: number;
  change: number;
  signal: "BUY" | "HOLD" | "SELL";
  strength: number;
  pnlDollar: number;
  pnlPercent: number;
  marketValue: number;
}

interface PortfolioSnapshot {
  date: string;
  value: number;
}

// ── Constants ────────────────────────────────────────────────────
const STORAGE_KEY = "alphaedge-portfolio";
const POLL_INTERVAL = 60_000;

const SIGNAL_CONFIG = {
  BUY:  { bg: "#00FF41", text: "text-[#00FF41]", border: "border-[#00FF41]/40" },
  HOLD: { bg: "#FFB800", text: "text-[#FFB800]", border: "border-[#FFB800]/40" },
  SELL: { bg: "#FF3131", text: "text-[#FF3131]", border: "border-[#FF3131]/40" },
} as const;

// ── Helpers ───────────────────────────────────────────────────────
function loadPositions(): Position[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function savePositions(positions: Position[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {}
}

function formatCurrency(val: number): string {
  return val.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatPnl(val: number): string {
  const sign = val >= 0 ? "+" : "";
  return sign + val.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatPct(val: number): string {
  const sign = val >= 0 ? "+" : "";
  return sign + val.toFixed(2) + "%";
}

function generateHistoricalData(positions: PositionWithSignal[]): PortfolioSnapshot[] {
  if (positions.length === 0) return [];
  const today = new Date();
  const points: PortfolioSnapshot[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    let dayValue = 0;
    for (const pos of positions) {
      // Simulate historical price with random walk from current price
      const volatility = 0.015;
      const drift = (i / 29) * (Math.random() * 0.1 - 0.05);
      const factor = 1 - drift - (Math.random() - 0.5) * volatility * Math.sqrt(i);
      dayValue += pos.shares * pos.currentPrice * factor;
    }
    points.push({ date: dateStr, value: Math.round(dayValue * 100) / 100 });
  }
  // Last point = actual current value
  const totalCurrent = positions.reduce((sum, p) => sum + p.marketValue, 0);
  points[points.length - 1].value = totalCurrent;
  return points;
}

// ── Signal suggestion ────────────────────────────────────────────
function getSignalSuggestion(pos: PositionWithSignal): { text: string; color: string } | null {
  if (pos.signal === "BUY" && pos.strength >= 60) {
    return { text: "BUY more — strong bullish signal", color: "#00FF41" };
  }
  if (pos.signal === "SELL" && pos.strength >= 60) {
    return { text: "REDUCE — bearish signal detected", color: "#FF3131" };
  }
  if (pos.signal === "HOLD") {
    return { text: "HOLD — wait for clearer signal", color: "#FFB800" };
  }
  return null;
}

// ── Custom Tooltip ───────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-3 py-2 text-xs shadow-xl">
      <div className="text-[#666]">{label}</div>
      <div className="font-bold text-[var(--pixel-text)]">{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [signals, setSignals] = useState<Record<string, Signal>>({});
  const [loading, setLoading] = useState(true);
  const [addingPosition, setAddingPosition] = useState(false);
  const [followSignal, setFollowSignal] = useState(false);

  // Add form state
  const [formTicker, setFormTicker] = useState("");
  const [formShares, setFormShares] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formError, setFormError] = useState("");

  // Load positions from localStorage
  useEffect(() => {
    setPositions(loadPositions());
  }, []);

  // Fetch signals for all position tickers
  const fetchSignals = useCallback(async (tickers: string[]) => {
    if (tickers.length === 0) {
      setSignals({});
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/signals?tickers=${tickers.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch signals");
      const data = await res.json();
      const map: Record<string, Signal> = {};
      for (const s of data.signals || []) {
        map[s.ticker] = s;
      }
      setSignals(map);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tickers = [...new Set(positions.map((p) => p.ticker))];
    fetchSignals(tickers);
    const interval = setInterval(() => fetchSignals(tickers), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [positions, fetchSignals]);

  // Add position
  const addPosition = () => {
    const ticker = formTicker.trim().toUpperCase();
    const shares = parseFloat(formShares);
    const avgCost = parseFloat(formCost);

    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      setFormError("Invalid ticker (1-5 letters)");
      return;
    }
    if (isNaN(shares) || shares <= 0) {
      setFormError("Shares must be > 0");
      return;
    }
    if (isNaN(avgCost) || avgCost <= 0) {
      setFormError("Cost must be > 0");
      return;
    }

    const newPos: Position = { ticker, shares, avgCost, addedAt: new Date().toISOString() };
    const updated = [...positions, newPos];
    setPositions(updated);
    savePositions(updated);
    setAddingPosition(false);
    setFormTicker("");
    setFormShares("");
    setFormCost("");
    setFormError("");
  };

  // Remove position
  const removePosition = (index: number) => {
    const updated = positions.filter((_, i) => i !== index);
    setPositions(updated);
    savePositions(updated);
  };

  // Enrich positions with signal data
  const enrichedPositions: PositionWithSignal[] = useMemo(() => {
    return positions.map((pos) => {
      const sig = signals[pos.ticker];
      const currentPrice = sig?.price ?? pos.avgCost;
      const marketValue = pos.shares * currentPrice;
      const costBasis = pos.shares * pos.avgCost;
      const pnlDollar = marketValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnlDollar / costBasis) * 100 : 0;
      return {
        ...pos,
        currentPrice,
        change: sig?.change ?? 0,
        signal: sig?.signal ?? "HOLD",
        strength: sig?.strength ?? 0,
        pnlDollar,
        pnlPercent,
        marketValue,
      };
    });
  }, [positions, signals]);

  // Portfolio summary
  const summary = useMemo(() => {
    if (enrichedPositions.length === 0) {
      return { totalValue: 0, totalCost: 0, totalPnl: 0, totalPnlPct: 0, best: null as PositionWithSignal | null, worst: null as PositionWithSignal | null };
    }
    const totalValue = enrichedPositions.reduce((s, p) => s + p.marketValue, 0);
    const totalCost = enrichedPositions.reduce((s, p) => s + p.shares * p.avgCost, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const sorted = [...enrichedPositions].sort((a, b) => b.pnlPercent - a.pnlPercent);
    return { totalValue, totalCost, totalPnl, totalPnlPct, best: sorted[0], worst: sorted[sorted.length - 1] };
  }, [enrichedPositions]);

  // Chart data
  const chartData = useMemo(() => generateHistoricalData(enrichedPositions), [enrichedPositions]);
  const chartColor = summary.totalPnl >= 0 ? "#00FF41" : "#FF3131";

  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] text-[var(--pixel-text)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-[#666] transition hover:text-[var(--pixel-text)]">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#00FF41]/15">
              <Briefcase className="h-4 w-4 text-[#00FF41]" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[var(--pixel-text)]">Portfolio</h1>
              <div className="text-[10px] text-[#444] tracking-widest uppercase">Paper Trading</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Follow Signal toggle */}
            <button
              onClick={() => setFollowSignal(!followSignal)}
              className={`flex items-center gap-1.5 rounded-none border px-2.5 py-1.5 text-xs transition ${
                followSignal
                  ? "border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41]"
                  : "border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] text-[#666] hover:text-[var(--pixel-text)]"
              }`}
            >
              {followSignal ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
              Follow Signal
            </button>

            {/* Add Position */}
            <button
              onClick={() => setAddingPosition(true)}
              className="flex items-center gap-1 rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] px-2.5 py-1.5 text-xs text-[#A0A0A0] transition hover:bg-[var(--pixel-surface-2)] hover:text-[var(--pixel-text)]"
            >
              <Plus className="h-3 w-3" />
              Add Position
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ── Add Position Modal ── */}
        {addingPosition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--pixel-text)]">Add Position</h3>
                <button
                  onClick={() => { setAddingPosition(false); setFormError(""); }}
                  className="text-[#666] transition hover:text-[var(--pixel-text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-[#666]">Ticker</label>
                  <input
                    type="text"
                    value={formTicker}
                    onChange={(e) => { setFormTicker(e.target.value.toUpperCase()); setFormError(""); }}
                    placeholder="NVDA"
                    maxLength={5}
                    className="w-full rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-3 py-2 text-sm text-[var(--pixel-text)] placeholder-[#444] outline-none focus:border-[#00FF41]/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666]">Shares</label>
                  <input
                    type="number"
                    value={formShares}
                    onChange={(e) => { setFormShares(e.target.value); setFormError(""); }}
                    placeholder="10"
                    min="0"
                    step="any"
                    className="w-full rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-3 py-2 text-sm text-[var(--pixel-text)] placeholder-[#444] outline-none focus:border-[#00FF41]/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[#666]">Avg Cost Price ($)</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => { setFormCost(e.target.value); setFormError(""); }}
                    placeholder="875.00"
                    min="0"
                    step="any"
                    className="w-full rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-3 py-2 text-sm text-[var(--pixel-text)] placeholder-[#444] outline-none focus:border-[#00FF41]/50"
                  />
                </div>

                {formError && (
                  <div className="rounded-none bg-[#FF3131]/10 px-3 py-1.5 text-xs text-[#FF3131]">{formError}</div>
                )}

                <button
                  onClick={addPosition}
                  className="w-full rounded-none bg-[#00FF41] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#00FF41]/90"
                >
                  Add to Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && positions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Briefcase className="mb-4 h-12 w-12 text-[#2A2A35]" />
            <h2 className="mb-2 text-lg font-bold text-[#666]">No positions yet</h2>
            <p className="mb-6 text-sm text-[#444]">Add your first paper trade to start tracking</p>
            <button
              onClick={() => setAddingPosition(true)}
              className="flex items-center gap-2 rounded-none bg-[#00FF41] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#00FF41]/90"
            >
              <Plus className="h-4 w-4" />
              Add Position
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && positions.length > 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-none bg-[var(--pixel-surface)]" />
            ))}
          </div>
        )}

        {/* ── Portfolio Content ── */}
        {enrichedPositions.length > 0 && (
          <>
            {/* ── Summary Bar ── */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-[#666]">Total Value</div>
                <div className="text-lg font-bold text-[var(--pixel-text)]">{formatCurrency(summary.totalValue)}</div>
              </div>
              <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-[#666]">Total P&L</div>
                <div className={`text-lg font-bold ${summary.totalPnl >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
                  {formatPnl(summary.totalPnl)}
                </div>
                <div className={`text-xs ${summary.totalPnlPct >= 0 ? "text-[#00FF41]/70" : "text-[#FF3131]/70"}`}>
                  {formatPct(summary.totalPnlPct)}
                </div>
              </div>
              <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-[#666]">Best Performer</div>
                {summary.best && (
                  <>
                    <div className="text-sm font-bold text-[var(--pixel-text)]">{summary.best.ticker}</div>
                    <div className={`text-xs ${summary.best.pnlPercent >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
                      {formatPct(summary.best.pnlPercent)}
                    </div>
                  </>
                )}
              </div>
              <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-[#666]">Worst Performer</div>
                {summary.worst && (
                  <>
                    <div className="text-sm font-bold text-[var(--pixel-text)]">{summary.worst.ticker}</div>
                    <div className={`text-xs ${summary.worst.pnlPercent >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
                      {formatPct(summary.worst.pnlPercent)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Portfolio Value Chart ── */}
            {chartData.length > 1 && (
              <div className="mb-6 rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#666]">Portfolio Value (30d)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C1C24" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#444", fontSize: 10 }}
                      axisLine={{ stroke: "#1C1C24" }}
                      tickLine={false}
                      tickFormatter={(d: string) => d.slice(5)}
                    />
                    <YAxis
                      tick={{ fill: "#444", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                      width={50}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#portfolioGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Positions Table ── */}
            <div className="rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)]">
              <div className="border-b border-[var(--pixel-border-dim)] px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666]">Positions</h3>
              </div>

              {/* Table header */}
              <div className="hidden grid-cols-[1fr_0.7fr_0.8fr_0.8fr_0.9fr_0.7fr_0.7fr_0.3fr] gap-2 border-b-2 border-[var(--pixel-border-dim)] px-4 py-2 text-[10px] uppercase tracking-widest text-[#444] sm:grid">
                <div>Ticker</div>
                <div className="text-right">Shares</div>
                <div className="text-right">Avg Cost</div>
                <div className="text-right">Price</div>
                <div className="text-right">P&L</div>
                <div className="text-right">P&L %</div>
                <div className="text-center">Signal</div>
                <div />
              </div>

              {/* Table rows */}
              {enrichedPositions.map((pos, idx) => {
                const pnlColor = pos.pnlDollar >= 0 ? "text-[#00FF41]" : "text-[#FF3131]";
                const signalCfg = SIGNAL_CONFIG[pos.signal];
                const suggestion = followSignal ? getSignalSuggestion(pos) : null;

                return (
                  <div key={`${pos.ticker}-${idx}`}>
                    {/* Desktop row */}
                    <div className="group hidden grid-cols-[1fr_0.7fr_0.8fr_0.8fr_0.9fr_0.7fr_0.7fr_0.3fr] items-center gap-2 border-b-2 border-[var(--pixel-border-dim)] px-4 py-3 transition hover:bg-[var(--pixel-surface-2)] sm:grid">
                      <div className="flex items-center gap-2">
                        <Link href={`/ticker/${pos.ticker}`} className="font-bold text-[var(--pixel-text)] hover:text-[#00FF41] transition">
                          {pos.ticker}
                        </Link>
                        {pos.change !== 0 && (
                          <span className={`text-[10px] ${pos.change >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
                            {pos.change >= 0 ? "+" : ""}{pos.change.toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm text-[#A0A0A0]">{pos.shares}</div>
                      <div className="text-right text-sm text-[#A0A0A0]">{formatCurrency(pos.avgCost)}</div>
                      <div className="text-right text-sm text-[var(--pixel-text)]">{formatCurrency(pos.currentPrice)}</div>
                      <div className={`text-right text-sm font-medium ${pnlColor}`}>{formatPnl(pos.pnlDollar)}</div>
                      <div className={`text-right text-sm font-medium ${pnlColor}`}>{formatPct(pos.pnlPercent)}</div>
                      <div className="flex justify-center">
                        <span
                          className="rounded-none px-2 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: signalCfg.bg + "20", color: signalCfg.bg }}
                        >
                          {pos.signal}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removePosition(idx)}
                          className="rounded-none p-1 text-[#333] opacity-0 transition hover:bg-[#FF3131]/10 hover:text-[#FF3131] group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile row */}
                    <div className="border-b-2 border-[var(--pixel-border-dim)] p-4 sm:hidden">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link href={`/ticker/${pos.ticker}`} className="font-bold text-[var(--pixel-text)]">{pos.ticker}</Link>
                          <span
                            className="rounded-none px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: signalCfg.bg + "20", color: signalCfg.bg }}
                          >
                            {pos.signal}
                          </span>
                        </div>
                        <button
                          onClick={() => removePosition(idx)}
                          className="rounded-none p-1 text-[#444] transition hover:text-[#FF3131]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1 text-xs">
                        <div className="text-[#666]">{pos.shares} shares @ {formatCurrency(pos.avgCost)}</div>
                        <div className="text-right text-[var(--pixel-text)]">{formatCurrency(pos.currentPrice)}</div>
                        <div className={pnlColor}>{formatPnl(pos.pnlDollar)}</div>
                        <div className={`text-right ${pnlColor}`}>{formatPct(pos.pnlPercent)}</div>
                      </div>
                    </div>

                    {/* Signal suggestion */}
                    {suggestion && (
                      <div
                        className="flex items-center gap-2 border-b-2 border-[var(--pixel-border-dim)] px-4 py-2 text-xs"
                        style={{ backgroundColor: suggestion.color + "08" }}
                      >
                        <Zap className="h-3 w-3" style={{ color: suggestion.color }} />
                        <span style={{ color: suggestion.color }}>{suggestion.text}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
