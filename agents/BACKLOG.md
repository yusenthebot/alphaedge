# AlphaEdge Feature & Bug Backlog
# Last reviewed by DESIGNER 2026-03-03 — based on screenshots

## 🔴 CRITICAL BUGS (fix first every cycle)

### BUG-01: Signal cards use circular Recharts gauges not pixel art
- File: src/frontend/src/app/dashboard/page.tsx
- Problem: Lower signal cards (row 2+) still render a circular RSI gauge via Recharts `<RadialBarChart>` or `<PieChart>`. Must be replaced with pixel `<SignalStrengthBar>` from PixelProgress.tsx
- Fix: Search for any `<RadialBarChart>`, `<PieChart>`, `<svg>` RSI rings in dashboard/page.tsx and replace with `<SignalStrengthBar value={rsi} signal={signal.signal} />`

### BUG-02: "STRONGEST SIGNAL TODAY" progress bar wrong color (blue/yellow)
- File: src/frontend/src/app/dashboard/page.tsx
- Problem: The confidence bar under STRONGEST SIGNAL card uses old Tailwind `bg-green-500` or inline blue color instead of `--pixel-buy`
- Fix: Change to `style={{ background: 'var(--pixel-buy)' }}` or use `PixelProgress` component

### BUG-03: Stray "N" icon in bottom-left of dashboard
- File: src/frontend/src/app/dashboard/page.tsx or layout.tsx
- Problem: A lone "N" character or icon appears floating in bottom-left of dashboard view
- Fix: Find and remove it

### BUG-04: Market Heatmap tiles show blank/skeleton state
- File: src/frontend/src/app/dashboard/page.tsx
- Problem: Heatmap tiles show gray placeholder blocks instead of actual market data
- Fix: Ensure mock data is loaded; if API unavailable use hard-coded demo data for FAANG stocks

### BUG-05: Portfolio/accuracy pages not navigating (stuck on dashboard)
- File: src/frontend/src/app/portfolio/page.tsx and accuracy/page.tsx
- Problem: Clicking PORTFOLIO or ACCURACY nav shows dashboard content — page component may have layout bug
- Fix: Check if these pages export a default component and don't accidentally import dashboard layout

### BUG-06: Landing page (/) shows dashboard nav instead of landing content
- File: src/frontend/src/app/page.tsx
- Problem: root page.tsx appears to redirect or share layout with dashboard, showing nav bar
- Fix: Verify page.tsx exports correct standalone landing page component

### BUG-07: RSI value shows "中" (Chinese) instead of number
- File: src/frontend/src/app/dashboard/page.tsx
- Problem: RSI label shows "中" — likely a translation artifact or wrong field reference
- Fix: Display numeric RSI value like `RSI 44` not `RSI 中`

## 🟡 HIGH PRIORITY FEATURES

### FEAT-01: Matrix Rain Background on Landing Page (MUST HAVE)
- Add a CSS/canvas matrix digital rain effect behind hero section on /
- Use `useEffect` + canvas for falling green characters
- Characters: "01ABαβ⬛⬜△▽◇◆" — mix of binary and pixel symbols
- Speed: randomized per column, 15-25px/frame at 30fps
- Color: #00FF41 at 80% opacity, trails fade to #2E4D2E

### FEAT-02: Price Flash Animation on Data Update
- When prices refresh (60s auto-refresh), flash changed prices
- +price: green flash → `box-shadow: 0 0 12px var(--pixel-buy); animation: priceFlash 0.6s`
- -price: red flash → `box-shadow: 0 0 12px var(--pixel-sell); animation: priceFlash 0.6s`
- @keyframes priceFlash: 0%→100% with background-color transition

### FEAT-03: Typewriter News Feed
- Jin10 news items should appear character by character (typewriter effect)
- Only animate the most recently added item (newest at top)
- Speed: 20ms per character
- Cursor: blinking `█` at end of typing

