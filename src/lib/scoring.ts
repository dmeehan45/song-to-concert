import type { ConcertEvent, RankedConcertEvent } from '../types/contracts'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const distanceScore = (distance: number, maxDistance = 100) =>
  1 - clamp01(distance / maxDistance)

const dateScore = (dateIso: string) => {
  const now = Date.now()
  const eventTime = new Date(dateIso).getTime()
  const maxWindowMs = 1000 * 60 * 60 * 24 * 90
  const diff = Math.max(0, eventTime - now)
  return 1 - clamp01(diff / maxWindowMs)
}

export const rankConcerts = (events: ConcertEvent[]): RankedConcertEvent[] =>
  events
    .map((event) => {
      const score =
        event.similarity * 0.4 +
        distanceScore(event.distance) * 0.3 +
        dateScore(event.dateIso) * 0.3

      const rankScore = event.isExactArtistMatch ? score + 2 : score
      return { ...event, rankScore }
    })
    .sort((a, b) => b.rankScore - a.rankScore)
