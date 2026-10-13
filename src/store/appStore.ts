import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DisplayCurrency } from '../api/fx'
import type { AssetClass, MarketSymbol, Timeframe } from '../types/market'

interface PrefsState {
  currency: DisplayCurrency
  setCurrency: (currency: DisplayCurrency) => void
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'fairbook-prefs' },
  ),
)

export type AppTab = 'markets' | 'trade' | 'wallet' | 'activity' | 'profile'
export type DeskNav = 'dashboard' | 'trading' | 'market' | 'portfolio'
export type ExploreFilter = 'all' | 'crypto' | 'stocks' | 'mine' | 'gainers' | 'losers'

function deskNavForTab(tab: AppTab, prev: DeskNav): DeskNav {
  if (tab === 'markets') return 'market'
  if (tab === 'trade') return 'trading'
  if (tab === 'wallet') return prev === 'portfolio' ? 'portfolio' : 'dashboard'
  return prev
}

interface SelectionState {
  selectedId: string
  selectedSymbol: string
  assetClass: AssetClass
  timeframe: Timeframe
  tab: AppTab
  deskNav: DeskNav
  exploreFilter: ExploreFilter
  detailOpen: boolean
  setSelection: (id: string, symbol: string, assetClass: AssetClass) => void
  setTimeframe: (tf: Timeframe) => void
  setTab: (tab: AppTab) => void
  setDeskNav: (nav: DeskNav) => void
  setExploreFilter: (filter: ExploreFilter) => void
  setDetailOpen: (open: boolean) => void
  openAsset: (id: string, symbol: string, assetClass: AssetClass) => void
}

export const useSelectionStore = create<SelectionState>()((set) => ({
  selectedId: 'bitcoin',
  selectedSymbol: 'BTC',
  assetClass: 'crypto',
  timeframe: '1D',
  tab: 'wallet',
  deskNav: 'dashboard',
  exploreFilter: 'all',
  detailOpen: false,
  setSelection: (id, symbol, assetClass) =>
    set((s) => ({
      selectedId: id,
      selectedSymbol: symbol,
      assetClass,
      timeframe: assetClass === 'stock' ? '1D' : s.timeframe,
    })),
  setTimeframe: (timeframe) => set({ timeframe }),
  setTab: (tab) =>
    set((s) => ({
      tab,
      detailOpen: false,
      deskNav: deskNavForTab(tab, s.deskNav),
    })),
  setDeskNav: (deskNav) =>
    set({
      deskNav,
      detailOpen: false,
      tab:
        deskNav === 'market'
          ? 'markets'
          : deskNav === 'trading'
            ? 'trade'
            : 'wallet',
    }),
  setExploreFilter: (exploreFilter) => set({ exploreFilter }),
  setDetailOpen: (detailOpen) => set({ detailOpen }),
  openAsset: (id, symbol, assetClass) =>
    set((s) => {
      const desktop =
        typeof window !== 'undefined' && window.matchMedia('(min-width: 650px)').matches
      return {
        selectedId: id,
        selectedSymbol: symbol,
        assetClass,
        timeframe: assetClass === 'stock' ? '1D' : s.timeframe,
        detailOpen: !desktop,
        tab: desktop ? 'trade' : s.tab,
        deskNav: desktop ? 'trading' : s.deskNav,
      }
    }),
}))

interface WatchlistState {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      ids: ['bitcoin', 'ethereum', 'AAPL', 'NVDA'],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: 'fairbook-watchlist' },
  ),
)

/** User-uploaded / manually listed stocks (demo prices). */
interface CustomListState {
  items: MarketSymbol[]
  add: (item: Omit<MarketSymbol, 'id' | 'change24h' | 'changePct24h'> & { id?: string }) => string | null
  addMany: (items: MarketSymbol[]) => number
  remove: (id: string) => void
}

export const useCustomListStore = create<CustomListState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const symbol = item.symbol.trim().toUpperCase()
        if (!symbol) return 'Symbol required'
        if (!item.name.trim()) return 'Name required'
        if (!Number.isFinite(item.price) || item.price <= 0) return 'Valid price required'
        const id = item.id ?? `custom-${symbol.toLowerCase()}`
        if (get().items.some((x) => x.id === id || x.symbol === symbol)) {
          return 'Symbol already in your list'
        }
        const row: MarketSymbol = {
          id,
          symbol,
          name: item.name.trim(),
          assetClass: item.assetClass,
          price: item.price,
          change24h: 0,
          changePct24h: 0,
        }
        set((s) => ({ items: [row, ...s.items] }))
        return null
      },
      addMany: (rows) => {
        let added = 0
        for (const row of rows) {
          const err = get().add(row)
          if (!err) added += 1
        }
        return added
      },
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
    }),
    { name: 'fairbook-custom-stocks' },
  ),
)

export interface Position {
  id: string
  symbol: string
  assetClass: AssetClass
  qty: number
  avgPrice: number
}

/** Full cash ledger: deposits + trades */
export interface LedgerEntry {
  id: string
  type: 'deposit' | 'buy' | 'sell'
  symbol: string
  qty: number
  price: number
  /** Signed cash impact in USD (+ in, − out) */
  cashDelta: number
  balanceAfter: number
  at: number
  note?: string
}

/** @deprecated use LedgerEntry — kept as alias for trade-shaped rows */
export type Trade = LedgerEntry

interface PaperState {
  userId: string | null
  cash: number
  positions: Position[]
  trades: LedgerEntry[]
  hydrateForUser: (userId: string) => void
  addMoney: (usdAmount: number) => string | null
  buy: (symbol: string, assetClass: AssetClass, qty: number, price: number) => string | null
  sell: (symbol: string, qty: number, price: number) => string | null
  reset: () => void
}

