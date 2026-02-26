import { useMemo, useState } from 'react'
import { HomeInputPanel } from './components/HomeInputPanel'
import { LocationFilterPanel } from './components/LocationFilterPanel'
import { makeDefaultFilters } from './lib/defaultFilters'
import { ResultsSection } from './components/ResultsSection'
import { mockEvents } from './lib/mockData'
import { rankConcerts } from './lib/scoring'
import { providerSelection } from './lib/providerConfig'
import { createDiscoveryGateway } from './lib/adapters/gateway'
import type { RankedConcertEvent, SongSeedInput } from './types/contracts'

function App() {
  const [seedInput, setSeedInput] = useState<SongSeedInput | null>(null)
  const [filters, setFilters] = useState(makeDefaultFilters)
  const [events, setEvents] = useState<RankedConcertEvent[]>([])
  const [visibleCount, setVisibleCount] = useState(10)
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const gateway = useMemo(() => createDiscoveryGateway(), [])

  const discoverConcerts = async () => {
    if (!seedInput) {
      setStatusMessage('Add a song/artist seed first.')
      return
    }

    setVisibleCount(10)
    setHasSearched(true)
    setIsLoading(true)

    const recognition = await gateway.resolveRecognition(seedInput)
    const { events: discoveredEvents, providersAttempted, winner } = await gateway.resolveEvents({
      recognition,
      filters,
    })

    setEvents(rankConcerts(discoveredEvents.length ? discoveredEvents : mockEvents))
    setStatusMessage(`Results source: ${winner}. Providers tried: ${providersAttempted.join(' → ')}`)
    setIsLoading(false)
  }

  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount])

  const canShowFilters = Boolean(seedInput)
  const canShowResults = hasSearched

  return (
    <>
      <header className="app-header">
        <p className="logo">◇ Song to Concert</p>
        <h1>Identify tracks and find nearby live shows</h1>
      </header>

      <main className="layout">
        <div>
          <section className="panel">
            <p className="step-label">Step 1</p>
            <HomeInputPanel onManualSubmit={setSeedInput} onOfflineSaved={setStatusMessage} />
          </section>

          {canShowFilters && (
            <section className="panel">
              <p className="step-label">Step 2</p>
              <LocationFilterPanel value={filters} onChange={setFilters} onSearch={discoverConcerts} />
            </section>
          )}

          <details className="panel details-panel">
            <summary>Search details</summary>
            <p>Seed: {seedInput ? `${seedInput.mode}: ${seedInput.query}` : 'None yet'}</p>
            <p>
              Area: {filters.locationQuery || 'Unset'} · {filters.radius} {filters.radiusUnit}
            </p>
            <p>
              Window: {filters.startDate} to {filters.endDate}
            </p>
            <p>
              Audio provider: {providerSelection.audioRecognitionPrimary} (fallback {providerSelection.audioRecognitionFallback})
            </p>
            <p>
              Event providers: {providerSelection.eventsPrimary} → {providerSelection.eventsSecondary}; niche source:{' '}
              {providerSelection.nicheSources.join(', ')}
            </p>
            <p>Outbound tracking: {providerSelection.outboundTrackingStatus}</p>
            {statusMessage && (
              <p className="status" aria-live="polite">
                {statusMessage}
              </p>
            )}
          </details>
        </div>

        <div>
          {canShowResults ? (
            <section className="panel">
              <p className="step-label">Step 3</p>
              <ResultsSection
                events={visibleEvents}
                isLoading={isLoading}
                hasSearched={hasSearched}
                totalEvents={events.length}
                onLoadMore={() => setVisibleCount((count) => count + 10)}
                onBroadenRadius={() =>
                  setFilters((previous) => ({
                    ...previous,
                    radius: Math.min(100, Math.round(previous.radius * 1.5)),
                  }))
                }
                onExtendWindow={() =>
                  setFilters((previous) => {
                    const end = new Date(previous.endDate)
                    end.setDate(end.getDate() + 30)
                    return {
                      ...previous,
                      endDate: end.toISOString().slice(0, 10),
                    }
                  })
                }
              />
            </section>
          ) : (
            <section className="panel">
              <p className="step-label">Step 3</p>
              <h2>See your recommendations</h2>
              <p className="subtle">Add a song and your location, then run a search to view matches.</p>
            </section>
          )}
        </div>
      </main>
    </>
  )
}

export default App
