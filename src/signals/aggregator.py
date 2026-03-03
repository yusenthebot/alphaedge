#!/usr/bin/env python3
"""
aggregator.py — Signal aggregation engine for AlphaEdge.
Takes unified_collector output and produces BUY/HOLD/SELL signals
with strength, confidence, and reasoning.
"""

import sys
import os
from datetime import datetime, timezone

# Signal weights (v1)
WEIGHTS = {
    "jin10_sentiment": 0.35,
    "social_sentiment": 0.20,
    "technical": 0.30,
    "momentum": 0.15,
}


def _score_jin10(jin10_score: float) -> float:
    """Convert jin10 sentiment score (-1 to 1) to 0-100 scale.

    Maps linearly: -1 -> 0, 0 -> 50, 1 -> 100
    """
    return (jin10_score + 1) * 50


def _score_social(reddit_score: float) -> float:
    """Convert social sentiment score (-1 to 1) to 0-100 scale.

    Same linear mapping as jin10. Placeholder until Reddit is integrated.
    """
    return (reddit_score + 1) * 50


def _score_technical(rsi: int, macd_signal: str) -> float:
    """Compute technical score (0-100) from RSI and MACD.

    RSI scoring (60% of technical):
    - RSI < 30: oversold = bullish (80-100)
    - RSI 30-45: mildly oversold (60-80)
    - RSI 45-55: neutral (40-60)
    - RSI 55-70: mildly overbought (20-40)
    - RSI > 70: overbought = bearish (0-20)

    MACD scoring (40% of technical):
    - bullish_cross: 90
    - bearish_cross: 10
    - neutral: 50
    """
    # RSI component (inverted: low RSI = bullish = high score)
    if rsi < 30:
        rsi_score = 80 + (30 - rsi) * (20 / 30)
    elif rsi < 45:
        rsi_score = 60 + (45 - rsi) * (20 / 15)
    elif rsi <= 55:
        rsi_score = 40 + (55 - rsi) * (20 / 10)
    elif rsi <= 70:
        rsi_score = 20 + (70 - rsi) * (20 / 15)
    else:
        rsi_score = max(0, 20 - (rsi - 70) * (20 / 30))

    # MACD component
    macd_scores = {"bullish_cross": 90, "bearish_cross": 10, "neutral": 50}
    macd_score = macd_scores.get(macd_signal, 50)

    return rsi_score * 0.6 + macd_score * 0.4


def _score_momentum(change_pct: float, volume_ratio: float) -> float:
    """Compute momentum score (0-100) from price change and volume ratio.

    Price change contribution (70%):
    - Positive change = bullish, capped at +5%
    - Negative change = bearish, capped at -5%

    Volume ratio contribution (30%):
    - High volume confirms the move
    - volume_ratio > 1.5 with positive change = extra bullish
    """
    # Price change: map -5% to +5% -> 0 to 100
    clamped_change = max(-5, min(5, change_pct))
    price_score = (clamped_change + 5) * 10  # -5->0, 0->50, +5->100

    # Volume confirmation
    vol_score = 50  # Default neutral
    if volume_ratio > 1.5:
        vol_score = 70 if change_pct > 0 else 30  # Confirms the direction
    elif volume_ratio > 1.2:
        vol_score = 60 if change_pct > 0 else 40
    elif volume_ratio < 0.5:
        vol_score = 45  # Low volume = less conviction

    return price_score * 0.7 + vol_score * 0.3


def compute_confidence(data: dict, strength: float) -> float:
    """Compute confidence (0.0-1.0) based on data availability and signal agreement.

    Higher confidence when:
    - More data sources are available
    - Multiple signals agree on direction
    - Strength is far from the neutral zone (35-65)
    """
    confidence = 0.5  # Base

    # Data availability bonus
    if data.get("jin10_headlines"):
        confidence += 0.1
    if data.get("reddit_score", 0.0) != 0.0:
        confidence += 0.1
    if data.get("price", 0) > 0:
        confidence += 0.1

    # Signal clarity: further from 50 = more confident
    distance_from_neutral = abs(strength - 50) / 50
    confidence += distance_from_neutral * 0.2

    return round(min(1.0, max(0.0, confidence)), 2)


