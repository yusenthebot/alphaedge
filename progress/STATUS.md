# AlphaEdge — Project Status
**Updated**: 2026-03-03 22:00 EST
**Location**: ~/Projects/alphaedge/
**Stage**: ✅ Day 1+2+3 Done — Pipeline + Signals + Frontend + Backend Skeleton

---

## 📌 What Is This
AI-powered market intelligence dashboard combining Chinese financial news (金十数据) + Reddit/Twitter sentiment + technical analysis → US stock buy/hold/sell signals.

**Tagline**: *Trade US stocks with Chinese market intelligence.*
**Target**: Active traders, bilingual investors
**Revenue**: Free (5 stocks, 1h delay) / Pro $29/mo (unlimited, real-time)

---

## 🗺️ 7-Day Roadmap

| Day | Focus | Agent | Status |
|-----|-------|-------|--------|
| 1 | Data pipeline + signal schema | A+B | ✅ Done |
| 2 | Signal engine + backtesting | B | ✅ Done |
| 3 | Frontend dashboard + Backend skeleton | C+D | ✅ Done |
| 4-5 | Backend API + Auth + Integration | D | ⏳ Pending |
| 6 | Stripe + landing page | C+D | ⏳ Pending |
| 7 | Deploy + launch prep | E | ⏳ Pending |

---

## ✅ Completed

- [x] Project directory initialized
- [x] Git repo created
- [x] Documentation structure created
- [x] Agent tasks defined
- [x] Unified data collector (Jin10 + Yahoo Finance + sentiment → merged dict)
- [x] Signal aggregator (weighted BUY/HOLD/SELL engine)
- [x] Backtester (30-day historical signal simulation + win rate)
- [x] CLI entry point (`python src/pipeline/run.py NVDA TSLA AAPL`)
- [x] Unit tests (14/14 passing)
- [x] Next.js 16 frontend (TypeScript + Tailwind v4 + shadcn/ui)
- [x] Landing page (`/`) — hero, 3 feature cards, pricing tiers (Free/$29/$79)
- [x] Signal dashboard (`/dashboard`) — live signal cards, 60s auto-refresh, Signal of Day highlight
- [x] Signal of the Day page (`/signal-of-the-day`) — public SEO page with full analysis
- [x] Mock API route (`/api/signals`) — realistic Jin10 data for 5 tickers
- [x] FastAPI backend skeleton (`src/backend/main.py`) — health + signals endpoints
- [x] Project README.md with quick start guide

---

## 🔨 In Progress

- [ ] Backend API integration with signal engine

---

## ⏳ Blocked / Needs Attention

*Nothing blocked yet.*

---

## 🔑 Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Stack | Next.js 14 + FastAPI | Next.js for UI, FastAPI for Python signal worker |
| DB | Supabase (free) | Auth + data persistence, zero ops |
| Deploy | Vercel + Railway | Vercel for Next.js, Railway for Python worker |
| Auth | NextAuth (Google) | Fastest OAuth setup |
| Payments | Stripe Checkout | Standard, well-documented |

---

## 📁 Project Structure

```
~/Projects/alphaedge/
├── progress/
│   ├── STATUS.md          ← This file (update constantly)
│   ├── CHANGELOG.md       ← What changed and when
│   └── LESSONS.md         ← Issues encountered + fixes
├── docs/
│   ├── ARCHITECTURE.md    ← System design
│   ├── API.md             ← API endpoints
│   └── DEPLOY.md          ← Deployment guide
├── src/
│   ├── pipeline/          ← Data collection (Jin10, stocks, sentiment)
│   ├── signals/           ← Signal engine
│   ├── frontend/          ← Next.js app
│   ├── backend/           ← FastAPI server
│   └── tests/             ← Test suite
└── .env.example           ← Required env vars
```

---

## 💡 Signal Schema (v1)

```json
{
  "ticker": "NVDA",
  "signal": "BUY | HOLD | SELL",
  "strength": 78,
  "confidence": 0.82,
  "sources": {
    "jin10_sentiment": 0.9,
    "reddit_sentiment": 0.6,
    "rsi": 42,
    "macd": "bullish_cross",
    "price_momentum": 0.12
  },
  "reasoning": "Jin10报道中国AI政策利好 + RSI超卖回升 + Reddit情绪回暖",
  "updated_at": "2026-03-03T18:00:00Z"
}
```

**Signal Weights (v1):**
- Jin10 sentiment: 35%
- Reddit/Twitter: 20%
- RSI + MACD (technical): 30%
- Price momentum: 15%

---

## 🌐 Pages

```
/                    Landing page                    ✅ Built
/dashboard           Main signal dashboard            ✅ Built (mock data)
/signal-of-the-day   Public page (SEO + virality)     ✅ Built
/dashboard/[ticker]  Signal detail + news feed         ⏳ Planned
/pricing             Plans                             ⏳ Planned
/api/signals         Mock API (Next.js route handler)  ✅ Built
```
