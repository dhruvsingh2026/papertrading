import { Plus, Star } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, useWatchlistStore } from '../store/appStore'
import { ScreenHeader } from './ScreenHeader'

interface Props {
  items: MarketSymbol[]
  query: string
  onQuery: (v: string) => void
  onAddStock: () => void
}

function MiniSpark({ up }: { up: boolean }) {
  const pts = up ? '0,14 8,10 16,12 24,6 32,8 40,3' : '0,4 8,7 16,5 24,11 32,9 40,14'
  return (
    <svg className="mob-mini-spark" viewBox="0 0 40 16" aria-hidden>
      <polyline
        fill="none"
        stroke={up ? 'var(--up)' : 'var(--down)'}
        strokeWidth="1.6"
        points={pts}
      />
    </svg>
  )
}

export function MarketsScreen({ items, query, onQuery, onAddStock }: Props) {
  const filter = useSelectionStore((s) => s.exploreFilter)
  const setFilter = useSelectionStore((s) => s.setExploreFilter)
  const openAsset = useSelectionStore((s) => s.openAsset)
  const watchIds = useWatchlistStore((s) => s.ids)
  const toggle = useWatchlistStore((s) => s.toggle)
  const { money } = useMoney()

  const chips = [
    ['all', 'Trending'],
    ['gainers', 'Gainers'],
    ['losers', 'Losers'],
    ['crypto', 'Crypto'],
    ['stocks', 'Stocks'],
    ['mine', 'My list'],
  ] as const

  return (
    <div className="mob-screen">
      <ScreenHeader title="Markets" query={query} onQuery={onQuery} showSearch />

      <div className="mob-chips">
        {chips.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={filter === id ? 'active' : undefined}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
        <button type="button" className="add" onClick={onAddStock}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="mob-asset-list">
        {items.length === 0 && <p className="mob-empty">No markets match</p>}
        {items.map((s) => {
          const up = s.changePct24h >= 0
          const watched = watchIds.includes(s.id)
          return (
            <div key={s.id} className="mob-asset-row wrap">
              <button
                type="button"
                className="mob-asset-hit"
                onClick={() => openAsset(s.id, s.symbol, s.assetClass)}
              >
                <div className="mob-avatar">
                  {s.image ? <img src={s.image} alt="" /> : s.symbol.slice(0, 2)}
                </div>
                <div className="mob-asset-main">
                  <b>{s.symbol}</b>
                  <small>{s.name}</small>
                </div>
                <MiniSpark up={up} />
                <div className="mob-asset-meta">
                  <b className="mono">{money(s.price)}</b>
                  <span className={up ? 'up' : 'down'}>{formatPct(s.changePct24h)}</span>
                </div>
              </button>
              <button
                type="button"
                className={watched ? 'mob-star on' : 'mob-star'}
                aria-label="Watchlist"
                onClick={() => toggle(s.id)}
              >
                <Star size={16} fill={watched ? 'currentColor' : 'none'} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
