export interface ProviderSelection {
  audioRecognitionPrimary: 'ACRCloud'
  audioRecognitionFallback: 'AudD'
  eventsPrimary: 'Bandsintown'
  eventsSecondary: 'Songkick'
  nicheSources: string[]
  outboundTrackingStatus: 'pending'
}

export const providerSelection: ProviderSelection = {
  audioRecognitionPrimary: 'ACRCloud',
  audioRecognitionFallback: 'AudD',
  eventsPrimary: 'Bandsintown',
  eventsSecondary: 'Songkick',
  nicheSources: ['Resident Advisor'],
  outboundTrackingStatus: 'pending',
}
