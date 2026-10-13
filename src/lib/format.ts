import type { DisplayCurrency } from '../api/fx'

/** Prices in the app are stored in USD; convert for display. */
export function toDisplay(usd: number, currency: DisplayCurrency, usdInr: number): number {
  if (!Number.isFinite(usd)) return NaN
  return currency === 'INR' ? usd * usdInr : usd
}

export function formatPrice(
  usd: number,
  currency: DisplayCurrency = 'INR',
  usdInr = 83.5,
): string {
  const value = toDisplay(usd, currency, usdInr)
  if (!Number.isFinite(value)) return '—'

  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  const abs = Math.abs(value)
  const fractionDigits = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6

  return value.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Math.min(2, fractionDigits),
    maximumFractionDigits: fractionDigits,
  })
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatCompact(
  usd: number,
  currency: DisplayCurrency = 'INR',
  usdInr = 83.5,
): string {
  const value = toDisplay(usd, currency, usdInr)
  if (!Number.isFinite(value)) return '—'
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatQty(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value >= 1) return value.toLocaleString('en-IN', { maximumFractionDigits: 4 })
  return value.toLocaleString('en-IN', { maximumFractionDigits: 8 })
}

export function formatFxRate(usdInr: number): string {
  if (!Number.isFinite(usdInr)) return '—'
  return `₹${usdInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
