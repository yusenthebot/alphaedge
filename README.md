# AlphaEdge

Trade US stocks with Chinese market intelligence.

AI-powered signal dashboard combining Jin10 (金十数据) Chinese financial news, sentiment analysis, and technical indicators into actionable BUY/HOLD/SELL signals for US stocks.

## Quick Start

### Frontend (Next.js)

```bash
cd src/frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)

```bash
cd src/backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

## Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `.env` (backend). See `.env.example` for all required variables:

- **Jin10**: Session cookie for news scraping
- **Supabase**: URL + keys for auth and data persistence
- **Stripe**: Keys for payment processing
- **NextAuth**: Google OAuth credentials

## Project Structure

```
alphaedge/
├── src/
│   ├── frontend/          Next.js 16 + TypeScript + Tailwind + shadcn/ui
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx                Landing page
│   │       │   ├── dashboard/page.tsx      Signal dashboard
│   │       │   ├── signal-of-the-day/      Public SEO page
│   │       │   └── api/signals/route.ts    Mock signal API
│   │       ├── components/ui/              shadcn components
│   │       └── types/signal.ts             Signal TypeScript types
│   ├── backend/           FastAPI server
│   │   ├── main.py                         API endpoints
│   │   └── requirements.txt
│   ├── pipeline/          Data collection (Jin10, stocks, sentiment)
│   ├── signals/           Signal engine
│   └── tests/
├── docs/                  Architecture docs
├── progress/              Status tracking
└── .env.example           Environment variable reference
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features + pricing |
| `/dashboard` | Live signal dashboard (60s auto-refresh) |
| `/signal-of-the-day` | Public highest-confidence signal (SEO) |

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts
- **Backend**: FastAPI, Pydantic, APScheduler
- **Auth**: NextAuth (Google OAuth)
- **Database**: Supabase (Postgres + Auth)
- **Payments**: Stripe Checkout
- **Deploy**: Vercel (frontend) + Railway (backend)
