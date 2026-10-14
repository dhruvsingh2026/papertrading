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

export type AppDestination = 'overview' | 'markets' | 'trade' | 'portfolio' | 'activity' | 'profile'
/** Backward compatible alias */
export type AppTab = AppDestination | 'wallet'
export type DeskNav = AppDestination | 'dashboard' | 'trading' | 'market'

export type ExploreFilter = 'all' | 'crypto' | 'stocks' | 'mine' | 'gainers' | 'losers' | 'watchlist'

interface SelectionState {
  selectedId: string
  selectedSymbol: string
  assetClass: AssetClass
  timeframe: Timeframe
  destination: AppDestination
  exploreFilter: ExploreFilter
  detailOpen: boolean
  // backward-compatible getters
  tab: AppTab
  deskNav: DeskNav

  setSelection: (id: string, symbol: string, assetClass: AssetClass) => void
  setTimeframe: (tf: Timeframe) => void
  setDestination: (dest: AppDestination) => void
  setTab: (tab: AppTab) => void
  setDeskNav: (nav: DeskNav) => void
  setExploreFilter: (filter: ExploreFilter) => void
  setDetailOpen: (open: boolean) => void
  openAsset: (id: string, symbol: string, assetClass: AssetClass) => void
}

function normalizeDestination(tab: string): AppDestination {
  if (tab === 'wallet' || tab === 'dashboard') return 'overview'
  if (tab === 'trading') return 'trade'
  if (tab === 'market') return 'markets'
  if (['overview', 'markets', 'trade', 'portfolio', 'activity', 'profile'].includes(tab)) {
    return tab as AppDestination
  }
  return 'overview'
}

