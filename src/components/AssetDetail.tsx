import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star } from 'lucide-react'
import { fetchCryptoOhlc } from '../api/coingecko'
import { fetchStockCandles } from '../api/finnode'
import { formatCompact, formatPct } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, useWatchlistStore } from '../store/appStore'
import type { Candle, MarketSymbol, OhlcReadout, Timeframe } from '../types/market'
import { TradingChart } from './TradingChart'
import { TradeSheet } from './TradeSheet'

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W', '1M']

interface Props {
  current?: MarketSymbol
}

export function AssetDetail({ current }: Props) {
  const [ohlc, setOhlc] = useState<OhlcReadout | null>(null)
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell' | null>(null)
  const selectedId = useSelectionStore((s) => s.selectedId)
  const selectedSymbol = useSelectionStore((s) => s.selectedSymbol)
  const assetClass = useSelectionStore((s) => s.assetClass)
  const timeframe = useSelectionStore((s) => s.timeframe)
  const setTimeframe = useSelectionStore((s) => s.setTimeframe)
  const setDetailOpen = useSelectionStore((s) => s.setDetailOpen)
  const setTab = useSelectionStore((s) => s.setTab)
  const watchIds = useWatchlistStore((s) => s.ids)
  const toggle = useWatchlistStore((s) => s.toggle)
  const { money, currency, convert, compact } = useMoney()

  const candlesQuery = useQuery({
    queryKey: ['candles', assetClass, selectedId, selectedSymbol, timeframe, current?.price],
    queryFn: async () => {
      if (selectedId.startsWith('custom-') && current) {
        const now = Math.floor(Date.now() / 1000)
        const base = current.price
        return Array.from({ length: 40 }, (_, i) => {
          const t = now - (39 - i) * 3600
          const wobble = 1 + Math.sin(i / 3) * 0.01
          const close = base * wobble
          const open = base * (1 + Math.cos(i / 4) * 0.008)
          return {
            time: t,
            open,
            high: Math.max(open, close) * 1.004,
            low: Math.min(open, close) * 0.996,
            close,
            volume: 1000 + i * 10,
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
  const display =
    ohlc ??
    (last
      ? {
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
          time: last.time,
        }
      : null)

  const changePct = current?.changePct24h ?? 0
  const up = changePct >= 0
  const watched = current ? watchIds.includes(current.id) : false

  return (
    <section className="mob-detail">
      <div className="mob-detail-bar">
        <button
          type="button"
          className="mob-icon-btn"
          aria-label="Back"
          onClick={() => setDetailOpen(false)}
        >
          <ArrowLeft size={18} />
        </button>
        <h1>{current?.name ?? selectedSymbol}</h1>
        <button
          type="button"
          className={watched ? 'mob-star on' : 'mob-star'}
          onClick={() => current && toggle(current.id)}
        >
          <Star size={18} fill={watched ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mob-detail-price">
        <small>
          {selectedSymbol}/{currency}
        </small>
        <strong className="mono">{money(current?.price ?? 0)}</strong>
        <span className={up ? 'mob-change up' : 'mob-change down'}>
          {formatPct(changePct)} today
        </span>
      </div>

      <div className="tf-group gw-tf">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            className={timeframe === tf ? 'tf active' : 'tf'}
            onClick={() => setTimeframe(tf)}
            disabled={assetClass === 'stock' && tf !== '1D'}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="mob-chart">
        {candlesQuery.isLoading && <div className="chart-status">Loading chart…</div>}
        {candlesQuery.isError && <div className="chart-status error">Chart unavailable</div>}
        {displayCandles.length > 0 && (
          <TradingChart
            key={`${selectedId}-${currency}-${timeframe}`}
            candles={displayCandles}
            onCrosshair={onCrosshair}
          />
        )}
      </div>

      <div className="mob-stats">
        <div>
          <span>Open</span>
          <b className="mono">
            {display
              ? display.open.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                })
              : '—'}
          </b>
        </div>
        <div>
          <span>High</span>
          <b className="mono">
            {display
              ? display.high.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                })
              : '—'}
          </b>
        </div>
        <div>
          <span>Low</span>
          <b className="mono">
            {display
              ? display.low.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                })
              : '—'}
          </b>
        </div>
        <div>
          <span>Close</span>
          <b className="mono">
            {display
              ? display.close.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                })
              : '—'}
          </b>
        </div>
        <div>
          <span>Market cap</span>
          <b className="mono">{current?.marketCap ? compact(current.marketCap) : '—'}</b>
        </div>
        <div>
          <span>24h volume</span>
          <b className="mono">{current?.volume ? formatCompact(current.volume, currency) : '—'}</b>
        </div>
      </div>

      <div className="mob-detail-actions">
        <button type="button" className="btn ghost large" onClick={() => setTradeSide('sell')}>
          Sell
        </button>
        <button
          type="button"
          className="btn primary large"
          onClick={() => {
            setDetailOpen(false)
            setTab('trade')
          }}
        >
          Buy
        </button>
      </div>

      <TradeSheet
        open={tradeSide !== null}
        side={tradeSide ?? 'buy'}
        current={current}
        onClose={() => setTradeSide(null)}
      />
    </section>
  )
}
