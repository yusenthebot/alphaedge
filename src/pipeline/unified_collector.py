#!/usr/bin/env python3
"""
unified_collector.py — Unified data collector for AlphaEdge.
Merges Jin10 news, stock prices, technical indicators, and sentiment
into a single dict per ticker.
"""

import sys
import os
from datetime import datetime, timezone

# Allow imports from src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

import yfinance as yf
import pandas as pd
import ta

from jin10 import fetch_flash_news, parse_flash, filter_by_time
from sentiment import analyze_sentiment


# Ticker-to-Chinese-keyword mapping for filtering Jin10 headlines
TICKER_KEYWORDS = {
    "NVDA": ["英伟达", "NVIDIA", "Nvidia", "NVDA", "黄仁勋"],
    "TSLA": ["特斯拉", "Tesla", "TSLA", "马斯克", "Musk"],
    "AAPL": ["苹果", "Apple", "AAPL", "iPhone"],
    "MSFT": ["微软", "Microsoft", "MSFT"],
    "GOOGL": ["谷歌", "Google", "GOOGL", "Alphabet"],
    "AMZN": ["亚马逊", "Amazon", "AMZN"],
    "META": ["Meta", "META", "Facebook", "脸书"],
    "AMD": ["AMD", "超威"],
    "BABA": ["阿里巴巴", "阿里", "Alibaba", "BABA"],
    "JD": ["京东", "JD"],
    "PDD": ["拼多多", "PDD"],
    "NIO": ["蔚来", "NIO"],
    "XPEV": ["小鹏", "XPEV", "XPeng"],
    "LI": ["理想", "Li Auto"],
    "BIDU": ["百度", "Baidu", "BIDU"],
}

# Generic market keywords (fallback when no ticker-specific news found)
MARKET_KEYWORDS = [
    "美股", "美国股市", "华尔街", "标普", "纳斯达克", "道琼斯",
    "美联储", "Fed", "利率", "降息", "加息",
    "AI", "人工智能", "芯片", "半导体",
]


