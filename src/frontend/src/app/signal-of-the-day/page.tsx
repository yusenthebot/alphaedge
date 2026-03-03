import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  TrendingUp,
  Newspaper,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signal of the Day — AlphaEdge",
  description:
    "Today's highest-confidence US stock trading signal powered by Chinese market intelligence from Jin10.",
  openGraph: {
    title: "AlphaEdge Signal of the Day",
    description:
      "AI-powered stock signal combining Jin10 Chinese financial news and technical analysis.",
  },
};

const SIGNAL = {
  ticker: "NVDA",
  signal: "BUY" as const,
  price: 875.2,
  change: 2.3,
  strength: 87,
  confidence: 0.89,
  sources: {
    jin10_sentiment: 0.92,
    rsi: 42,
    macd: "金叉 (Golden Cross)",
    rsi_label: "超卖回升 (Oversold Recovery)",
    jin10_headline: "中国AI政策重磅利好，算力需求激增",
    jin10_headline_en:
      "Major China AI policy boost — compute demand surging",
  },
  reasoning:
    "Strong bullish convergence: Jin10 reports major Chinese AI policy support driving compute demand. Technical indicators confirm with RSI recovering from oversold territory and a fresh MACD golden cross.",
  date: new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
};

const SIGNAL_COLORS: Record<string, string> = {
  BUY: "bg-[#22C55E] text-white",
  SELL: "bg-[#EF4444] text-white",
  HOLD: "bg-[#F59E0B] text-black",
};

export default function SignalOfTheDayPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Nav */}
      <nav className="border-b border-[#2A2A35] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#22C55E]" />
            <span className="text-xl font-bold text-white">AlphaEdge</span>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Open Dashboard</Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-[#F59E0B]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
              Signal of the Day
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
            {SIGNAL.date}
          </h1>
          <p className="text-[#A0A0A0]">
            Highest-confidence signal from our AI analysis engine
          </p>
        </div>

        {/* Main Signal Card */}
        <Card className="mb-8 border-[#22C55E]/30 bg-[#15151B]">
          <CardContent className="p-6 sm:p-8">
            {/* Ticker + Signal */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-white">
                  {SIGNAL.ticker}
                </span>
                <Badge
                  className={`${SIGNAL_COLORS[SIGNAL.signal]} px-3 py-1 text-lg font-bold`}
                >
                  {SIGNAL.signal}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  ${SIGNAL.price.toFixed(2)}
                </div>
                <div className="flex items-center justify-end gap-1 text-[#22C55E]">
                  <TrendingUp className="h-4 w-4" />+{SIGNAL.change}%
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-[#0D0D0D] p-4">
                <div className="mb-1 text-xs uppercase text-[#A0A0A0]">
                  Strength
                </div>
                <div className="text-2xl font-bold text-[#22C55E]">
                  {SIGNAL.strength}/100
                </div>
              </div>
              <div className="rounded-lg bg-[#0D0D0D] p-4">
                <div className="mb-1 text-xs uppercase text-[#A0A0A0]">
                  Confidence
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(SIGNAL.confidence * 100)}%
                </div>
              </div>
              <div className="rounded-lg bg-[#0D0D0D] p-4">
                <div className="mb-1 text-xs uppercase text-[#A0A0A0]">
                  RSI
                </div>
                <div className="text-2xl font-bold text-white">
                  {SIGNAL.sources.rsi}
                </div>
              </div>
              <div className="rounded-lg bg-[#0D0D0D] p-4">
                <div className="mb-1 text-xs uppercase text-[#A0A0A0]">
                  Jin10 Sentiment
                </div>
                <div className="text-2xl font-bold text-[#3B82F6]">
                  {Math.round(SIGNAL.sources.jin10_sentiment * 100)}%
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Newspaper className="mt-1 h-5 w-5 shrink-0 text-[#3B82F6]" />
                <div>
                  <div className="mb-1 text-sm font-medium text-white">
                    Jin10 Breaking News
                  </div>
                  <p className="text-sm text-[#A0A0A0]">
                    {SIGNAL.sources.jin10_headline}
                  </p>
                  <p className="text-sm text-[#666]">
                    {SIGNAL.sources.jin10_headline_en}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-[#8B5CF6]" />
                <div>
                  <div className="mb-1 text-sm font-medium text-white">
                    Technical Indicators
                  </div>
                  <p className="text-sm text-[#A0A0A0]">
                    RSI: {SIGNAL.sources.rsi} — {SIGNAL.sources.rsi_label} |
                    MACD: {SIGNAL.sources.macd}
                  </p>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="mt-6 rounded-lg border border-[#2A2A35] bg-[#0D0D0D] p-4">
              <div className="mb-2 text-xs font-semibold uppercase text-[#A0A0A0]">
                AI Analysis
              </div>
              <p className="text-sm leading-relaxed text-white">
                {SIGNAL.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-4 text-[#A0A0A0]">
            Want signals for your entire watchlist? Updated every 60 seconds.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-[#22C55E] text-white hover:bg-[#16A34A]"
            >
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="mt-16 text-center text-xs text-[#666]">
          Not financial advice. Signals are generated by AI analysis of public
          data sources for informational purposes only. Past performance does
          not guarantee future results.
        </p>
      </main>
    </div>
  );
}
