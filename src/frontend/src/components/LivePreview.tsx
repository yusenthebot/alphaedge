"use client";

import { useEffect, useState } from "react";

interface MiniSignal {
  ticker: string;
  signal: "BUY" | "HOLD" | "SELL";
  strength: number;
  price: number;
  change: number;
}

const SIGNAL_COLOR = {
  BUY:  { text: "#00FF41", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" },
  HOLD: { text: "#FFB800", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  SELL: { text: "#FF3131", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
};

export function LivePreview() {
  const [signals, setSignals] = useState<MiniSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/signals?tickers=NVDA,TSLA,AAPL,BABA,SPY", { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => {
        setSignals(
          (d.signals ?? []).map((s: { ticker: string; signal: string; strength: number; price: number; change: number }) => ({
            ticker: s.ticker,
            signal: s.signal,
            strength: s.strength,
            price: s.price,
            change: s.change,
          }))
        );
      })
      .catch((err) => { if (err.name !== "AbortError") console.error(err); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 w-28 animate-pulse rounded-none bg-[var(--pixel-surface)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {signals.map((s) => {
        const cfg = SIGNAL_COLOR[s.signal];
        const isPos = s.change >= 0;
        return (
          <div
            key={s.ticker}
            className="flex w-28 flex-col gap-1 rounded-none px-4 py-3 transition-transform hover:scale-105"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--pixel-text)]">{s.ticker}</span>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider"
                style={{ color: cfg.text, background: cfg.bg }}
              >
                {s.signal}
              </span>
            </div>
            <div className="text-xs font-semibold text-[var(--pixel-text)]">${s.price.toFixed(0)}</div>
            <div
              className="text-[10px] font-medium"
              style={{ color: isPos ? "#00FF41" : "#FF3131" }}
            >
              {isPos ? "+" : ""}{s.change.toFixed(1)}%
            </div>
            {/* strength bar */}
            <div className="mt-1 h-1 w-full rounded-none bg-[#2A2A35]">
              <div
                className="h-full rounded-none"
                style={{ width: `${s.strength}%`, background: cfg.text }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
