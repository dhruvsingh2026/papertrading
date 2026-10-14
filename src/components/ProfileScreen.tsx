import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins, LogOut, RotateCcw, ShieldCheck, Upload, Wallet } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, usePrefsStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'

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
  const claimStarterPack = usePaperStore((s) => s.claimStarterPack)
  const currency = usePrefsStore((s) => s.currency)
  const setCurrency = usePrefsStore((s) => s.setCurrency)
  const { money, usdInr } = useMoney()

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const handleReset = () => {
    reset()
    setConfirmResetOpen(false)
    setFeedbackMsg('Your paper wallet, open positions, and ledger have been reset.')
    setTimeout(() => setFeedbackMsg(null), 4000)
  }

  const handleStarterPack = () => {
    claimStarterPack()
    setFeedbackMsg('Starter pack of $1,000 virtual cash added to your wallet.')
    setTimeout(() => setFeedbackMsg(null), 4000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem' }}>PROFILE & SETTINGS</h1>
        <p style={{ fontSize: '0.88rem' }}>Manage your demo account, currency preference, and trading sandbox.</p>
      </div>

      {/* User Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <div className="desk-avatar" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1.4rem' }}>
          {(session?.name ?? 'U').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <strong style={{ fontSize: '1.25rem', display: 'block', color: 'var(--ink)' }}>
            {session?.name ?? 'Demo Trader'}
          </strong>
          <span style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
            {session?.email ?? 'trader@fairbook.app'}
          </span>
          <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
            <ShieldCheck size={14} className="up" />
            <span>Local Browser Sandbox Account</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--up-soft)', border: '1px solid rgba(22, 135, 93, 0.3)', borderRadius: 'var(--radius)', color: 'var(--up)', fontSize: '0.88rem' }}>
          {feedbackMsg}
        </div>
      )}

      {/* Settings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Virtual Cash Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>Virtual Paper Cash</span>
            <strong className="mono" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>{money(cash)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {cash === 0 && (
              <button type="button" className="btn ghost" onClick={handleStarterPack}>
                <Coins size={15} /> Claim $1,000 Grant
              </button>
            )}
            <button type="button" className="btn primary" onClick={onAddMoney}>
              <Wallet size={15} /> Top Up Funds
            </button>
          </div>
        </div>

        {/* Currency Preference */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>Display Currency</span>
            <small style={{ color: 'var(--secondary)' }}>
              Live exchange rate: 1 USD ≈ ₹{usdInr.toFixed(2)} INR
            </small>
          </div>
          <div className="currency-toggle">
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
        </div>

        {/* Custom Stock & CSV Tool */}
        <div
          onClick={onAddStock}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>Custom Asset & CSV Import</span>
            <small style={{ color: 'var(--secondary)' }}>
              Add custom stocks or bulk-import a CSV portfolio to practice with unlisted symbols.
            </small>
          </div>
          <button type="button" className="btn ghost small">
            <Upload size={14} /> Import CSV
          </button>
        </div>

        {/* Reset Sandbox */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontWeight: 600, display: 'block', color: 'var(--down)' }}>Reset Paper Account</span>
            <small style={{ color: 'var(--secondary)' }}>
              Clears your cash balance, wipes all open holdings, and clears the ledger.
            </small>
          </div>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setConfirmResetOpen(true)}
            style={{ color: 'var(--down)', borderColor: 'rgba(201, 60, 75, 0.3)' }}
          >
            <RotateCcw size={14} /> Reset Account
          </button>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="btn ghost full"
          onClick={() => {
            logout()
            navigate('/')
          }}
          style={{ marginTop: '0.5rem' }}
        >
          <LogOut size={16} /> Log Out of Demo Desk
        </button>
      </div>

      <p className="disclaimer" style={{ textAlign: 'center', marginTop: '1rem' }}>
        Demo account only. Stored locally in this browser. Fairbook never collects real money or bank access.
      </p>

      {/* Confirmation Modal */}
      {confirmResetOpen && (
        <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Confirm Paper Wallet Reset">
          <button type="button" className="pay-backdrop" onClick={() => setConfirmResetOpen(false)} />
          <div className="pay-sheet" style={{ maxWidth: '420px' }}>
            <h2 style={{ color: 'var(--down)' }}>CONFIRM RESET?</h2>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
              Are you sure you want to reset your paper account? All your simulated positions, virtual cash, and transaction history will be permanently erased.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn danger full" onClick={handleReset}>
                Yes, Reset Account
              </button>
              <button type="button" className="btn ghost full" onClick={() => setConfirmResetOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
