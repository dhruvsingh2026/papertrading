import type { Candle, Timeframe } from '../types/market'

/** Public market-data host — better browser CORS than api.binance.com in many regions */
const BASE = 'https://data-api.binance.vision/api/v3'

const COIN_TO_PAIR: Record<string, string> = {
  bitcoin: 'BTCUSDT',
  ethereum: 'ETHUSDT',
  binancecoin: 'BNBUSDT',
  solana: 'SOLUSDT',
  ripple: 'XRPUSDT',
  cardano: 'ADAUSDT',
  dogecoin: 'DOGEUSDT',
  tron: 'TRXUSDT',
  'avalanche-2': 'AVAXUSDT',
  'matic-network': 'MATICUSDT',
  polkadot: 'DOTUSDT',
  chainlink: 'LINKUSDT',
  litecoin: 'LTCUSDT',
  'shiba-inu': 'SHIBUSDT',
  uniswap: 'UNIUSDT',
  cosmos: 'ATOMUSDT',
  stellar: 'XLMUSDT',
  near: 'NEARUSDT',
  aptos: 'APTUSDT',
  arbitrum: 'ARBUSDT',
  optimism: 'OPUSDT',
  'internet-computer': 'ICPUSDT',
  filecoin: 'FILUSDT',
  aave: 'AAVEUSDT',
  maker: 'MKRUSDT',
  'render-token': 'RENDERUSDT',
  injective: 'INJUSDT',
  sui: 'SUIUSDT',
  pepe: 'PEPEUSDT',
  toncoin: 'TONUSDT',
  'the-open-network': 'TONUSDT',
  hyperliquid: 'HYPEUSDT',
  'usd-coin': 'USDCUSDT',
}

const TIMEFRAME_INTERVAL: Record<Timeframe, string> = {
  '1H': '1m',
  '4H': '5m',
  '1D': '1h',
  '1W': '4h',
  '1M': '1d',
}

const TIMEFRAME_LIMIT: Record<Timeframe, number> = {
  '1H': 60,
  '4H': 48,
  '1D': 168,
  '1W': 168,
  '1M': 180,
}

export function binancePairForCoin(coinId: string, symbol?: string): string | null {
  if (COIN_TO_PAIR[coinId]) return COIN_TO_PAIR[coinId]
  if (symbol) {
    const pair = `${symbol.toUpperCase()}USDT`
    return pair
  }
  return null
}

export async function fetchBinanceKlines(
  pair: string,
  timeframe: Timeframe,
): Promise<Candle[]> {
  const interval = TIMEFRAME_INTERVAL[timeframe]
  const limit = TIMEFRAME_LIMIT[timeframe]
  const url = `${BASE}/klines?symbol=${encodeURIComponent(pair)}&interval=${interval}&limit=${limit}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Binance klines failed (${res.status}) for ${pair}`)
  }

  const rows = (await res.json()) as Array<
    [number, string, string, string, string, string, ...unknown[]]
  >

  return rows.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
  }))
}

export async function fetchBinanceTickers(): Promise<
  Array<{ symbol: string; lastPrice: string; priceChangePercent: string; volume: string }>
> {
  const res = await fetch(`${BASE}/ticker/24hr`)
  if (!res.ok) throw new Error(`Binance tickers failed (${res.status})`)
  return (await res.json()) as Array<{
    symbol: string
    lastPrice: string
    priceChangePercent: string
    volume: string
  }>
}
