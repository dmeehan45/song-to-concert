import type { RankedConcertEvent } from '../types/contracts'

interface ResultsSectionProps {
  events: RankedConcertEvent[]
  isLoading: boolean
  onLoadMore: () => void
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
        <p>
          {event.venue} · {event.city}
        </p>
        <p>{formatDate(event.dateIso)}</p>
        <p>
          {event.minPrice ? `$${event.minPrice} - $${event.maxPrice ?? event.minPrice}` : 'Price unavailable'}
        </p>
        <a href={event.ticketUrl} target="_blank" rel="noreferrer">
          Book tickets
        </a>
      </div>
    </article>
  )
}

export function ResultsSection({ events, isLoading, onLoadMore }: ResultsSectionProps) {
  if (isLoading) return <section className="panel">Loading recommendations...</section>

  if (!events.length) {
    return (
      <section className="panel">
        <h3>No events found</h3>
        <p>Try broadening your radius by 50% or extending timeframe by one month.</p>
      </section>
    )
  }

  const bestFit = events.slice(0, 3)
  const remaining = events.slice(3)

  return (
    <section className="panel">
      <h2>Best-fit concerts</h2>
      <div className="top-grid">
        {bestFit.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <h3>More matches</h3>
      <div className="list">
        {remaining.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <button className="action secondary" type="button" onClick={onLoadMore}>
        Load More
      </button>
    </section>
  )
}
