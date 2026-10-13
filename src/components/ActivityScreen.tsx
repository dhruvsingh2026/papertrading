import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react'
import { formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, type LedgerEntry } from '../store/appStore'
import { ScreenHeader } from './ScreenHeader'

type Filter = 'all' | 'trades' | 'transfers'

function dayLabel(at: number) {
  const d = new Date(at)
  const today = new Date()
  const yest = new Date()
  yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeLabel(at: number) {
  return new Date(at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function ActivityScreen() {
  const trades = usePaperStore((s) => s.trades)
  const { money } = useMoney()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    if (filter === 'transfers') return trades.filter((t) => t.type === 'deposit')
    if (filter === 'trades') return trades.filter((t) => t.type === 'buy' || t.type === 'sell')
    return trades
  }, [trades, filter])

  const groups = useMemo(() => {
    const map = new Map<string, LedgerEntry[]>()
    for (const t of filtered) {
      const key = dayLabel(t.at)
      const list = map.get(key) ?? []
      list.push(t)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div className="mob-screen">
      <ScreenHeader title="Activity" />

      <div className="mob-chips">
        {(
          [
            ['all', 'All'],
            ['trades', 'Trades'],
            ['transfers', 'Transfers'],
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

      {groups.length === 0 ? (
        <div className="mob-empty">
          <p>No activity yet</p>
        </div>
      ) : (
        groups.map(([day, rows]) => (
          <div key={day} className="mob-day-group">
            <h3>{day}</h3>
            {rows.map((t) => {
              const inflow = t.cashDelta >= 0
              return (
                <div key={t.id} className="mob-activity-row">
                  <div className={inflow ? 'mob-act-icon in' : 'mob-act-icon out'}>
                    {t.type === 'deposit' ? (
                      <Plus size={16} />
                    ) : inflow ? (
                      <ArrowDownLeft size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>
                  <div className="mob-asset-main">
                    <b>
                      {t.type === 'deposit'
                        ? 'Added money'
                        : t.type === 'buy'
                          ? `Bought ${t.symbol}`
                          : `Sold ${t.symbol}`}
                    </b>
                    <small>{timeLabel(t.at)}</small>
                  </div>
                  <div className="mob-asset-meta">
                    <b className={inflow ? 'mono up' : 'mono down'}>
                      {inflow ? '+' : '−'}
                      {money(Math.abs(t.cashDelta))}
                    </b>
                    <small className="mono">
                      {t.type === 'deposit' ? 'Wallet' : `${formatQty(t.qty)} ${t.symbol}`}
                    </small>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
