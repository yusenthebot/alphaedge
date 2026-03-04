"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface Alert {
  ticker: string;
  from_signal: string;
  to_signal: string;
  price: number;
  created_at: string;
  severity: "high" | "medium";
}

type AlertFilter = "ALL" | "HIGH" | "MEDIUM" | "BUY" | "SELL";

const POLL_INTERVAL = 120_000; // 2 minutes

const SIGNAL_COLORS: Record<string, string> = {
  BUY: "#22C55E",
  HOLD: "#F59E0B",
  SELL: "#EF4444",
};

// ── Helpers ────────────────────────────────────────────────────────
function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Signal Badge ───────────────────────────────────────────────────
function SignalBadge({ signal }: { signal: string }) {
  const color = SIGNAL_COLORS[signal] ?? "#A0A0A0";
  return (
    <span
      className="rounded-md px-2 py-0.5 text-xs font-black tracking-widest"
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {signal}
    </span>
  );
}

// ── Alert Card ─────────────────────────────────────────────────────
function AlertCard({ alert }: { alert: Alert }) {
  return (
    <Link href={`/ticker/${alert.ticker}`}>
      <div className="group rounded-xl border border-[#2A2A35] bg-[#15151B] p-4 transition-all duration-200 hover:bg-[#1C1C24] hover:border-[#3A3A45]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Severity indicator */}
            <span className="text-lg" title={alert.severity === "high" ? "High severity" : "Medium severity"}>
              {alert.severity === "high" ? "\uD83D\uDD34" : "\uD83D\uDFE1"}
            </span>

            {/* Ticker */}
            <span className="text-lg font-black tracking-wide text-white">
              {alert.ticker}
            </span>

            {/* Signal transition */}
            <div className="flex items-center gap-1.5">
              <SignalBadge signal={alert.from_signal} />
              <ArrowRight className="h-3.5 w-3.5 text-[#666]" />
              <SignalBadge signal={alert.to_signal} />
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-white">
              ${alert.price.toFixed(2)}
            </div>
            <div className="text-[10px] text-[#666]">
              {timeAgo(alert.created_at)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Empty State ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22C55E]/10">
        <ShieldCheck className="h-8 w-8 text-[#22C55E]" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">All Signals Stable</h3>
      <p className="max-w-sm text-sm text-[#666]">
        No signal changes in the last 24h. Signals are stable.
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlertFilter>("ALL");

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch (err) {
      console.error("fetch alerts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const iv = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchAlerts]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return alerts;
    if (filter === "HIGH") return alerts.filter((a) => a.severity === "high");
    if (filter === "MEDIUM") return alerts.filter((a) => a.severity === "medium");
    // BUY/SELL: alerts where to_signal matches
    return alerts.filter((a) => a.to_signal === filter);
  }, [alerts, filter]);

  const filterCounts = useMemo(
    () => ({
      ALL: alerts.length,
      HIGH: alerts.filter((a) => a.severity === "high").length,
      MEDIUM: alerts.filter((a) => a.severity === "medium").length,
      BUY: alerts.filter((a) => a.to_signal === "BUY").length,
      SELL: alerts.filter((a) => a.to_signal === "SELL").length,
    }),
    [alerts]
  );

  const FILTER_STYLES: Record<AlertFilter, string> = {
    ALL: "#A0A0A0",
    HIGH: "#EF4444",
    MEDIUM: "#F59E0B",
    BUY: "#22C55E",
    SELL: "#EF4444",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-[#1C1C24] bg-[#0D0D0D]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A35] text-[#666] transition hover:bg-[#1C1C24] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EF4444]/15">
                <Zap className="h-4 w-4 text-[#EF4444]" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white">
                  Signal Alerts
                </h1>
                <div className="text-[10px] uppercase tracking-widest text-[#444]">
                  Last 24 hours
                </div>
              </div>
            </div>
            {alerts.length > 0 && (
              <span className="rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-xs font-bold text-[#EF4444]">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#22C55E]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
            </span>
            Polling 2min
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* ── Filter tabs ── */}
        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          {(["ALL", "HIGH", "MEDIUM", "BUY", "SELL"] as AlertFilter[]).map(
            (tab) => {
              const isActive = filter === tab;
              const color = FILTER_STYLES[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive ? "text-white" : "text-[#666] hover:text-[#A0A0A0]"
                  }`}
                  style={
                    isActive
                      ? {
                          background: color + "20",
                          color,
                          border: `1px solid ${color}44`,
                        }
                      : { background: "transparent", border: "1px solid transparent" }
                  }
                >
                  {tab}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                      isActive ? "bg-white/10" : "bg-[#2A2A35]"
                    }`}
                  >
                    {filterCounts[tab]}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl border border-[#2A2A35] bg-[#15151B]"
              />
            ))}
          </div>
        )}

        {/* ── Alert list ── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((alert, idx) => (
              <AlertCard key={`${alert.ticker}-${alert.created_at}-${idx}`} alert={alert} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && <EmptyState />}
      </main>
    </div>
  );
}
