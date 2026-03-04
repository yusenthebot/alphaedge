"""
AlphaEdge FastAPI Backend
- /api/signals: real-time signals (cached 5 min)
- /api/signals/{ticker}: single ticker
- /api/signals/{ticker}/history: signal history from SQLite
- /api/news: Jin10 live headlines
- /api/health: status
- Background scheduler refreshes cache every 5 min
"""
import sys
import os
import time
import threading
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add pipeline to path
_src = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, _src)
sys.path.insert(0, os.path.join(_src, "pipeline"))  # for jin10.py etc.
sys.path.insert(0, os.path.dirname(__file__))       # for signal_store.py

from pipeline.unified_collector import collect_all
from signals.aggregator import generate_signals
from signal_store import init_db, log_signal, get_history, get_all_latest, get_signal_changes, compute_win_rate, compute_all_win_rates


def _generate_signals_for_tickers(tickers: list[str]) -> list[dict]:
    """Collect data + generate signals, returning dicts with all fields."""
    data_list = collect_all(tickers)
    raw_signals = generate_signals(data_list)
    # Merge signal + raw data into flat dict for API
    result = []
    for sig, data in zip(raw_signals, data_list):
        result.append({
            "ticker": sig["ticker"],
            "signal": sig["signal"],
            "strength": sig["strength"],
            "confidence": sig["confidence"],
            "price": data["price"],
            "change_pct": data["change_pct"],
            "rsi": data["rsi"],
            "macd_signal": data["macd_signal"],
            "jin10_score": data["jin10_score"],
            "reasoning": sig["reasoning"],
            "timestamp": sig.get("updated_at", data.get("timestamp", "")),
        })
    return result

# ── App ──────────────────────────────────────────────────────────────
app = FastAPI(title="AlphaEdge API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Init DB at startup ──────────────────────────────────────────────
init_db()

# ── Signal cache ─────────────────────────────────────────────────────
WATCHLIST = ["NVDA", "TSLA", "AAPL", "BABA", "SPY", "MSFT", "AMD", "META"]
CACHE_TTL = 300  # 5 minutes

_cache: dict = {}          # ticker → signal dict
_cache_ts: float = 0.0     # unix timestamp of last refresh
_cache_lock = threading.Lock()


def _refresh_cache(tickers: list[str] = WATCHLIST):
    """Refresh signal cache synchronously."""
    global _cache, _cache_ts
    try:
        signals = _generate_signals_for_tickers(tickers)
        with _cache_lock:
            _cache = {s["ticker"]: s for s in signals}
            _cache_ts = time.time()
        # Log each signal to SQLite history
        for s in signals:
            try:
                log_signal(s)
            except Exception as e:
                print(f"[store] log error for {s.get('ticker')}: {e}")
        print(f"[cache] refreshed {len(signals)} signals at {datetime.now().strftime('%H:%M:%S')}")
    except Exception as e:
        print(f"[cache] refresh error: {e}")


def _get_cache_or_refresh(tickers: Optional[list[str]] = None) -> list[dict]:
    """Return cached signals, refreshing if stale."""
    now = time.time()
    if now - _cache_ts > CACHE_TTL or not _cache:
        _refresh_cache(tickers or WATCHLIST)
    with _cache_lock:
        if tickers:
            return [_cache[t] for t in tickers if t in _cache]
        return list(_cache.values())


# ── Background scheduler ─────────────────────────────────────────────
def _start_scheduler():
    """Background thread: refresh cache every 5 min."""
    import time as _time
    _time.sleep(2)  # let server start first
    while True:
        _refresh_cache(WATCHLIST)
        _time.sleep(CACHE_TTL)

_scheduler_thread = threading.Thread(target=_start_scheduler, daemon=True)
_scheduler_thread.start()


# ── Models ───────────────────────────────────────────────────────────
class SignalResponse(BaseModel):
    ticker: str
    signal: str
    strength: int
    confidence: float
    price: float
    change_pct: float
    rsi: int
    macd_signal: str
    jin10_score: float
    reasoning: str
    timestamp: str


class SignalsListResponse(BaseModel):
    signals: list[SignalResponse]
    cached_at: Optional[str]
    count: int


# ── Routes ───────────────────────────────────────────────────────────
@app.get("/health")
def health():
    age = round(time.time() - _cache_ts, 1) if _cache_ts else None
    return {
        "status": "ok",
        "cache_age_sec": age,
        "cached_tickers": len(_cache),
        "watchlist": WATCHLIST,
    }


@app.get("/api/signals", response_model=SignalsListResponse)
def get_signals(tickers: Optional[str] = None):
    """
    Return signals for watchlist (default) or specific tickers.
    Query: /api/signals?tickers=NVDA,TSLA,AAPL
    """
    ticker_list = [t.strip().upper() for t in tickers.split(",")] if tickers else None
    signals = _get_cache_or_refresh(ticker_list)
    cached_at = (
        datetime.fromtimestamp(_cache_ts, tz=timezone.utc).isoformat()
        if _cache_ts else None
    )
    return SignalsListResponse(
        signals=[SignalResponse(**s) for s in signals],
        cached_at=cached_at,
        count=len(signals),
    )


@app.get("/api/signals/{ticker}", response_model=SignalResponse)
def get_signal(ticker: str):
    """Return signal for a single ticker."""
    ticker = ticker.upper()
    signals = _get_cache_or_refresh([ticker])
    if not signals:
        raise HTTPException(status_code=404, detail=f"No signal for {ticker}")
    return SignalResponse(**signals[0])


@app.get("/api/signals/{ticker}/history")
def get_signal_history(ticker: str, limit: int = 20):
    """Return historical signal records for a ticker."""
    ticker = ticker.upper()
    limit = min(max(1, limit), 100)  # clamp 1-100
    records = get_history(ticker, limit=limit)
    return {"ticker": ticker, "history": records, "count": len(records)}


@app.get("/api/history/{ticker}")
def get_price_history(ticker: str, days: int = 7):
    """Return OHLC history for sparkline charts."""
    try:
        import yfinance as yf
        t = yf.Ticker(ticker.upper())
        hist = t.history(period=f"{days}d", interval="1d")
        points = []
        for ts, row in hist.iterrows():
            points.append({
                "date": ts.strftime("%m/%d"),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })
        return {"ticker": ticker.upper(), "data": points}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/news")
def get_news():
    """Return last 30 Jin10 headlines, newest first."""
    try:
        from jin10 import fetch_flash_news, parse_flash
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"jin10 module not available: {e}")

    raw_items = fetch_flash_news(max_items=50)
    parsed = []
    for item in raw_items:
        p = parse_flash(item)
        if p:
            parsed.append({
                "text": p["text"],
                "created_at": p["time"].isoformat(),
                "time_str": p["time_str"],
                "is_important": p["important"],
            })

    # Sort newest first, limit to 30
    parsed.sort(key=lambda x: x["created_at"], reverse=True)
    return {"news": parsed[:30], "count": min(len(parsed), 30)}


