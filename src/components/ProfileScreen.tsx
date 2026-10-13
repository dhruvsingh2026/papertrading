import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, Wallet } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, usePrefsStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import { ScreenHeader } from './ScreenHeader'

interface Props {
  onAddMoney: () => void
  onAddStock: () => void
}

export function ProfileScreen({ onAddMoney, onAddStock }: Props) {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const cash = usePaperStore((s) => s.cash)
  const reset = usePaperStore((s) => s.reset)
  const currency = usePrefsStore((s) => s.currency)
  const setCurrency = usePrefsStore((s) => s.setCurrency)
  const { money } = useMoney()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="mob-screen">
      <ScreenHeader title="Profile" />

      <div className="mob-profile-card">
        <div className="mob-avatar lg">{(session?.name ?? 'U').slice(0, 1).toUpperCase()}</div>
        <div>
          <b>{session?.name ?? 'Guest'}</b>
          <small>{session?.email ?? '—'}</small>
        </div>
      </div>

      <div className="mob-settings">
        <div className="mob-setting-row">
          <div>
            <b>Wallet cash</b>
            <small className="mono">{money(cash)}</small>
          </div>
          <button type="button" className="btn primary" onClick={onAddMoney}>
            <Wallet size={14} /> Add
          </button>
        </div>

        <div className="mob-setting-row">
          <div>
            <b>Display currency</b>
            <small>Prices & wallet</small>
          </div>
          <div className="currency-toggle">
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
        </div>

        <button type="button" className="mob-setting-row btnish" onClick={onAddStock}>
          <div>
            <b>List / upload stocks</b>
            <small>CSV or manual</small>
          </div>
          <Plus size={18} />
        </button>

        <button
          type="button"
          className="mob-setting-row btnish"
          onClick={() => {
            reset()
            setMsg('Paper wallet reset')
          }}
        >
          <div>
            <b>Reset paper wallet</b>
            <small>Clears cash, holdings, ledger</small>
          </div>
        </button>

        {msg && <p className="muted">{msg}</p>}

        <button
          type="button"
          className="btn ghost full"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      <p className="mob-footnote">Demo account · stored only in this browser</p>
    </div>
  )
}
