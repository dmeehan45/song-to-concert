import type { SearchFilters } from '../types/contracts'

const next30Days = () => {
  const start = new Date()
  const end = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export const makeDefaultFilters = (): SearchFilters => ({
  locationQuery: '',
  radius: 50,
  radiusUnit: navigator.language === 'en-US' ? 'mi' : 'km',
  sortBy: 'date',
  ...next30Days(),
})
