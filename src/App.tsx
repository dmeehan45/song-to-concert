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
  const gateway = useMemo(() => createDiscoveryGateway(), [])

  const discoverConcerts = async () => {
    if (!seedInput) {
      setStatusMessage('Add a song/artist seed first.')
      return
    }

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

  return (
    <>
      <header className="app-header">
        <p className="logo">◇ Song to Concert</p>
        <h1>Identify tracks and find nearby live shows</h1>
      </header>

      <main className="layout">
        <div>
          <HomeInputPanel onManualSubmit={setSeedInput} onOfflineSaved={setStatusMessage} />
          <LocationFilterPanel value={filters} onChange={setFilters} onSearch={discoverConcerts} />
        </div>
        <div>
          <section className="panel">
            <h3>Query summary</h3>
            <p>Seed: {seedInput ? `${seedInput.mode}: ${seedInput.query}` : 'None yet'}</p>
            <p>
              Area: {filters.locationQuery || 'Unset'} · {filters.radius} {filters.radiusUnit}
            </p>
            <p>Window: {filters.startDate} to {filters.endDate}</p>
            <p>Audio provider: {providerSelection.audioRecognitionPrimary} (fallback {providerSelection.audioRecognitionFallback})</p>
            <p>Event providers: {providerSelection.eventsPrimary} → {providerSelection.eventsSecondary}; niche source: {providerSelection.nicheSources.join(', ')}</p>
            <p>Outbound tracking: {providerSelection.outboundTrackingStatus}</p>
            {statusMessage && <p className="status">{statusMessage}</p>}
          </section>
          <ResultsSection
            events={visibleEvents}
            isLoading={isLoading}
            onLoadMore={() => setVisibleCount((count) => count + 10)}
          />
        </div>
      </main>
    </>
  )
}

export default App
