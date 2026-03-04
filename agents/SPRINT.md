# Sprint — Cycle 11 [21:30:58]

# SPRINT 11

## Task 1: LivePreview error state (bug fix)
File: `src/frontend/src/components/LivePreview.tsx`
Change: Add `const [error, setError] = useState(false);` next to line 21. In the `.catch()` at line 38, add `setError(true)` after the console.error. After the loading guard (line 51), add an error guard: `if (error) return <div className="text-center text-xs text-[#FF3131] py-4">Signal fetch failed — retrying…</div>;` — and wrap the fetch in a retry: on catch, `setTimeout(() => { setError(false); setLoading(true); /* re-run fetch */ }, 5000)`.
Done when: Network/5xx failure shows red error text instead of blank div, and auto-retries after 5s.

## Task 2: Dynamic ticker tape
File: `src/frontend/src/app/dashboard/page.tsx`
Change: Replace the hardcoded string at line 670 with: `{(signals.length > 0 ? signals.map(s => \`\${s.ticker} \${s.change >= 0 ? '▲' : '▼'}\${Math.abs(s.change).toFixed(2)}% \${s.signal}\`).join(' ◆ ') + ' ◆ ' : 'Loading signals… ◆ ').repeat(3)}`
Done when: Ticker tape renders live signal data from `signals` state; falls back to "Loading signals…" while empty.