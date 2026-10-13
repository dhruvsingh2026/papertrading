export type DisplayCurrency = 'INR' | 'USD'

/** Frankfurter (ECB) — free, CORS-friendly USD→INR */
export async function fetchUsdInrRate(): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR')
    if (res.ok) {
      const data = (await res.json()) as { rates?: { INR?: number } }
      if (data.rates?.INR && data.rates.INR > 0) return data.rates.INR
    }
  } catch {
    // fall through
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (res.ok) {
      const data = (await res.json()) as { rates?: { INR?: number } }
      if (data.rates?.INR && data.rates.INR > 0) return data.rates.INR
    }
  } catch {
    // fall through
  }

  return 83.5
}
