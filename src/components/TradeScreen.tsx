import { useMemo, useState } from 'react'
import { ArrowDownUp, History } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'
import { ScreenHeader } from './ScreenHeader'

interface Props {
  symbols: MarketSymbol[]
  current?: MarketSymbol
}

export function TradeScreen({ symbols, current }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const buy = usePaperStore((s) => s.buy)
  const sell = usePaperStore((s) => s.sell)
  const cash = usePaperStore((s) => s.cash)
  const positions = usePaperStore((s) => s.positions)
  const selectedSymbol = useSelectionStore((s) => s.selectedSymbol)
  const assetClass = useSelectionStore((s) => s.assetClass)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setTab = useSelectionStore((s) => s.setTab)
  const { money, currency, usdInr } = useMoney()

  const price = current?.price ?? 0
  const position = positions.find((p) => p.symbol === selectedSymbol)
  const displayAmount = Number(amount)
  const usdSpend =
    currency === 'INR' && side === 'buy'
      ? displayAmount / usdInr
      : side === 'buy'
        ? displayAmount
        : displayAmount * price

  const qty =
    side === 'buy'
      ? price > 0
        ? (currency === 'INR' ? displayAmount / usdInr : displayAmount) / price
        : 0
      : displayAmount

  const youGetLabel = useMemo(() => {
    if (!Number.isFinite(qty) || qty <= 0) return '—'
    if (side === 'buy') return `${formatQty(qty)} ${selectedSymbol}`
    return money(qty * price)
  }, [qty, side, selectedSymbol, price, money])

  const youPayLabel = side === 'buy' ? `${currency} amount` : `${selectedSymbol} qty`

  const openReview = () => {
    if (!current || price <= 0) {
      setError('Pick a market first')
      return
    }
    if (!Number.isFinite(displayAmount) || displayAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (side === 'buy') {
      const cost = qty * price
      if (cost > cash) {
        setError('Insufficient balance — add money in Profile')
        return
      }
    } else if (!position || qty > position.qty) {
      setError('Not enough holdings')
      return
    }
    setError(null)
    setPayOpen(true)
  }

  const complete = () => {
    if (!current) return
    const err =
      side === 'buy'
        ? buy(selectedSymbol, assetClass, qty, price)
        : sell(selectedSymbol, qty, price)
    setError(err)
    if (!err) {
      setAmount('')
      setTab('wallet')
    }
  }

  return (
    <div className="mob-screen">
      <ScreenHeader title="Trade" />
      <div className="mob-trade-tools">
        <button type="button" className="mob-icon-btn" onClick={() => setTab('activity')}>
          <History size={18} />
        </button>
      </div>

      <div className="mob-segment">
        <button
          type="button"
          className={side === 'buy' ? 'active' : undefined}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          type="button"
          className={side === 'sell' ? 'active sell' : undefined}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>

      <label className="field mob-select">
        <span>Asset</span>
        <select
          value={current?.id ?? ''}
          onChange={(e) => {
            const s = symbols.find((x) => x.id === e.target.value)
            if (s) setSelection(s.id, s.symbol, s.assetClass)
          }}
        >
          {symbols.slice(0, 80).map((s) => (
            <option key={s.id} value={s.id}>
              {s.symbol} — {s.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mob-trade-card">
        <div className="mob-trade-block">
          <div className="mob-trade-block-top">
            <span>{side === 'buy' ? 'You pay' : 'You sell'}</span>
            <small>
              Bal:{' '}
              {side === 'buy'
                ? money(cash)
                : `${formatQty(position?.qty ?? 0)} ${selectedSymbol}`}
            </small>
          </div>
          <div className="mob-trade-input-row">
            <input
              className="mono"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="mob-chip">{side === 'buy' ? currency : selectedSymbol}</span>
          </div>
          <small className="muted">{youPayLabel}</small>
        </div>

        <button
          type="button"
          className="mob-swap-flip"
          aria-label="Flip"
          onClick={() => setSide((s) => (s === 'buy' ? 'sell' : 'buy'))}
        >
          <ArrowDownUp size={18} />
        </button>

        <div className="mob-trade-block">
          <div className="mob-trade-block-top">
            <span>{side === 'buy' ? 'You get' : 'You receive'}</span>
            <small>Price {money(price)}</small>
          </div>
          <div className="mob-trade-input-row">
            <strong className="mono mob-get">{youGetLabel}</strong>
            <span className="mob-chip">{side === 'buy' ? selectedSymbol : currency}</span>
          </div>
        </div>
      </div>

      <div className="mob-trade-meta">
        <div>
          <span>Est. total</span>
          <b className="mono">
            {side === 'buy' ? money(Number.isFinite(usdSpend) ? usdSpend : 0) : money(qty * price)}
          </b>
        </div>
        <div>
          <span>Network fee</span>
          <b>Demo · ₹0</b>
        </div>
        <div>
          <span>Slippage</span>
          <b>Paper fill</b>
        </div>
      </div>

      {error && <p className="ticket-error">{error}</p>}

      <button
        type="button"
        className={side === 'buy' ? 'btn primary large full' : 'btn danger large full'}
        onClick={openReview}
      >
        Review {side}
      </button>
      <p className="mob-footnote">Demo payment · no real money</p>

      <PaymentDemo
        open={payOpen}
        side={side}
        symbol={selectedSymbol}
        amountLabel={
          side === 'buy' ? money(qty * price) : money(qty * price)
        }
        qtyLabel={formatQty(qty)}
        onClose={() => setPayOpen(false)}
        onSuccess={complete}
      />
    </div>
  )
}
