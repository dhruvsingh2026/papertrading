import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCryptoMarkets } from '../api/coingecko'
import { fetchStockUniverse } from '../api/finnode'
import { ActivityScreen } from '../components/ActivityScreen'
import { AddMoneyModal } from '../components/AddMoneyModal'
import { AddStockModal } from '../components/AddStockModal'
import { AppBottomNav } from '../components/AppBottomNav'
import { AssetDetail } from '../components/AssetDetail'
import { DesktopTopNav } from '../components/DesktopTopNav'
import { DesktopTradingView } from '../components/DesktopTradingView'
import { MarketsScreen } from '../components/MarketsScreen'
import { PortfolioView } from '../components/PortfolioView'
import { ProfileScreen } from '../components/ProfileScreen'
import { TradeScreen } from '../components/TradeScreen'
import { WalletScreen } from '../components/WalletScreen'
import { useIsDesktop } from '../hooks/useMediaQuery'
import {
  useCustomListStore,
  usePaperStore,
  useSelectionStore,
  useWatchlistStore,
} from '../store/appStore'
import { useAuthStore } from '../store/authStore'

export default function Terminal() {
  const [query, setQuery] = useState('')
  const [addStockOpen, setAddStockOpen] = useState(false)
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)
  const isDesktop = useIsDesktop()
  const session = useAuthStore((s) => s.session)
  const hydrateForUser = usePaperStore((s) => s.hydrateForUser)
  const destination = useSelectionStore((s) => s.destination)
  const exploreFilter = useSelectionStore((s) => s.exploreFilter)
  const selectedId = useSelectionStore((s) => s.selectedId)
  const detailOpen = useSelectionStore((s) => s.detailOpen)
  const setDestination = useSelectionStore((s) => s.setDestination)
  const watchIds = useWatchlistStore((s) => s.ids)
  const customItems = useCustomListStore((s) => s.items)

  useEffect(() => {
    if (session?.id) hydrateForUser(session.id)
  }, [session?.id, hydrateForUser])

  const cryptoQuery = useQuery({
    queryKey: ['crypto-markets'],
    queryFn: () => fetchCryptoMarkets(40),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const stocksQuery = useQuery({
    queryKey: ['stock-markets'],
    queryFn: fetchStockUniverse,
    staleTime: 5 * 60_000,
  })

  const crypto = useMemo(() => cryptoQuery.data ?? [], [cryptoQuery.data])
  const stocks = useMemo(() => stocksQuery.data ?? [], [stocksQuery.data])
  const all = useMemo(
    () => [...customItems, ...crypto, ...stocks],
    [customItems, crypto, stocks],
  )

  const marketItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    let base =
      exploreFilter === 'crypto'
        ? crypto
        : exploreFilter === 'stocks'
          ? stocks
          : exploreFilter === 'mine'
            ? customItems
            : exploreFilter === 'watchlist'
              ? all.filter((s) => watchIds.includes(s.id))
              : exploreFilter === 'gainers'
                ? [...all].sort((a, b) => b.changePct24h - a.changePct24h)
                : exploreFilter === 'losers'
                  ? [...all].sort((a, b) => a.changePct24h - b.changePct24h)
                  : all

    if (exploreFilter === 'all') {
      const starred = all.filter((s) => watchIds.includes(s.id))
      base = starred.length ? [...starred, ...all.filter((s) => !watchIds.includes(s.id))] : all
    }

    return q
      ? base.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q),
        )
      : base
  }, [all, crypto, stocks, customItems, exploreFilter, watchIds, query])

  const current = all.find((s) => s.id === selectedId) ?? crypto[0] ?? customItems[0]

  const feedWarn = (cryptoQuery.isError || stocksQuery.isError) && (
    <div
      style={{
        padding: '0.65rem 1rem',
        background: 'var(--accent-soft)',
        border: '1px solid rgba(231, 182, 10, 0.35)',
        borderRadius: 'var(--radius)',
        fontSize: '0.82rem',
        color: '#634e02',
        textAlign: 'center',
        margin: '0.5rem 0',
      }}
    >
      External API connection busy — live fallback pricing is active while reconnecting.
    </div>
  )

  if (isDesktop) {
    return (
      <div className="desk-shell">
        <DesktopTopNav
          onTransfer={() => setAddMoneyOpen(true)}
          onProfile={() => setDestination('profile')}
          onActivity={() => setDestination('activity')}
        />

        <main className="desk-main">
          {feedWarn}

          {destination === 'overview' && (
            <div className="desk-pane">
              <WalletScreen
                symbols={all}
                onAddMoney={() => setAddMoneyOpen(true)}
                title="OVERVIEW & ALLOCATION"
              />
            </div>
          )}

          {destination === 'markets' && (
            <div className="desk-pane">
              <MarketsScreen
                items={marketItems}
                query={query}
                onQuery={setQuery}
                onAddStock={() => setAddStockOpen(true)}
              />
            </div>
          )}

          {destination === 'trade' && (
            <DesktopTradingView current={current} symbols={all} />
          )}

          {destination === 'portfolio' && (
            <div className="desk-pane">
              <PortfolioView symbols={all} />
            </div>
          )}

          {destination === 'activity' && (
            <div className="desk-pane">
              <ActivityScreen />
            </div>
          )}

          {destination === 'profile' && (
            <div className="desk-pane">
              <ProfileScreen
                onAddMoney={() => setAddMoneyOpen(true)}
                onAddStock={() => setAddStockOpen(true)}
              />
            </div>
          )}
        </main>

        <AddStockModal open={addStockOpen} onClose={() => setAddStockOpen(false)} />
        <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
      </div>
    )
  }

  return (
    <div className="mob-shell">
      <div className="mob-frame">
        <main className="mob-body">
          {feedWarn}

          {destination === 'overview' && (
            <WalletScreen symbols={all} onAddMoney={() => setAddMoneyOpen(true)} />
          )}

          {destination === 'markets' && (
            <MarketsScreen
              items={marketItems}
              query={query}
              onQuery={setQuery}
              onAddStock={() => setAddStockOpen(true)}
            />
          )}

          {destination === 'trade' && <TradeScreen symbols={all} current={current} />}

          {destination === 'portfolio' && <PortfolioView symbols={all} />}

          {destination === 'activity' && <ActivityScreen />}

          {destination === 'profile' && (
            <ProfileScreen
              onAddMoney={() => setAddMoneyOpen(true)}
              onAddStock={() => setAddStockOpen(true)}
            />
          )}
        </main>

        {detailOpen && (
          <div className="mob-detail-overlay">
            <AssetDetail current={current} />
          </div>
        )}

        <AppBottomNav />
      </div>

      <AddStockModal open={addStockOpen} onClose={() => setAddStockOpen(false)} />
      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
    </div>
  )
}
