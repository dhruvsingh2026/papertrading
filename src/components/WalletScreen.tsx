import { useMemo } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CandlestickChart,
  Coins,
  PieChart,
} from 'lucide-react'
import type { MarketSymbol } from '../types/market'
import { formatPct, formatQty } from '../lib/format'
import { useMoney } from '../hooks/useMoney'
import { usePaperStore, useSelectionStore, useWatchlistStore } from '../store/appStore'

interface Props {
  symbols: MarketSymbol[]
  onAddMoney: () => void
  title?: string
}

export function WalletScreen({ symbols, onAddMoney, title = 'Overview' }: Props) {
  const positions = usePaperStore((s) => s.positions)
  const cash = usePaperStore((s) => s.cash)
  const trades = usePaperStore((s) => s.trades)
  const claimStarterPack = usePaperStore((s) => s.claimStarterPack)
  const setDestination = useSelectionStore((s) => s.setDestination)
  const openAsset = useSelectionStore((s) => s.openAsset)
  const watchIds = useWatchlistStore((s) => s.ids)
  const { money } = useMoney()

  const priceMap = useMemo(() => new Map(symbols.map((s) => [s.symbol, s])), [symbols])

  // Portfolio calculations
  const holdingsValue = useMemo(() => {
    return positions.reduce((sum, p) => {
      const mark = priceMap.get(p.symbol)?.price ?? p.avgPrice
      return sum + p.qty * mark
    }, 0)
  }, [positions, priceMap])

  const investedValue = useMemo(() => {
    return positions.reduce((sum, p) => sum + p.qty * p.avgPrice, 0)
  }, [positions])

  const unrealizedPnl = holdingsValue - investedValue
  const unrealizedPnlPct = investedValue > 0 ? (unrealizedPnl / investedValue) * 100 : 0
  const totalEquity = cash + holdingsValue
  const isUp = unrealizedPnl >= 0

  // Today's estimated P&L based on 24h asset movements
  const estTodayPnl = useMemo(() => {
    return positions.reduce((sum, p) => {
      const meta = priceMap.get(p.symbol)
      if (!meta) return sum
      const mark = meta.price
      const currentVal = p.qty * mark
      const pct = meta.changePct24h / 100
      return sum + currentVal * pct
    }, 0)
  }, [positions, priceMap])

  // Allocation breakdown
  const cryptoValue = useMemo(() => {
    return positions
      .filter((p) => p.assetClass === 'crypto')
      .reduce((sum, p) => sum + p.qty * (priceMap.get(p.symbol)?.price ?? p.avgPrice), 0)
  }, [positions, priceMap])

  const stockValue = useMemo(() => {
    return positions
      .filter((p) => p.assetClass === 'stock')
      .reduce((sum, p) => sum + p.qty * (priceMap.get(p.symbol)?.price ?? p.avgPrice), 0)
  }, [positions, priceMap])

  const cashPct = totalEquity > 0 ? (cash / totalEquity) * 100 : 100
  const cryptoPct = totalEquity > 0 ? (cryptoValue / totalEquity) * 100 : 0
  const stockPct = totalEquity > 0 ? (stockValue / totalEquity) * 100 : 0

  // Starred / Watchlist symbols for quick overview
  const starredSymbols = useMemo(() => {
    return symbols.filter((s) => watchIds.includes(s.id)).slice(0, 4)
  }, [symbols, watchIds])

  return (
    <div className="gw-portfolio">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>{title}</h1>
          <p style={{ fontSize: '0.88rem' }}>Live paper-trading summary and asset allocation.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn ghost" onClick={() => setDestination('markets')}>
            <CandlestickChart size={16} />
            Explore Markets
          </button>
          <button type="button" className="btn primary" onClick={onAddMoney}>
            <ArrowDownLeft size={16} />
            Add Demo Funds
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Card */}
      <div className="gw-port-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="gw-port-label">Total Portfolio Equity</span>
            <strong className="mono gw-port-value">{money(totalEquity)}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`change-pill ${isUp ? 'up' : 'down'} mono`}>
              {isUp ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
              {unrealizedPnl >= 0 ? '+' : '−'}
              {money(Math.abs(unrealizedPnl))} ({formatPct(unrealizedPnlPct)}) Total Return
            </span>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="gw-port-grid">
          <div>
            <span>Available Paper Cash</span>
            <b className="mono" style={{ color: 'var(--ink)' }}>{money(cash)}</b>
          </div>
          <div>
            <span>Invested Holdings</span>
            <b className="mono">{money(holdingsValue)}</b>
          </div>
          <div>
            <span>Est. Today's Movement</span>
            <b className={`mono ${estTodayPnl >= 0 ? 'up' : 'down'}`}>
              {estTodayPnl >= 0 ? '+' : '−'}
              {money(Math.abs(estTodayPnl))}
            </b>
          </div>
        </div>

        {/* Asset Allocation Breakdown */}
        {totalEquity > 0 && (
          <div className="allocation-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--secondary)' }}>
              <span>Asset Allocation</span>
              <span>{positions.length} Open Position{positions.length === 1 ? '' : 's'}</span>
            </div>
            <div className="allocation-bar" role="progressbar" aria-label="Portfolio asset allocation">
              <div
                className="alloc-seg"
                style={{ width: `${cashPct}%`, background: 'var(--accent)' }}
                title={`Cash: ${cashPct.toFixed(1)}%`}
              />
              <div
                className="alloc-seg"
                style={{ width: `${cryptoPct}%`, background: '#356AE6' }}
                title={`Crypto: ${cryptoPct.toFixed(1)}%`}
              />
              <div
                className="alloc-seg"
                style={{ width: `${stockPct}%`, background: '#16875D' }}
                title={`Stocks: ${stockPct.toFixed(1)}%`}
              />
            </div>
            <div className="alloc-legend">
              <div className="alloc-item">
                <span className="alloc-dot" style={{ background: 'var(--accent)' }} />
                <span>Cash: {cashPct.toFixed(1)}% ({money(cash)})</span>
              </div>
              {cryptoPct > 0 && (
                <div className="alloc-item">
                  <span className="alloc-dot" style={{ background: '#356AE6' }} />
                  <span>Crypto: {cryptoPct.toFixed(1)}% ({money(cryptoValue)})</span>
                </div>
              )}
              {stockPct > 0 && (
                <div className="alloc-item">
                  <span className="alloc-dot" style={{ background: '#16875D' }} />
                  <span>Stocks: {stockPct.toFixed(1)}% ({money(stockValue)})</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Brand New User Starter Pack Callout if Empty */}
      {cash === 0 && positions.length === 0 && (
        <div
          style={{
            padding: '1.5rem 1.75rem',
            background: 'var(--accent-soft)',
            border: '1px solid rgba(231, 182, 10, 0.35)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={22} style={{ color: 'var(--accent-ink)' }} />
            </div>
            <div>
              <strong style={{ fontSize: '1.1rem', display: 'block', color: 'var(--accent-ink)' }}>
                YOUR VIRTUAL WALLET IS READY
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#634e02' }}>
                Claim your starter grant of $1,000 (~₹83,500 demo cash) to begin simulated paper trading.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={claimStarterPack}
          >
            Claim $1,000 Demo Grant
          </button>
        </div>
      )}

      {/* Watchlist Pulse Strip */}
      {starredSymbols.length > 0 && (
        <div>
          <div className="gw-section-title" style={{ marginBottom: '0.85rem' }}>
            <h2>WATCHLIST HIGHLIGHTS</h2>
            <button type="button" className="linkish" onClick={() => setDestination('markets')}>
              View all markets
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {starredSymbols.map((s) => {
              const up = s.changePct24h >= 0
              return (
                <div
                  key={s.id}
                  onClick={() => openAsset(s.id, s.symbol, s.assetClass)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700 }}>{s.symbol}</span>
                      <small style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase' }}>{s.assetClass}</small>
                    </div>
                    <span className={`change-pill ${up ? 'up' : 'down'} mono`} style={{ fontSize: '0.75rem' }}>
                      {formatPct(s.changePct24h)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong className="mono" style={{ fontSize: '1.2rem' }}>{money(s.price)}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', textDecoration: 'underline' }}>Trade →</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Open Positions List */}
      <div>
        <div className="gw-section-title" style={{ marginBottom: '0.85rem' }}>
          <h2>CURRENT HOLDINGS</h2>
          {positions.length > 0 && (
            <button type="button" className="linkish" onClick={() => setDestination('portfolio')}>
              Detailed Portfolio View
            </button>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="gw-empty-card">
            <PieChart size={36} style={{ color: 'var(--muted)' }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--ink)' }}>No active holdings yet</p>
              <p style={{ fontSize: '0.85rem' }}>Search any crypto or stock in Markets to execute your first paper trade.</p>
            </div>
            <button type="button" className="btn primary" onClick={() => setDestination('markets')}>
              Explore Markets
            </button>
          </div>
        ) : (
          <div className="gw-list">
            {positions.map((p) => {
              const meta = priceMap.get(p.symbol)
              const mark = meta?.price ?? p.avgPrice
              const rowPnl = (mark - p.avgPrice) * p.qty
              const rowPct = p.avgPrice ? ((mark - p.avgPrice) / p.avgPrice) * 100 : 0
              const rowUp = rowPnl >= 0

              return (
                <div
                  key={p.id}
                  className="gw-row"
                  onClick={() => {
                    if (meta) openAsset(meta.id, meta.symbol, meta.assetClass)
                  }}
                >
                  <div className="gw-avatar">
                    {meta?.image ? (
                      <img src={meta.image} alt={p.symbol} />
                    ) : (
                      p.symbol.slice(0, 2)
                    )}
                  </div>
                  <div className="gw-row-main">
                    <span className="gw-row-name">{meta?.name ?? p.symbol}</span>
                    <span className="gw-row-sub">
                      {formatQty(p.qty)} units · Avg Entry: {money(p.avgPrice)}
                    </span>
                  </div>
                  <div className="gw-row-meta">
                    <span className="mono gw-row-price">{money(mark * p.qty)}</span>
                    <span className={`gw-chip ${rowUp ? 'up' : 'down'} mono`}>
                      {rowUp ? '+' : '−'}{money(Math.abs(rowPnl))} ({formatPct(rowPct)})
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Snapshot */}
      {trades.length > 0 && (
        <div>
          <div className="gw-section-title" style={{ marginBottom: '0.85rem' }}>
            <h2>RECENT ACTIVITY</h2>
            <button type="button" className="linkish" onClick={() => setDestination('activity')}>
              View Full Cash Ledger
            </button>
          </div>
          <div className="ledger-table">
            <div className="ledger-head">
              <span>Time</span>
              <span>Type</span>
              <span>Details</span>
              <span style={{ textAlign: 'right' }}>Cash Impact</span>
              <span style={{ textAlign: 'right' }}>Cash Balance</span>
            </div>
            {trades.slice(0, 5).map((t) => {
              const inflow = t.cashDelta >= 0
              return (
                <div key={t.id} className="ledger-row">
                  <span className="muted" style={{ fontSize: '0.78rem' }}>
                    {new Date(t.at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className={`ledger-badge ${t.type}`}>
                      {t.type}
                    </span>
                  </div>
                  <div>
                    {t.type === 'deposit' ? (
                      <span>{t.note ?? 'Wallet top-up'}</span>
                    ) : (
                      <span>
                        {t.symbol} · {formatQty(t.qty)} @ {money(t.price)}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b className={`mono ${inflow ? 'up' : 'down'}`}>
                      {inflow ? '+' : '−'}
                      {money(Math.abs(t.cashDelta))}
                    </b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="mono">{money(t.balanceAfter)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
