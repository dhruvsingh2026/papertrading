import type { MarketSymbol } from '../types/market'
import { formatPct, formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore } from '../store/appStore'

interface Props {
  symbols: MarketSymbol[]
}

export function PositionsBar({ symbols }: Props) {
  const positions = usePaperStore((s) => s.positions)
  const trades = usePaperStore((s) => s.trades)
  const cash = usePaperStore((s) => s.cash)
  const { money } = useMoney()

  const priceMap = new Map(symbols.map((s) => [s.symbol, s.price]))
  const equity =
    cash +
    positions.reduce((sum, p) => sum + p.qty * (priceMap.get(p.symbol) ?? p.avgPrice), 0)

  return (
    <footer className="bottombar">
      <div className="bottom-stats">
        <div>
          <span>Equity</span>
          <strong className="mono">{money(equity)}</strong>
        </div>
        <div>
          <span>Cash</span>
          <strong className="mono">{money(cash)}</strong>
        </div>
        <div>
          <span>Open</span>
          <strong className="mono">{positions.length}</strong>
        </div>
      </div>

      <div className="bottom-scroll">
        {positions.length === 0 && trades.length === 0 && (
          <p className="empty">No paper positions yet — place a trade from the ticket.</p>
        )}
        {positions.map((p) => {
          const mark = priceMap.get(p.symbol) ?? p.avgPrice
          const pnl = (mark - p.avgPrice) * p.qty
          const pnlPct = p.avgPrice ? ((mark - p.avgPrice) / p.avgPrice) * 100 : 0
          const up = pnl >= 0
          return (
            <div key={p.id} className="position-chip">
              <span className="mono">{p.symbol}</span>
              <span className="muted">
                {formatQty(p.qty)} @ {money(p.avgPrice)}
              </span>
              <span className={up ? 'up mono' : 'down mono'}>
                {money(pnl)} ({formatPct(pnlPct)})
              </span>
            </div>
          )
        })}
        {trades.slice(0, 6).map((t) => (
          <div key={t.id} className="trade-chip">
            <span className={t.type === 'buy' ? 'down' : 'up'}>{t.type.toUpperCase()}</span>
            <span className="mono">
              {t.type === 'deposit'
                ? `Deposit @ ${money(t.price)}`
                : `${t.symbol} ${formatQty(t.qty)} @ ${money(t.price)}`}
            </span>
          </div>
        ))}
      </div>
    </footer>
  )
}
