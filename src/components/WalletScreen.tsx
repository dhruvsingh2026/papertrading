import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, Send } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct, formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'
import { ScreenHeader } from './ScreenHeader'

interface Props {
  symbols: MarketSymbol[]
  onAddMoney: () => void
  title?: string
}

function BalanceSpark({ up }: { up: boolean }) {
  const pts = up
    ? '0,36 20,30 40,32 60,22 80,26 100,14 120,18 140,8 160,12 180,4'
    : '0,8 20,14 40,12 60,20 80,18 100,28 120,24 140,34 160,30 180,38'
  return (
    <svg className="mob-spark" viewBox="0 0 180 42" aria-hidden>
      <polyline
        fill="none"
        stroke={up ? 'var(--up)' : 'var(--down)'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  )
}

export function WalletScreen({ symbols, onAddMoney, title = 'Portfolio' }: Props) {
  const positions = usePaperStore((s) => s.positions)
  const cash = usePaperStore((s) => s.cash)
  const setTab = useSelectionStore((s) => s.setTab)
  const openAsset = useSelectionStore((s) => s.openAsset)
  const { money } = useMoney()

  const priceMap = new Map(symbols.map((s) => [s.symbol, s]))
  const holdingsValue = positions.reduce((sum, p) => {
    const mark = priceMap.get(p.symbol)?.price ?? p.avgPrice
    return sum + p.qty * mark
  }, 0)
  const invested = positions.reduce((sum, p) => sum + p.qty * p.avgPrice, 0)
  const pnl = holdingsValue - invested
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
  const equity = cash + holdingsValue
  const up = pnl >= 0

  return (
    <div className="mob-screen">
      <ScreenHeader title={title} />

      <div className="mob-balance-card">
        <span className="mob-label">Total balance</span>
        <strong className="mono mob-balance">{money(equity)}</strong>
        <div className={up ? 'mob-change up' : 'mob-change down'}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
          {money(Math.abs(pnl))} ({formatPct(pnlPct)}) returns
        </div>
        <BalanceSpark up={up || equity === 0} />
        <div className="mob-pills">
          {['7D', '30D', '3M', '1Y', 'All'].map((t, i) => (
            <button key={t} type="button" className={i === 1 ? 'active' : undefined}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mob-quick">
        <button type="button" onClick={() => setTab('trade')}>
          <span className="mob-quick-icon">
            <Plus size={18} />
          </span>
          Buy
        </button>
        <button type="button" onClick={() => setTab('trade')}>
          <span className="mob-quick-icon">
            <RefreshCw size={18} />
          </span>
          Swap
        </button>
        <button type="button" onClick={onAddMoney}>
          <span className="mob-quick-icon">
            <ArrowDownLeft size={18} />
          </span>
          Add
        </button>
        <button type="button" onClick={() => setTab('activity')}>
          <span className="mob-quick-icon">
            <Send size={18} />
          </span>
          Activity
        </button>
      </div>

      <div className="mob-section-head">
        <h2>Your assets</h2>
        <button type="button" className="linkish" onClick={() => setTab('markets')}>
          See all
        </button>
      </div>

      {positions.length === 0 && cash === 0 ? (
        <div className="mob-empty">
          <p>Wallet is empty</p>
          <button type="button" className="btn primary" onClick={onAddMoney}>
            Add money
          </button>
        </div>
      ) : (
        <div className="mob-asset-list">
          <button type="button" className="mob-asset-row" onClick={onAddMoney}>
            <div className="mob-avatar soft">₹</div>
            <div className="mob-asset-main">
              <b>Cash</b>
              <small>Available balance</small>
            </div>
            <div className="mob-asset-meta">
              <b className="mono">{money(cash)}</b>
            </div>
          </button>
          {positions.map((p) => {
            const meta = priceMap.get(p.symbol)
            const mark = meta?.price ?? p.avgPrice
            const rowPct = p.avgPrice ? ((mark - p.avgPrice) / p.avgPrice) * 100 : 0
            const rowUp = rowPct >= 0
            return (
              <button
                key={p.id}
                type="button"
                className="mob-asset-row"
                onClick={() => {
                  if (meta) openAsset(meta.id, meta.symbol, meta.assetClass)
                }}
              >
                <div className="mob-avatar">
                  {meta?.image ? (
                    <img src={meta.image} alt="" />
                  ) : (
                    p.symbol.slice(0, 2)
                  )}
                </div>
                <div className="mob-asset-main">
                  <b>{meta?.name ?? p.symbol}</b>
                  <small>
                    {formatQty(p.qty)} {p.symbol}
                  </small>
                </div>
                <div className="mob-asset-meta">
                  <b className="mono">{money(mark * p.qty)}</b>
                  <span className={rowUp ? 'up' : 'down'}>{formatPct(rowPct)}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
