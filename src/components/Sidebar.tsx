/** @deprecated Terminal now uses Groww ExploreList — kept for reference builds */
import { Star } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, useWatchlistStore } from '../store/appStore'

interface Props {
  crypto: MarketSymbol[]
  stocks: MarketSymbol[]
  query: string
}

export function Sidebar({ crypto, stocks, query }: Props) {
  const { money } = useMoney()
  const exploreFilter = useSelectionStore((s) => s.exploreFilter)
  const setExploreFilter = useSelectionStore((s) => s.setExploreFilter)
  const selectedId = useSelectionStore((s) => s.selectedId)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setTab = useSelectionStore((s) => s.setTab)
  const watchIds = useWatchlistStore((s) => s.ids)
  const toggle = useWatchlistStore((s) => s.toggle)

  const q = query.trim().toLowerCase()
  const filter = (list: MarketSymbol[]) =>
    q
      ? list.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q),
        )
      : list

  const list =
    exploreFilter === 'crypto'
      ? filter(crypto)
      : exploreFilter === 'stocks'
        ? filter(stocks)
        : filter([...crypto, ...stocks])

  return (
    <aside className="sidebar">
      <div className="tabs">
        {(
          [
            ['all', 'All'],
            ['crypto', 'Crypto'],
            ['stocks', 'Stocks'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={exploreFilter === id ? 'tab active' : 'tab'}
            onClick={() => {
              setExploreFilter(id)
              setTab('markets')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="symbol-list">
        {list.length === 0 && <p className="empty">No symbols match.</p>}
        {list.map((s) => {
          const up = s.changePct24h >= 0
          const watched = watchIds.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              className={selectedId === s.id ? 'symbol-row active' : 'symbol-row'}
              onClick={() => setSelection(s.id, s.symbol, s.assetClass)}
            >
              <div className="symbol-main">
                <span className="symbol-ticker">{s.symbol}</span>
                <span className="symbol-name">{s.name}</span>
              </div>
              <div className="symbol-meta">
                <span className="symbol-price mono">{money(s.price)}</span>
                <span className={up ? 'pct up mono' : 'pct down mono'}>
                  {formatPct(s.changePct24h)}
                </span>
              </div>
              <span
                className={watched ? 'star on' : 'star'}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(s.id)
                }}
              >
                <Star size={14} strokeWidth={1.75} fill={watched ? 'currentColor' : 'none'} />
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
