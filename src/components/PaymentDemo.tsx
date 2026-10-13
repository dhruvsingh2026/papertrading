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
  { id: 'upi', label: 'UPI', hint: 'GPay · PhonePe · Paytm (demo)', icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Visa · Mastercard · RuPay (demo)', icon: CreditCard },
  { id: 'netbanking', label: 'Net banking', hint: 'All Indian banks (demo)', icon: Landmark },
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
  const [upiId, setUpiId] = useState('fairbook@demo')
  const [step, setStep] = useState<Step>('method')

  useEffect(() => {
    if (!open) {
      setStep('method')
      setMethod('upi')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'processing') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, step])

  if (!open) return null

  const title =
    symbol === 'WALLET'
      ? 'Add money'
      : side === 'buy'
        ? 'Demo payment'
        : 'Demo payout'
  const action =
    symbol === 'WALLET'
      ? `Pay ${amountLabel}`
      : side === 'buy'
        ? `Pay ${amountLabel}`
        : `Receive ${amountLabel}`

  const confirm = () => {
    setStep('processing')
    window.setTimeout(() => {
      setStep('success')
      window.setTimeout(() => {
        onSuccess()
        onClose()
      }, 900)
    }, 1400)
  }

  return (
    <div className="pay-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="pay-backdrop" aria-label="Close" onClick={onClose} />
      <div className="pay-sheet">
        <div className="pay-head">
          <div>
            <p className="pay-badge">DEMO ONLY · no real money</p>
            <h2>{title}</h2>
            <p className="pay-sub">
              {symbol === 'WALLET'
                ? 'Wallet top-up'
                : `${side === 'buy' ? 'Buy' : 'Sell'} ${qtyLabel} ${symbol}`}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            disabled={step === 'processing'}
            aria-label="Close payment"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {step === 'method' && (
          <>
            <div className="pay-amount mono">{amountLabel}</div>

            <div className="pay-methods">
              {METHODS.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={method === m.id ? 'pay-method active' : 'pay-method'}
                    onClick={() => setMethod(m.id)}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span>
                      <strong>{m.label}</strong>
                      <small>{m.hint}</small>
                    </span>
                  </button>
                )
              })}
            </div>

            {method === 'upi' && (
              <label className="field">
                <span>UPI ID (demo)</span>
                <input
                  className="mono"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </label>
            )}

            {method === 'card' && (
              <div className="pay-card-demo">
                <label className="field">
                  <span>Card number</span>
                  <input className="mono" value="4111 1111 1111 1111" readOnly />
                </label>
                <div className="pay-card-row">
                  <label className="field">
                    <span>Expiry</span>
                    <input className="mono" value="12/28" readOnly />
                  </label>
                  <label className="field">
                    <span>CVV</span>
                    <input className="mono" value="123" readOnly />
                  </label>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <label className="field">
                <span>Bank (demo)</span>
                <select defaultValue="sbi">
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                </select>
              </label>
            )}

            <button
              type="button"
              className={side === 'buy' ? 'submit buy' : 'submit sell'}
              onClick={confirm}
            >
              {action}
            </button>
            <p className="disclaimer">
              This is a Fairbook simulation. Nothing is charged to your bank or UPI.
            </p>
          </>
        )}

        {step === 'processing' && (
          <div className="pay-status">
            <div className="pay-spinner" aria-hidden />
            <p>Contacting demo gateway…</p>
            <p className="muted">
              {method === 'upi'
                ? 'Waiting for UPI approval (simulated)'
                : method === 'card'
                  ? 'Authorising card (simulated)'
                  : 'Redirecting to bank (simulated)'}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="pay-status success">
            <CheckCircle2 size={36} strokeWidth={1.5} className="up" />
            <p>Payment successful</p>
            <p className="muted">{successHint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
