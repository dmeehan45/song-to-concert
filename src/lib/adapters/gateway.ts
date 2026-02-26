import { mockEvents } from '../mockData'
import type { RecognitionResult, SearchFilters, SongSeedInput } from '../../types/contracts'
import { providerSelection } from '../providerConfig'
import type { AudioRecognitionAdapter, DiscoveryGateway, EventDiscoveryAdapter } from './types'

const fallbackRecognition = (input: SongSeedInput): RecognitionResult => ({
  trackId: 'manual-seed',
  title: input.query,
  artist: input.query,
  genres: ['unknown'],
  confidence: 0.4,
})

class AcrCloudTextAdapter implements AudioRecognitionAdapter {
  provider = 'ACRCloud'

  async recognizeFromText(input: SongSeedInput): Promise<RecognitionResult> {
    if (input.mode === 'text' && input.query.trim()) {
      return {
        trackId: `acr-${input.query.toLowerCase().replaceAll(' ', '-')}`,
        title: input.query,
        artist: input.query,
        genres: ['alt'],
        confidence: 0.8,
      }
    }
    return fallbackRecognition(input)
  }
}

class AuddTextAdapter implements AudioRecognitionAdapter {
  provider = 'AudD'

  async recognizeFromText(input: SongSeedInput): Promise<RecognitionResult> {
    return fallbackRecognition(input)
  }
}

class BandsintownAdapter implements EventDiscoveryAdapter {
  provider = 'Bandsintown'

  async searchEvents(input: { recognition: RecognitionResult; filters: SearchFilters }) {
    void input
    return mockEvents.slice(0, 10)
  }
}

class SongkickAdapter implements EventDiscoveryAdapter {
  provider = 'Songkick'

  async searchEvents(input: { recognition: RecognitionResult; filters: SearchFilters }) {
    void input
    return mockEvents.slice(2, 12)
  }
}

class ResidentAdvisorAdapter implements EventDiscoveryAdapter {
  provider = 'Resident Advisor'

  async searchEvents(input: { recognition: RecognitionResult; filters: SearchFilters }) {
    void input
    return mockEvents.filter((event) => event.id.endsWith('1') || event.id.endsWith('3'))
  }
}

const audioByName: Record<string, AudioRecognitionAdapter> = {
  ACRCloud: new AcrCloudTextAdapter(),
  AudD: new AuddTextAdapter(),
}

const eventsByName: Record<string, EventDiscoveryAdapter> = {
  Bandsintown: new BandsintownAdapter(),
  Songkick: new SongkickAdapter(),
  'Resident Advisor': new ResidentAdvisorAdapter(),
}

export const createDiscoveryGateway = (): DiscoveryGateway => {
  const audioPrimary = audioByName[providerSelection.audioRecognitionPrimary]
  const audioFallback = audioByName[providerSelection.audioRecognitionFallback]

  const eventPipeline = [
    eventsByName[providerSelection.eventsPrimary],
    eventsByName[providerSelection.eventsSecondary],
    ...providerSelection.nicheSources.map((name) => eventsByName[name]).filter(Boolean),
  ]

  return {
    async resolveRecognition(input: SongSeedInput) {
      try {
        return await audioPrimary.recognizeFromText(input)
      } catch {
        return audioFallback.recognizeFromText(input)
      }
    },

    async resolveEvents(input) {
      const providersAttempted: string[] = []
      for (const adapter of eventPipeline) {
        providersAttempted.push(adapter.provider)
        const events = await adapter.searchEvents(input)
        if (events.length > 0) {
          return { events, providersAttempted, winner: adapter.provider }
        }
      }

      return { events: mockEvents, providersAttempted, winner: 'Mock fallback' }
    },
  }
}
