import {
  ArrowDownLeft,
  ArrowUpRight,
  CandlestickChart,
  Plus,
  Search,
  Star,
  X,
} from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, useWatchlistStore, type ExploreFilter } from '../store/appStore'

interface Props {
  items: MarketSymbol[]
  query: string
  onQuery: (v: string) => void
  onAddStock: () => void
}

const CATEGORY_CHIPS: { id: ExploreFilter; label: string }[] = [
  { id: 'all', label: 'All Instruments' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'stocks', label: 'US Equities' },
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'losers', label: 'Top Losers' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'mine', label: 'Custom List' },
]

export function MarketsScreen({ items, query, onQuery, onAddStock }: Props) {
  const filter = useSelectionStore((s) => s.exploreFilter)
  const setFilter = useSelectionStore((s) => s.setExploreFilter)
  const openAsset = useSelectionStore((s) => s.openAsset)
  const watchIds = useWatchlistStore((s) => s.ids)
  const toggle = useWatchlistStore((s) => s.toggle)
  const { money } = useMoney()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>MARKETS & DISCOVERY</h1>
          <p style={{ fontSize: '0.88rem' }}>Live market prices, 24-hour momentum, and volume data.</p>
        </div>
        <button type="button" className="btn ghost" onClick={onAddStock}>
          <Plus size={16} />
          List Custom Stock (CSV)
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="market-search-bar">
        <Search size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search crypto or US stocks by ticker, company, or token name…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Search markets"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery('')}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="market-filter-chips">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={filter === chip.id ? 'active' : undefined}
            onClick={() => setFilter(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Table of Instruments */}
      {items.length === 0 ? (
        <div className="gw-empty-card">
          <CandlestickChart size={36} style={{ color: 'var(--muted)' }} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No instruments found</p>
            <p style={{ fontSize: '0.85rem' }}>
              {query
                ? `No markets match "${query}". Try searching another symbol or clear your filter.`
                : 'No markets currently available in this category.'}
            </p>
          </div>
          {query && (
            <button type="button" className="btn ghost" onClick={() => onQuery('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table className="market-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} aria-label="Watchlist"></th>
                <th>Asset</th>
                <th className="right">Current Price</th>
                <th className="right">24h Change</th>
                <th className="right" style={{ display: 'none', minWidth: '120px' }}>24h Volume</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const up = s.changePct24h >= 0
                const isStarred = watchIds.includes(s.id)

                return (
                  <tr key={s.id}>
                    {/* Watchlist Star */}
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle(s.id)
                        }}
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: isStarred ? 'var(--accent)' : 'var(--muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.25rem',
                        }}
                        title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star size={17} fill={isStarred ? 'currentColor' : 'none'} />
                      </button>
                    </td>

                    {/* Asset Name & Symbol */}
                    <td>
                      <div
                        onClick={() => openAsset(s.id, s.symbol, s.assetClass)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                      >
                        <div className="gw-avatar" style={{ width: '2.25rem', height: '2.25rem' }}>
                          {s.image ? (
                            <img src={s.image} alt={s.symbol} />
                          ) : (
                            s.symbol.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--ink)' }}>
                            {s.symbol}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
                            {s.name} · <span style={{ textTransform: 'capitalize' }}>{s.assetClass}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="right">
                      <strong className="mono" style={{ fontSize: '1rem', color: 'var(--ink)' }}>
                        {money(s.price)}
                      </strong>
                    </td>

                    {/* 24h Change */}
                    <td className="right">
                      <span className={`change-pill ${up ? 'up' : 'down'} mono`}>
                        {up ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {formatPct(s.changePct24h)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="right">
                      <button
                        type="button"
                        className="btn ghost small"
                        onClick={() => openAsset(s.id, s.symbol, s.assetClass)}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
