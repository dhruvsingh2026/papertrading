import { useMemo, useState } from 'react'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  open: boolean
  onClose: () => void
}

const PRESETS_INR = [5_000, 10_000, 25_000, 50_000]

export function AddMoneyModal({ open, onClose }: Props) {
  const addMoney = usePaperStore((s) => s.addMoney)
  const { currency, usdInr, money } = useMoney()
  const [presetInr, setPresetInr] = useState(10_000)
  const [custom, setCustom] = useState('')
  const [payOpen, setPayOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayAmount = useMemo(() => {
    const customNum = Number(custom)
    if (custom.trim() && Number.isFinite(customNum) && customNum > 0) {
      return customNum
    }
    return currency === 'INR' ? presetInr : presetInr / usdInr
  }, [custom, currency, presetInr, usdInr])

  const usdAmount = useMemo(() => {
    const customNum = Number(custom)
    if (custom.trim() && Number.isFinite(customNum) && customNum > 0) {
      return currency === 'INR' ? customNum / usdInr : customNum
    }
    return presetInr / usdInr
  }, [custom, currency, presetInr, usdInr])

  const amountLabel =
    currency === 'INR'
      ? displayAmount.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        })
      : money(usdAmount)

  if (!open) return null

  return (
    <>
      <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Add money">
        <button type="button" className="pay-backdrop" aria-label="Close" onClick={onClose} />
        <div className="pay-sheet">
          <div className="pay-head">
            <div>
              <p className="pay-badge">DEMO ONLY · no real money</p>
              <h2>Add money to wallet</h2>
              <p className="pay-sub">Choose an amount, then complete demo payment.</p>
            </div>
          </div>

          <div className="add-presets">
            {PRESETS_INR.map((inr) => {
              const label =
                currency === 'INR'
                  ? inr.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })
                  : money(inr / usdInr)
              const active = !custom.trim() && presetInr === inr
              return (
                <button
                  key={inr}
                  type="button"
                  className={active ? 'preset active' : 'preset'}
                  onClick={() => {
                    setPresetInr(inr)
                    setCustom('')
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <label className="field">
            <span>Custom amount ({currency})</span>
            <input
              className="mono"
              inputMode="decimal"
              placeholder={currency === 'INR' ? 'e.g. 15000' : 'e.g. 100'}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          </label>

          <div className="pay-amount mono">{amountLabel}</div>
          {error && <p className="ticket-error">{error}</p>}

          <button
            type="button"
            className="submit buy"
            onClick={() => {
              if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
                setError('Enter a valid amount')
                return
              }
              setError(null)
              setPayOpen(true)
            }}
          >
            Continue to payment
          </button>
          <button type="button" className="btn ghost full" onClick={onClose}>
            Cancel
          </button>
          <p className="disclaimer">Credits paper cash only. Nothing is charged.</p>
        </div>
      </div>

      <PaymentDemo
        open={payOpen}
        side="buy"
        symbol="WALLET"
        amountLabel={amountLabel}
        qtyLabel="top-up"
        successHint="Adding funds to your wallet…"
        onClose={() => setPayOpen(false)}
        onSuccess={() => {
          const err = addMoney(usdAmount)
          setError(err)
          if (!err) {
            setPayOpen(false)
            onClose()
          }
        }}
      />
    </>
  )
}
