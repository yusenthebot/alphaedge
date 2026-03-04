"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { Signal } from "@/types/signal";

const MARKET_TICKERS = ["SPY", "QQQ", "DIA", "IWM", "XLK", "XLF", "XLE", "XLV"];

const TICKER_LABELS: Record<string, string> = {
  SPY: "S&P 500",
  QQQ: "Nasdaq",
  DIA: "Dow Jones",
  IWM: "Russell 2K",
  XLK: "Tech",
  XLF: "Finance",
  XLE: "Energy",
  XLV: "Health",
};

const SIGNAL_COLORS: Record<string, string> = {
  BUY: "#00FF41",
  HOLD: "#FFB800",
  SELL: "#FF3131",
};

function tileColor(change: number): string {
  if (change >= 2) return "#00FF41";
  if (change > 0) return "#4ADE80";
  if (change === 0) return "#6B7280";
  if (change > -2) return "#F87171";
  return "#FF3131";
}

function tileBg(change: number): string {
  const color = tileColor(change);
  return color + "18";
}

function tileBorder(change: number): string {
  const color = tileColor(change);
  return color + "30";
}

export default function MarketOverview() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      const res = await fetch(`/api/signals?tickers=${MARKET_TICKERS.join(",")}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSignals(data.signals ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("MarketOverview fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const iv = setInterval(fetchMarketData, 120_000); // refresh every 2 min
    return () => clearInterval(iv);
  }, [fetchMarketData]);

  // Map signals by ticker for quick lookup
  const signalMap = new Map(signals.map((s) => [s.ticker, s]));

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--pixel-text-muted)]">Market Heatmap</h2>
        {lastUpdated && (
          <span className="flex items-center gap-1 text-[10px] text-[#333]">
            <Clock className="h-3 w-3" />
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Heatmap grid: 2 rows × 4 cols */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MARKET_TICKERS.map((ticker) => {
          const sig = signalMap.get(ticker);
          const isHovered = hoveredTicker === ticker;

          if (loading || !sig) {
            return (
              <div
                key={ticker}
                className="animate-pulse rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] p-3"
              >
                <div className="mb-1.5 h-3 w-12 rounded bg-[#2A2A35]" />
                <div className="h-5 w-16 rounded bg-[#2A2A35]" />
              </div>
            );
          }

          const change = sig.change;
          const color = tileColor(change);
          const isPos = change >= 0;
          const label = TICKER_LABELS[ticker] ?? ticker;
          const sigColor = SIGNAL_COLORS[sig.signal] ?? "#A0A0A0";

          return (
            <div
              key={ticker}
              className="relative cursor-default rounded-none border p-3 transition-all duration-200"
              style={{
                background: tileBg(change),
                borderColor: tileBorder(change),
              }}
              onMouseEnter={() => setHoveredTicker(ticker)}
              onMouseLeave={() => setHoveredTicker(null)}
            >
              {/* Default content */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888]">
                    {label}
                  </div>
                  <div className="text-xs font-bold text-[var(--pixel-text)]">{ticker}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[var(--pixel-text)]">
                    ${sig.price.toFixed(2)}
                  </div>
                  <div
                    className="flex items-center justify-end gap-0.5 text-xs font-bold"
                    style={{ color }}
                  >
                    {isPos ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPos ? "+" : ""}
                    {change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Hover overlay: signal info */}
              {isHovered && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-none border backdrop-blur-sm fade-in-up"
                  style={{
                    background: "#15151BE8",
                    borderColor: sigColor + "44",
                  }}
                >
                  <div className="text-center">
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-black tracking-widest"
                      style={{
                        background: sigColor + "22",
                        color: sigColor,
                        border: `1px solid ${sigColor}55`,
                      }}
                    >
                      {sig.signal}
                    </span>
                    <div className="mt-1.5 text-xs font-bold text-[var(--pixel-text)]">
                      Strength {sig.strength}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#888]">
                      Conf. {Math.round(sig.confidence * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
