import { useQuery } from '@tanstack/react-query'
import { fetchUsdInrRate, type DisplayCurrency } from '../api/fx'
import { formatCompact, formatPrice, toDisplay } from '../lib/format'
import { usePrefsStore } from '../store/appStore'

export function useMoney() {
  const currency = usePrefsStore((s) => s.currency)
  const setCurrency = usePrefsStore((s) => s.setCurrency)

  const fxQuery = useQuery({
    queryKey: ['usd-inr'],
    queryFn: fetchUsdInrRate,
    staleTime: 30 * 60_000,
    refetchInterval: 30 * 60_000,
  })

  const usdInr = fxQuery.data ?? 83.5

  return {
    currency,
    setCurrency,
    usdInr,
    fxLoading: fxQuery.isLoading,
    money: (usd: number) => formatPrice(usd, currency, usdInr),
    compact: (usd: number) => formatCompact(usd, currency, usdInr),
    convert: (usd: number) => toDisplay(usd, currency, usdInr),
    toggle: () => setCurrency(currency === 'INR' ? 'USD' : 'INR'),
  }
}

export function useDisplayCurrency(): DisplayCurrency {
  return usePrefsStore((s) => s.currency)
}
