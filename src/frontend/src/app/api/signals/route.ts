import { type NextRequest, NextResponse } from "next/server";

const MOCK_DATA: Record<
  string,
  {
    price: number;
    change: number;
    jin10_headline: string;
    rsi: number;
    macd: string;
    rsi_label: string;
  }
> = {
  NVDA: {
    price: 875.2,
    change: 2.3,
    jin10_headline: "中国AI政策重磅利好，算力需求激增",
    rsi: 42,
    macd: "金叉",
    rsi_label: "超卖回升",
  },
  TSLA: {
    price: 248.5,
    change: -1.2,
    jin10_headline: "中国新能源车补贴政策延期，竞争加剧",
    rsi: 55,
    macd: "死叉",
    rsi_label: "中性",
  },
  AAPL: {
    price: 189.3,
    change: 0.8,
    jin10_headline: "苹果供应链中国工厂产能恢复正常",
    rsi: 61,
    macd: "金叉",
    rsi_label: "偏强",
  },
  BABA: {
    price: 92.15,
    change: 4.1,
    jin10_headline: "阿里巴巴云计算业务获政府大单",
    rsi: 38,
    macd: "金叉",
    rsi_label: "超卖回升",
  },
  SPY: {
    price: 512.8,
    change: 0.3,
    jin10_headline: "美联储降息预期升温，中国资金流入美股",
    rsi: 52,
    macd: "金叉",
    rsi_label: "中性偏多",
  },
};

function generateSignal(ticker: string) {
  const data = MOCK_DATA[ticker];
  const hasData = !!data;

  const price = hasData ? data.price : 100 + Math.random() * 500;
  const change = hasData ? data.change : (Math.random() - 0.5) * 10;
  const rsi = hasData ? data.rsi : Math.floor(Math.random() * 100);
  const jin10Sentiment = hasData
    ? 0.6 + Math.random() * 0.35
    : Math.random();
  const strength = hasData
    ? Math.floor(50 + Math.random() * 45)
    : Math.floor(Math.random() * 100);
  const confidence = hasData
    ? 0.65 + Math.random() * 0.3
    : 0.3 + Math.random() * 0.6;

  let signal: "BUY" | "HOLD" | "SELL";
  if (strength >= 65 && change > 0) signal = "BUY";
  else if (strength < 40 || change < -2) signal = "SELL";
  else signal = "HOLD";

  return {
    ticker,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    signal,
    strength,
    confidence: Math.round(confidence * 100) / 100,
    sources: {
      jin10_sentiment: Math.round(jin10Sentiment * 100) / 100,
      rsi,
      macd: hasData ? data.macd : Math.random() > 0.5 ? "金叉" : "死叉",
      rsi_label: hasData ? data.rsi_label : "N/A",
      jin10_headline: hasData
        ? data.jin10_headline
        : `${ticker}相关中国市场消息`,
    },
    reasoning: hasData
      ? `Jin10: ${data.jin10_headline} | RSI ${rsi} (${data.rsi_label}) | MACD ${data.macd}`
      : `Mock signal for ${ticker}`,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers =
    searchParams.get("tickers")?.split(",") ?? ["NVDA"];

  const signals = tickers.map(generateSignal);

  return NextResponse.json({ signals });
}
