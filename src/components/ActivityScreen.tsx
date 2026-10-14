import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore } from '../store/appStore'

type Filter = 'all' | 'trades' | 'transfers'

function formatDateTime(at: number) {
  const d = new Date(at)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityScreen() {
  const trades = usePaperStore((s) => s.trades)
  const cash = usePaperStore((s) => s.cash)
  const { money } = useMoney()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    if (filter === 'transfers') return trades.filter((t) => t.type === 'deposit')
    if (filter === 'trades') return trades.filter((t) => t.type === 'buy' || t.type === 'sell')
    return trades
  }, [trades, filter])

  const totalDeposits = useMemo(() => {
    return trades.filter((t) => t.type === 'deposit').reduce((sum, t) => sum + t.cashDelta, 0)
  }, [trades])

  const totalTradesCount = useMemo(() => {
    return trades.filter((t) => t.type === 'buy' || t.type === 'sell').length
  }, [trades])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>TRANSACTION LEDGER & ACTIVITY</h1>
          <p style={{ fontSize: '0.88rem' }}>Chronological audit trail of all paper trades and virtual wallet deposits.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Current Cash Balance
          </span>
          <strong className="mono" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.25rem', color: 'var(--ink)' }}>
            {money(cash)}
          </strong>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Virtual Funded
          </span>
          <strong className="mono" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.25rem', color: 'var(--up)' }}>
            {money(totalDeposits)}
          </strong>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Executed Trades Count
          </span>
          <strong className="mono" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.25rem' }}>
            {totalTradesCount}
          </strong>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="market-filter-chips">
        {(
          [
            ['all', 'All Activity'],
            ['trades', 'Trades Only'],
            ['transfers', 'Deposits & Funding'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={filter === id ? 'active' : undefined}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      {filtered.length === 0 ? (
        <div className="gw-empty-card">
          <History size={36} style={{ color: 'var(--muted)' }} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No entries in ledger</p>
            <p style={{ fontSize: '0.88rem' }}>Transactions will appear here when you add money or execute a trade.</p>
          </div>
        </div>
      ) : (
        <div className="ledger-table">
          <div className="ledger-head">
            <span>Date & Time</span>
            <span>Type</span>
            <span>Transaction Details</span>
            <span style={{ textAlign: 'right' }}>Cash Impact</span>
            <span style={{ textAlign: 'right' }}>Balance After</span>
          </div>
          {filtered.map((t) => {
            const inflow = t.cashDelta >= 0
            return (
              <div key={t.id} className="ledger-row">
                <span className="muted" style={{ fontSize: '0.8rem' }}>
                  {formatDateTime(t.at)}
                </span>
                <div>
                  <span className={`ledger-badge ${t.type}`}>
                    {t.type}
                  </span>
                </div>
                <div>
                  {t.type === 'deposit' ? (
                    <span>{t.note ?? 'Virtual wallet top-up'}</span>
                  ) : (
                    <div>
                      <strong style={{ display: 'block', color: 'var(--ink)' }}>
                        {t.type === 'buy' ? 'Bought' : 'Sold'} {formatQty(t.qty)} {t.symbol}
                      </strong>
                      <small style={{ color: 'var(--secondary)', fontSize: '0.78rem' }}>
                        Fill Price: {money(t.price)} {t.note ? `· ${t.note}` : ''}
                      </small>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b className={`mono ${inflow ? 'up' : 'down'}`}>
                    {inflow ? '+' : '−'}
                    {money(Math.abs(t.cashDelta))}
                  </b>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="mono" style={{ fontWeight: 600 }}>{money(t.balanceAfter)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
