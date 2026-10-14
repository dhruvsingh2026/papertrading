import {
  Activity,
  ArrowLeftRight,
  CandlestickChart,
  LayoutDashboard,
  PieChart,
  UserRound,
} from 'lucide-react'
import { useSelectionStore, type AppDestination } from '../store/appStore'

const TABS: { id: AppDestination; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'markets', label: 'Markets', icon: CandlestickChart },
  { id: 'trade', label: 'Trade', icon: ArrowLeftRight },
  { id: 'portfolio', label: 'Holdings', icon: PieChart },
  { id: 'activity', label: 'Ledger', icon: Activity },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

export function AppBottomNav() {
  const destination = useSelectionStore((s) => s.destination)
  const setDestination = useSelectionStore((s) => s.setDestination)

  return (
    <nav className="mob-nav" aria-label="Mobile Bottom Navigation">
      {TABS.map((t) => {
        const Icon = t.icon
        const active = destination === t.id
        return (
          <button
            key={t.id}
            type="button"
            className={active ? 'mob-nav-item active' : 'mob-nav-item'}
            onClick={() => setDestination(t.id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.7} />
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
