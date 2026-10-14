import { useRef, useState, type FormEvent } from 'react'
import { FileSpreadsheet, Plus, Upload, X } from 'lucide-react'
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
  const setDestination = useSelectionStore((s) => s.setDestination)
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
    if (!Number.isFinite(p) || p <= 0) {
      setError('Please enter a valid price greater than zero.')
      return
    }

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
      setDestination('markets')
      onClose()
    }
  }

  const onCsv = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)

      if (lines.length === 0) {
        setError('The selected CSV file is empty.')
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
          assetClass: cls?.toLowerCase() === 'crypto' ? 'crypto' : 'stock',
          price: toUsd(p),
          change24h: 0,
          changePct24h: 0,
        })
      }

      if (rows.length === 0) {
        setError('No valid rows found in CSV. Format: symbol,name,price,stock|crypto')
        return
      }

      const added = addMany(rows)
      setError(null)
      setInfo(`Successfully imported ${added} custom instruments into your list.`)
      setExploreFilter('mine')
      setDestination('markets')
    } catch {
      setError('Failed to parse CSV file. Please verify formatting.')
    }
  }

  return (
    <div className="pay-overlay" role="dialog" aria-modal="true" aria-label="Add or Import Custom Stocks">
      <button type="button" className="pay-backdrop" aria-label="Close modal" onClick={onClose} />
      <div className="pay-sheet">
        <div className="pay-head">
          <div>
            <span className="pay-badge">CUSTOM SIMULATED INSTRUMENTS</span>
            <h2>LIST CUSTOM ASSET</h2>
            <p className="pay-sub">
              Add individual unlisted stocks or bulk-import a CSV portfolio for paper trading.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label className="field">
            <span>Symbol / Ticker</span>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. INFY or RELIANCE"
              required
            />
          </label>

          <label className="field">
            <span>Asset / Company Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Infosys Limited"
              required
            />
          </label>

          <label className="field">
            <span>Baseline Quote Price ({currency})</span>
            <input
              className="mono"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder={currency === 'INR' ? 'e.g. 1500' : 'e.g. 18.50'}
              required
            />
          </label>

          <label className="field">
            <span>Asset Class</span>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value as AssetClass)}
            >
              <option value="stock">Equity / Stock</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </label>

          {error && <p className="ticket-error">{error}</p>}
          {info && <p style={{ color: 'var(--up)', fontSize: '0.85rem' }}>{info}</p>}

          <button type="submit" className="btn primary full large">
            <Plus size={16} /> Add to Custom List
          </button>
        </form>

        <div className="csv-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bulk CSV Import</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
            Header format: <code>symbol,name,price,stock|crypto</code>
          </p>

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

          <button
            type="button"
            className="btn ghost full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={16} /> Choose CSV File to Upload
          </button>
        </div>

        <p className="disclaimer">
          Custom instruments use manually specified demo prices and are separated under your "Custom List" tab.
        </p>
      </div>
    </div>
  )
}
