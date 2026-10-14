import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownLeft, ArrowUpRight, Star } from 'lucide-react'
import { fetchCryptoOhlc } from '../api/coingecko'
import { fetchStockCandles } from '../api/finnode'
import { formatCompact, formatPct } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, useWatchlistStore } from '../store/appStore'
import type { Candle, MarketSymbol, OhlcReadout, Timeframe } from '../types/market'
import { DesktopTradePanel } from './DesktopTradePanel'
import { TradingChart } from './TradingChart'

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W', '1M']

interface Props {
  current?: MarketSymbol
  symbols: MarketSymbol[]
}

export function DesktopTradingView({ current, symbols }: Props) {
  const [ohlc, setOhlc] = useState<OhlcReadout | null>(null)
  const selectedId = useSelectionStore((s) => s.selectedId)
  const selectedSymbol = useSelectionStore((s) => s.selectedSymbol)
  const assetClass = useSelectionStore((s) => s.assetClass)
  const timeframe = useSelectionStore((s) => s.timeframe)
  const setTimeframe = useSelectionStore((s) => s.setTimeframe)
  const watchIds = useWatchlistStore((s) => s.ids)
  const toggle = useWatchlistStore((s) => s.toggle)
  const { money, currency, convert, compact } = useMoney()

  const candlesQuery = useQuery({
    queryKey: ['candles', assetClass, selectedId, selectedSymbol, timeframe, current?.price],
    queryFn: async () => {
      if (selectedId.startsWith('custom-') && current) {
        const now = Math.floor(Date.now() / 1000)
        const base = current.price
        return Array.from({ length: 45 }, (_, i) => {
          const t = now - (44 - i) * 3600
          const wobble = 1 + Math.sin(i / 3) * 0.015
          const close = base * wobble
          const open = base * (1 + Math.cos(i / 4) * 0.01)
          return {
            time: t,
            open,
            high: Math.max(open, close) * 1.005,
            low: Math.min(open, close) * 0.995,
            close,
            volume: 1200 + i * 20,
          }
        })
      }
      if (assetClass === 'crypto') {
        return fetchCryptoOhlc(selectedId, timeframe, selectedSymbol)
      }
      return fetchStockCandles(selectedId)
    },
    staleTime: 60_000,
    retry: 2,
  })

  const displayCandles: Candle[] = useMemo(() => {
    const rows = candlesQuery.data ?? []
    if (currency === 'USD') return rows
    return rows.map((c) => ({
      ...c,
      open: convert(c.open),
      high: convert(c.high),
      low: convert(c.low),
      close: convert(c.close),
    }))
  }, [candlesQuery.data, currency, convert])

  const onCrosshair = useCallback((value: OhlcReadout | null) => setOhlc(value), [])
  const last = displayCandles.at(-1)
  const readout =
    ohlc ??
    (last
      ? { open: last.open, high: last.high, low: last.low, close: last.close, time: last.time }
      : null)

  const fmt = (v: number) =>
    v.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    })

  const changePct = current?.changePct24h ?? 0
  const changeAbs = current?.change24h ?? 0
  const up = changePct >= 0
  const watched = current ? watchIds.includes(current.id) : false

  return (
    <div className="desk-trading">
      {/* Chart Pane Left */}
      <section className="desk-chart-pane">
        {/* Asset Header */}
        <div className="desk-asset-head">
          <div className="desk-asset-id">
            <div className="desk-avatar-img">
              {current?.image ? (
                <img src={current.image} alt={current.symbol} />
              ) : (
                (current?.symbol ?? '??').slice(0, 2)
              )}
            </div>
            <div className="desk-asset-title">
              <b>{current?.name ?? selectedSymbol}</b>
              <small>
                {selectedSymbol} · <span style={{ textTransform: 'capitalize' }}>{current?.assetClass ?? assetClass}</span>
              </small>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={() => current && toggle(current.id)}
            aria-label={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
            title={watched ? 'Starred in Watchlist' : 'Add to Watchlist'}
            style={{ color: watched ? 'var(--accent)' : 'var(--muted)' }}
          >
            <Star size={18} fill={watched ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Live Price Display & 24h Movement */}
        <div className="desk-price-block">
          <strong className="mono">{money(current?.price ?? 0)}</strong>
          <span className={`change-pill ${up ? 'up' : 'down'} mono`}>
            {up ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
            {money(Math.abs(changeAbs))} ({formatPct(changePct)}) 24h
          </span>
        </div>

        {/* Timeframe Controls */}
        <div className="desk-tf-row">
          <div className="tf-group" role="tablist" aria-label="Chart timeframes">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                className={timeframe === tf ? 'active' : ''}
                onClick={() => setTimeframe(tf)}
                disabled={assetClass === 'stock' && tf !== '1D'}
                title={assetClass === 'stock' && tf !== '1D' ? 'Stocks feed provides daily interval' : `View ${tf} interval`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--secondary)' }}>
            <span>O: <strong className="mono">{readout ? fmt(readout.open) : '—'}</strong></span>
            <span>H: <strong className="mono">{readout ? fmt(readout.high) : '—'}</strong></span>
            <span>L: <strong className="mono">{readout ? fmt(readout.low) : '—'}</strong></span>
            <span>C: <strong className="mono">{readout ? fmt(readout.close) : '—'}</strong></span>
          </div>
        </div>

        {/* Candlestick & Volume Chart */}
        <div className="desk-chart">
          {candlesQuery.isLoading && <div className="chart-status">Loading market candlesticks…</div>}
          {candlesQuery.isError && (
            <div className="chart-status" style={{ color: 'var(--down)' }}>
              Primary feed delayed. Retrying live connection…
            </div>
          )}
          {displayCandles.length > 0 && (
            <TradingChart
              key={`${selectedId}-${currency}-${timeframe}-desk`}
              candles={displayCandles}
              onCrosshair={onCrosshair}
            />
          )}
        </div>

        {/* Additional Market Statistics */}
        <div className="desk-stats-row">
          <div>
            <span>Market Capitalization</span>
            <b className="mono">{current?.marketCap ? compact(current.marketCap) : '—'}</b>
          </div>
          <div>
            <span>24h Trading Volume</span>
            <b className="mono">
              {current?.volume ? formatCompact(current.volume, currency) : '—'}
            </b>
          </div>
          <div>
            <span>Interval High</span>
            <b className="mono">{readout ? fmt(readout.high) : '—'}</b>
          </div>
          <div>
            <span>Interval Low</span>
            <b className="mono">{readout ? fmt(readout.low) : '—'}</b>
          </div>
        </div>
      </section>

      {/* Order Panel Right */}
      <DesktopTradePanel current={current} symbols={symbols} />
    </div>
  )
}
