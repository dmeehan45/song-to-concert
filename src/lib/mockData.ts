import type { ConcertEvent } from '../types/contracts'

const dayMs = 1000 * 60 * 60 * 24

export const mockEvents: ConcertEvent[] = Array.from({ length: 12 }).map((_, i) => {
  const exact = i === 3
  return {
    id: `event-${i + 1}`,
    artist: exact ? 'Matched Artist' : `Similar Artist ${i + 1}`,
    venue: `Venue ${i + 1}`,
    city: i % 2 === 0 ? 'New York' : 'Brooklyn',
    dateIso: new Date(Date.now() + (i + 2) * dayMs).toISOString(),
    distance: 4 + i * 3,
    minPrice: 30 + i * 2,
    maxPrice: 60 + i * 3,
    imageUrl:
      i % 3 === 0
        ? 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=640&q=60'
        : undefined,
    ticketUrl: `https://tickets.example.com/event-${i + 1}?utm_source=song-to-concert`,
    similarity: exact ? 1 : Math.max(0.45, 0.9 - i * 0.04),
    isExactArtistMatch: exact,
    description: 'Live set featuring artist-adjacent sounds and similar genre influences.',
  }
})
