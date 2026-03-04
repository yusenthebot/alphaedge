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
  BUY: "#00FF41",
  HOLD: "#FFB800",
  SELL: "#FF3131",
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
  const color = SIGNAL_COLORS[signal] ?? "var(--pixel-text-off)";
  return (
    <span
      className="border-2 px-1.5 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-widest"
      style={{ background: color + "14", color, borderColor: color + "88" }}
    >
      {signal}
    </span>
  );
}

// ── Alert Card ─────────────────────────────────────────────────────
function AlertCard({ alert }: { alert: Alert }) {
  const toColor = SIGNAL_COLORS[alert.to_signal] ?? "var(--pixel-text-off)";
  return (
    <Link href={`/ticker/${alert.ticker}`}>
      <div
        className="group border-2 bg-[var(--pixel-surface)] p-4 transition-all duration-150 hover:bg-[var(--pixel-surface-2)]"
        style={{
          borderColor: alert.severity === "high" ? "#FF313144" : "var(--pixel-border-dim)",
          boxShadow: alert.severity === "high" ? "0 0 8px rgba(255,49,49,0.1)" : "none",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="border px-1.5 py-0.5 font-mono text-[0.45rem] uppercase tracking-widest"
              style={alert.severity === "high"
                ? { borderColor: "#FF3131", color: "#FF3131", background: "rgba(255,49,49,0.08)" }
                : { borderColor: "#FFB800", color: "#FFB800", background: "rgba(255,184,0,0.08)" }
              }
            >
              {alert.severity}
            </span>
            <span className="pixel-title text-[0.65rem]" style={{ color: toColor }}>{alert.ticker}</span>
            <div className="flex items-center gap-1.5">
              <SignalBadge signal={alert.from_signal} />
              <ArrowRight className="h-3 w-3 text-[var(--pixel-text-muted)]" />
              <SignalBadge signal={alert.to_signal} />
            </div>
          </div>
          <div className="text-right">
            <div className="pixel-data text-sm font-bold">${alert.price.toFixed(2)}</div>
            <div className="pixel-label text-[0.45rem]">{timeAgo(alert.created_at)}</div>
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-[var(--pixel-buy)] bg-[var(--pixel-surface)]" style={{ boxShadow: "var(--pixel-glow-green)" }}>
        <ShieldCheck className="h-8 w-8 text-[var(--pixel-buy)]" />
      </div>
      <h3 className="pixel-title mb-2 text-[0.6rem]">All Signals Stable</h3>
      <p className="pixel-label max-w-sm">
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
    ALL: "var(--pixel-text-off)",
    HIGH: "#FF3131",
    MEDIUM: "#FFB800",
    BUY: "#00FF41",
    SELL: "#FF3131",
  };

  return (
    <div className="min-h-screen bg-[var(--pixel-bg)] text-[var(--pixel-text)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 items-center justify-center border-2 border-[var(--pixel-border-dim)] text-[var(--pixel-text-muted)] transition hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-[var(--pixel-sell)] bg-[var(--pixel-surface)]" style={{ boxShadow: "var(--pixel-glow-red)" }}>
                <Zap className="h-4 w-4 text-[var(--pixel-sell)]" />
              </div>
              <div>
                <h1 className="pixel-title text-[0.6rem]">Signal Alerts</h1>
                <div className="pixel-label text-[0.45rem]">Last 24 hours</div>
              </div>
            </div>
            {alerts.length > 0 && (
              <span className="border border-[var(--pixel-sell)] bg-[rgba(255,49,49,0.1)] px-2 py-0.5 font-mono text-[0.55rem] font-bold text-[var(--pixel-sell)]">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-widest text-[var(--pixel-buy)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-[var(--pixel-buy)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-[var(--pixel-buy)]" style={{ boxShadow: "var(--pixel-glow-green)" }} />
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
                  className="flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-widest transition"
                  style={isActive
                    ? { background: color + "14", color, borderColor: color + "88" }
                    : { background: "transparent", borderColor: "var(--pixel-border-dim)", color: "var(--pixel-text-muted)" }
                  }
                >
                  {isActive && "▸ "}{tab}
                  <span className="border border-current px-1 py-0.5 text-[0.45rem] font-bold">{filterCounts[tab]}</span>
                </button>
              );
            }
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse border-2 border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)]" />
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
