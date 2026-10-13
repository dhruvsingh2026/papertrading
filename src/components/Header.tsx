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

export function Header({ query, onQuery }: Props) {
  const navigate = useNavigate()
  const cash = usePaperStore((s) => s.cash)
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const { currency, setCurrency, money } = useMoney()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <div className="brand-name">Fairbook</div>
            <div className="brand-tag">
              {session ? `Hi, ${session.name.split(' ')[0]}` : 'Clear markets. Quiet desk.'}
            </div>
          </div>
        </div>

        <label className="search">
          <Search size={16} strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search BTC, RELIANCE, AAPL…"
            aria-label="Search markets"
          />
        </label>

        <div className="topbar-actions">
          <div className="currency-toggle" role="group" aria-label="Display currency">
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

          <div className="wallet-group">
            <div className="topbar-cash" title="Paper wallet balance">
              <Wallet size={16} strokeWidth={1.75} />
              <span>{money(cash)}</span>
            </div>
            <button
              type="button"
              className="add-money-btn"
              onClick={() => setAddOpen(true)}
              title="Add money to wallet"
            >
              <Plus size={15} strokeWidth={2} />
              Add money
            </button>
          </div>

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
      </header>

      <AddMoneyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
