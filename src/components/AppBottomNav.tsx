import {
  Activity,
  ArrowLeftRight,
  CandlestickChart,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useSelectionStore } from '../store/appStore'

const TABS = [
  { id: 'markets' as const, label: 'Markets', icon: CandlestickChart },
  { id: 'trade' as const, label: 'Trade', icon: ArrowLeftRight },
  { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
  { id: 'activity' as const, label: 'Activity', icon: Activity },
  { id: 'profile' as const, label: 'Profile', icon: UserRound },
]

export function AppBottomNav() {
  const tab = useSelectionStore((s) => s.tab)
  const setTab = useSelectionStore((s) => s.setTab)

  return (
    <nav className="mob-nav" aria-label="Main">
      {TABS.map((t) => {
        const Icon = t.icon
        const active = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            className={active ? 'mob-nav-item active' : 'mob-nav-item'}
            onClick={() => setTab(t.id)}
          >
            <Icon size={24} strokeWidth={active ? 2.25 : 1.7} />
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
