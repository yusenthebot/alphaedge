"""
signal_store.py — SQLite signal history storage
Stores every signal generation for historical tracking.
DB file: ~/.alphaedge/signals.db
"""

import os
import sqlite3
import threading
from datetime import datetime, timezone
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
