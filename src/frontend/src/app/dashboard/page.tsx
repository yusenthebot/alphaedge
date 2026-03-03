"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Clock, Newspaper, BarChart3, Zap } from "lucide-react";
import type { Signal } from "@/types/signal";

const WATCHLIST = ["NVDA", "TSLA", "AAPL", "BABA", "SPY"];
const POLL_INTERVAL = 60_000;

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const SIGNAL_COLORS: Record<string, string> = {
  BUY: "bg-[#22C55E] text-white",
  SELL: "bg-[#EF4444] text-white",
  HOLD: "bg-[#F59E0B] text-black",
};

const SIGNAL_TEXT_COLORS: Record<string, string> = {
  BUY: "text-[#22C55E]",
  SELL: "text-[#EF4444]",
  HOLD: "text-[#F59E0B]",
};

function StrengthBar({ strength }: { strength: number }) {
  const filled = Math.round(strength / 10);
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`h-3 w-2.5 rounded-sm ${
              i < filled ? "bg-[#22C55E]" : "bg-[#2A2A35]"
            }`}
          />
        ))}
      </div>
      <span className="text-[#A0A0A0]">Strength: {strength}/100</span>
    </div>
  );
}

function SignalCardSkeleton() {
  return (
    <Card className="border-[#2A2A35] bg-[#15151B]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16 bg-[#2A2A35]" />
          <Skeleton className="h-6 w-28 bg-[#2A2A35]" />
        </div>
        <Skeleton className="h-4 w-full bg-[#2A2A35]" />
        <Skeleton className="h-4 w-3/4 bg-[#2A2A35]" />
        <Skeleton className="h-4 w-full bg-[#2A2A35]" />
        <Skeleton className="h-3 w-1/3 bg-[#2A2A35]" />
      </CardContent>
    </Card>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const isPositive = signal.change >= 0;

  return (
    <Card className="border-[#2A2A35] bg-[#15151B] transition-all hover:border-[#3A3A45]">
      <CardContent className="space-y-3 p-5">
        {/* Header: Ticker + Price + Change */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">{signal.ticker}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">
              ${signal.price.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-0.5 text-sm font-medium ${
                isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? "+" : ""}
              {signal.change.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Strength bar */}
        <StrengthBar strength={signal.strength} />

        {/* Signal + Confidence */}
        <div className="flex items-center gap-3">
          <Badge className={`${SIGNAL_COLORS[signal.signal]} font-bold`}>
            {signal.signal}
          </Badge>
          <span className="text-sm text-[#A0A0A0]">
            Confidence: {Math.round(signal.confidence * 100)}%
          </span>
        </div>

        {/* Jin10 headline */}
        <div className="flex items-start gap-2 text-sm">
          <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" />
          <span className="text-[#A0A0A0]">
            Jin10: {signal.sources.jin10_headline}
          </span>
        </div>

        {/* Technical indicators */}
        <div className="flex items-center gap-2 text-sm">
          <BarChart3 className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
          <span className="text-[#A0A0A0]">
            RSI: {signal.sources.rsi} ({signal.sources.rsi_label}) | MACD:{" "}
            {signal.sources.macd}
          </span>
        </div>

        {/* Updated time */}
        <div className="flex items-center gap-1.5 text-xs text-[#666]">
          <Clock className="h-3 w-3" />
          Updated {timeAgo(signal.updated_at)}
        </div>
      </CardContent>
    </Card>
  );
}

function SignalOfDayHighlight({ signal }: { signal: Signal }) {
  return (
    <Card className="border-[#22C55E]/30 bg-gradient-to-r from-[#15151B] to-[#1a1f15]">
      <CardContent className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#F59E0B]" />
          <span className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
            Signal of the Day
          </span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {signal.ticker}
              </span>
              <Badge
                className={`${SIGNAL_COLORS[signal.signal]} text-sm font-bold`}
              >
                {signal.signal}
              </Badge>
              <span
                className={`text-lg font-semibold ${SIGNAL_TEXT_COLORS[signal.signal]}`}
              >
                {signal.strength}/100
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0]">
              {signal.sources.jin10_headline}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${signal.price.toFixed(2)}
            </div>
            <div
              className={`text-sm font-medium ${
                signal.change >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {signal.change >= 0 ? "+" : ""}
              {signal.change.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/signals?tickers=${WATCHLIST.join(",")}`
      );
      const data = await res.json();
      setSignals(data.signals);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const signalOfDay = signals.length
    ? signals.reduce((best, s) => (s.strength > best.strength ? s : best))
    : null;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="border-b border-[#2A2A35] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#22C55E]" />
            <h1 className="text-xl font-bold text-white">AlphaEdge</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
            <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
            Live
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Signal of the Day */}
        <div className="mb-6">
          {loading ? (
            <Skeleton className="h-32 w-full rounded-xl bg-[#15151B]" />
          ) : signalOfDay ? (
            <SignalOfDayHighlight signal={signalOfDay} />
          ) : null}
        </div>

        {/* Watchlist heading */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Watchlist</h2>
          <span className="text-sm text-[#A0A0A0]">
            Auto-refreshes every 60s
          </span>
        </div>

        {/* Signal Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? WATCHLIST.map((ticker) => (
                <SignalCardSkeleton key={ticker} />
              ))
            : signals.map((signal) => (
                <SignalCard key={signal.ticker} signal={signal} />
              ))}
        </div>
      </main>
    </div>
  );
}
