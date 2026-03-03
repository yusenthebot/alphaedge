#!/usr/bin/env python3
"""
backtester.py — Simple backtester for AlphaEdge signals.
Tests historical signal accuracy using price data and RSI-based signal simulation.
"""

import sys
import os
from datetime import datetime, timezone

import yfinance as yf
import pandas as pd
import ta

# Allow imports from src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from aggregator import generate_signal


def get_historical_data(ticker: str, days: int = 90) -> pd.DataFrame:
    """Fetch historical daily data for backtesting.

    Gets enough history to compute indicators (RSI needs 14 days warmup),
    then returns the most recent `days` of data with indicators attached.

    Args:
        ticker: Stock ticker symbol
        days: Number of trading days to backtest

    Returns:
        DataFrame with columns: Open, High, Low, Close, Volume, RSI, MACD, Signal_Line
    """
    stock = yf.Ticker(ticker)
    # Fetch extra days for indicator warmup
    hist = stock.history(period=f"{days + 60}d", interval="1d")

    if hist.empty:
        raise ValueError(f"No historical data for {ticker}")

    # Compute RSI
    hist['RSI'] = ta.momentum.RSIIndicator(hist['Close'], window=14).rsi()

    # Compute MACD
    macd_ind = ta.trend.MACD(hist['Close'])
    hist['MACD'] = macd_ind.macd()
    hist['Signal_Line'] = macd_ind.macd_signal()

    # Volume average (20-day rolling)
    hist['Vol_Avg_20'] = hist['Volume'].rolling(window=20).mean()

    # Drop NaN rows from indicator warmup
    hist = hist.dropna()

    # Return last `days` rows
    return hist.tail(days)


def simulate_daily_signals(hist: pd.DataFrame, ticker: str) -> list:
    """Simulate daily signals from historical data.

    For each day, constructs a synthetic unified_collector-style dict
    using that day's price, RSI, MACD, and volume, then runs the
    aggregator to produce a signal.

    Args:
        hist: DataFrame from get_historical_data()
        ticker: Ticker symbol

    Returns:
        List of dicts with keys: date, signal, strength, close, next_day_return
    """
    results = []

    for i in range(len(hist) - 1):  # -1 because we need next day's return
        row = hist.iloc[i]
        next_row = hist.iloc[i + 1]

        # Determine MACD crossover
        macd_signal = "neutral"
        if i > 0:
            prev = hist.iloc[i - 1]
            macd_diff_curr = row['MACD'] - row['Signal_Line']
            macd_diff_prev = prev['MACD'] - prev['Signal_Line']
            if macd_diff_prev < 0 and macd_diff_curr >= 0:
                macd_signal = "bullish_cross"
            elif macd_diff_prev > 0 and macd_diff_curr <= 0:
                macd_signal = "bearish_cross"

        # Change % from previous close
        change_pct = 0.0
        if i > 0:
            prev_close = hist.iloc[i - 1]['Close']
            if prev_close > 0:
                change_pct = ((row['Close'] - prev_close) / prev_close) * 100

        # Volume ratio
        vol_ratio = row['Volume'] / row['Vol_Avg_20'] if row['Vol_Avg_20'] > 0 else 1.0

        # Build synthetic unified data (no Jin10/Reddit for backtest)
        synthetic = {
            "ticker": ticker,
            "price": float(row['Close']),
            "change_pct": round(float(change_pct), 2),
            "volume_ratio": round(float(vol_ratio), 2),
            "rsi": int(round(float(row['RSI']))),
            "macd_signal": macd_signal,
            "jin10_score": 0.0,  # No historical Jin10 data
            "jin10_headlines": [],
            "reddit_score": 0.0,
            "timestamp": str(row.name),
        }

        signal = generate_signal(synthetic)

        # Next-day return
        next_day_return = ((next_row['Close'] - row['Close']) / row['Close']) * 100

        results.append({
            "date": str(row.name.date()),
            "signal": signal["signal"],
            "strength": signal["strength"],
            "close": round(float(row['Close']), 2),
            "next_day_return": round(float(next_day_return), 2),
        })

    return results


