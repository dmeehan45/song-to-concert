import type { RankedConcertEvent } from '../types/contracts'

interface ResultsSectionProps {
  events: RankedConcertEvent[]
  isLoading: boolean
  hasSearched: boolean
  totalEvents: number
  onLoadMore: () => void
  onBroadenRadius: () => void
  onExtendWindow: () => void
}

const formatDate = (value: string) => new Date(value).toLocaleDateString()

function EventCard({ event }: { event: RankedConcertEvent }) {
  return (
    <article className="event-card">
      {event.imageUrl && <img src={event.imageUrl} alt={`${event.artist} live`} loading="lazy" />}
      <div>
        <h4>
          {event.artist} {event.isExactArtistMatch && <span className="badge">Exact artist</span>}
        </h4>
        <p className="event-meta-primary">{formatDate(event.dateIso)}</p>
        <p className="event-meta-secondary">
          {event.venue} · {event.city}
        </p>
        <p className="event-price">
          {event.minPrice ? `$${event.minPrice} - $${event.maxPrice ?? event.minPrice}` : 'Price unavailable'}
        </p>
        <a className="action secondary inline-action" href={event.ticketUrl} target="_blank" rel="noreferrer">
          Book tickets
        </a>
      </div>
    </article>
  )
}

export function ResultsSection({
  events,
  isLoading,
  hasSearched,
  totalEvents,
  onLoadMore,
  onBroadenRadius,
  onExtendWindow,
}: ResultsSectionProps) {
  if (!hasSearched) {
    return (
      <>
        <h2>Best-fit concerts</h2>
        <p className="subtle">Run a search to see recommendations.</p>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <h2>Best-fit concerts</h2>
        <div className="loading-block" aria-live="polite">
          <p>Matching artists…</p>
          <p>Checking nearby venues…</p>
        </div>
      </>
    )
  }

  if (!events.length) {
    return (
      <>
        <h3>No events found</h3>
        <p>Try broadening your radius or extending your date window.</p>
        <div className="preset-row">
          <button type="button" onClick={onBroadenRadius}>
            Expand radius by 50%
          </button>
          <button type="button" onClick={onExtendWindow}>
            Extend window by 30 days
          </button>
        </div>
      </>
    )
  }

  const bestFit = events.slice(0, 3)
  const remaining = events.slice(3)
  const hasMore = totalEvents > events.length

  return (
    <>
      <h2>Best-fit concerts</h2>
      <div className="top-grid">
        {bestFit.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {remaining.length > 0 && (
        <>
          <h3>More matches</h3>
          <div className="list">
            {remaining.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}

      {hasMore && (
        <button className="action secondary" type="button" onClick={onLoadMore}>
          Load more
        </button>
      )}
    </>
  )
}
