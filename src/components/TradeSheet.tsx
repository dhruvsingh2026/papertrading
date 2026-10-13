import { useMemo, useState } from 'react'
import type { MarketSymbol } from '../types/market'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  open: boolean
  side: 'buy' | 'sell'
  current?: MarketSymbol
  onClose: () => void
}

export function TradeSheet({ open, side, current, onClose }: Props) {
  const [qty, setQty] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const buy = usePaperStore((s) => s.buy)
  const sell = usePaperStore((s) => s.sell)
  const cash = usePaperStore((s) => s.cash)
  const positions = usePaperStore((s) => s.positions)
  const selectedSymbol = useSelectionStore((s) => s.selectedSymbol)
  const assetClass = useSelectionStore((s) => s.assetClass)
  const { money, currency } = useMoney()

  const price = current?.price ?? 0
  const position = positions.find((p) => p.symbol === selectedSymbol)
  const qtyNum = Number(qty)
  const notional = useMemo(() => {
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return 0
    return qtyNum * price
  }, [qtyNum, price])

  if (!open) return null

  const validate = (): string | null => {
    if (!current || price <= 0) return 'No live price'
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return 'Invalid quantity'
    if (side === 'buy' && notional > cash) return 'Insufficient balance — add money'
    if (side === 'sell') {
      if (!position) return 'No holdings'
      if (qtyNum > position.qty) return 'Not enough quantity'
    }
    return null
  }

  const completeTrade = () => {
    if (!current) return
    const err =
      side === 'buy'
        ? buy(selectedSymbol, assetClass, qtyNum, price)
        : sell(selectedSymbol, qtyNum, price)
    setError(err)
    if (!err) {
      setQty('1')
      onClose()
    }
  }

  return (
    <>
      <div className="pay-overlay" role="dialog" aria-modal="true">
        <button type="button" className="pay-backdrop" aria-label="Close" onClick={onClose} />
        <div className="pay-sheet gw-trade-sheet">
          <p className="pay-badge">DEMO · paper trade</p>
          <h2>
            {side === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}
          </h2>
          <p className="pay-sub">
            {current?.name} · {money(price)}
          </p>

          <label className="field">
            <span>Quantity</span>
            <input
              className="mono"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputMode="decimal"
            />
          </label>

          <div className="ticket-summary">
            <div>
              <span>Est. amount</span>
              <strong className="mono">{money(notional)}</strong>
            </div>
            <div>
              <span>Balance</span>
              <strong className="mono">{money(cash)}</strong>
            </div>
            {position && (
              <div>
                <span>Holdings</span>
                <strong className="mono">{formatQty(position.qty)}</strong>
              </div>
            )}
          </div>

          {error && <p className="ticket-error">{error}</p>}

          <button
            type="button"
            className={side === 'buy' ? 'submit buy' : 'submit sell'}
            onClick={() => {
              const err = validate()
              setError(err)
              if (!err) setPayOpen(true)
            }}
          >
            Continue · {money(notional)} ({currency})
          </button>
          <button type="button" className="btn ghost full" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      <PaymentDemo
        open={payOpen}
        side={side}
        symbol={selectedSymbol}
        amountLabel={money(notional)}
        qtyLabel={formatQty(qtyNum)}
        onClose={() => setPayOpen(false)}
        onSuccess={completeTrade}
      />
    </>
  )
}
