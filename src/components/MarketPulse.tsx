import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowUpRight, Clock3, IndianRupee, TrendingUp } from 'lucide-react'
import { fetchCryptoGlobal } from '../api/coingecko'
import { useMoney } from '../hooks/useMoney'
import { formatFxRate, formatPct } from '../lib/format'
import type { MarketSymbol } from '../types/market'
import { useSelectionStore } from '../store/appStore'

interface Props {
  crypto: MarketSymbol[]
}

function useIstClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function MarketPulse({ crypto }: Props) {
  const { currency, compact, usdInr } = useMoney()
  const ist = useIstClock()
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setTab = useSelectionStore((s) => s.setTab)

  const globalQuery = useQuery({
    queryKey: ['crypto-global'],
    queryFn: fetchCryptoGlobal,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  })

  const { gainer, loser } = useMemo(() => {
    if (crypto.length === 0) return { gainer: null, loser: null }
    const sorted = [...crypto].sort((a, b) => b.changePct24h - a.changePct24h)
    return { gainer: sorted[0], loser: sorted[sorted.length - 1] }
  }, [crypto])

  const g = globalQuery.data

  return (
    <div className="market-pulse" aria-label="Market pulse">
      <div className="pulse-item">
        <IndianRupee size={14} strokeWidth={1.75} />
        <div>
          <span className="pulse-label">USD → INR</span>
          <strong className="mono">{formatFxRate(usdInr)}</strong>
        </div>
      </div>

      <div className="pulse-item">
        <TrendingUp size={14} strokeWidth={1.75} />
        <div>
          <span className="pulse-label">Crypto mkt cap</span>
          <strong className="mono">
            {g ? compact(g.totalMarketCapUsd) : '—'}
            {g && (
              <span className={g.marketCapChange24h >= 0 ? 'up' : 'down'}>
                {' '}
                {formatPct(g.marketCapChange24h)}
              </span>
            )}
          </strong>
        </div>
      </div>

      <div className="pulse-item">
        <div>
          <span className="pulse-label">BTC dominance</span>
          <strong className="mono">
            {g ? `${g.btcDominance.toFixed(1)}%` : '—'}
          </strong>
        </div>
      </div>

      {gainer && (
        <button
          type="button"
          className="pulse-item clickable"
          onClick={() => {
            setTab('markets')
            setSelection(gainer.id, gainer.symbol, 'crypto')
          }}
        >
          <ArrowUpRight size={14} strokeWidth={1.75} className="up" />
          <div>
            <span className="pulse-label">Top gainer</span>
            <strong className="mono">
              {gainer.symbol}{' '}
              <span className="up">{formatPct(gainer.changePct24h)}</span>
            </strong>
          </div>
        </button>
      )}

      {loser && (
        <button
          type="button"
          className="pulse-item clickable"
          onClick={() => {
            setTab('markets')
            setSelection(loser.id, loser.symbol, 'crypto')
          }}
        >
          <ArrowDownRight size={14} strokeWidth={1.75} className="down" />
          <div>
            <span className="pulse-label">Top loser</span>
            <strong className="mono">
              {loser.symbol}{' '}
              <span className="down">{formatPct(loser.changePct24h)}</span>
            </strong>
          </div>
        </button>
      )}

      <div className="pulse-item pulse-ist">
        <Clock3 size={14} strokeWidth={1.75} />
        <div>
          <span className="pulse-label">India (IST)</span>
          <strong className="mono">{ist}</strong>
        </div>
        <span className="pulse-hint">{currency === 'INR' ? 'Prices in ₹' : 'Prices in $'}</span>
      </div>
    </div>
  )
}