const START_CASH = 0

function paperKey(userId: string) {
  return `fairbook-paper-${userId}`
}

function loadPaper(userId: string): Pick<PaperState, 'cash' | 'positions' | 'trades'> {
  try {
    const raw = localStorage.getItem(paperKey(userId))
    if (!raw) return { cash: START_CASH, positions: [], trades: [] }
    const parsed = JSON.parse(raw) as {
      cash?: number
      positions?: Position[]
      trades?: Array<Partial<LedgerEntry> & { side?: 'buy' | 'sell'; qty: number; price: number }>
    }
    const trades = (parsed.trades ?? []).map((t) => {
      const type: LedgerEntry['type'] =
        t.type === 'deposit' || t.type === 'buy' || t.type === 'sell'
          ? t.type
          : t.side === 'sell'
            ? 'sell'
            : 'buy'
      const qty = t.qty ?? 1
      const price = t.price ?? 0
      const cashDelta =
        typeof t.cashDelta === 'number'
          ? t.cashDelta
          : type === 'buy'
            ? -(qty * price)
            : qty * price
      return {
        id: t.id ?? crypto.randomUUID(),
        type,
        symbol: t.symbol ?? '—',
        qty,
        price,
        cashDelta,
        balanceAfter: typeof t.balanceAfter === 'number' ? t.balanceAfter : 0,
        at: t.at ?? Date.now(),
        note: t.note,
      } satisfies LedgerEntry
    })
    return {
      cash: typeof parsed.cash === 'number' ? parsed.cash : START_CASH,
      positions: parsed.positions ?? [],
      trades,
    }
  } catch {
    return { cash: START_CASH, positions: [], trades: [] }
  }
}

function savePaper(
  userId: string,
  data: Pick<PaperState, 'cash' | 'positions' | 'trades'>,
) {
  localStorage.setItem(paperKey(userId), JSON.stringify(data))
}

export const usePaperStore = create<PaperState>()((set, get) => ({
  userId: null,
  cash: START_CASH,
  positions: [],
  trades: [],
  hydrateForUser: (userId) => {
    const prev = get().userId
    if (prev && prev !== userId) {
      savePaper(prev, {
        cash: get().cash,
        positions: get().positions,
        trades: get().trades,
      })
    }
    const next = loadPaper(userId)
    set({ userId, ...next })
  },
  addMoney: (usdAmount) => {
    const { userId, cash, positions, trades } = get()
    if (!userId) return 'Please log in'
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) return 'Enter a valid amount'
    if (usdAmount > 1_000_000) return 'Demo max exceeded'
    const balanceAfter = cash + usdAmount
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      type: 'deposit',
      symbol: 'CASH',
      qty: 1,
      price: usdAmount,
      cashDelta: usdAmount,
      balanceAfter,
      at: Date.now(),
      note: 'Wallet top-up (demo)',
    }
    const next = {
      cash: balanceAfter,
      positions,
      trades: [entry, ...trades].slice(0, 200),
    }
    savePaper(userId, next)
    set(next)
    return null
  },
  buy: (symbol, assetClass, qty, price) => {
    const cost = qty * price
    const { userId, cash, positions, trades } = get()
    if (!userId) return 'Please log in'
    if (qty <= 0 || price <= 0) return 'Invalid quantity'
    if (cost > cash) return 'Insufficient cash — add money to wallet'
    const existing = positions.find((p) => p.symbol === symbol)
    let nextPositions: Position[]
    if (existing) {
      const totalQty = existing.qty + qty
      const avgPrice = (existing.avgPrice * existing.qty + cost) / totalQty
      nextPositions = positions.map((p) =>
        p.symbol === symbol ? { ...p, qty: totalQty, avgPrice } : p,
      )
    } else {
      nextPositions = [
        ...positions,
        { id: symbol, symbol, assetClass, qty, avgPrice: price },
      ]
    }
    const balanceAfter = cash - cost
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      type: 'buy',
      symbol,
      qty,
      price,
      cashDelta: -cost,
      balanceAfter,
      at: Date.now(),
    }
    const next = {
      cash: balanceAfter,
      positions: nextPositions,
      trades: [entry, ...trades].slice(0, 200),
    }
    savePaper(userId, next)
    set(next)
    return null
  },
  sell: (symbol, qty, price) => {
    const { userId, cash, positions, trades } = get()
    if (!userId) return 'Please log in'
    const existing = positions.find((p) => p.symbol === symbol)
    if (!existing) return 'No position'
    if (qty <= 0 || price <= 0) return 'Invalid quantity'
    if (qty > existing.qty) return 'Not enough shares'
    const proceeds = qty * price
    const remaining = existing.qty - qty
    const nextPositions =
      remaining <= 1e-10
        ? positions.filter((p) => p.symbol !== symbol)
        : positions.map((p) => (p.symbol === symbol ? { ...p, qty: remaining } : p))
    const balanceAfter = cash + proceeds
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      type: 'sell',
      symbol,
      qty,
      price,
      cashDelta: proceeds,
      balanceAfter,
      at: Date.now(),
    }
    const next = {
      cash: balanceAfter,
      positions: nextPositions,
      trades: [entry, ...trades].slice(0, 200),
    }
    savePaper(userId, next)
    set(next)
    return null
  },
  reset: () => {
    const { userId } = get()
    const next = { cash: START_CASH, positions: [] as Position[], trades: [] as LedgerEntry[] }
    if (userId) savePaper(userId, next)
    set(next)
  },
}))
