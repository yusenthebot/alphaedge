#!/usr/bin/env python3
"""
test_pipeline.py — Unit tests for AlphaEdge pipeline and signal engine.
"""

import sys
import os
import pytest

# Allow imports from src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'pipeline'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'signals'))

from pipeline.unified_collector import collect_ticker, collect_all, get_technical_data, _empty_technical
from signals.aggregator import generate_signal, generate_signals, WEIGHTS


# ---- Unified Collector Tests ----

class TestUnifiedCollector:
    """Tests for the unified data collector."""

    def test_collect_ticker_returns_correct_schema(self):
        """Test that collect_ticker returns all required fields for NVDA."""
        data = collect_ticker("NVDA")

        required_keys = [
            "ticker", "price", "change_pct", "volume_ratio", "rsi",
            "macd_signal", "jin10_score", "jin10_headlines",
            "reddit_score", "timestamp",
        ]
        for key in required_keys:
            assert key in data, f"Missing key: {key}"

    def test_collect_ticker_types(self):
        """Test that collect_ticker returns correct types."""
        data = collect_ticker("AAPL")

        assert isinstance(data["ticker"], str)
        assert isinstance(data["price"], (int, float))
        assert isinstance(data["change_pct"], (int, float))
        assert isinstance(data["volume_ratio"], (int, float))
        assert isinstance(data["rsi"], int)
        assert isinstance(data["macd_signal"], str)
        assert isinstance(data["jin10_score"], (int, float))
        assert isinstance(data["jin10_headlines"], list)
        assert isinstance(data["reddit_score"], (int, float))
        assert isinstance(data["timestamp"], str)

    def test_collect_ticker_value_ranges(self):
        """Test that values are within expected ranges."""
        data = collect_ticker("MSFT")

        assert data["price"] >= 0
        assert 0 <= data["rsi"] <= 100
        assert data["macd_signal"] in ("bullish_cross", "bearish_cross", "neutral")
        assert -1.0 <= data["jin10_score"] <= 1.0
        assert data["reddit_score"] == 0.0  # Placeholder
        assert "T" in data["timestamp"]  # ISO format

    def test_collect_all_multiple_tickers(self):
        """Test collect_all returns data for all requested tickers."""
        tickers = ["NVDA", "AAPL"]
        results = collect_all(tickers)

        assert len(results) == 2
        assert results[0]["ticker"] == "NVDA"
        assert results[1]["ticker"] == "AAPL"

    def test_empty_technical_defaults(self):
        """Test _empty_technical returns valid defaults."""
        defaults = _empty_technical()
        assert defaults["price"] == 0.0
        assert defaults["rsi"] == 50
        assert defaults["macd_signal"] == "neutral"

    def test_get_technical_data_nvda(self):
        """Test that get_technical_data returns real data for NVDA."""
        tech = get_technical_data("NVDA")
        assert tech["price"] > 0, "NVDA price should be > 0"
        assert 0 <= tech["rsi"] <= 100


# ---- Aggregator Tests ----