def _build_reasoning(data: dict, strength: float) -> str:
    """Build bilingual reasoning string explaining the signal.

    Format: Chinese summary with key factors.
    """
    parts = []

    # Jin10 sentiment
    jin10 = data.get("jin10_score", 0)
    if jin10 > 0.3:
        parts.append(f"Jin10情绪积极 ({jin10:+.2f})")
    elif jin10 < -0.3:
        parts.append(f"Jin10情绪消极 ({jin10:+.2f})")
    else:
        parts.append(f"Jin10情绪中性 ({jin10:+.2f})")

    # RSI
    rsi = data.get("rsi", 50)
    if rsi < 30:
        parts.append(f"RSI超卖 ({rsi})")
    elif rsi > 70:
        parts.append(f"RSI超买 ({rsi})")
    else:
        parts.append(f"RSI中性 ({rsi})")

    # MACD
    macd = data.get("macd_signal", "neutral")
    if macd == "bullish_cross":
        parts.append("MACD金叉")
    elif macd == "bearish_cross":
        parts.append("MACD死叉")

    # Price momentum
    change = data.get("change_pct", 0)
    if abs(change) > 1:
        direction = "上涨" if change > 0 else "下跌"
        parts.append(f"价格{direction}{abs(change):.1f}%")

    # Volume
    vol = data.get("volume_ratio", 1.0)
    if vol > 1.5:
        parts.append(f"放量 (vol×{vol:.1f})")

    return "中文: " + " + ".join(parts)


def generate_signal(data: dict) -> dict:
    """Generate a BUY/HOLD/SELL signal from unified collector data.

    Takes a single ticker's unified data dict and produces:
    - signal: BUY | HOLD | SELL
    - strength: 0-100
    - confidence: 0.0-1.0
    - weights: component weights used
    - reasoning: bilingual explanation
    - updated_at: ISO timestamp

    Signal rules:
    - strength > 65 = BUY
    - strength < 35 = SELL
    - else = HOLD

    Args:
        data: Dict from unified_collector.collect_ticker()

    Returns:
        Signal dict matching AlphaEdge schema
    """
    # Compute component scores (all 0-100)
    jin10_component = _score_jin10(data.get("jin10_score", 0))
    social_component = _score_social(data.get("reddit_score", 0))
    tech_component = _score_technical(
        data.get("rsi", 50),
        data.get("macd_signal", "neutral"),
    )
    momentum_component = _score_momentum(
        data.get("change_pct", 0),
        data.get("volume_ratio", 1.0),
    )

    # Weighted average
    strength = (
        jin10_component * WEIGHTS["jin10_sentiment"]
        + social_component * WEIGHTS["social_sentiment"]
        + tech_component * WEIGHTS["technical"]
        + momentum_component * WEIGHTS["momentum"]
    )
    strength = round(min(100, max(0, strength)))

    # Signal decision
    if strength > 65:
        signal = "BUY"
    elif strength < 35:
        signal = "SELL"
    else:
        signal = "HOLD"

    confidence = compute_confidence(data, strength)
    reasoning = _build_reasoning(data, strength)

    return {
        "ticker": data.get("ticker", ""),
        "signal": signal,
        "strength": strength,
        "confidence": confidence,
        "weights": dict(WEIGHTS),
        "reasoning": reasoning,
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def generate_signals(data_list: list) -> list:
    """Generate signals for multiple tickers.

    Args:
        data_list: List of dicts from unified_collector.collect_all()

    Returns:
        List of signal dicts
    """
    return [generate_signal(d) for d in data_list]


if __name__ == "__main__":
    import json

    # Quick test with sample data
    sample = {
        "ticker": "NVDA",
        "price": 875.20,
        "change_pct": 2.3,
        "volume_ratio": 1.4,
        "rsi": 42,
        "macd_signal": "bullish_cross",
        "jin10_score": 0.85,
        "jin10_headlines": ["英伟达股价大涨"],
        "reddit_score": 0.0,
        "timestamp": "2026-03-03T18:00:00Z",
    }
    result = generate_signal(sample)
    print(json.dumps(result, indent=2, ensure_ascii=False))
