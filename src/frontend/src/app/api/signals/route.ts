import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ALPHAEDGE_API_URL || "http://localhost:8765";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get("tickers") || "NVDA,TSLA,AAPL,BABA,SPY";

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/signals?tickers=${tickers}`,
      { next: { revalidate: 300 } } // cache 5 min at Next.js layer too
    );

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();

    // Normalize backend schema → frontend schema
    const signals = data.signals.map(
      (s: {
        ticker: string;
        price: number;
        change_pct: number;
        signal: string;
        strength: number;
        confidence: number;
        jin10_score: number;
        rsi: number;
        macd_signal: string;
        reasoning: string;
        timestamp: string;
      }) => ({
        ticker: s.ticker,
        price: s.price,
        change: s.change_pct,
        signal: s.signal as "BUY" | "HOLD" | "SELL",
        strength: s.strength,
        confidence: s.confidence,
        sources: {
          jin10_sentiment: s.jin10_score,
          rsi: s.rsi,
          macd: s.macd_signal === "bullish_cross" ? "金叉"
               : s.macd_signal === "bearish_cross" ? "死叉"
               : "中性",
          rsi_label: s.rsi < 30 ? "超卖" : s.rsi > 70 ? "超买" : "中性",
          jin10_headline: s.reasoning,
        },
        reasoning: s.reasoning,
        updated_at: s.timestamp,
      })
    );

    return NextResponse.json({ signals, cached_at: data.cached_at });
  } catch (err) {
    console.error("[api/signals] backend error:", err);
    return NextResponse.json(
      { error: "Signal backend unavailable", signals: [] },
      { status: 503 }
    );
  }
}