def run_backtest(ticker: str, days: int = 30) -> dict:
    """Run a full backtest for a ticker.

    Gets historical data, simulates daily signals, then computes:
    - Win rate: % of BUY signals where next-day return > 0
    - Average return on BUY signals
    - Max drawdown during the period
    - Total BUY/HOLD/SELL counts

    Args:
        ticker: Stock ticker symbol
        days: Number of trading days to backtest

    Returns:
        Dict with backtest results
    """
    hist = get_historical_data(ticker, days)
    signals = simulate_daily_signals(hist, ticker)

    if not signals:
        return {"ticker": ticker, "error": "No signals generated"}

    # Filter BUY signals
    buy_signals = [s for s in signals if s["signal"] == "BUY"]
    sell_signals = [s for s in signals if s["signal"] == "SELL"]
    hold_signals = [s for s in signals if s["signal"] == "HOLD"]

    # Win rate (BUY signals where next day was positive)
    buy_wins = [s for s in buy_signals if s["next_day_return"] > 0]
    buy_win_rate = (len(buy_wins) / len(buy_signals) * 100) if buy_signals else 0

    # Average return on BUY signals
    buy_returns = [s["next_day_return"] for s in buy_signals]
    avg_buy_return = sum(buy_returns) / len(buy_returns) if buy_returns else 0

    # SELL signal accuracy (next day was negative)
    sell_wins = [s for s in sell_signals if s["next_day_return"] < 0]
    sell_win_rate = (len(sell_wins) / len(sell_signals) * 100) if sell_signals else 0

    # Max drawdown (peak-to-trough decline during period)
    closes = [s["close"] for s in signals]
    max_drawdown = _compute_max_drawdown(closes)

    return {
        "ticker": ticker,
        "period_days": days,
        "total_signals": len(signals),
        "buy_count": len(buy_signals),
        "hold_count": len(hold_signals),
        "sell_count": len(sell_signals),
        "buy_win_rate": round(buy_win_rate, 1),
        "avg_buy_return": round(avg_buy_return, 2),
        "sell_win_rate": round(sell_win_rate, 1),
        "max_drawdown_pct": round(max_drawdown, 2),
        "signals": signals,
    }


def _compute_max_drawdown(prices: list) -> float:
    """Compute maximum drawdown percentage from a list of prices.

    Finds the largest peak-to-trough decline as a percentage.
    """
    if not prices or len(prices) < 2:
        return 0.0

    peak = prices[0]
    max_dd = 0.0

    for price in prices:
        if price > peak:
            peak = price
        drawdown = (peak - price) / peak * 100 if peak > 0 else 0
        max_dd = max(max_dd, drawdown)

    return max_dd


def print_backtest_report(result: dict):
    """Print a formatted backtest report to stdout.

    Displays signal distribution, win rates, and a daily signal log.
    """
    if "error" in result:
        print(f"Error: {result['error']}")
        return

    ticker = result["ticker"]
    print(f"\n{'='*60}")
    print(f"  BACKTEST REPORT: {ticker}")
    print(f"  Period: {result['period_days']} trading days")
    print(f"{'='*60}\n")

    print(f"  Signal Distribution:")
    print(f"    BUY:  {result['buy_count']:3d}  ({result['buy_count']/result['total_signals']*100:.0f}%)")
    print(f"    HOLD: {result['hold_count']:3d}  ({result['hold_count']/result['total_signals']*100:.0f}%)")
    print(f"    SELL: {result['sell_count']:3d}  ({result['sell_count']/result['total_signals']*100:.0f}%)")
    print()

    print(f"  Performance:")
    print(f"    BUY win rate:    {result['buy_win_rate']:.1f}%")
    print(f"    Avg BUY return:  {result['avg_buy_return']:+.2f}%")
    print(f"    SELL win rate:   {result['sell_win_rate']:.1f}%")
    print(f"    Max drawdown:    -{result['max_drawdown_pct']:.2f}%")
    print()

    # Show last 10 signals
    signals = result.get("signals", [])
    if signals:
        print(f"  Last 10 Signals:")
        print(f"  {'Date':<12} {'Signal':<6} {'Str':>4} {'Close':>10} {'Next Day':>10}")
        print(f"  {'-'*12} {'-'*6} {'-'*4} {'-'*10} {'-'*10}")
        for s in signals[-10:]:
            color = {'BUY': '+', 'SELL': '-', 'HOLD': ' '}
            ret_str = f"{s['next_day_return']:+.2f}%"
            print(f"  {s['date']:<12} {s['signal']:<6} {s['strength']:>4} {s['close']:>10.2f} {ret_str:>10}")

    print(f"\n{'='*60}\n")


if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else "NVDA"
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 30

    print(f"Running backtest for {ticker} ({days} days)...")
    result = run_backtest(ticker, days)
    print_backtest_report(result)
