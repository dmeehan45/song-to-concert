import type { ConcertEvent, RecognitionResult, SearchFilters, SongSeedInput } from '../../types/contracts'

export interface AudioRecognitionAdapter {
  readonly provider: string
  recognizeFromText(input: SongSeedInput): Promise<RecognitionResult>
}

export interface EventDiscoveryAdapter {
  readonly provider: string
  searchEvents(input: {
    recognition: RecognitionResult
    filters: SearchFilters
  }): Promise<ConcertEvent[]>
}

export interface DiscoveryGateway {
  resolveRecognition(input: SongSeedInput): Promise<RecognitionResult>
  resolveEvents(input: { recognition: RecognitionResult; filters: SearchFilters }): Promise<{
    events: ConcertEvent[]
    providersAttempted: string[]
    winner: string
  }>
}
