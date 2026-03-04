"""
signal_store.py — SQLite signal history storage
Stores every signal generation for historical tracking.
DB file: ~/.alphaedge/signals.db
"""

import os
import sqlite3
import threading
from datetime import datetime, timezone, timedelta
from pathlib import Path

DB_DIR = Path.home() / ".alphaedge"
DB_PATH = DB_DIR / "signals.db"

_local = threading.local()


def _get_conn() -> sqlite3.Connection:
    """Get a thread-local SQLite connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        DB_DIR.mkdir(parents=True, exist_ok=True)
        _local.conn = sqlite3.connect(str(DB_PATH))
        _local.conn.row_factory = sqlite3.Row
    return _local.conn


def init_db():
    """Create signals table if it doesn't exist."""
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            signal TEXT NOT NULL,
            strength INTEGER,
            confidence REAL,
            price REAL,
            change_pct REAL,
            rsi INTEGER,
            macd_signal TEXT,
            jin10_score REAL,
            reasoning TEXT,
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_signals_ticker_created
        ON signals (ticker, created_at DESC)
    """)
    conn.commit()


def log_signal(signal_dict: dict):
    """Insert one signal row into the database."""
    conn = _get_conn()
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        """
        INSERT INTO signals (ticker, signal, strength, confidence, price,
                             change_pct, rsi, macd_signal, jin10_score,
                             reasoning, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            signal_dict.get("ticker"),
            signal_dict.get("signal"),
            signal_dict.get("strength"),
            signal_dict.get("confidence"),
            signal_dict.get("price"),
            signal_dict.get("change_pct"),
            signal_dict.get("rsi"),
            signal_dict.get("macd_signal"),
            signal_dict.get("jin10_score"),
            signal_dict.get("reasoning"),
            now,
        ),
    )
    conn.commit()


def get_history(ticker: str, limit: int = 20) -> list[dict]:
    """Return recent signal records for a ticker, newest first."""
    conn = _get_conn()
    rows = conn.execute(
        """
        SELECT id, ticker, signal, strength, confidence, price,
               change_pct, rsi, macd_signal, jin10_score, reasoning, created_at
        FROM signals
        WHERE ticker = ?
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (ticker.upper(), limit),
    ).fetchall()
    return [dict(row) for row in rows]


def get_prev_signal(ticker: str):
    """Return the second most recent signal value for ticker."""
    conn = _get_conn()
    rows = conn.execute(
        """
        SELECT signal FROM signals
        WHERE ticker = ?
        ORDER BY created_at DESC
        LIMIT 2
        """,
        (ticker.upper(),),
    ).fetchall()
    if len(rows) < 2:
        return None
    return rows[1]["signal"]


def get_signal_changes(since_hours: int = 24) -> list[dict]:
    """Return all rows where signal changed from previous row for same ticker."""
    conn = _get_conn()
    rows = conn.execute(
        """
        WITH ranked AS (
            SELECT
                ticker, signal, price, created_at,
                LAG(signal) OVER (PARTITION BY ticker ORDER BY created_at) AS prev_signal
            FROM signals
            WHERE created_at >= datetime('now', ?)
        )
        SELECT ticker, prev_signal AS old_signal, signal AS new_signal,
               price, created_at
        FROM ranked
        WHERE prev_signal IS NOT NULL AND signal != prev_signal
        ORDER BY created_at DESC
        """,
        (f"-{since_hours} hours",),
    ).fetchall()
    return [dict(row) for row in rows]


def get_all_latest() -> list[dict]:
    """Return the most recent signal per ticker."""
    conn = _get_conn()
    rows = conn.execute(
        """
        SELECT s.id, s.ticker, s.signal, s.strength, s.confidence, s.price,
               s.change_pct, s.rsi, s.macd_signal, s.jin10_score,
               s.reasoning, s.created_at
        FROM signals s
        INNER JOIN (
            SELECT ticker, MAX(created_at) AS max_created
            FROM signals
            GROUP BY ticker
        ) latest ON s.ticker = latest.ticker AND s.created_at = latest.max_created
        ORDER BY s.ticker
        """
    ).fetchall()
    return [dict(row) for row in rows]


def compute_win_rate(ticker: str, days_back: int = 30) -> dict:
    """
    Compute signal accuracy stats for a ticker.

    For each BUY signal:
    - If followed by another BUY or a price increase in next entry → win
    - If followed by a SELL within next 3 entries → loss
    Returns stats dict with signal counts, changes, and approximate win rate.
    """
    conn = _get_conn()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days_back)).isoformat()
    rows = conn.execute(
        """
        SELECT signal, strength, price, created_at
        FROM signals
        WHERE ticker = ?
          AND created_at >= ?
        ORDER BY created_at ASC
        """,
        (ticker.upper(), cutoff),
    ).fetchall()

    records = [dict(r) for r in rows]
    total = len(records)

    buy_count = sum(1 for r in records if r["signal"] == "BUY")
    hold_count = sum(1 for r in records if r["signal"] == "HOLD")
    sell_count = sum(1 for r in records if r["signal"] == "SELL")

    # Count signal changes (consecutive different signals)
    changes = 0
    for i in range(1, total):
        if records[i]["signal"] != records[i - 1]["signal"]:
            changes += 1

    # Approximate win rate for BUY signals
    wins = 0
    losses = 0
    for i, rec in enumerate(records):
        if rec["signal"] != "BUY":
            continue
        lookahead = records[i + 1 : i + 4]
        if not lookahead:
            continue
        # Check if price went up in next entry
        next_rec = lookahead[0]
        if next_rec["price"] and rec["price"] and next_rec["price"] > rec["price"]:
            wins += 1
            continue
        # Check if a SELL appeared within next 3 entries
        if any(la["signal"] == "SELL" for la in lookahead):
            losses += 1
            continue
        # Next entry is still BUY → win (signal held)
        if next_rec["signal"] == "BUY":
            wins += 1
        else:
            losses += 1

    evaluated = wins + losses
    win_rate = round((wins / evaluated) * 100, 1) if evaluated > 0 else None

    # Most common signal
    counts = {"BUY": buy_count, "HOLD": hold_count, "SELL": sell_count}
    most_common = max(counts, key=counts.get) if total > 0 else "HOLD"

    # Stability score: fewer changes relative to total = more stable
    # score = 100 * (1 - changes / max(total - 1, 1))
    stability = round(100 * (1 - changes / max(total - 1, 1)), 1) if total > 1 else 100.0

    return {
        "ticker": ticker.upper(),
        "total_signals": total,
        "buy_signals": buy_count,
        "hold_signals": hold_count,
        "sell_signals": sell_count,
        "signal_changes": changes,
        "win_rate_approx": win_rate,
        "most_common_signal": most_common,
        "stability_score": stability,
    }


def compute_all_win_rates(days_back: int = 30) -> list[dict]:
    """Compute win rate stats for all tickers that have signal history."""
    conn = _get_conn()
    tickers = conn.execute(
        "SELECT DISTINCT ticker FROM signals ORDER BY ticker"
    ).fetchall()
    return [compute_win_rate(row["ticker"], days_back) for row in tickers]
