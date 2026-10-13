---
name: fairbook
description: >-
  Build and extend Fairbook, a frontend-only cream/off-white market terminal
  with live crypto/stock updates, TradingView-style charts, watchlists, and
  paper trading. Use when working on Fairbook UI, market APIs, charts, or local state.
---

# Fairbook

Frontend-only paper trading app. No backend. Never real order routing.

## Brand & UX

- Name: **Fairbook**
- UX model: **responsive** — mobile cards &lt;650px; desktop trading layout ≥650px
- Mobile tabs: Markets · Trade · Wallet · Activity · Profile
- Desktop nav: Dashboard · Trading · Market · Portfolio (+ Activity / Profile top-right)
- Palette: cream `#F7F4EF`, white `#FFFFFF`, yellow `#F0B90B`, grey text `#5C6570` — **no black**
- Soft green/red only for price up/down

## App shell

- `Terminal` — `useIsDesktop()` switches `mob-shell` vs `desk-shell`
- Mobile: `AppBottomNav` + screen stack + `AssetDetail` overlay
- Desktop: `DesktopTopNav` + `DesktopTradingView` (chart + yellow `DesktopTradePanel`)
- `WalletScreen` · `MarketsScreen` · `TradeScreen` · `ActivityScreen` · `ProfileScreen`
- `TradeSheet` + `PaymentDemo` — qty then demo UPI/card

## APIs (browser, free)

| Asset | Source | Use |
|-------|--------|-----|
| Crypto list | CoinGecko via `/api/coingecko` | Explore |
| Crypto OHLC | Binance `data-api.binance.vision` | Chart |
| Stocks | Fin-node | Explore + daily candles |
| FX USD→INR | Frankfurter | Display |

Default currency **INR**. Paper ledger USD internally; UI converts.
Auth local (`fairbook-auth`). Wallet per user; starts at 0 — Add money first.

## Commands

```bash
npm run dev
npm run build
```
