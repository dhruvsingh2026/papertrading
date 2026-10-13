import { Star } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, useWatchlistStore } from '../store/appStore'

interface Props {
  items: MarketSymbol[]
  emptyText?: string
}

function Avatar({ symbol, image }: { symbol: string; image?: string }) {
  if (image) {
    return <img className="gw-avatar" src={image} alt="" width={36} height={36} />
  }
  return <div className="gw-avatar fallback">{symbol.slice(0, 2)}</div>
}

export function ExploreList({ items, emptyText = 'No matches found' }: Props) {
  const { money } = useMoney()
  const selectedId = useSelectionStore((s) => s.selectedId)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const watchIds = useWatchlistStore((s) => s.ids)
  const toggle = useWatchlistStore((s) => s.toggle)

  if (items.length === 0) {
    return <p className="gw-empty">{emptyText}</p>
  }

  return (
    <div className="gw-list">
      {items.map((s) => {
        const up = s.changePct24h >= 0
        const watched = watchIds.includes(s.id)
        return (
          <button
            key={s.id}
            type="button"
            className={selectedId === s.id ? 'gw-row active' : 'gw-row'}
            onClick={() => setSelection(s.id, s.symbol, s.assetClass)}
          >
            <Avatar symbol={s.symbol} image={s.image} />
            <div className="gw-row-main">
              <span className="gw-row-name">{s.name}</span>
              <span className="gw-row-sub">
                {s.symbol} · {s.assetClass}
              </span>
            </div>
            <div className="gw-row-meta">
              <span className="mono gw-row-price">{money(s.price)}</span>
              <span className={up ? 'gw-chip up' : 'gw-chip down'}>
                {formatPct(s.changePct24h)}
              </span>
            </div>
            <span
              className={watched ? 'gw-star on' : 'gw-star'}
              role="button"
              tabIndex={0}
              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={(e) => {
                e.stopPropagation()
                toggle(s.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle(s.id)
                }
              }}
            >
              <Star size={16} strokeWidth={1.75} fill={watched ? 'currentColor' : 'none'} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
