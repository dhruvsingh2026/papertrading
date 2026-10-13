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
  const tab = useSelectionStore((s) => s.tab)
  const deskNav = useSelectionStore((s) => s.deskNav)
  const exploreFilter = useSelectionStore((s) => s.exploreFilter)
  const selectedId = useSelectionStore((s) => s.selectedId)
  const detailOpen = useSelectionStore((s) => s.detailOpen)
  const setTab = useSelectionStore((s) => s.setTab)
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

  const crypto = cryptoQuery.data ?? []
  const stocks = stocksQuery.data ?? []
  const all = useMemo(
    () => [...customItems, ...crypto, ...stocks],
    [customItems, crypto, stocks],
  )

  const q = query.trim().toLowerCase()
  const filterQ = <T extends { symbol: string; name: string; id: string }>(list: T[]) =>
    q
      ? list.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q),
        )
      : list

  const marketItems = useMemo(() => {
    let base =
      exploreFilter === 'crypto'
        ? crypto
        : exploreFilter === 'stocks'
          ? stocks
          : exploreFilter === 'mine'
            ? customItems
            : exploreFilter === 'gainers'
              ? [...all].sort((a, b) => b.changePct24h - a.changePct24h)
              : exploreFilter === 'losers'
                ? [...all].sort((a, b) => a.changePct24h - b.changePct24h)
                : all
    if (exploreFilter === 'all') {
      const starred = all.filter((s) => watchIds.includes(s.id))
      base = starred.length ? [...starred, ...all.filter((s) => !watchIds.includes(s.id))] : all
    }
    return filterQ(base)
  }, [all, crypto, stocks, customItems, exploreFilter, watchIds, q])

  const current = all.find((s) => s.id === selectedId) ?? crypto[0] ?? customItems[0]

  const feedWarn = (cryptoQuery.isError || stocksQuery.isError) && (
    <p className="banner-warn mob-banner">Some feeds are slow — retrying automatically.</p>
  )

  if (isDesktop) {
    return (
      <div className="desk-shell">
        <DesktopTopNav
          onTransfer={() => setAddMoneyOpen(true)}
          onProfile={() => setTab('profile')}
          onActivity={() => setTab('activity')}
        />
        <main className="desk-main">
          {tab === 'wallet' && (
            <div className="desk-pane">
              <WalletScreen
                symbols={all}
                onAddMoney={() => setAddMoneyOpen(true)}
                title={deskNav === 'portfolio' ? 'Portfolio' : 'Dashboard'}
              />
            </div>
          )}
          {tab === 'markets' && (
            <div className="desk-pane">
              <MarketsScreen
                items={marketItems}
                query={query}
                onQuery={setQuery}
                onAddStock={() => setAddStockOpen(true)}
              />
            </div>
          )}
          {tab === 'trade' && <DesktopTradingView current={current} symbols={all} />}
          {tab === 'activity' && (
            <div className="desk-pane narrow">
              <ActivityScreen />
            </div>
          )}
          {tab === 'profile' && (
            <div className="desk-pane narrow">
              <ProfileScreen
                onAddMoney={() => setAddMoneyOpen(true)}
                onAddStock={() => setAddStockOpen(true)}
              />
            </div>
          )}
          {feedWarn}
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
          {tab === 'wallet' && (
            <WalletScreen symbols={all} onAddMoney={() => setAddMoneyOpen(true)} />
          )}
          {tab === 'markets' && (
            <MarketsScreen
              items={marketItems}
              query={query}
              onQuery={setQuery}
              onAddStock={() => setAddStockOpen(true)}
            />
          )}
          {tab === 'trade' && <TradeScreen symbols={all} current={current} />}
          {tab === 'activity' && <ActivityScreen />}
          {tab === 'profile' && (
            <ProfileScreen
              onAddMoney={() => setAddMoneyOpen(true)}
              onAddStock={() => setAddStockOpen(true)}
            />
          )}
          {feedWarn}
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
