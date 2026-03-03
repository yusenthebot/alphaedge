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

## [2026-03-03 ~22:30 EST] Agent C+D: Frontend Dashboard + Backend Skeleton Complete
- Next.js 16 app with TypeScript strict mode, Tailwind CSS v4, shadcn/ui
- Landing page (`/`): hero section, 3 feature cards, 3-tier pricing (Free/Pro $29/Elite $79)
- Dashboard (`/dashboard`): signal cards with strength bars, Jin10 headlines, RSI/MACD indicators, 60s auto-refresh, Signal of the Day highlight
- Signal of the Day (`/signal-of-the-day`): public SEO page with full signal analysis, OG metadata
- Mock API route (`/api/signals`): realistic data for NVDA, TSLA, AAPL, BABA, SPY with Chinese Jin10 headlines
- FastAPI backend skeleton: health check + signals endpoint stub
- Project README.md with quick start, env vars reference, project structure
- Dark theme throughout (#0D0D0D bg, #15151B cards, green/red/amber signals)
- Mobile-first responsive grid (1->2->3 cols)
- Frontend build passes clean (0 errors)

### Files created/modified:
- `src/frontend/src/app/page.tsx` — Landing page
- `src/frontend/src/app/dashboard/page.tsx` — Signal dashboard
- `src/frontend/src/app/signal-of-the-day/page.tsx` — SEO page
- `src/frontend/src/app/api/signals/route.ts` — Mock signal API
- `src/frontend/src/app/layout.tsx` — Root layout (dark theme)
- `src/frontend/src/app/globals.css` — CSS variables + signal colors
- `src/frontend/src/types/signal.ts` — TypeScript signal interface
- `src/backend/main.py` — FastAPI app
- `src/backend/requirements.txt` — Python dependencies
- `README.md` — Project documentation

---
