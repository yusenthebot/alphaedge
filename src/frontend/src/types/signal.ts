export interface Signal {
  ticker: string;
  signal: "BUY" | "HOLD" | "SELL";
  strength: number;
  confidence: number;
  price: number;
  change: number;
  sources: {
    jin10_sentiment: number;
    rsi: number;
    macd: string;
    rsi_label: string;
    jin10_headline: string;
    reddit_sentiment?: number;
    price_momentum?: number;
  };
  reasoning: string;
  updated_at: string;
}

export interface SignalsResponse {
  signals: Signal[];
}
