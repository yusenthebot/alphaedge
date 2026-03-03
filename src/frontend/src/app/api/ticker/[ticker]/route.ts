import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ALPHAEDGE_API_URL || "http://localhost:8765";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  try {
    const res = await fetch(`${BACKEND_URL}/api/signals/${ticker}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const s = await res.json();

    const signal = {
      ticker: s.ticker,
      price: s.price,
      change: s.change_pct,
      signal: s.signal as "BUY" | "HOLD" | "SELL",
      strength: s.strength,
      confidence: s.confidence,
      sources: {
        jin10_sentiment: s.jin10_score,
        rsi: s.rsi,
        macd:
          s.macd_signal === "bullish_cross"
            ? "金叉"
            : s.macd_signal === "bearish_cross"
              ? "死叉"
              : "中性",
        rsi_label: s.rsi < 30 ? "超卖" : s.rsi > 70 ? "超买" : "中性",
        jin10_headline: s.reasoning,
      },
      reasoning: s.reasoning,
      updated_at: s.timestamp,
    };

    return NextResponse.json(signal);
  } catch (err) {
    console.error("[api/ticker] backend error:", err);
    return NextResponse.json(
      { error: "Signal backend unavailable" },
      { status: 503 }
    );
  }
}
