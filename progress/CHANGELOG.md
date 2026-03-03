# AlphaEdge — Changelog

## [2026-03-03 18:31 EST] Project Initialized
- Created ~/Projects/alphaedge/ directory structure
- Initialized git repository
- Created progress docs: STATUS.md, CHANGELOG.md, LESSONS.md
- Defined signal schema v1
- Spawning Agent A (pipeline) and Agent B (signal engine)

## [2026-03-03 18:36 EST] Agents Successfully Started
- Agent A+B (lucky-cove, pid 37050): Pipeline + Signal engine — running ✅
- Agent C+D (glow-lobster, pid 39787): Frontend + Backend — running ✅
- Both accepted bypass permissions prompt (Down → wait → Enter pattern)

## [2026-03-03 ~21:30 EST] Agent A+B: Pipeline + Signal Engine Complete
- Enhanced unified_collector.py with ticker-specific Jin10 keyword filtering (TICKER_KEYWORDS map)
- Added market-wide keyword fallback when no ticker-specific headlines found
- Fixed run.py display bug (line 87: `SHORTCUTS and '35%'` → `'35%'`)
- Verified all 14 unit tests passing (collector, aggregator, backtester)
- CLI smoke test: `python src/pipeline/run.py NVDA TSLA AAPL` — working

### Files touched:
- `src/pipeline/unified_collector.py` — added TICKER_KEYWORDS, MARKET_KEYWORDS, ticker-filtered Jin10 sentiment
- `src/pipeline/run.py` — fixed weights display bug
- `src/pipeline/__init__.py` — created
- `src/signals/__init__.py` — created
- `src/tests/__init__.py` — created

## [2026-03-03 ~22:00 EST] Agent A+B: Verification Pass
- Re-verified all 14 unit tests passing (pytest)
- Re-verified CLI: `python src/pipeline/run.py NVDA TSLA AAPL` produces signal table
- Live signals: NVDA=BUY(68), TSLA=HOLD(55), AAPL=BUY(68)
- Dependencies confirmed: yfinance, pandas, ta, pytest all installed

---
