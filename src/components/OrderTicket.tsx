import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  current?: MarketSymbol
}

export function OrderTicket({ current }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const buy = usePaperStore((s) => s.buy)
  const sell = usePaperStore((s) => s.sell)
  const cash = usePaperStore((s) => s.cash)
  const reset = usePaperStore((s) => s.reset)
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

  const validate = (): string | null => {
    if (!current || price <= 0) return 'No live price'
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return 'Invalid quantity'
    if (side === 'buy' && notional > cash) return 'Insufficient cash'
    if (side === 'sell') {
      if (!position) return 'No position'
      if (qtyNum > position.qty) return 'Not enough shares'
    }
    return null
  }

  const openPayment = () => {
    const err = validate()
    setError(err)
    if (!err) setPayOpen(true)
  }

  const completeTrade = () => {
    if (!current) return
    const err =
      side === 'buy'
        ? buy(selectedSymbol, assetClass, qtyNum, price)
        : sell(selectedSymbol, qtyNum, price)
    setError(err)
    if (!err) {
      setQty(side === 'buy' ? '1' : String(Math.min(qtyNum, position?.qty ?? qtyNum)))
    }
  }

  return (
    <aside className="ticket">
      <div className="panel-head">
        <h2>Paper ticket</h2>
        <button type="button" className="icon-btn" onClick={reset} title="Reset paper account">
          <RotateCcw size={15} strokeWidth={1.75} />
        </button>
      </div>

      <div className="side-toggle">
        <button
          type="button"
          className={side === 'buy' ? 'side buy active' : 'side buy'}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          type="button"
          className={side === 'sell' ? 'side sell active' : 'side sell'}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>

      <label className="field">
        <span>Symbol</span>
        <div className="field-value mono">{selectedSymbol}</div>
      </label>

      <label className="field">
        <span>Price ({currency})</span>
        <div className="field-value mono">{money(price)}</div>
      </label>

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
          <span>Est. total</span>
          <strong className="mono">{money(notional)}</strong>
        </div>
        <div>
          <span>Cash</span>
          <strong className="mono">{money(cash)}</strong>
        </div>
        {position && (
          <div>
            <span>Position</span>
            <strong className="mono">{formatQty(position.qty)}</strong>
          </div>
        )}
      </div>

      {error && <p className="ticket-error">{error}</p>}

      <button
        type="button"
        className={side === 'buy' ? 'submit buy' : 'submit sell'}
        onClick={openPayment}
        disabled={!current || price <= 0}
      >
        {side === 'buy' ? 'Pay & buy' : 'Cash out & sell'} {selectedSymbol}
      </button>

      <p className="disclaimer">
        Opens a demo UPI/card gateway · no real charge · {currency} display
      </p>

      <PaymentDemo
        open={payOpen}
        side={side}
        symbol={selectedSymbol}
        amountLabel={money(notional)}
        qtyLabel={formatQty(qtyNum)}
        onClose={() => setPayOpen(false)}
        onSuccess={completeTrade}
      />
    </aside>
  )
}