@app.get("/api/alerts")
def get_alerts(hours: int = 24):
    """Return signal changes in the last N hours with severity."""
    hours = min(max(1, hours), 168)  # clamp 1h-7d
    changes = get_signal_changes(since_hours=hours)

    def severity(old: str, new: str) -> str:
        pair = {old, new}
        if pair == {"BUY", "SELL"}:
            return "high"
        return "medium"

    alerts = [
        {
            "ticker": c["ticker"],
            "from_signal": c["old_signal"],
            "to_signal": c["new_signal"],
            "price": c["price"],
            "created_at": c["created_at"],
            "severity": severity(c["old_signal"], c["new_signal"]),
        }
        for c in changes
    ]
    return {"alerts": alerts, "count": len(alerts)}


@app.get("/api/accuracy")
def get_accuracy(days: int = 30):
    """Return signal accuracy stats for all tracked tickers."""
    days = min(max(1, days), 365)
    stats = compute_all_win_rates(days_back=days)
    return {"stats": stats, "count": len(stats), "days_back": days}


@app.get("/api/accuracy/{ticker}")
def get_accuracy_ticker(ticker: str, days: int = 30):
    """Return signal accuracy stats for a single ticker."""
    ticker = ticker.upper()
    days = min(max(1, days), 365)
    stats = compute_win_rate(ticker, days_back=days)
    if stats["total_signals"] == 0:
        raise HTTPException(status_code=404, detail=f"No signal history for {ticker}")
    return stats


@app.post("/api/refresh")
def force_refresh(tickers: Optional[str] = None):
    """Force cache refresh (admin use)."""
    ticker_list = [t.strip().upper() for t in tickers.split(",")] if tickers else WATCHLIST
    _refresh_cache(ticker_list)
    return {"ok": True, "refreshed": ticker_list}
