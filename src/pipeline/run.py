#!/usr/bin/env python3
"""
run.py — CLI entry point for AlphaEdge signal pipeline.

Usage:
    python src/pipeline/run.py NVDA TSLA AAPL
    python src/pipeline/run.py mag7
    python src/pipeline/run.py --json NVDA
"""

import argparse
import json
import sys
import os

# Allow imports from src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from unified_collector import collect_all
from signals.aggregator import generate_signals

# Ticker group shortcuts (same as stock_price.py)
SHORTCUTS = {
    'mag7': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA'],
    'ai': ['NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'PLTR'],
    'chip': ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO', 'QCOM'],
    'cn': ['BABA', 'JD', 'PDD', 'NIO', 'XPEV', 'LI', 'BIDU'],
}


def resolve_tickers(args: list) -> list:
    """Resolve ticker arguments, expanding shortcuts.

    Args:
        args: List of ticker symbols or shortcut names

    Returns:
        Deduplicated list of ticker symbols
    """
    tickers = []
    for arg in args:
        if arg.lower() in SHORTCUTS:
            tickers.extend(SHORTCUTS[arg.lower()])
        else:
            tickers.append(arg.upper())
    # Deduplicate while preserving order
    seen = set()
    return [t for t in tickers if not (t in seen or seen.add(t))]


def print_signals_table(signals: list):
    """Print signals as a formatted ASCII table.

    Args:
        signals: List of signal dicts from aggregator
    """
    if not signals:
        print("No signals generated.")
        return

    # Header
    print(f"\n{'='*75}")
    print(f"  ALPHAEDGE SIGNAL DASHBOARD")
    print(f"{'='*75}")
    print(f"  {'Ticker':<8} {'Signal':<6} {'Str':>4} {'Conf':>6} {'Price':>10} {'Chg%':>7} {'RSI':>4} {'MACD':<14}")
    print(f"  {'-'*8} {'-'*6} {'-'*4} {'-'*6} {'-'*10} {'-'*7} {'-'*4} {'-'*14}")

    for s in signals:
        signal_str = s['signal']
        ticker = s['ticker']
        strength = s['strength']
        conf = s['confidence']

        # Get underlying data from reasoning for display
        print(f"  {ticker:<8} {signal_str:<6} {strength:>4} {conf:>6.2f}", end="")

        # These are in the input data, not in signal output — so we pass them through
        if '_data' in s:
            d = s['_data']
            print(f" {d['price']:>10.2f} {d['change_pct']:>+7.2f} {d['rsi']:>4} {d['macd_signal']:<14}")
        else:
            print()

    print(f"{'='*75}")
    print(f"  Signal rules: BUY (>65) | HOLD (35-65) | SELL (<35)")
    print(f"  Weights: Jin10=35% Social=20% Technical=30% Momentum=15%")
    print()

    # Print reasoning for each
    print("  Reasoning:")
    for s in signals:
        print(f"    {s['ticker']}: {s['reasoning']}")
    print()


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="AlphaEdge Signal Pipeline — Generate BUY/HOLD/SELL signals"
    )
    parser.add_argument(
        'tickers', nargs='*', default=['NVDA'],
        help='Ticker symbols or shortcuts (mag7, ai, chip, cn)'
    )
    parser.add_argument('--json', '-j', action='store_true', help='JSON output')
    args = parser.parse_args()

    tickers = resolve_tickers(args.tickers)
    print(f"Collecting data for: {', '.join(tickers)}...\n")

    # Step 1: Collect unified data
    data_list = collect_all(tickers)

    # Step 2: Generate signals
    signals = generate_signals(data_list)

    # Attach raw data for table display
    for sig, data in zip(signals, data_list):
        sig['_data'] = data

    if args.json:
        # Remove internal _data key for clean JSON output
        clean = []
        for s in signals:
            s_copy = {k: v for k, v in s.items() if k != '_data'}
            clean.append(s_copy)
        print(json.dumps(clean, indent=2, ensure_ascii=False))
    else:
        print_signals_table(signals)


if __name__ == "__main__":
    main()
