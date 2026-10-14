import { useMemo, useState } from 'react'
import { PieChart, RotateCcw } from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct, formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore } from '../store/appStore'

interface Props {
  symbols: MarketSymbol[]
}

export function PortfolioView({ symbols }: Props) {
  const positions = usePaperStore((s) => s.positions)
  const cash = usePaperStore((s) => s.cash)
  const reset = usePaperStore((s) => s.reset)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setDestination = useSelectionStore((s) => s.setDestination)
  const { money } = useMoney()

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  const priceMap = useMemo(() => new Map(symbols.map((s) => [s.symbol, s])), [symbols])

  const holdingsValue = useMemo(() => {
    return positions.reduce((sum, p) => {
      const mark = priceMap.get(p.symbol)?.price ?? p.avgPrice
      return sum + p.qty * mark
    }, 0)
  }, [positions, priceMap])

  const investedValue = useMemo(() => {
    return positions.reduce((sum, p) => sum + p.qty * p.avgPrice, 0)
  }, [positions])

  const totalPnl = holdingsValue - investedValue
  const totalPnlPct = investedValue > 0 ? (totalPnl / investedValue) * 100 : 0
  const totalEquity = cash + holdingsValue
  const isUp = totalPnl >= 0

  const handleTradePosition = (symbol: string) => {
    const meta = priceMap.get(symbol)
    if (meta) {
      setSelection(meta.id, meta.symbol, meta.assetClass)
      setDestination('trade')
    }
  }

  return (
    <section className="gw-portfolio">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>PORTFOLIO & HOLDINGS</h1>
          <p style={{ fontSize: '0.88rem' }}>Track your active positions, cost basis, and unrealized returns.</p>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setConfirmResetOpen(true)}
          style={{ color: 'var(--down)' }}
        >
          <RotateCcw size={15} />
          Reset Paper Portfolio
        </button>
      </div>

      {/* Portfolio Value Summary Card */}
      <div className="gw-port-card">
        <span className="gw-port-label">Total Portfolio Equity</span>
        <strong className="mono gw-port-value">{money(totalEquity)}</strong>
        <div className="gw-port-grid">
          <div>
            <span>Invested Cost Basis</span>
            <b className="mono">{money(investedValue)}</b>
          </div>
          <div>
            <span>Unrealized P&L</span>
            <b className={`mono ${isUp ? 'up' : 'down'}`}>
              {isUp ? '+' : '−'}
              {money(Math.abs(totalPnl))} ({formatPct(totalPnlPct)})
            </b>
          </div>
          <div>
            <span>Available Paper Cash</span>
            <b className="mono">{money(cash)}</b>
          </div>
        </div>
      </div>

      {/* Open Positions List */}
      <div className="gw-section-title">
        <h2>ALL POSITIONS ({positions.length})</h2>
        {positions.length > 0 && (
          <button type="button" className="btn primary small" onClick={() => setDestination('markets')}>
            + Buy New Instrument
          </button>
        )}
      </div>

      {positions.length === 0 ? (
        <div className="gw-empty-card">
          <PieChart size={38} style={{ color: 'var(--muted)' }} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No active holdings</p>
            <p style={{ fontSize: '0.88rem' }}>
              You do not have any open positions. Browse the markets to execute your first simulated trade.
            </p>
          </div>
          <button type="button" className="btn primary" onClick={() => setDestination('markets')}>
            Explore Markets
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table className="market-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th className="right">Units Held</th>
                <th className="right">Avg Entry Price</th>
                <th className="right">Current Price</th>
                <th className="right">Market Value</th>
                <th className="right">Unrealized P&L</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const meta = priceMap.get(p.symbol)
                const currentPrice = meta?.price ?? p.avgPrice
                const positionValue = p.qty * currentPrice
                const pnl = (currentPrice - p.avgPrice) * p.qty
                const pnlPct = p.avgPrice > 0 ? ((currentPrice - p.avgPrice) / p.avgPrice) * 100 : 0
                const posUp = pnl >= 0

                return (
                  <tr key={p.id}>
                    <td>
                      <div
                        onClick={() => handleTradePosition(p.symbol)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                      >
                        <div className="gw-avatar" style={{ width: '2.25rem', height: '2.25rem' }}>
                          {meta?.image ? (
                            <img src={meta.image} alt={p.symbol} />
                          ) : (
                            p.symbol.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--ink)' }}>
                            {p.symbol}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            {meta?.name ?? p.symbol}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="right mono" style={{ fontWeight: 600 }}>
                      {formatQty(p.qty)}
                    </td>

                    <td className="right mono">
                      {money(p.avgPrice)}
                    </td>

                    <td className="right mono" style={{ fontWeight: 600 }}>
                      {money(currentPrice)}
                    </td>

                    <td className="right mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                      {money(positionValue)}
                    </td>

                    <td className="right">
                      <span className={`change-pill ${posUp ? 'up' : 'down'} mono`}>
                        {posUp ? '+' : '−'}
                        {money(Math.abs(pnl))} ({formatPct(pnlPct)})
                      </span>
                    </td>

                    <td className="right">
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn ghost small"
                          onClick={() => handleTradePosition(p.symbol)}
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Resetting Portfolio */}
      {confirmResetOpen && (
        <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Confirm Portfolio Reset">
          <button type="button" className="pay-backdrop" onClick={() => setConfirmResetOpen(false)} />
          <div className="pay-sheet" style={{ maxWidth: '420px' }}>
            <h2 style={{ color: 'var(--down)' }}>RESET PAPER PORTFOLIO?</h2>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
              This will clear all your open positions, wipe your paper cash balance, and reset your transaction ledger. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn danger full"
                onClick={() => {
                  reset()
                  setConfirmResetOpen(false)
                }}
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                className="btn ghost full"
                onClick={() => setConfirmResetOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
