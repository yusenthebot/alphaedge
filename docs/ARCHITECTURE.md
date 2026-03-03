# AlphaEdge — Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                          │
│  Jin10 (金十快讯)  │  Yahoo Finance  │  Reddit  │  Twitter  │
└────────┬─────────────────┬──────────────┬──────────┬─────────┘
         │                 │              │          │
         ▼                 ▼              ▼          ▼
┌──────────────────────────────────────────────────────────────┐
│                      PIPELINE LAYER                          │
│  src/pipeline/                                               │
│  ├── jin10_collector.py    (Jin10 scraper, adapted from will)│
│  ├── price_collector.py    (Yahoo Finance via yfinance)      │
│  ├── sentiment_collector.py (Reddit + Twitter)               │
│  └── unified_collector.py  (merge all sources)              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      SIGNAL ENGINE                           │
│  src/signals/                                                │
│  ├── technical.py     (RSI, MACD, Bollinger, Volume)        │
│  ├── sentiment.py     (weighted NLP scoring)                 │
│  ├── aggregator.py    (combine → BUY/HOLD/SELL + strength)  │
│  └── backtester.py    (historical validation)               │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
              ▼                        ▼
┌─────────────────────┐   ┌────────────────────────┐
│   FASTAPI BACKEND   │   │    NEXT.JS FRONTEND     │
│   src/backend/      │   │    src/frontend/        │
│   ├── main.py       │   │    ├── app/             │
│   ├── routes/       │   │    │   ├── dashboard/   │
│   ├── auth.py       │   │    │   ├── pricing/     │
│   └── scheduler.py  │   │    │   └── signal-of-..│
│                     │   │    └── components/      │
└──────────┬──────────┘   └────────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  Tables: users, watchlists, signals_cache, alerts            │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Scheduler** (every 5 min): trigger pipeline for all watched tickers
2. **Pipeline**: fetch Jin10 news → price data → sentiment → merge
3. **Signal Engine**: compute weighted score → generate signal JSON
4. **Cache**: store in Supabase signals_cache (TTL: 5 min)
5. **API**: serve signals to frontend
6. **Alerts**: if strength > 85, send email/Telegram

## Tech Stack

| Layer | Tech | Reason |
|-------|------|--------|
| Frontend | Next.js 14 + Tailwind + shadcn | Fast, SSR, great DX |
| Backend | FastAPI (Python) | Reuse existing Python tools |
| Signal engine | Python + pandas + ta-lib | Standard for TA |
| DB | Supabase (PostgreSQL) | Free, Auth included |
| Scheduler | APScheduler (FastAPI) | Simple Python scheduler |
| Deploy | Vercel + Railway | Vercel for Next.js, Railway for Python |
| Payments | Stripe Checkout | Standard |
| Auth | Supabase Auth | Integrated with DB |

## Environment Variables

```bash
# Jin10
JIN10_SESSION=...

# Yahoo Finance (no key needed, but rate limit)
# Reddit
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...

# Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
