from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AlphaEdge API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/signals")
def get_signals(tickers: str = "NVDA,TSLA,AAPL"):
    # TODO: call signal engine
    return {"signals": [], "message": "Signal engine not connected yet"}
