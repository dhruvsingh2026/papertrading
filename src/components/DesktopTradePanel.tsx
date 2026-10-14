import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  current?: MarketSymbol
  symbols: MarketSymbol[]
}

const QUICK_INR = [1000, 5000, 10000, 25000, 50000]
const QUICK_USD = [50, 100, 250, 500, 1000]

export function DesktopTradePanel({ current, symbols }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [inputMode, setInputMode] = useState<'cash' | 'qty'>('cash')
  const [inputValue, setInputValue] = useState('5000')
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const buy = usePaperStore((s) => s.buy)
  const sell = usePaperStore((s) => s.sell)
  const cash = usePaperStore((s) => s.cash)
  const positions = usePaperStore((s) => s.positions)
  const selectedSymbol = useSelectionStore((s) => s.selectedSymbol)
  const assetClass = useSelectionStore((s) => s.assetClass)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const { money, currency, usdInr } = useMoney()

  const price = current?.price ?? 0
  const position = positions.find((p) => p.symbol === selectedSymbol)
  const ownedQty = position?.qty ?? 0
  const avgEntryPrice = position?.avgPrice ?? 0

  const quickPresets = currency === 'INR' ? QUICK_INR : QUICK_USD

  // Calculate parsed quantity and cash value in USD
  const parsedNum = Number(inputValue)

  const { targetQty, totalCostUsd } = useMemo(() => {
    if (!Number.isFinite(parsedNum) || parsedNum <= 0 || price <= 0) {
      return { targetQty: 0, totalCostUsd: 0 }
    }

    if (inputMode === 'qty') {
      const q = parsedNum
      return { targetQty: q, totalCostUsd: q * price }
    } else {
      // Cash budget mode
      const usdBudget = currency === 'INR' ? parsedNum / usdInr : parsedNum
      const q = usdBudget / price
      return { targetQty: q, totalCostUsd: usdBudget }
    }
  }, [parsedNum, inputMode, price, currency, usdInr])

  // Realized P&L calculation for sell side
  const estRealizedPnl = useMemo(() => {
    if (side !== 'sell' || !position || targetQty <= 0) return 0
    return (price - avgEntryPrice) * Math.min(targetQty, ownedQty)
  }, [side, position, targetQty, ownedQty, price, avgEntryPrice])

  const balanceAfter = useMemo(() => {
    if (side === 'buy') {
      return Math.max(0, cash - totalCostUsd)
    } else {
      return cash + totalCostUsd
    }
  }, [side, cash, totalCostUsd])

  const validateOrder = (): string | null => {
    if (!current || price <= 0) {
      return 'Market quote is currently unavailable. Please pick another asset.'
    }
    if (!Number.isFinite(parsedNum) || parsedNum <= 0 || targetQty <= 0) {
      return 'Please enter a valid amount or quantity greater than zero.'
    }
    if (side === 'buy') {
      if (totalCostUsd > cash + 0.0001) {
        return `Insufficient paper cash. Order requires ${money(totalCostUsd)} but available cash is ${money(cash)}.`
      }
    } else {
      if (!position || ownedQty <= 0) {
        return `You do not hold any shares of ${selectedSymbol} to sell.`
      }
      if (targetQty > ownedQty + 1e-8) {
        return `Cannot sell ${formatQty(targetQty)} units. You currently own ${formatQty(ownedQty)} ${selectedSymbol}.`
      }
    }
    return null
  }

  const handleReviewOrder = () => {
    const err = validateOrder()
    setError(err)
    if (!err) {
      setPayOpen(true)
    }
  }

  const handleExecuteTrade = () => {
    if (!current) return
    const err =
      side === 'buy'
        ? buy(selectedSymbol, assetClass, targetQty, price)
        : sell(selectedSymbol, targetQty, price)

    setError(err)
    if (!err) {
      setToastMsg(`Successfully placed paper ${side.toUpperCase()} order for ${formatQty(targetQty)} ${selectedSymbol}!`)
      setInputValue('')
      setTimeout(() => setToastMsg(null), 4000)
    }
  }

  return (
    <aside className="desk-trade-panel" aria-label="Paper Order Ticket">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>PLACE PAPER ORDER</h2>
        <span style={{ fontSize: '0.72rem', background: 'var(--surface-2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
          SIMULATED
        </span>
      </div>

      {/* Side Toggle: BUY / SELL */}
      <div className="desk-buy-sell" role="tablist">
        <button
          type="button"
          className={side === 'buy' ? 'active buy' : ''}
          onClick={() => {
            setSide('buy')
            setError(null)
          }}
        >
          <ArrowDown size={16} />
          BUY
        </button>
        <button
          type="button"
          className={side === 'sell' ? 'active sell' : ''}
          onClick={() => {
            setSide('sell')
            setError(null)
            if (ownedQty > 0) {
              setInputMode('qty')
              setInputValue(String(ownedQty))
            }
          }}
        >
          <ArrowUp size={16} />
          SELL
        </button>
      </div>

      {/* Selected Asset Selector */}
      <label className="desk-field">
        <span>Trading Instrument</span>
        <select
          value={current?.id ?? ''}
          onChange={(e) => {
            const s = symbols.find((x) => x.id === e.target.value)
            if (s) setSelection(s.id, s.symbol, s.assetClass)
          }}
        >
          {symbols.map((s) => (
            <option key={s.id} value={s.id}>
              {s.symbol} — {s.name} ({s.assetClass})
            </option>
          ))}
        </select>
      </label>

      {/* Input Mode Selector: Cash Budget vs Units */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
        <span style={{ fontWeight: 600 }}>Order Mode</span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setInputMode('cash')}
            style={{
              border: 0,
              background: inputMode === 'cash' ? 'var(--ink)' : 'transparent',
              color: inputMode === 'cash' ? '#fff' : 'var(--secondary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cash ({currency})
          </button>
          <button
            type="button"
            onClick={() => setInputMode('qty')}
            style={{
              border: 0,
              background: inputMode === 'qty' ? 'var(--ink)' : 'transparent',
              color: inputMode === 'qty' ? '#fff' : 'var(--secondary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Quantity (Units)
          </button>
        </div>
      </div>

      {/* Amount / Quantity Input Field */}
      <label className="desk-field">
        <span>{inputMode === 'cash' ? `Order Amount (${currency})` : `Order Quantity (${selectedSymbol})`}</span>
        <div className="desk-amount-box">
          <input
            className="mono"
            inputMode="decimal"
            placeholder="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <span>{inputMode === 'cash' ? currency : selectedSymbol}</span>
        </div>
      </label>

      {/* Quick Amount Presets */}
      {inputMode === 'cash' && (
        <div className="desk-quick">
          {quickPresets.map((n) => (
            <button key={n} type="button" onClick={() => setInputValue(String(n))}>
              {currency === 'INR' ? `₹${n.toLocaleString('en-IN')}` : `$${n}`}
            </button>
          ))}
        </div>
      )}

      {/* Sell Max Shortcut */}
      {side === 'sell' && ownedQty > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              setInputMode('qty')
              setInputValue(String(ownedQty))
            }}
            style={{ fontSize: '0.78rem' }}
          >
            Sell All ({formatQty(ownedQty)} {selectedSymbol})
          </button>
        </div>
      )}

      {/* Financial Impact Breakdown */}
      <div style={{ padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem' }}>
        <div className="desk-est">
          <span>Target Quantity:</span>
          <b className="mono">{targetQty > 0 ? `${formatQty(targetQty)} ${selectedSymbol}` : '—'}</b>
        </div>
        <div className="desk-est">
          <span>Execution Price:</span>
          <b className="mono">{price > 0 ? money(price) : '—'}</b>
        </div>
        <div className="desk-est">
          <span>Estimated Total:</span>
          <strong className="mono" style={{ fontSize: '1rem', color: 'var(--ink)' }}>
            {totalCostUsd > 0 ? money(totalCostUsd) : '—'}
          </strong>
        </div>
        <div className="desk-est" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.45rem' }}>
          <span>Available Cash:</span>
          <b className="mono">
            {money(cash)}
          </b>
        </div>
        <div className="desk-est">
          <span>Projected Cash After:</span>
          <b className="mono">{money(balanceAfter)}</b>
        </div>
        {side === 'sell' && position && targetQty > 0 && (
          <div className="desk-est">
            <span>Est. Realized P&L:</span>
            <b className={`mono ${estRealizedPnl >= 0 ? 'up' : 'down'}`}>
              {estRealizedPnl >= 0 ? '+' : '−'}
              {money(Math.abs(estRealizedPnl))}
            </b>
          </div>
        )}
      </div>

      {error && <p className="ticket-error">{error}</p>}

      {toastMsg && (
        <div style={{ padding: '0.65rem', background: 'var(--up-soft)', border: '1px solid rgba(22, 135, 93, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--up)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        type="button"
        className={`desk-continue ${side}`}
        onClick={handleReviewOrder}
        disabled={price <= 0}
      >
        {side === 'buy' ? `Place Paper Buy Order` : `Place Paper Sell Order`}
      </button>

      <p className="desk-trade-foot">
        Simulated paper execution · No real currency or broker involved
      </p>

      {/* Simulated Checkout Confirmation Modal */}
      <PaymentDemo
        open={payOpen}
        side={side}
        symbol={selectedSymbol}
        amountLabel={money(totalCostUsd)}
        qtyLabel={formatQty(targetQty)}
        successHint={side === 'buy' ? `Executed buy of ${formatQty(targetQty)} ${selectedSymbol}` : `Executed sell of ${formatQty(targetQty)} ${selectedSymbol}`}
        onClose={() => setPayOpen(false)}
        onSuccess={handleExecuteTrade}
      />
    </aside>
  )
}
