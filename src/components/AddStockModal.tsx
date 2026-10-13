import { useRef, useState, type FormEvent } from 'react'
import { Upload, X } from 'lucide-react'
import type { AssetClass, MarketSymbol } from '../types/market'
import { useCustomListStore, useSelectionStore } from '../store/appStore'
import { useMoney } from '../hooks/useMoney'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddStockModal({ open, onClose }: Props) {
  const add = useCustomListStore((s) => s.add)
  const addMany = useCustomListStore((s) => s.addMany)
  const setExploreFilter = useSelectionStore((s) => s.setExploreFilter)
  const setTab = useSelectionStore((s) => s.setTab)
  const { currency, usdInr } = useMoney()
  const fileRef = useRef<HTMLInputElement>(null)

  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [assetClass, setAssetClass] = useState<AssetClass>('stock')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (!open) return null

  const toUsd = (displayPrice: number) =>
    currency === 'INR' ? displayPrice / usdInr : displayPrice

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const p = Number(price)
    const err = add({
      symbol,
      name,
      assetClass,
      price: toUsd(p),
    })
    setError(err)
    setInfo(null)
    if (!err) {
      setSymbol('')
      setName('')
      setPrice('')
      setExploreFilter('mine')
      setTab('markets')
      onClose()
    }
  }

  const onCsv = async (file: File) => {
    const text = await file.text()
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) {
      setError('CSV is empty')
      return
    }

    const start = lines[0].toLowerCase().includes('symbol') ? 1 : 0
    const rows: MarketSymbol[] = []
    for (const line of lines.slice(start)) {
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''))
      if (parts.length < 3) continue
      const [sym, nm, priceStr, cls] = parts
      const p = Number(priceStr)
      if (!sym || !nm || !Number.isFinite(p) || p <= 0) continue
      rows.push({
        id: `custom-${sym.toLowerCase()}`,
        symbol: sym.toUpperCase(),
        name: nm,
        assetClass: cls === 'crypto' ? 'crypto' : 'stock',
        price: toUsd(p),
        change24h: 0,
        changePct24h: 0,
      })
    }

    const added = addMany(rows)
    setError(null)
    setInfo(`Imported ${added} of ${rows.length} rows`)
    if (added > 0) {
      setExploreFilter('mine')
      setTab('markets')
    }
  }

  return (
    <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Add stock">
      <button type="button" className="pay-backdrop" aria-label="Close" onClick={onClose} />
      <div className="pay-sheet">
        <div className="pay-head">
          <div>
            <p className="pay-badge">List your own symbols</p>
            <h2>Add / upload stocks</h2>
            <p className="pay-sub">Manual entry or CSV · demo prices in {currency}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form className="auth-card" style={{ width: '100%', boxShadow: 'none', padding: 0, border: 0 }} onSubmit={onSubmit}>
          <label className="field">
            <span>Symbol</span>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="RELIANCE" required />
          </label>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reliance Industries" required />
          </label>
          <label className="field">
            <span>Price ({currency})</span>
            <input
              className="mono"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="2500"
              required
            />
          </label>
          <label className="field">
            <span>Type</span>
            <select value={assetClass} onChange={(e) => setAssetClass(e.target.value as AssetClass)}>
              <option value="stock">Stock</option>
              <option value="crypto">Crypto</option>
            </select>
          </label>

          {error && <p className="ticket-error">{error}</p>}
          {info && <p className="muted">{info}</p>}

          <button type="submit" className="submit buy">
            Add to My list
          </button>
        </form>

        <div className="csv-box">
          <p className="muted">CSV format: <code>symbol,name,price,stock|crypto</code></p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onCsv(f)
            }}
          />
          <button type="button" className="btn ghost full" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Upload CSV
          </button>
        </div>
      </div>
    </div>
  )
}
