import { useMoney } from '../hooks/useMoney'
import { formatQty } from '../lib/format'
import { usePaperStore } from '../store/appStore'

function formatWhen(at: number) {
  return new Date(at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LedgerView() {
  const trades = usePaperStore((s) => s.trades)
  const cash = usePaperStore((s) => s.cash)
  const { money } = useMoney()

  const deposits = trades.filter((t) => t.type === 'deposit').length
  const buys = trades.filter((t) => t.type === 'buy').length
  const sells = trades.filter((t) => t.type === 'sell').length

  return (
    <section className="gw-portfolio">
      <div className="gw-port-card">
        <span className="gw-port-label">Cash ledger</span>
        <strong className="mono gw-port-value">{money(cash)}</strong>
        <div className="gw-port-grid">
          <div>
            <span>Deposits</span>
            <b className="mono">{deposits}</b>
          </div>
          <div>
            <span>Buys</span>
            <b className="mono">{buys}</b>
          </div>
          <div>
            <span>Sells</span>
            <b className="mono">{sells}</b>
          </div>
        </div>
      </div>

      <div className="gw-section-title">
        <h2>All entries</h2>
      </div>

      {trades.length === 0 ? (
        <div className="gw-empty-card">
          <p>No ledger entries yet. Add money or place a trade.</p>
        </div>
      ) : (
        <div className="ledger-table">
          <div className="ledger-head">
            <span>When</span>
            <span>Type</span>
            <span>Detail</span>
            <span>Cash</span>
            <span>Balance</span>
          </div>
          {trades.map((t) => (
            <div key={t.id} className="ledger-row">
              <span className="muted">{formatWhen(t.at)}</span>
              <span className={t.type === 'buy' ? 'down' : 'up'}>{t.type.toUpperCase()}</span>
              <span className="mono">
                {t.type === 'deposit'
                  ? t.note ?? 'Wallet top-up'
                  : `${t.symbol} · ${formatQty(t.qty)} @ ${money(t.price)}`}
              </span>
              <span className={t.cashDelta >= 0 ? 'up mono' : 'down mono'}>
                {t.cashDelta >= 0 ? '+' : ''}
                {money(Math.abs(t.cashDelta))}
              </span>
              <span className="mono">{money(t.balanceAfter)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
