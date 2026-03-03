# AlphaEdge — Lessons & Issues

Record every bug, blocker, and fix here in real-time.

## Format
```
## [DATE TIME] issue_title
**Type**: bug | blocker | decision | learning
**Status**: open | resolved
**Description**: what happened
**Fix**: how it was resolved
```

---

## [2026-03-03 18:37] jin10_session_expired
**Type**: blocker
**Status**: open
**Description**: Jin10 scraper returns score=1.0 (fallback default) because session cookie expired. All backtester signals show HOLD — no BUY signals generated.
**Fix**: Need to refresh Jin10 session cookie from ~/.zshrc and update src/pipeline/unified_collector.py to read JIN10_SESSION env var. Or set score=0.0 as neutral fallback instead of 1.0.
