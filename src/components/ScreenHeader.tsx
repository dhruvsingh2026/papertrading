import { Search } from 'lucide-react'

interface Props {
  title: string
  query?: string
  onQuery?: (v: string) => void
  showSearch?: boolean
}

export function ScreenHeader({ title, query = '', onQuery, showSearch }: Props) {
  return (
    <header className="mob-header">
      <div className="mob-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{title}</h1>
      </div>
      {showSearch && onQuery && (
        <label className="market-search-bar" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          <Search size={16} strokeWidth={1.75} style={{ color: 'var(--muted)' }} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search crypto & US stocks…"
            aria-label="Search"
          />
        </label>
      )}
    </header>
  )
}
