import type { Candle, MarketSymbol, Timeframe } from '../types/market'
import { binancePairForCoin, fetchBinanceKlines } from './binance'

/**
 * Prefer same-origin Vite proxy in browser to avoid CoinGecko CORS/429 stripping headers.
 * Falls back to direct URL (SSR/tools) when not in a browser.
 */
function geckoBase(): string {
  if (typeof window !== 'undefined') return '/api/coingecko'
  return 'https://api.coingecko.com/api/v3'
}

const TIMEFRAME_DAYS: Record<Timeframe, string> = {
  '1H': '1',
  '4H': '1',
  '1D': '30',
  '1W': '90',
  '1M': '180',
}

async function geckoFetch(path: string): Promise<Response> {
  const url = `${geckoBase()}${path.startsWith('/') ? path : `/${path}`}`
  return fetch(url, {
    headers: { Accept: 'application/json' },
  })
}

export async function fetchCryptoMarkets(perPage = 40): Promise<MarketSymbol[]> {
  const qs = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: '1',
    sparkline: 'false',
    price_change_percentage: '24h',
  })

  const res = await geckoFetch(`/coins/markets?${qs}`)
  if (!res.ok) {
    throw new Error(`CoinGecko markets failed (${res.status})`)
  }

  const data = (await res.json()) as Array<{
    id: string
    symbol: string
    name: string
    image: string
    current_price: number
    price_change_24h: number
    price_change_percentage_24h: number
    total_volume: number
    market_cap: number
  }>

  return data.map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    assetClass: 'crypto' as const,
    price: c.current_price ?? 0,
    change24h: c.price_change_24h ?? 0,
    changePct24h: c.price_change_percentage_24h ?? 0,
    volume: c.total_volume,
    marketCap: c.market_cap,
    image: c.image,
  }))
}

export async function fetchCryptoOhlcFromGecko(
  coinId: string,
  timeframe: Timeframe,
): Promise<Candle[]> {
  const days = TIMEFRAME_DAYS[timeframe]
  const res = await geckoFetch(
    `/coins/${encodeURIComponent(coinId)}/ohlc?vs_currency=usd&days=${days}`,
  )
  if (!res.ok) {
    throw new Error(`CoinGecko OHLC failed (${res.status})`)
  }
  const rows = (await res.json()) as number[][]
  return rows.map(([timeMs, open, high, low, close]) => ({
    time: Math.floor(timeMs / 1000),
    open,
    high,
    low,
    close,
  }))
}

/** Prefer Binance klines (reliable in-browser); fall back to CoinGecko via proxy. */
export async function fetchCryptoOhlc(
  coinId: string,
  timeframe: Timeframe,
  symbol?: string,
): Promise<Candle[]> {
  const pair = binancePairForCoin(coinId, symbol)
  if (pair) {
    try {
      return await fetchBinanceKlines(pair, timeframe)
    } catch {
      // fall through to CoinGecko
    }
  }
  return fetchCryptoOhlcFromGecko(coinId, timeframe)
}

export interface CryptoGlobal {
  totalMarketCapUsd: number
  totalVolumeUsd: number
  btcDominance: number
  marketCapChange24h: number
}

export async function fetchCryptoGlobal(): Promise<CryptoGlobal> {
  const res = await geckoFetch('/global')
  if (!res.ok) throw new Error(`CoinGecko global failed (${res.status})`)
  const json = (await res.json()) as {
    data: {
      total_market_cap: { usd: number }
      total_volume: { usd: number }
      market_cap_percentage: { btc: number }
      market_cap_change_percentage_24h_usd: number
    }
  }
  const d = json.data
  return {
    totalMarketCapUsd: d.total_market_cap.usd,
    totalVolumeUsd: d.total_volume.usd,
    btcDominance: d.market_cap_percentage.btc,
    marketCapChange24h: d.market_cap_change_percentage_24h_usd,
  }
}

