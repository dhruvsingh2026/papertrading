import { useEffect, useState } from 'react'
import { CheckCircle2, CreditCard, Landmark, Smartphone, X } from 'lucide-react'

export type DemoPayMethod = 'upi' | 'card' | 'netbanking'

interface Props {
  open: boolean
  side: 'buy' | 'sell'
  symbol: string
  amountLabel: string
  qtyLabel: string
  successHint?: string
  onClose: () => void
  onSuccess: () => void
}

const METHODS: Array<{
  id: DemoPayMethod
  label: string
  hint: string
  icon: typeof Smartphone
}> = [
  { id: 'upi', label: 'UPI Fast Checkout', hint: 'Google Pay · PhonePe · Paytm · BHIM (Demo)', icon: Smartphone },
  { id: 'card', label: 'Debit & Credit Card', hint: 'RuPay · Visa · Mastercard · Amex (Demo)', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', hint: 'SBI · HDFC · ICICI · Axis (Demo)', icon: Landmark },
]

type Step = 'method' | 'processing' | 'success'

export function PaymentDemo({
  open,
  side,
  symbol,
  amountLabel,
  qtyLabel,
  successHint = 'Filling your paper order…',
  onClose,
  onSuccess,
}: Props) {
  const [method, setMethod] = useState<DemoPayMethod>('upi')
  const [upiId, setUpiId] = useState('learner@demo')
  const [step, setStep] = useState<Step>('method')

  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) {
      setStep('method')
      setMethod('upi')
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'processing') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, step])

  if (!open) return null

  const isDeposit = symbol === 'WALLET'
  const title = isDeposit
    ? 'SIMULATED WALLET FUNDING'
    : side === 'buy'
      ? 'SIMULATED ORDER CHECKOUT'
      : 'SIMULATED ORDER SETTLEMENT'

  const actionLabel = isDeposit
    ? `Authorize Deposit of ${amountLabel}`
    : side === 'buy'
      ? `Authorize Buy for ${amountLabel}`
      : `Confirm Sale for ${amountLabel}`

  const confirmExecution = () => {
    setStep('processing')
    window.setTimeout(() => {
      setStep('success')
      window.setTimeout(() => {
        onSuccess()
        onClose()
      }, 850)
    }, 1200)
  }

  return (
    <div className="pay-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="pay-backdrop"
        aria-label="Close dialog"
        onClick={() => {
          if (step !== 'processing') onClose()
        }}
      />
      <div className="pay-sheet">
        <div className="pay-head">
          <div>
            <span className="pay-badge">100% DEMO SIMULATION</span>
            <h2>{title}</h2>
            <p className="pay-sub">
              {isDeposit
                ? 'Virtual paper wallet top-up'
                : `${side === 'buy' ? 'Buy' : 'Sell'} ${qtyLabel} ${symbol}`}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            disabled={step === 'processing'}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {step === 'method' && (
          <>
            <div className="pay-amount mono">{amountLabel}</div>

            {/* Payment Method Selector */}
            <div className="pay-methods">
              {METHODS.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`pay-method ${method === m.id ? 'active' : ''}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <Icon size={20} style={{ color: method === m.id ? 'var(--accent-ink)' : 'var(--secondary)' }} />
                    <span>
                      <strong>{m.label}</strong>
                      <small>{m.hint}</small>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Method Inputs */}
            {method === 'upi' && (
              <label className="field">
                <span>Simulated Virtual Payment Address (VPA)</span>
                <input
                  className="mono"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okhdfcbank"
                />
              </label>
            )}

            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label className="field">
                  <span>Simulated Card Number</span>
                  <input className="mono" value="4532 •••• •••• 8824" readOnly />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <label className="field">
                    <span>Expiry</span>
                    <input className="mono" value="10/28" readOnly />
                  </label>
                  <label className="field">
                    <span>CVV</span>
                    <input className="mono" value="•••" readOnly />
                  </label>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <label className="field">
                <span>Select Bank (Demo)</span>
                <select defaultValue="sbi">
                  <option value="sbi">State Bank of India (Demo)</option>
                  <option value="hdfc">HDFC Bank (Demo)</option>
                  <option value="icici">ICICI Bank (Demo)</option>
                  <option value="axis">Axis Bank (Demo)</option>
                </select>
              </label>
            )}

            <button
              type="button"
              className={`btn ${side === 'sell' && !isDeposit ? 'danger' : 'primary'} full large`}
              onClick={confirmExecution}
            >
              {actionLabel}
            </button>

            <p className="disclaimer">
              Educational simulation only. No real money, payment gateway API, or banking institution is accessed.
            </p>
          </>
        )}

        {step === 'processing' && (
          <div className="pay-status">
            <div className="pay-spinner" aria-hidden="true" />
            <strong style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>Simulating Authorization…</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
              {method === 'upi'
                ? 'Simulating instant UPI notification & confirmation…'
                : method === 'card'
                  ? 'Simulating zero-friction tokenized card authorization…'
                  : 'Simulating instant bank confirmation…'}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="pay-status">
            <CheckCircle2 size={44} style={{ color: 'var(--up)' }} />
            <strong style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
              {isDeposit ? 'Funds Deposited' : 'Order Executed'}
            </strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>{successHint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
