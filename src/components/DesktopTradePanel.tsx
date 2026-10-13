import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { PaymentDemo } from './PaymentDemo'

interface Props {
  current?: MarketSymbol
  symbols: MarketSymbol[]
}

const QUICK_INR = [50, 100, 500, 1000, 2000]
const QUICK_USD = [50, 100, 500, 1000, 2000]

export function DesktopTradePanel({ current, symbols }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('1500')
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
  const quick = currency === 'INR' ? QUICK_INR : QUICK_USD

  const qty =
    side === 'buy'
      ? price > 0
        ? (currency === 'INR' ? displayAmount / usdInr : displayAmount) / price
        : 0
      : displayAmount

  const estLabel = useMemo(() => {
    if (!Number.isFinite(qty) || qty <= 0) return '—'
    if (side === 'buy') return `${formatQty(qty)} ${selectedSymbol}`
    return money(qty * price)
  }, [qty, side, selectedSymbol, price, money])

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
      if (qty * price > cash) {
        setError('Insufficient balance — use Transfer to add money')
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
    <aside className="desk-trade-panel">
      <h2>Make a trade</h2>

      <div className="desk-buy-sell">
        <button
          type="button"
          className={side === 'buy' ? 'active buy' : undefined}
          onClick={() => setSide('buy')}
        >
          <span className="desk-side-dot">
            <ArrowDown size={14} />
          </span>
          BUY
        </button>
        <button
          type="button"
          className={side === 'sell' ? 'active sell' : undefined}
          onClick={() => setSide('sell')}
        >
          <span className="desk-side-dot">
            <ArrowUp size={14} />
          </span>
          SELL
        </button>
      </div>

      <label className="desk-field">
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

      <label className="desk-field">
        <span>How often?</span>
        <select defaultValue="once" disabled>
          <option value="once">ONCE</option>
        </select>
      </label>

      <label className="desk-field">
        <span>How much?</span>
        <div className="desk-amount-box">
          <input
            className="mono"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span>{side === 'buy' ? currency : selectedSymbol}</span>
        </div>
      </label>

      {side === 'buy' && (
        <div className="desk-quick">
          {quick.map((n) => (
            <button key={n} type="button" onClick={() => setAmount(String(n))}>
              {currency === 'INR' ? `₹${n}` : `$${n}`}
            </button>
          ))}
        </div>
      )}

      <div className="desk-est">
        <span>{side === 'buy' ? 'You get' : 'You receive'}</span>
        <b className="mono">{estLabel}</b>
      </div>
      <div className="desk-est">
        <span>Balance</span>
        <b className="mono">
          {side === 'buy' ? money(cash) : `${formatQty(position?.qty ?? 0)} ${selectedSymbol}`}
        </b>
      </div>

      {error && <p className="ticket-error">{error}</p>}

      <button type="button" className="desk-continue" onClick={openReview}>
        CONTINUE
      </button>
      <p className="desk-trade-foot">Demo paper trade · no real money</p>

      <PaymentDemo
        open={payOpen}
        side={side}
        symbol={selectedSymbol}
        amountLabel={money(side === 'buy' ? qty * price : qty * price)}
        qtyLabel={formatQty(qty)}
        onClose={() => setPayOpen(false)}
        onSuccess={complete}
      />
    </aside>
  )
}
