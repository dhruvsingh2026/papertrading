import { ArrowLeftRight } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { useSelectionStore, type DeskNav } from '../store/appStore'
import { useAuthStore } from '../store/authStore'

const LINKS: { id: DeskNav; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'trading', label: 'Trading' },
  { id: 'market', label: 'Market' },
  { id: 'portfolio', label: 'Portfolio' },
]

interface Props {
  onTransfer: () => void
  onProfile: () => void
  onActivity: () => void
}

export function DesktopTopNav({ onTransfer, onProfile, onActivity }: Props) {
  const deskNav = useSelectionStore((s) => s.deskNav)
  const setDeskNav = useSelectionStore((s) => s.setDeskNav)
  const tab = useSelectionStore((s) => s.tab)
  const session = useAuthStore((s) => s.session)
  const { currency, setCurrency } = useMoney()

  const active =
    tab === 'activity' || tab === 'profile'
      ? null
      : deskNav

  return (
    <header className="desk-topnav">
      <div className="desk-brand">
        <span className="desk-mark" aria-hidden>
          F
        </span>
        <span className="desk-brand-name">Fairbook</span>
      </div>

      <nav className="desk-links" aria-label="Desktop">
        {LINKS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={active === l.id ? 'active' : undefined}
            onClick={() => setDeskNav(l.id)}
          >
            {l.label}
          </button>
        ))}
      </nav>

      <div className="desk-top-actions">
        <div className="currency-toggle desk-currency">
          <button
            type="button"
            className={currency === 'INR' ? 'active' : ''}
            onClick={() => setCurrency('INR')}
          >
            ₹ INR
          </button>
          <button
            type="button"
            className={currency === 'USD' ? 'active' : ''}
            onClick={() => setCurrency('USD')}
          >
            $ USD
          </button>
        </div>
        <button type="button" className="desk-transfer" onClick={onTransfer}>
          <ArrowLeftRight size={16} />
          Transfer
        </button>
        <button
          type="button"
          className="desk-icon-link"
          onClick={onActivity}
          title="Activity"
        >
          Activity
        </button>
        <button
          type="button"
          className="desk-avatar"
          onClick={onProfile}
          aria-label="Profile"
          title={session?.name ?? 'Profile'}
        >
          {(session?.name ?? 'U').slice(0, 1).toUpperCase()}
        </button>
      </div>
    </header>
  )
}