def get_technical_data(ticker: str) -> dict:
    """Fetch current price, volume ratio, RSI, and MACD signal for a ticker.

    Uses yfinance for 60 days of daily data, then computes:
    - Current price and change %
    - Volume ratio (today vs 20-day average)
    - RSI (14-period)
    - MACD signal (bullish_cross / bearish_cross / neutral)

    Returns dict with keys: price, change_pct, volume_ratio, rsi, macd_signal.
    Returns partial data with defaults on failure.
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="60d", interval="1d")

        if hist.empty or len(hist) < 20:
            return _empty_technical()

        # Current price & change
        current_price = float(hist['Close'].iloc[-1])
        prev_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else current_price
        change_pct = round(((current_price - prev_close) / prev_close) * 100, 2) if prev_close else 0.0

        # Volume ratio vs 20-day average
        volumes = hist['Volume']
        avg_vol_20 = float(volumes.iloc[-21:-1].mean()) if len(volumes) >= 21 else float(volumes.mean())
        current_vol = float(volumes.iloc[-1])
        volume_ratio = round(current_vol / avg_vol_20, 2) if avg_vol_20 > 0 else 1.0

        # RSI (14-period)
        rsi_series = ta.momentum.RSIIndicator(hist['Close'], window=14).rsi()
        rsi = int(round(rsi_series.iloc[-1])) if not pd.isna(rsi_series.iloc[-1]) else 50

        # MACD
        macd_ind = ta.trend.MACD(hist['Close'])
        macd_line = macd_ind.macd()
        signal_line = macd_ind.macd_signal()

        macd_signal = "neutral"
        if len(macd_line) >= 2 and not pd.isna(macd_line.iloc[-1]):
            macd_curr = macd_line.iloc[-1] - signal_line.iloc[-1]
            macd_prev = macd_line.iloc[-2] - signal_line.iloc[-2]
            if macd_prev < 0 and macd_curr >= 0:
                macd_signal = "bullish_cross"
            elif macd_prev > 0 and macd_curr <= 0:
                macd_signal = "bearish_cross"

        return {
            "price": round(current_price, 2),
            "change_pct": change_pct,
            "volume_ratio": volume_ratio,
            "rsi": rsi,
            "macd_signal": macd_signal,
        }

    except Exception as e:
        print(f"[unified_collector] Technical data error for {ticker}: {e}", file=sys.stderr)
        return _empty_technical()


def _empty_technical() -> dict:
    """Return default technical data when fetch fails."""
    return {
        "price": 0.0,
        "change_pct": 0.0,
        "volume_ratio": 1.0,
        "rsi": 50,
        "macd_signal": "neutral",
    }


def get_jin10_sentiment(ticker: str, hours: float = 2.0) -> tuple:
    """Fetch Jin10 headlines relevant to a ticker and compute sentiment score.

    Fetches recent flash news, filters by time window and ticker relevance,
    runs sentiment analysis on each headline, and averages the scores.

    Args:
        ticker: Stock ticker symbol (used to filter relevant headlines)
        hours: How many hours back to look

    Returns:
        (score, headlines) where score is -1.0 to 1.0, headlines is list[str]
    """
    try:
        raw_items = fetch_flash_news(max_items=100, use_cache=True)
        parsed = [parse_flash(item) for item in raw_items]
        parsed = [p for p in parsed if p is not None]
        parsed = filter_by_time(parsed, hours)

        if not parsed:
            return 0.0, []

        # Filter by ticker-specific keywords
        keywords = TICKER_KEYWORDS.get(ticker.upper(), [ticker])
        relevant = []
        for p in parsed:
            text = p["text"]
            if any(kw in text for kw in keywords):
                relevant.append(text)

        # Fallback to market-wide news if no ticker-specific headlines
        if not relevant:
            for p in parsed[:20]:
                text = p["text"]
                if any(kw in text for kw in MARKET_KEYWORDS):
                    relevant.append(text)
                    if len(relevant) >= 5:
                        break

        headlines = relevant[:10]
        scores = []
        for headline in headlines:
            _, score, _ = analyze_sentiment(headline)
            scores.append(score)

        avg_score = round(sum(scores) / len(scores), 2) if scores else 0.0
        return avg_score, headlines[:5]

    except Exception as e:
        print(f"[unified_collector] Jin10 error: {e}", file=sys.stderr)
        return 0.0, []


def collect_ticker(ticker: str) -> dict:
    """Collect all data for a single ticker and merge into unified dict.

    Calls technical data (yfinance), Jin10 news + sentiment, and returns
    a merged dictionary matching the AlphaEdge signal schema.

    Args:
        ticker: US stock ticker symbol (e.g. 'NVDA')

    Returns:
        Dict with keys: ticker, price, change_pct, volume_ratio, rsi,
        macd_signal, jin10_score, jin10_headlines, reddit_score, timestamp
    """
    tech = get_technical_data(ticker)
    jin10_score, jin10_headlines = get_jin10_sentiment(ticker)

    return {
        "ticker": ticker.upper(),
        "price": tech["price"],
        "change_pct": tech["change_pct"],
        "volume_ratio": tech["volume_ratio"],
        "rsi": tech["rsi"],
        "macd_signal": tech["macd_signal"],
        "jin10_score": jin10_score,
        "jin10_headlines": jin10_headlines,
        "reddit_score": 0.0,  # Placeholder for future Reddit integration
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def collect_all(tickers: list) -> list:
    """Collect unified data for multiple tickers.

    Args:
        tickers: List of ticker symbols

    Returns:
        List of unified dicts, one per ticker
    """
    results = []
    for ticker in tickers:
        data = collect_ticker(ticker)
        results.append(data)
    return results


if __name__ == "__main__":
    import json

    tickers = sys.argv[1:] if len(sys.argv) > 1 else ["NVDA"]
    data = collect_all(tickers)
    print(json.dumps(data, indent=2, ensure_ascii=False))
