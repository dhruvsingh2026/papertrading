import type { Candle, MarketSymbol } from '../types/market'

const BASE = 'https://www.fin-node.net/api'

interface FinNodeIndex {
  tickers: string[]
}

interface FinNodePrice {
  Date: string
  Open: number
  High: number
  Low: number
  Close: number
  Volume: number
}

interface FinNodeBundle {
  prices: FinNodePrice[]
  fundamentals?: Record<string, number | string | null>
  news?: Array<{ date: string; headline: string; url: string }>
}

const STOCK_NAMES: Record<string, string> = {
  NVDA: 'NVIDIA',
  AAPL: 'Apple',
  GOOGL: 'Alphabet',
  MSFT: 'Microsoft',
  META: 'Meta Platforms',
  TSLA: 'Tesla',
  AMZN: 'Amazon',
  TSM: 'TSMC',
  JPM: 'JPMorgan',
  NFLX: 'Netflix',
  AMD: 'AMD',
  AVGO: 'Broadcom',
  INTC: 'Intel',
  DIS: 'Disney',
  IBM: 'IBM',
  BAC: 'Bank of America',
  GS: 'Goldman Sachs',
  PYPL: 'PayPal',
  BABA: 'Alibaba',
  MU: 'Micron',
}

export async function fetchStockUniverse(): Promise<MarketSymbol[]> {
  const res = await fetch(`${BASE}/index.json`)
  if (!res.ok) throw new Error(`Fin-node index failed (${res.status})`)
  const index = (await res.json()) as FinNodeIndex

  const priority = [
    'AAPL',
    'NVDA',
    'MSFT',
    'GOOGL',
    'AMZN',
    'META',
    'TSLA',
    'AMD',
    'JPM',
    'NFLX',
  ]
  const ordered = [
    ...priority.filter((t) => index.tickers.includes(t)),
    ...index.tickers.filter((t) => !priority.includes(t)),
  ].slice(0, 24)

  const bundles = await Promise.all(
    ordered.map(async (ticker): Promise<MarketSymbol | null> => {
      try {
        const bundle = await fetchStockBundle(ticker)
        const last = bundle.prices.at(-1)
        const prev = bundle.prices.at(-2)
        if (!last) return null
        const change24h = prev ? last.Close - prev.Close : 0
        const changePct24h = prev && prev.Close ? (change24h / prev.Close) * 100 : 0
        return {
          id: ticker,
          symbol: ticker,
          name: STOCK_NAMES[ticker] ?? ticker,
          assetClass: 'stock',
          price: last.Close,
          change24h,
          changePct24h,
          volume: last.Volume,
        }
      } catch {
        return null
      }
    }),
  )

  return bundles.filter((s): s is MarketSymbol => s !== null)
}

export async function fetchStockBundle(ticker: string): Promise<FinNodeBundle> {
  const res = await fetch(`${BASE}/${encodeURIComponent(ticker)}.json`)
  if (!res.ok) throw new Error(`Fin-node ${ticker} failed (${res.status})`)
  return (await res.json()) as FinNodeBundle
}

export async function fetchStockCandles(ticker: string): Promise<Candle[]> {
  const bundle = await fetchStockBundle(ticker)
  return bundle.prices.map((p) => ({
    time: Math.floor(new Date(p.Date).getTime() / 1000),
    open: p.Open,
    high: p.High,
    low: p.Low,
    close: p.Close,
    volume: p.Volume,
  }))
}

export async function fetchMarketNews() {
  const res = await fetch(`${BASE}/news.json`)
  if (!res.ok) return []
  const data = (await res.json()) as
    | Array<{ date: string; headline: string; url: string; tickers?: string[] }>
    | { news?: Array<{ date: string; headline: string; url: string }> }
  if (Array.isArray(data)) return data.slice(0, 8)
  return (data.news ?? []).slice(0, 8)
}
