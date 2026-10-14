import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, History } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  symbols: MarketSymbol[]
  current?: MarketSymbol
}

export function TradeScreen({ symbols, current }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('2000')
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)

  const buy = usePaperStore((s) => s.buy)
  const sell = usePaperStore((s) => s.sell)
  const cash = usePaperStore((s) => s.cash)
  const positions = usePaperStore((s) => s.positions)
  const selectedSymbol = useSelectionStore((s) => s.selectedSymbol)
  const assetClass = useSelectionStore((s) => s.assetClass)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setDestination = useSelectionStore((s) => s.setDestination)
  const { money, currency, usdInr } = useMoney()

  const price = current?.price ?? 0
  const position = positions.find((p) => p.symbol === selectedSymbol)
  const ownedQty = position?.qty ?? 0
  const displayAmount = Number(amount)

  const usdCost = useMemo(() => {
    if (!Number.isFinite(displayAmount) || displayAmount <= 0) return 0
    return currency === 'INR' ? displayAmount / usdInr : displayAmount
  }, [displayAmount, currency, usdInr])

  const targetQty = useMemo(() => {
    if (price <= 0 || usdCost <= 0) return 0
    return side === 'buy' ? usdCost / price : displayAmount
  }, [side, price, usdCost, displayAmount])

  const effectiveTotalUsd = useMemo(() => {
    return side === 'buy' ? usdCost : targetQty * price
  }, [side, usdCost, targetQty, price])

  const validate = (): string | null => {
    if (!current || price <= 0) return 'Market quote is unavailable'
    if (!Number.isFinite(displayAmount) || displayAmount <= 0) return 'Enter a valid amount'
    if (side === 'buy') {
      if (effectiveTotalUsd > cash + 0.0001) {
        return `Insufficient cash. Need ${money(effectiveTotalUsd)} but available is ${money(cash)}.`
      }
    } else {
      if (!position || ownedQty <= 0) return `You don't own any ${selectedSymbol} to sell.`
      if (targetQty > ownedQty + 1e-8) {
        return `Cannot sell ${formatQty(targetQty)} units. You only have ${formatQty(ownedQty)} ${selectedSymbol}.`
      }
    }
    return null
  }

  const handleOpenReview = () => {
    const err = validate()
    setError(err)
    if (!err) setPayOpen(true)
  }

  const handleComplete = () => {
    if (!current) return
    const err =
      side === 'buy'
        ? buy(selectedSymbol, assetClass, targetQty, price)
        : sell(selectedSymbol, targetQty, price)

    setError(err)
    if (!err) {
      setAmount('')
      setDestination('portfolio')
    }
  }

  return (
    <div className="mob-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem' }}>SIMULATED TRADE</h1>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setDestination('activity')}
          title="Activity Ledger"
        >
          <History size={18} />
        </button>
      </div>

      {/* Side Selector */}
      <div className="desk-buy-sell" role="tablist">
        <button
          type="button"
          className={side === 'buy' ? 'active buy' : ''}
          onClick={() => {
            setSide('buy')
            setError(null)
          }}
        >
          <ArrowDown size={16} /> BUY
        </button>
        <button
          type="button"
          className={side === 'sell' ? 'active sell' : ''}
          onClick={() => {
            setSide('sell')
            setError(null)
            if (ownedQty > 0) setAmount(String(ownedQty))
          }}
        >
          <ArrowUp size={16} /> SELL
        </button>
      </div>

      {/* Asset Selector Dropdown */}
      <label className="field">
        <span>Select Instrument</span>
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

      {/* Interactive Order Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {side === 'buy' ? `Budget (${currency})` : `Units to sell (${selectedSymbol})`}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--secondary)' }}>
            Available: <strong>{side === 'buy' ? money(cash) : `${formatQty(ownedQty)} ${selectedSymbol}`}</strong>
          </span>
        </div>

        <div className="desk-amount-box">
          <input
            className="mono"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span>{side === 'buy' ? currency : selectedSymbol}</span>
        </div>

        {side === 'sell' && ownedQty > 0 && (
          <button
            type="button"
            className="linkish"
            onClick={() => setAmount(String(ownedQty))}
            style={{ alignSelf: 'flex-end', fontSize: '0.78rem' }}
          >
            Sell All ({formatQty(ownedQty)} {selectedSymbol})
          </button>
        )}

        <div style={{ padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--secondary)' }}>Market Price:</span>
            <strong className="mono">{price > 0 ? money(price) : '—'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--secondary)' }}>Target Units:</span>
            <strong className="mono">{targetQty > 0 ? `${formatQty(targetQty)} ${selectedSymbol}` : '—'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.35rem' }}>
            <span style={{ color: 'var(--secondary)' }}>Est. Total:</span>
            <strong className="mono" style={{ color: 'var(--ink)' }}>{effectiveTotalUsd > 0 ? money(effectiveTotalUsd) : '—'}</strong>
          </div>
        </div>
      </div>

      {error && <p className="ticket-error">{error}</p>}

      <button
        type="button"
        className={`btn ${side === 'buy' ? 'primary' : 'danger'} full large`}
        onClick={handleOpenReview}
      >
        Review & Place Paper {side.toUpperCase()}
      </button>

      <p className="disclaimer" style={{ textAlign: 'center' }}>
        Paper-trading simulation · No real money debited or invested
      </p>

      <PaymentDemo
        open={payOpen}
        side={side}
        symbol={selectedSymbol}
        amountLabel={money(effectiveTotalUsd)}
        qtyLabel={formatQty(targetQty)}
        onClose={() => setPayOpen(false)}
        onSuccess={handleComplete}
      />
    </div>
  )
}
