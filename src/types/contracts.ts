export type RadiusUnit = 'mi' | 'km'

export interface SongSeedInput {
  mode: 'audio' | 'text'
  query: string
}

export interface RecognitionResult {
  trackId: string
  title: string
  artist: string
  genres: string[]
  confidence: number
}

export interface SearchFilters {
  locationQuery: string
  radius: number
  radiusUnit: RadiusUnit
  startDate: string
  endDate: string
  sortBy: 'date' | 'distance' | 'price'
}

export interface ConcertEvent {
  id: string
  artist: string
  venue: string
  city: string
  dateIso: string
  distance: number
  minPrice?: number
  maxPrice?: number
  imageUrl?: string
  ticketUrl: string
  similarity: number
  isExactArtistMatch: boolean
  description?: string
}

export interface RankedConcertEvent extends ConcertEvent {
  rankScore: number
}

export interface ApiError {
  error: 'NO_MATCH' | 'RATE_LIMIT' | 'UPSTREAM_FAILURE'
  message: string
}