### FEAT-04: Animated Signal Pulse Ring on HIGH confidence signals (>80%)
- Add pulsing concentric rings on BUY signal cards where confidence > 80%
- CSS: `@keyframes signalPulse` — 3 rings, 0.3s stagger, scale 1→1.4, opacity 1→0
- Color: `var(--pixel-buy)` green glow rings

### FEAT-05: Scanline Flicker on hover
- When hovering any signal card, add brief CRT scanline intensify effect
- CSS: `::after` pseudo with repeating-linear-gradient, opacity animate 0.3→0.5→0.3

### FEAT-06: Market Heatmap Color Gradient Tiles
- Heatmap tiles should show color intensity based on % change
- >2% gain: bright `--pixel-buy` (#00FF41)
- 0-2% gain: dim green `#1A8A00`
- 0-2% loss: dim red `#8A0000`
- >2% loss: bright `--pixel-sell` (#FF3131)
- Tile shows: TICKER + % change in pixel font

### FEAT-07: Glitch Effect on SELL signals
- When displaying SELL badge/card, add CSS glitch animation
- Brief horizontal offset of text (2px left/right), RGB split
- @keyframes glitch: 0% normal, 2% offset+red, 4% normal

### FEAT-08: Boot Sequence on Page Load
- Landing page shows ASCII boot sequence for 2s before revealing content
- Text: "INITIALIZING ALPHAEDGE... LOADING SIGNALS... MARKET CONNECTION ESTABLISHED"
- Then fade-in the actual landing content

### FEAT-09: Pixel Chart for Signal History (per ticker)
- On /ticker/[ticker] page, replace any Recharts chart with pixel-art style
- Each day = one column of blocks (█), height = signal strength
- Color = BUY(green)/HOLD(amber)/SELL(red)

### FEAT-10: Live Signal Ticker Tape (horizontal scroll)
- At top of dashboard, add scrolling ticker: "MSFT ▲1.35% BUY | NVDA ▼1.22% HOLD | AAPL ▲0.8% HOLD |..."
- CSS marquee/animation: `@keyframes tickerScroll` continuous left scroll
- Background: `--pixel-surface`, border-bottom: `--pixel-border`

## 🟢 MEDIUM PRIORITY

### FEAT-11: Keyboard shortcuts
- Press `B` to filter BUY only, `H` for HOLD, `S` for SELL, `Esc` for ALL
- Press `R` to refresh, `1-9` to jump to signal card
- Show shortcut hints in footer

### FEAT-12: Signal card flip animation (click for detail)
- Click signal card → flip 3D to show detailed back side (entry price, stop loss, target)
- CSS `transform: rotateY(180deg)` with `transform-style: preserve-3d`
- Back side shows: "ENTRY: $X | STOP: $Y | TARGET: $Z | RISK/REWARD: 1:3"

### FEAT-13: Accuracy page pixel bar chart
- Replace any Recharts BarChart in accuracy/page.tsx with hand-drawn pixel bars
- Each bar = series of `█` blocks stacked vertically
- X-axis = last 30 days, Y-axis = % accuracy

### FEAT-14: Portfolio P&L pixel sparkline
- In portfolio page, each position shows a mini 7-day sparkline made of ASCII chars
- Format: `▁▂▄▆█▇▄` proportional to price movement

## ⚙️ TECH IMPROVEMENTS

### TECH-01: Add loading skeleton with pixel animation
- Replace plain gray skeletons with animated pixel blocks: `░░░░░` → `████` wave

### TECH-02: Error boundary pixel error screen
- When component crashes: show pixel tombstone `⬛` with "SIGNAL LOST" text

### TECH-03: localStorage persistence for watchlist
- Save user's signal filter preference (BUY/HOLD/SELL) to localStorage
- Restore on next page load

### TECH-04: Debounce search input
- SearchBar currently fires API on every keystroke — add 300ms debounce

### TECH-05: Accessible keyboard navigation
- All interactive elements should have `tabIndex`, `onKeyDown Enter/Space` handlers