export const useSelectionStore = create<SelectionState>()((set) => ({
  selectedId: 'bitcoin',
  selectedSymbol: 'BTC',
  assetClass: 'crypto',
  timeframe: '1D',
  destination: 'overview',
  tab: 'overview',
  deskNav: 'overview',
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

  setDestination: (dest) =>
    set({
      destination: dest,
      tab: dest,
      deskNav: dest,
      detailOpen: false,
    }),

  setTab: (tab) => {
    const dest = normalizeDestination(tab)
    set({
      destination: dest,
      tab: dest,
      deskNav: dest,
      detailOpen: false,
    })
  },

  setDeskNav: (nav) => {
    const dest = normalizeDestination(nav)
    set({
      destination: dest,
      tab: dest,
      deskNav: dest,
      detailOpen: false,
    })
  },

  setExploreFilter: (exploreFilter) => set({ exploreFilter }),
  setDetailOpen: (detailOpen) => set({ detailOpen }),

  openAsset: (id, symbol, assetClass) =>
    set((s) => {
      const isDesktop =
        typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
      return {
        selectedId: id,
        selectedSymbol: symbol,
        assetClass,
        timeframe: assetClass === 'stock' ? '1D' : s.timeframe,
        detailOpen: !isDesktop,
        destination: isDesktop ? 'trade' : s.destination,
        tab: isDesktop ? 'trade' : s.tab,
        deskNav: isDesktop ? 'trade' : s.deskNav,
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
      ids: ['bitcoin', 'ethereum', 'solana', 'AAPL', 'NVDA'],
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
        if (!symbol) return 'Stock symbol is required'
        if (!item.name.trim()) return 'Company or asset name is required'
        if (!Number.isFinite(item.price) || item.price <= 0) return 'Please enter a valid positive price'
        const id = item.id ?? `custom-${symbol.toLowerCase()}`
        if (get().items.some((x) => x.id === id || x.symbol === symbol)) {
          return `${symbol} is already in your custom list`
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
  realizedPnl?: number
}

export type Trade = LedgerEntry

interface PaperState {
  userId: string | null
  cash: number
  positions: Position[]
  trades: LedgerEntry[]
  hydrateForUser: (userId: string) => void
  addMoney: (usdAmount: number, note?: string) => string | null
  claimStarterPack: () => void
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
        realizedPnl: t.realizedPnl,
      } satisfies LedgerEntry
    })
    return {
      cash: typeof parsed.cash === 'number' && Number.isFinite(parsed.cash) ? parsed.cash : START_CASH,
      positions: Array.isArray(parsed.positions) ? parsed.positions : [],
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

  claimStarterPack: () => {
    const { userId, cash } = get()
    if (!userId || cash > 0) return
    // Default starter pack: $1,000 (~₹83,500)
    get().addMoney(1000, 'Welcome demo grant')
  },

  addMoney: (usdAmount, note) => {
    const { userId, cash, positions, trades } = get()
    if (!userId) return 'Please log in to your demo account'
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) return 'Please enter a valid deposit amount'
    if (usdAmount > 1_000_000) return 'Maximum demo deposit per transaction is $1,000,000'

    const cleanAmount = Math.round(usdAmount * 100) / 100
    const balanceAfter = Math.round((cash + cleanAmount) * 100) / 100

    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      type: 'deposit',
      symbol: 'CASH',
      qty: 1,
      price: cleanAmount,
      cashDelta: cleanAmount,
      balanceAfter,
      at: Date.now(),
      note: note ?? 'Virtual wallet top-up',
    }

    const next = {
      cash: balanceAfter,
      positions,
      trades: [entry, ...trades].slice(0, 300),
    }

    savePaper(userId, next)
    set(next)
    return null
  },

  buy: (symbol, assetClass, qty, price) => {
    const { userId, cash, positions, trades } = get()
    if (!userId) return 'Please log in to your demo account'
    if (!Number.isFinite(qty) || qty <= 0) return 'Quantity must be greater than zero'
    if (!Number.isFinite(price) || price <= 0) return 'Market price is currently unavailable'

    const cost = qty * price
    if (cost > cash + 0.0001) {
      return `Insufficient paper cash. You need $${cost.toFixed(2)} but have $${cash.toFixed(2)}.`
    }

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

    const balanceAfter = Math.max(0, Math.round((cash - cost) * 100) / 100)
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
      trades: [entry, ...trades].slice(0, 300),
    }

    savePaper(userId, next)
    set(next)
    return null
  },

  sell: (symbol, qty, price) => {
    const { userId, cash, positions, trades } = get()
    if (!userId) return 'Please log in to your demo account'
    const existing = positions.find((p) => p.symbol === symbol)
    if (!existing) return `You don't own any ${symbol} to sell`
    if (!Number.isFinite(qty) || qty <= 0) return 'Quantity must be greater than zero'
    if (!Number.isFinite(price) || price <= 0) return 'Market price is currently unavailable'

    if (qty > existing.qty + 1e-9) {
      return `Cannot sell ${qty} units. You only hold ${existing.qty.toFixed(4)} ${symbol}.`
    }

    const effectiveQty = Math.min(qty, existing.qty)
    const proceeds = effectiveQty * price
    const realizedPnl = (price - existing.avgPrice) * effectiveQty
    const remaining = existing.qty - effectiveQty

    const nextPositions =
      remaining <= 1e-8
        ? positions.filter((p) => p.symbol !== symbol)
        : positions.map((p) => (p.symbol === symbol ? { ...p, qty: remaining } : p))

    const balanceAfter = Math.round((cash + proceeds) * 100) / 100
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      type: 'sell',
      symbol,
      qty: effectiveQty,
      price,
      cashDelta: proceeds,
      balanceAfter,
      at: Date.now(),
      realizedPnl,
      note: realizedPnl >= 0 ? `Gain: +$${realizedPnl.toFixed(2)}` : `Loss: -$${Math.abs(realizedPnl).toFixed(2)}`,
    }

    const next = {
      cash: balanceAfter,
      positions: nextPositions,
      trades: [entry, ...trades].slice(0, 300),
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
