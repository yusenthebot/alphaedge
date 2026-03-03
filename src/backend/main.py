"""
AlphaEdge FastAPI Backend
- /api/signals: real-time signals (cached 5 min)
- /api/signals/{ticker}: single ticker
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

from pipeline.unified_collector import collect_all
from signals.aggregator import generate_signals


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
app = FastAPI(title="AlphaEdge API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.post("/api/refresh")
def force_refresh(tickers: Optional[str] = None):
    """Force cache refresh (admin use)."""
    ticker_list = [t.strip().upper() for t in tickers.split(",")] if tickers else WATCHLIST
    _refresh_cache(ticker_list)
    return {"ok": True, "refreshed": ticker_list}