class TestAggregator:
    """Tests for the signal aggregator."""

    def test_generate_signal_buy(self):
        """Test that strong bullish data produces BUY signal."""
        data = {
            "ticker": "TEST",
            "price": 100.0,
            "change_pct": 3.0,
            "volume_ratio": 1.8,
            "rsi": 28,
            "macd_signal": "bullish_cross",
            "jin10_score": 0.9,
            "jin10_headlines": ["大涨突破新高"],
            "reddit_score": 0.0,
            "timestamp": "2026-03-03T18:00:00Z",
        }
        signal = generate_signal(data)

        assert signal["signal"] == "BUY"
        assert signal["strength"] > 65

    def test_generate_signal_sell(self):
        """Test that strong bearish data produces SELL signal."""
        data = {
            "ticker": "TEST",
            "price": 50.0,
            "change_pct": -4.0,
            "volume_ratio": 2.0,
            "rsi": 78,
            "macd_signal": "bearish_cross",
            "jin10_score": -0.8,
            "jin10_headlines": ["暴跌崩盘"],
            "reddit_score": 0.0,
            "timestamp": "2026-03-03T18:00:00Z",
        }
        signal = generate_signal(data)

        assert signal["signal"] == "SELL"
        assert signal["strength"] < 35

    def test_generate_signal_hold(self):
        """Test that neutral data produces HOLD signal."""
        data = {
            "ticker": "TEST",
            "price": 75.0,
            "change_pct": 0.1,
            "volume_ratio": 1.0,
            "rsi": 50,
            "macd_signal": "neutral",
            "jin10_score": 0.0,
            "jin10_headlines": [],
            "reddit_score": 0.0,
            "timestamp": "2026-03-03T18:00:00Z",
        }
        signal = generate_signal(data)

        assert signal["signal"] == "HOLD"
        assert 35 <= signal["strength"] <= 65

    def test_signal_schema(self):
        """Test that signal output has all required fields."""
        data = {
            "ticker": "NVDA",
            "price": 875.0,
            "change_pct": 1.0,
            "volume_ratio": 1.2,
            "rsi": 45,
            "macd_signal": "neutral",
            "jin10_score": 0.5,
            "jin10_headlines": ["test"],
            "reddit_score": 0.0,
            "timestamp": "2026-03-03T18:00:00Z",
        }
        signal = generate_signal(data)

        assert "ticker" in signal
        assert "signal" in signal
        assert signal["signal"] in ("BUY", "HOLD", "SELL")
        assert "strength" in signal
        assert 0 <= signal["strength"] <= 100
        assert "confidence" in signal
        assert 0.0 <= signal["confidence"] <= 1.0
        assert "weights" in signal
        assert "reasoning" in signal
        assert "updated_at" in signal

    def test_weights_sum_to_one(self):
        """Test that signal weights sum to 1.0."""
        total = sum(WEIGHTS.values())
        assert abs(total - 1.0) < 0.001

    def test_generate_signals_batch(self):
        """Test batch signal generation."""
        data_list = [
            {
                "ticker": "A", "price": 100, "change_pct": 1.0,
                "volume_ratio": 1.0, "rsi": 50, "macd_signal": "neutral",
                "jin10_score": 0.0, "jin10_headlines": [], "reddit_score": 0.0,
                "timestamp": "2026-03-03T18:00:00Z",
            },
            {
                "ticker": "B", "price": 200, "change_pct": -1.0,
                "volume_ratio": 1.0, "rsi": 50, "macd_signal": "neutral",
                "jin10_score": 0.0, "jin10_headlines": [], "reddit_score": 0.0,
                "timestamp": "2026-03-03T18:00:00Z",
            },
        ]
        signals = generate_signals(data_list)
        assert len(signals) == 2
        assert signals[0]["ticker"] == "A"
        assert signals[1]["ticker"] == "B"


# ---- Backtester Tests ----

class TestBacktester:
    """Tests for the backtester."""

    def test_backtest_runs_without_error(self):
        """Test that backtester runs end-to-end for NVDA."""
        from signals.backtester import run_backtest

        result = run_backtest("NVDA", days=30)

        assert "ticker" in result
        assert result["ticker"] == "NVDA"
        assert "error" not in result
        assert result["total_signals"] > 0
        assert result["buy_count"] + result["hold_count"] + result["sell_count"] == result["total_signals"]
        assert 0 <= result["buy_win_rate"] <= 100
        assert result["max_drawdown_pct"] >= 0

    def test_backtest_signals_have_returns(self):
        """Test that backtest signals include next-day returns."""
        from signals.backtester import run_backtest

        result = run_backtest("AAPL", days=15)
        signals = result.get("signals", [])

        if signals:
            for s in signals:
                assert "date" in s
                assert "signal" in s
                assert "strength" in s
                assert "close" in s
                assert "next_day_return" in s


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
