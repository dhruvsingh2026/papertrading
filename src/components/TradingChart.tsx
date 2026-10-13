import { useEffect, useRef } from 'react'
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import type { Candle, OhlcReadout } from '../types/market'

interface Props {
  candles: Candle[]
  onCrosshair?: (readout: OhlcReadout | null) => void
}

export function TradingChart({ candles, onCrosshair }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#8A929C',
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: '#E4E0D6' },
        horzLines: { color: '#E4E0D6' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#B8BEC6', labelBackgroundColor: '#F0B90B' },
        horzLine: { color: '#B8BEC6', labelBackgroundColor: '#F0B90B' },
      },
      rightPriceScale: {
        borderColor: '#E4E0D6',
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: '#E4E0D6',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candlesSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#2DB87A',
      downColor: '#E85D6C',
      borderUpColor: '#2DB87A',
      borderDownColor: '#E85D6C',
      wickUpColor: '#2DB87A',
      wickDownColor: '#E85D6C',
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candlesSeries
    volumeSeriesRef.current = volumeSeries

    chart.subscribeCrosshairMove((param) => {
      if (!onCrosshair) return
      if (!param.time || !param.seriesData.size) {
        onCrosshair(null)
        return
      }
      const bar = param.seriesData.get(candlesSeries) as
        | { open: number; high: number; low: number; close: number; time: UTCTimestamp }
        | undefined
      if (!bar) {
        onCrosshair(null)
        return
      }
      onCrosshair({
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        time: Number(bar.time),
      })
    })

    return () => {
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [onCrosshair])

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return

    const unique = new Map<number, Candle>()
    for (const c of candles) unique.set(c.time, c)
    const sorted = [...unique.values()].sort((a, b) => a.time - b.time)

    candleSeriesRef.current.setData(
      sorted.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    )

    volumeSeriesRef.current.setData(
      sorted.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume ?? Math.abs(c.close - c.open) * 1000,
        color: c.close >= c.open ? 'rgba(45, 184, 122, 0.35)' : 'rgba(232, 93, 108, 0.35)',
      })),
    )

    chartRef.current?.timeScale().fitContent()
  }, [candles])

  return <div className="chart-canvas" ref={containerRef} />
}
