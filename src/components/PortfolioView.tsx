import type { MarketSymbol } from '../types/market'
import { formatPct, formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'

interface Props {
  symbols: MarketSymbol[]
}

export function PortfolioView({ symbols }: Props) {
  const positions = usePaperStore((s) => s.positions)
  const trades = usePaperStore((s) => s.trades)
  const cash = usePaperStore((s) => s.cash)
  const reset = usePaperStore((s) => s.reset)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setTab = useSelectionStore((s) => s.setTab)
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

  return (
    <section className="gw-portfolio">
      <div className="gw-port-card">
        <span className="gw-port-label">Total value</span>
        <strong className="mono gw-port-value">{money(equity)}</strong>
        <div className="gw-port-grid">
          <div>
            <span>Invested</span>
            <b className="mono">{money(invested)}</b>
          </div>
          <div>
            <span>Returns</span>
            <b className={pnl >= 0 ? 'mono up' : 'mono down'}>
              {money(pnl)} ({formatPct(pnlPct)})
            </b>
          </div>
          <div>
            <span>Balance</span>
            <b className="mono">{money(cash)}</b>
          </div>
        </div>
      </div>

      <div className="gw-section-title">
        <h2>Holdings</h2>
        <button type="button" className="btn ghost" onClick={reset}>
          Reset
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="gw-empty-card">
          <p>No holdings yet</p>
          <button type="button" className="btn primary" onClick={() => setTab('markets')}>
            Explore markets
          </button>
        </div>
      ) : (
        <div className="gw-list">
          {positions.map((p) => {
            const meta = priceMap.get(p.symbol)
            const mark = meta?.price ?? p.avgPrice
            const rowPnl = (mark - p.avgPrice) * p.qty
            const rowPct = p.avgPrice ? ((mark - p.avgPrice) / p.avgPrice) * 100 : 0
            const up = rowPnl >= 0
            return (
              <button
                key={p.id}
                type="button"
                className="gw-row"
                onClick={() => {
                  if (meta) {
                    setSelection(meta.id, meta.symbol, meta.assetClass)
                    setTab('markets')
                  }
                }}
              >
                <div className="gw-avatar fallback">{p.symbol.slice(0, 2)}</div>
                <div className="gw-row-main">
                  <span className="gw-row-name">{p.symbol}</span>
                  <span className="gw-row-sub">
                    {formatQty(p.qty)} · Avg {money(p.avgPrice)}
                  </span>
                </div>
                <div className="gw-row-meta">
                  <span className="mono gw-row-price">{money(mark * p.qty)}</span>
                  <span className={up ? 'gw-chip up' : 'gw-chip down'}>
                    {formatPct(rowPct)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {trades.length > 0 && (
        <>
          <div className="gw-section-title">
            <h2>Recent orders</h2>
          </div>
          <div className="gw-orders">
            {trades.slice(0, 8).map((t) => (
              <div key={t.id} className="gw-order">
                <span className={t.type === 'buy' ? 'down' : 'up'}>{t.type.toUpperCase()}</span>
                <span className="mono">
                  {t.type === 'deposit'
                    ? `Deposit · ${money(t.price)}`
                    : `${t.symbol} · ${formatQty(t.qty)} @ ${money(t.price)}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
