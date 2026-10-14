import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  open: boolean
  onClose: () => void
}

const PRESETS_INR = [5_000, 10_000, 25_000, 50_000, 100_000]
const PRESETS_USD = [100, 250, 500, 1_000, 2_500]

export function AddMoneyModal({ open, onClose }: Props) {
  const addMoney = usePaperStore((s) => s.addMoney)
  const { currency, usdInr, money } = useMoney()

  const [selectedPreset, setSelectedPreset] = useState<number>(currency === 'INR' ? 25_000 : 500)
  const [customValue, setCustomValue] = useState('')
  const [payOpen, setPayOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const presets = currency === 'INR' ? PRESETS_INR : PRESETS_USD

  const displayAmount = useMemo(() => {
    const customNum = Number(customValue)
    if (customValue.trim() && Number.isFinite(customNum) && customNum > 0) {
      return customNum
    }
    return selectedPreset
  }, [customValue, selectedPreset])

  const usdAmount = useMemo(() => {
    return currency === 'INR' ? displayAmount / usdInr : displayAmount
  }, [displayAmount, currency, usdInr])

  const formattedAmountLabel = useMemo(() => {
    if (currency === 'INR') {
      return displayAmount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      })
    }
    return money(usdAmount)
  }, [displayAmount, currency, usdAmount, money])

  if (!open) return null

  const handleOpenPayment = () => {
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
      setError('Please enter a valid deposit amount greater than zero.')
      return
    }
    if (usdAmount > 1_000_000) {
      setError('Maximum simulated deposit per transaction is $1,000,000.')
      return
    }
    setError(null)
    setPayOpen(true)
  }

  const handleDepositSuccess = () => {
    const err = addMoney(usdAmount, 'Simulated wallet deposit')
    if (!err) {
      setPayOpen(false)
      onClose()
    } else {
      setError(err)
    }
  }

  return (
    <>
      <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Add Demo Funds">
        <button type="button" className="pay-backdrop" aria-label="Close modal" onClick={onClose} />
        <div className="pay-sheet">
          <div className="pay-head">
            <div>
              <span className="pay-badge">SIMULATED PAPER FUNDS ONLY</span>
              <h2>TOP UP DEMO WALLET</h2>
              <p className="pay-sub">
                Select or enter an amount to credit to your virtual paper-trading account.
              </p>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Presets Grid */}
          <div className="add-presets">
            {presets.map((val) => {
              const label =
                currency === 'INR'
                  ? `₹${val.toLocaleString('en-IN')}`
                  : `$${val.toLocaleString('en-US')}`
              const isSelected = !customValue.trim() && selectedPreset === val

              return (
                <button
                  key={val}
                  type="button"
                  className={`preset ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPreset(val)
                    setCustomValue('')
                    setError(null)
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Custom Amount Field */}
          <label className="field">
            <span>Custom Amount ({currency})</span>
            <input
              className="mono"
              inputMode="decimal"
              placeholder={currency === 'INR' ? 'e.g. 15,000' : 'e.g. 200'}
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value)
                setError(null)
              }}
            />
          </label>

          {/* Big Amount Readout */}
          <div className="pay-amount mono">{formattedAmountLabel}</div>

          {error && <p className="ticket-error">{error}</p>}

          <button
            type="button"
            className="btn primary full large"
            onClick={handleOpenPayment}
          >
            Continue to Demo Checkout
          </button>

          <p className="disclaimer">
            This checkout simulates standard payment gateways. No real credit card or bank account will ever be charged.
          </p>
        </div>
      </div>

      <PaymentDemo
        open={payOpen}
        side="buy"
        symbol="WALLET"
        amountLabel={formattedAmountLabel}
        qtyLabel="Funding"
        successHint="Virtual funds credited successfully to your paper wallet"
        onClose={() => setPayOpen(false)}
        onSuccess={handleDepositSuccess}
      />
    </>
  )
}
