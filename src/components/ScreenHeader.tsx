import { Bell, Search } from 'lucide-react'

interface Props {
  title: string
  query?: string
  onQuery?: (v: string) => void
  showSearch?: boolean
}

export function ScreenHeader({ title, query = '', onQuery, showSearch }: Props) {
  return (
    <header className="mob-header">
      <div className="mob-header-row">
        <h1>{title}</h1>
        <div className="mob-header-actions">
          <button type="button" className="mob-icon-btn" aria-label="Notifications" disabled>
            <Bell size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {showSearch && onQuery && (
        <label className="mob-search">
          <Search size={16} strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search coins & stocks"
            aria-label="Search"
          />
        </label>
      )}
    </header>
  )
}
