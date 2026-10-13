import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, Search, Wallet } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import { AddMoneyModal } from './AddMoneyModal'

interface Props {
  query: string
  onQuery: (value: string) => void
}

export function GrowwTopBar({ query, onQuery }: Props) {
  const navigate = useNavigate()
  const cash = usePaperStore((s) => s.cash)
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const { currency, setCurrency, money } = useMoney()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <header className="gw-top">
        <div className="gw-top-row">
          <div className="brand gw-brand">
            <span className="brand-mark" aria-hidden />
            <div>
              <div className="brand-name">Fairbook</div>
              <div className="brand-tag">
                {session ? `Hi, ${session.name.split(' ')[0]}` : 'Easy paper trading'}
              </div>
            </div>
          </div>

          <div className="gw-top-actions">
            <div className="currency-toggle" role="group" aria-label="Display currency">
              <button
                type="button"
                className={currency === 'INR' ? 'active' : ''}
                onClick={() => setCurrency('INR')}
              >
                ₹
              </button>
              <button
                type="button"
                className={currency === 'USD' ? 'active' : ''}
                onClick={() => setCurrency('USD')}
              >
                $
              </button>
            </div>

            <button type="button" className="gw-wallet-pill" onClick={() => setAddOpen(true)}>
              <Wallet size={15} strokeWidth={1.75} />
              <span className="mono">{money(cash)}</span>
              <Plus size={14} strokeWidth={2} />
            </button>

            <button
              type="button"
              className="icon-btn"
              title="Log out"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              <LogOut size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <label className="gw-search">
          <Search size={16} strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search any stock or coin…"
            aria-label="Search markets"
          />
        </label>
      </header>

      <AddMoneyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
