import type { SearchFilters } from '../types/contracts'

interface LocationFilterPanelProps {
  value: SearchFilters
  onChange: (next: SearchFilters) => void
  onSearch: () => void
}

export function LocationFilterPanel({ value, onChange, onSearch }: LocationFilterPanelProps) {
  const setPreset = (days: number) => {
    const start = new Date()
    const end = new Date(Date.now() + 1000 * 60 * 60 * 24 * days)
    onChange({
      ...value,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    })
  }

  return (
    <>
      <h2>Find concerts near you</h2>
      <p className="subtle">Set location and timeframe, then run search. You can refine after results.</p>
      <label htmlFor="location-input">Location</label>
      <input
        id="location-input"
        aria-label="Location"
        value={value.locationQuery}
        onChange={(event) => onChange({ ...value, locationQuery: event.target.value })}
        placeholder="City, ZIP, or address"
      />

      <label htmlFor="radius-input">
        Radius: {value.radius} {value.radiusUnit}
      </label>
      <input
        id="radius-input"
        type="range"
        min={10}
        max={100}
        value={value.radius}
        onChange={(event) => onChange({ ...value, radius: Number(event.target.value) })}
      />

      <button
        type="button"
        className="action secondary"
        onClick={() => onChange({ ...value, radiusUnit: value.radiusUnit === 'mi' ? 'km' : 'mi' })}
      >
        Switch distance unit to {value.radiusUnit === 'mi' ? 'km' : 'mi'}
      </button>
      <div className="preset-row">
        <button type="button" onClick={() => setPreset(7)}>
          This week
        </button>
        <button type="button" onClick={() => setPreset(30)}>
          This month
        </button>
        <button type="button" onClick={() => setPreset(90)}>
          Next 3 months
        </button>
      </div>
      <button className="action" type="button" disabled={!value.locationQuery.trim()} onClick={onSearch}>
        Search concerts
      </button>
    </>
  )
}
