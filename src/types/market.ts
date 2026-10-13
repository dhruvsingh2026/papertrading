export type AssetClass = 'crypto' | 'stock'

export type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M'

export interface MarketSymbol {
  id: string
  symbol: string
  name: string
  assetClass: AssetClass
  price: number
  change24h: number
  changePct24h: number
  volume?: number
  marketCap?: number
  image?: string
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface OhlcReadout {
  open: number
  high: number
  low: number
  close: number
  time: number
}
