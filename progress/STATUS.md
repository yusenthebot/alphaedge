# AlphaEdge — Project Status
**Updated**: 2026-03-03 21:00 EST
**Location**: ~/Projects/alphaedge/
**Stage**: ✅ Day 1+2 Done — Pipeline + Signal Engine Complete

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
| 3-4 | Frontend dashboard | C | ⏳ Pending |
| 4-5 | Backend API + Auth | D | ⏳ Pending |
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

---

## 🔨 In Progress

- [ ] Frontend dashboard (Next.js)
- [ ] Backend API (FastAPI)

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

## 🌐 Pages (planned)

```
/                    Landing page
/dashboard           Main signal dashboard (auth required)
/dashboard/[ticker]  Signal detail + news feed
/signal-of-the-day   Public page (SEO + virality)
/pricing             Plans
/api/signals         REST API (Elite tier)
```
