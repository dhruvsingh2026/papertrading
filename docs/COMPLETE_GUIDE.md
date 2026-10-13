# Fairbook — Complete Application Guide

**Clear markets. Quiet desk.**

This document explains Fairbook from first principles. It assumes **zero trading knowledge**. Every feature is covered as **What → Why → How**.

---

## Table of contents

1. [What is Fairbook?](#1-what-is-fairbook)
2. [What / Why / How (the whole app)](#2-what--why--how-the-whole-app)
3. [First principles: markets for beginners](#3-first-principles-markets-for-beginners)
4. [Screen map](#4-screen-map)
5. [Feature-by-feature](#5-feature-by-feature)
6. [Paper trading deep dive](#6-paper-trading-deep-dive)
7. [Where data comes from](#7-where-data-comes-from)
8. [How money & currency work](#8-how-money--currency-work)
9. [State that survives refresh](#9-state-that-survives-refresh)
10. [User journeys](#10-user-journeys)
11. [Tech stack & how to run](#11-tech-stack--how-to-run)
12. [Mental model cheat sheet](#12-mental-model-cheat-sheet)
13. [Disclaimers](#13-disclaimers)

---

## 1. What is Fairbook?

Fairbook is a **browser-only market terminal**. On one screen you can:

- Watch **live crypto** and **stock** prices
- Study **candlestick charts** (price history over time)
- Keep a **watchlist** of favorites
- Practice **buying and selling with fake money** (paper trading)
- See a **demo payment** flow (UPI / card / net banking) that **never charges real money**

There is **no backend server** of Fairbook’s own, **no real broker**, and **no real bank connection**. Market numbers come from free public APIs. Your practice portfolio is saved in the browser (`localStorage`).

---

## 2. What / Why / How (the whole app)

### WHAT

A frontend-only desk that combines:

| Area | Purpose |
|------|---------|
| Left sidebar | Browse Crypto, Stocks, or Watch |
| Center | Chart hero + OHLC + timeframes |
| Right | Paper order ticket + demo payment |
| Top | Brand, search, ₹/USD, paper cash |
| Pulse strip | FX, crypto market size, BTC dominance, top mover, IST clock |
| Bottom | Equity, cash, open positions, recent trades |

### WHY

| Goal | Reason |
|------|--------|
| Learn markets visually | Charts + live lists teach price behavior without opening a broker account |
| Practice safely | Paper trading lets you try buy/sell logic with **no financial risk** |
| Feel like a real desk | Layout mimics a trading terminal: symbols left, chart center, ticket right |
| India-friendly | Default **₹ INR**, IST clock, demo UPI/card/netbanking UX |
| Simple to run | Pure client app — `npm run dev` is enough; no database to host |

### HOW (big picture)

```
Browser (React app)
   │
   ├─ TanStack Query     → fetches, caches, and refreshes market data
   ├─ Zustand            → selection, watchlist, paper cash / positions
   ├─ localStorage       → prefs, watchlist, paper ledger survive refresh
   │
   ├─ CoinGecko (Vite proxy)  → crypto list, global stats, OHLC fallback
   ├─ Binance public data API → crypto candles (preferred)
   ├─ Fin-node                → stock list + daily candles
   └─ Frankfurter / er-api    → USD → INR rate for display
```

**Internal rule:** API prices and the paper ledger stay in **USD**. When you choose ₹, the UI multiplies by the live USD→INR rate for display only.

---

## 3. First principles: markets for beginners

Read this section if words like “ticker”, “candle”, or “PnL” are new.

### What is a market?

A **market** is where people agree on a price to exchange something.

- **Crypto** (Bitcoin, Ethereum…): digital assets traded online; prices often move **24/7**.
- **Stocks** (Apple, NVIDIA…): ownership slices of companies; usually priced during exchange hours.

Fairbook shows both in one desk.

### What is a price?

The last agreed rate: “how much money for one unit of this asset.”

If Bitcoin is $95,000, that means 1 BTC ≈ $95,000 (before Fairbook converts to ₹ on screen).

### What does “up” vs “down” mean?

- **Green / up** — price rose vs a recent reference (often last 24 hours).
- **Red / down** — price fell.

The % next to a symbol (e.g. `+2.35%`) is that change.

### What is a symbol / ticker?

A short code for an asset:

| Symbol | Meaning |
|--------|---------|
| BTC | Bitcoin |
| ETH | Ethereum |
| AAPL | Apple stock |
| NVDA | NVIDIA stock |

### What is a chart? What is a candle?

A **chart** shows how price moved over time.

A **candlestick** is one time bucket (for example one hour). Each candle has four numbers (**OHLC**):

| Letter | Word | Meaning |
|--------|------|---------|
| **O** | Open | Price at the **start** of that period |
| **H** | High | **Highest** price in that period |
| **L** | Low | **Lowest** price in that period |
| **C** | Close | Price at the **end** of that period |

- Close ≥ Open → usually **green** (period ended higher).
- Close < Open → usually **red** (period ended lower).

The thin sticks (**wicks**) show the high/low range.

### What is volume?

How much was traded in that period. Fairbook draws volume as bars under the candles. More volume ≈ more activity.

### What is buy and sell?

- **Buy** — spend cash → receive the asset (you hold it, hoping the price rises).
- **Sell** — give back the asset → receive cash (you reduce or close a holding).

### What is paper trading?

Practice trading with **imaginary money**.

Fairbook starts you with **$100,000 virtual cash**. Trades only change numbers in your browser. **No real money moves.**

### What is a position?

What you currently hold after buys (minus sells).

Example: buy 2 BTC → you have a **position** of 2 BTC at some **average entry price**.

### What is PnL (profit and loss)?

While you still hold:

```
PnL ≈ (current price − average buy price) × quantity
```

- Positive → paper profit so far (unrealized).
- Negative → paper loss so far (unrealized).

It changes as live prices move, until you sell.

### What is equity?

```
Equity ≈ cash left + value of everything you hold at current prices
```

That is your paper account’s total worth.

### What Fairbook is *not*

- Not a real broker
- Not a real bank / UPI / card gateway
- Not financial advice
- Not a guarantee of perfect or up-to-the-second data (free APIs can be delayed or rate-limited)

---

## 4. Screen map

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Fairbook · search · ₹ INR / $ USD · paper cash      │
├─────────────────────────────────────────────────────────────┤
│ Market Pulse: FX · mkt cap · BTC dom · gainer/loser · IST   │
├────────────┬──────────────────────────────┬─────────────────┤
│ Sidebar    │ Chart (hero)                 │ Paper ticket    │
│ Crypto /   │ Symbol, price, OHLC, TFs     │ Buy / Sell      │
│ Stocks /   │ Candles + volume             │ Demo payment    │
│ Watch      │                              │                 │
├────────────┴──────────────────────────────┴─────────────────┤
│ Positions bar: equity · cash · open positions · trades      │
└─────────────────────────────────────────────────────────────┘
```

**Brand:** Fairbook — *Clear markets. Quiet desk.*  
**Look:** cream / off-white desk, ink text, muted teal accent, green up / red down. Fonts: Outfit (UI), IBM Plex Mono (prices).

---

## 5. Feature-by-feature

### 5.1 Brand & terminal shell

| | |
|--|--|
| **What** | Cream/off-white single-page terminal: brand, chart desk, ticket, positions |
| **Why** | Feels like a calm professional desk, not a flashy fintech landing page |
| **How** | React layout in `src/App.tsx` + CSS in `src/index.css`; Lucide icons |

---

### 5.2 Header — search

| | |
|--|--|
| **What** | Search box: “Search BTC, RELIANCE, AAPL…” |
| **Why** | Find a symbol quickly among dozens of rows |
| **How** | `query` state in `App` is passed to `Sidebar`, which filters by **symbol**, **name**, or **id** (case-insensitive). Component: `src/components/Header.tsx` |

---

### 5.3 Header — currency toggle (₹ INR / $ USD)

| | |
|--|--|
| **What** | Switch all displayed money between rupees and dollars |
| **Why** | Most market APIs quote in USD; many users think in INR |
| **How** | Preference stored in Zustand + `localStorage` (`fairbook-prefs`). Hook `useMoney` loads USD→INR and formats with `en-IN` / `en-US`. **Paper ledger stays USD internally**; only labels change |

---

### 5.4 Header — paper wallet cash

| | |
|--|--|
| **What** | Remaining virtual cash |
| **Why** | Instant sense of buying power |
| **How** | Reads `usePaperStore.cash` (starts at **$100,000**), formats via `money()` |

---

### 5.5 Market Pulse strip

Component: `src/components/MarketPulse.tsx`

| Item | What | Why | How |
|------|------|-----|-----|
| **USD → INR** | Live FX rate | Context for ₹ prices | Frankfurter → open.er-api → fallback `83.5` |
| **Crypto mkt cap** | Total crypto market size + 24h % | “How big / hot is crypto today?” | CoinGecko `/global` |
| **BTC dominance** | Bitcoin’s % of the crypto market | High ≈ BTC leading; lower ≈ alts relatively larger | Same global feed |
| **Top gainer** | Best 24h % among loaded crypto | Spot momentum | Sort crypto list; **click** opens that coin |
| **Top loser** | Worst 24h % | Spot weakness | Same; click to select |
| **India (IST)** | Clock in Asia/Kolkata | Local time context | Updates every 30s; hint shows ₹ or $ mode |

---

### 5.6 Sidebar — Crypto / Stocks / Watch

Component: `src/components/Sidebar.tsx`

| | |
|--|--|
| **What** | Three tabs of market rows: ticker, name, price, % change |
| **Why** | Separate asset classes; Watch is your personal short list |
| **How** | Tab lives in `useSelectionStore`. **Crypto:** ~top 40 by market cap (CoinGecko, refresh ~60s). **Stocks:** up to ~24 from Fin-node (priority names like AAPL, NVDA first). **Watch:** only starred ids |

Click a row → chart + ticket follow that asset (`setSelection`). Selecting a **stock** forces timeframe to **1D** (stock history is daily).

---

### 5.7 Watchlist (star)

| | |
|--|--|
| **What** | Star any symbol to pin it under **Watch** |
| **Why** | Focus on assets you care about |
| **How** | `useWatchlistStore` persisted as `fairbook-watchlist`. Defaults: `bitcoin`, `ethereum`, `AAPL`, `NVDA`. Star click does **not** change the chart selection |

---

### 5.8 Chart identity toolbar

| | |
|--|--|
| **What** | Symbol, asset-class pill, currency pill, last price, 24h % |
| **Why** | Know what you are looking at without scanning the sidebar |
| **How** | Built from selection store + current `MarketSymbol` from the loaded lists |

---

### 5.9 Timeframes (1H, 4H, 1D, 1W, 1M)

| | |
|--|--|
| **What** | Zoom of history: shorter = more recent detail; longer = bigger picture |
| **Why** | The same asset looks different on different time scales |
| **How** | Crypto maps to Binance intervals (e.g. 1H → 1m bars, 1D → 1h bars) or CoinGecko OHLC by days. **Stocks:** only **1D** is enabled (Fin-node daily candles) |

Rough meaning:

| Timeframe | Idea |
|-----------|------|
| **1H** | Last ~hour, fine grain |
| **4H** | Last several hours |
| **1D** | Days of history (crypto hourly-style / stocks daily) |
| **1W** | About a week of coarser bars |
| **1M** | About a month of daily-style bars |

---

### 5.10 OHLC readout

| | |
|--|--|
| **What** | O / H / L / C numbers above the chart |
| **Why** | Exact candle values, not only eyeballing shapes |
| **How** | Default = latest candle. Moving the **crosshair** updates from that candle. Shown in the active currency |

---

### 5.11 Trading chart (candles + volume)

Component: `src/components/TradingChart.tsx`

| | |
|--|--|
| **What** | Interactive chart: green/red candles, volume histogram, crosshair, right price scale |
| **Why** | Core tool for reading how price moved |
| **How** | `lightweight-charts` v5. Crypto: Binance klines first, CoinGecko OHLC fallback. Stocks: Fin-node daily OHLC. In INR mode, candle prices are converted for display |

Colors: up `#1F7A4C`, down `#B42318` (from the Fairbook palette).

---

### 5.12 Paper ticket (order panel)

Component: `src/components/OrderTicket.tsx`

| Control | What | Why |
|---------|------|-----|
| **Buy / Sell** | Side of the practice trade | Declare intent |
| **Symbol** | Selected ticker | Confirm what you trade |
| **Price** | Current market price (display currency) | Market-style fill at “last” price |
| **Quantity** | How many units | Size of the trade |
| **Est. total** | qty × price | Cost (buy) or proceeds (sell) |
| **Cash** | Remaining virtual cash | Affordability check |
| **Position** | How much you already hold | Needed for sells |
| **Pay & buy / Cash out & sell** | Opens demo payment | Mimics real checkout |
| **Reset** | Wipe paper account to $100k | Fresh start |

**Validation before payment:**

- Need a live price
- Quantity must be finite and > 0
- **Buy:** estimated total ≤ cash
- **Sell:** you must hold enough of that symbol

---

### 5.13 Demo payment modal

Component: `src/components/PaymentDemo.tsx`

| | |
|--|--|
| **What** | Fake UPI / Card / Net banking sheet with badge **DEMO ONLY · no real money** |
| **Why** | Teach the *feel* of paying without charging anyone |
| **How** | Choose method → optional fake fields → “processing” (~1.4s) → success → paper fill runs. Escape closes (except while processing). **No real payment gateway is ever called** |

Methods:

1. **UPI** — editable demo UPI id (default `fairbook@demo`)
2. **Card** — read-only demo card numbers
3. **Net banking** — demo Indian banks dropdown

---

### 5.14 Positions bar (footer)

Component: `src/components/PositionsBar.tsx`

| | |
|--|--|
| **What** | Equity, cash, open position count; chips for each holding (qty @ avg, PnL); recent trade chips |
| **Why** | Portfolio dashboard after you trade |
| **How** | Equity = cash + Σ(qty × live mark). PnL uses live price vs average entry. Shows up to **6** recent trades |

---

### 5.15 Live refresh & errors

| Feed | Behavior |
|------|----------|
| Crypto markets | Refetch ~every **60s** |
| Crypto global | ~every **120s** |
| FX (USD→INR) | ~every **30 minutes** |
| Candles | Cached ~**60s**; retries on failure |
| Rate limits / outages | Banner: feeds slow; will retry automatically |

---

## 6. Paper trading deep dive

Store: `usePaperStore` in `src/store/appStore.ts`  
Persistence key: `fairbook-paper`

### Starting account

- Cash: **$100,000**
- Positions: none
- Trades: none

### Buy (after demo payment succeeds)

1. Cost = `qty × price`
2. If cost > cash → error `Insufficient cash`
3. Cash decreases by cost
4. If you already hold the symbol → **average price** updates:

   ```
   newAvg = (oldAvg × oldQty + cost) / (oldQty + qty)
   ```

5. Trade is logged (`buy`, symbol, qty, price, timestamp)
6. Last **50** trades are kept

### Sell (after demo payout succeeds)

1. You must already have a position
2. Cannot sell more than you hold
3. Cash increases by `qty × price`
4. Position quantity decreases; if ~0, position is removed
5. Trade is logged as `sell`

### Reset

Sets cash back to $100,000 and clears positions and trades.

### Important

Paper fills use the **current displayed market price** at submit time (market-style simulation). There are no limit orders, stop losses, fees, or slippage models in this app.

---

## 7. Where data comes from

| Asset | Source | Role |
|-------|--------|------|
| Crypto list & live prices | CoinGecko via Vite proxy `/api/coingecko` | Markets, search, polling |
| Crypto candles | Binance `data-api.binance.vision` | Primary OHLC + volume |
| Crypto candles fallback | CoinGecko OHLC | If Binance fails / coin unmapped |
| Crypto global | CoinGecko `/global` | Market cap, BTC dominance |
| Stocks | Fin-node (`fin-node.net`) | Universe + daily history |
| FX | Frankfurter → open.er-api → 83.5 | USD→INR display |

### Why a Vite proxy for CoinGecko?

Browsers can hit **CORS** or rate-limit issues calling CoinGecko directly. In development, Vite rewrites:

```
/api/coingecko/*  →  https://api.coingecko.com/api/v3/*
```

Configured in `vite.config.ts`.

### Code map

| File | Responsibility |
|------|----------------|
| `src/api/coingecko.ts` | Crypto markets, global, OHLC fallback |
| `src/api/binance.ts` | Crypto klines (candles) |
| `src/api/finnode.ts` | Stock universe + candles |
| `src/api/fx.ts` | USD→INR rate |
| `src/types/market.ts` | Shared types (`MarketSymbol`, `Candle`, …) |

---

## 8. How money & currency work

1. APIs return prices in **USD**.
2. Paper cash / avg prices / trade prices are stored in **USD**.
3. `useMoney` (`src/hooks/useMoney.ts`) loads FX and exposes:
   - `money(usd)` — formatted string in ₹ or $
   - `convert(usd)` — numeric display value
   - `compact(usd)` — compact notation for huge numbers (e.g. market cap)
4. Chart candles are converted when currency is INR so the axis matches the toggle.
5. Formatting helpers live in `src/lib/format.ts` (`en-IN` for INR, `en-US` for USD).

Default display currency: **INR**.

---

## 9. State that survives refresh

| Store | Storage key | Contents |
|-------|-------------|----------|
| Prefs | `fairbook-prefs` | INR vs USD |
| Watchlist | `fairbook-watchlist` | Starred symbol ids |
| Paper | `fairbook-paper` | Cash, positions, trades |

**In-memory only** (resets on full reload toward defaults such as Bitcoin / crypto / 1D):

- Selected symbol
- Asset class
- Timeframe
- Sidebar tab

Clearing site data / localStorage wipes practice account and preferences.

---

## 10. User journeys

### A. Explore a crypto chart

1. Open Fairbook (default often Bitcoin).
2. Sidebar → **Crypto** → pick another coin (e.g. ETH).
3. Change timeframe (1H … 1M).
4. Move the mouse on the chart → OHLC updates.
5. Toggle ₹ / $ → prices and candles re-label.

### B. Build a watchlist

1. Star BTC, ETH, AAPL, …
2. Open **Watch** → only favorites.

### C. Paper buy then sell

1. Select a symbol with a live price.
2. Ticket → **Buy**, set quantity.
3. **Pay & buy** → choose demo UPI / card / bank → confirm.
4. Cash drops; position appears in the footer; equity updates.
5. Later **Sell** → demo payout → cash returns; position shrinks or closes.

### D. Reset practice account

1. Ticket header → reset (rotate) icon.
2. Back to $100,000, empty positions and trades.

---

## 11. Tech stack & how to run

| Piece | Role |
|-------|------|
| Vite + React 19 + TypeScript | App shell |
| TanStack Query | Fetch, cache, refetch |
| Zustand + persist | Client state |
| lightweight-charts | Candles + volume |
| Lucide | Icons |

### Commands

```bash
npm install
npm run dev      # local terminal (http://localhost:5173 by default)
npm run build    # production build
npm run preview  # preview production build
```

### Main source layout

```
src/
  App.tsx                 # Workspace composition
  main.tsx                # React + QueryClient bootstrap
  components/
    Header.tsx
    MarketPulse.tsx
    Sidebar.tsx
    TradingChart.tsx
    OrderTicket.tsx
    PaymentDemo.tsx
    PositionsBar.tsx
  api/                    # Market & FX clients
  store/appStore.ts       # Prefs, selection, watchlist, paper
  hooks/useMoney.ts
  lib/format.ts
  types/market.ts
```

---

## 12. Mental model cheat sheet

| Fairbook term | Plain English |
|---------------|---------------|
| Market terminal | One screen for prices + chart + practice orders |
| Paper cash | Fake money to practice |
| Ticket | Form to place a practice trade |
| Fill | Trade accepted; books updated |
| Mark / live price | Latest price used to value holdings |
| Avg price | Blended cost of your buys |
| Equity | Cash + holdings value |
| Watchlist | Your starred symbols |
| Timeframe | How zoomed-in the chart history is |
| Dominance | Bitcoin’s share of the crypto market |
| Demo payment | Fake checkout; never charges you |
| OHLC | Open, High, Low, Close for one candle |
| Asset class | Crypto vs stock |

---

## 13. Disclaimers

1. **Paper trading only** — Fairbook never routes real orders to a broker or exchange.
2. **Not financial advice** — for learning and UI practice only.
3. **Demo payment** — the badge “DEMO ONLY · no real money” is accurate; nothing hits your bank or UPI.
4. **Data quality** — free public APIs may be delayed, incomplete, or rate-limited.
5. **Frontend-only** — clearing browser storage resets paper account, watchlist, and currency preference.
6. **Attribution** — stock data comes from Fin-node when shown; respect third-party terms of use.

---

*Document version aligned with the Fairbook frontend in this repository. For day-to-day product conventions when building features, see also `.cursor/skills/fairbook/SKILL.md`.*
