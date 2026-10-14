import { ArrowDownLeft, Plus, Wallet } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore, type AppDestination } from '../store/appStore'
import { useAuthStore } from '../store/authStore'

const NAV_LINKS: { id: AppDestination; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'markets', label: 'Markets' },
  { id: 'trade', label: 'Trade' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'activity', label: 'Activity' },
  { id: 'profile', label: 'Profile' },
]

interface Props {
  onTransfer: () => void
  onProfile: () => void
  onActivity: () => void
}

export function DesktopTopNav({ onTransfer, onProfile }: Props) {
  const destination = useSelectionStore((s) => s.destination)
  const setDestination = useSelectionStore((s) => s.setDestination)
  const session = useAuthStore((s) => s.session)
  const cash = usePaperStore((s) => s.cash)
  const { currency, setCurrency, money } = useMoney()

  return (
    <header className="desk-topnav" role="banner">
      <div className="desk-brand">
        <span className="desk-mark" aria-hidden>
          F
        </span>
        <span className="desk-brand-name">FAIRBOOK</span>
      </div>

      <nav className="desk-links" aria-label="Desktop Primary Navigation">
        {NAV_LINKS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={destination === l.id ? 'active' : undefined}
            onClick={() => setDestination(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <div className="desk-top-actions">
        {/* Currency Switcher */}
        <div className="currency-toggle" aria-label="Display currency">
          <button
            type="button"
            className={currency === 'INR' ? 'active' : ''}
            onClick={() => setCurrency('INR')}
            title="Display in Indian Rupees"
          >
            ₹ INR
          </button>
          <button
            type="button"
            className={currency === 'USD' ? 'active' : ''}
            onClick={() => setCurrency('USD')}
            title="Display in US Dollars"
          >
            $ USD
          </button>
        </div>

        {/* Paper Cash Badge with Quick Top-Up */}
        <div className="desk-wallet-badge" title="Available Paper Trading Cash">
          <Wallet size={15} style={{ color: 'var(--muted)' }} />
          <span>Paper Cash:</span>
          <strong>{money(cash)}</strong>
          <button
            type="button"
            onClick={onTransfer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              border: 0,
              cursor: 'pointer',
              marginLeft: '0.25rem',
            }}
            title="Add Demo Money"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>

        {/* Deposit Button */}
        <button
          type="button"
          className="desk-transfer"
          onClick={onTransfer}
          title="Add Demo Funds"
        >
          <ArrowDownLeft size={16} />
          Add Funds
        </button>

        {/* User Profile Avatar */}
        <button
          type="button"
          className="desk-avatar"
          onClick={onProfile}
          aria-label="Profile and Settings"
          title={`${session?.name ?? 'User'} — Account Settings`}
        >
          {(session?.name ?? 'U').slice(0, 1).toUpperCase()}
        </button>
      </div>
    </header>
  )
}
