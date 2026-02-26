# Song-to-Concert Discovery MVP Plan (Canonical)

## Executive overview
We are building a mobile-first PWA that lets users identify a song (recorded audio or manual text), apply location/radius/timeframe filters, and discover nearby concerts with ticket links. Target users are mobile listeners who want immediate discovery with no signup friction. We will prove MVP success by validating: (1) input-to-results flow works, (2) ranking logic is deterministic and testable, (3) offline audio capture fallback stores clips locally, and (4) UI is responsive and accessible.

## Contracts first (shared interfaces)


## Execution order requested by reviewer
- Start with **Option C**: provider-agnostic adapter interfaces and gateway orchestration.
- Then execute **Option A**: continue mock-backed flow for stability while UI/features iterate.
- Then execute **Option B**: progressively replace adapter internals with live ACRCloud/Bandsintown/Songkick calls.

## Product decisions confirmed in this iteration
- Audio recognition: **ACRCloud** is primary for browser-compatible music fingerprinting; **AudD** remains fallback.
- Events discovery priority: **Bandsintown** primary, **Songkick** secondary.
- Niche music source coverage: include **Resident Advisor** as additional source for electronic-focused events in later integration.
- Ranking policy remains unchanged: similarity 40% / distance 30% / date 30% with exact-artist priority override.
- Outbound tracking/deeplink format is intentionally **pending** and deferred to a later workstream.

### API contracts (client-facing adapters)
All integrations are adapter-based; network calls can be stubbed during scaffold.

1. `POST /api/recognize-song` (future Supabase Edge Function or client adapter)
   - Request JSON:
     - `{ "audioBase64": string, "durationSec": number }`
   - Response JSON:
     - `{ "trackId": string, "title": string, "artist": string, "genres": string[], "confidence": number }`
   - Error shape:
     - `{ "error": "NO_MATCH" | "RATE_LIMIT" | "UPSTREAM_FAILURE", "message": string }`

2. `GET /api/music-seed?q=<string>&type=track|artist|genre`
   - Response JSON:
     - `{ "seed": { "id": string, "name": string, "artist": string }, "similarArtists": string[], "genres": string[] }`

3. `POST /api/events/search`
   - Request JSON:
     - `{ "origin": { "lat": number, "lon": number }, "radius": number, "radiusUnit": "mi" | "km", "startDate": string, "endDate": string, "seed": { "artist": string, "genres": string[] } }`
   - Response JSON:
     - `{ "events": ConcertEvent[], "nextCursor": string | null }`

### Shared TypeScript interfaces (single source)
Defined in `src/types/contracts.ts`:
- `SongSeedInput`
- `RecognitionResult`
- `SearchFilters`
- `ConcertEvent`
- `RankedConcertEvent`
- `ApiError`

### UI component contracts/props
- `HomeInputPanel`
  - props: `onRecordStart()`, `onManualSubmit(input: SongSeedInput)`
- `LocationFilterPanel`
  - props: `value: SearchFilters`, `onChange(next: SearchFilters)`, `onSearch()`
- `ResultsSection`
  - props: `events: RankedConcertEvent[]`, `isLoading: boolean`, `onLoadMore()`

### Env var names (names only)
- `VITE_ACRCLOUD_HOST`
- `VITE_ACRCLOUD_ACCESS_KEY`
- `VITE_ACRCLOUD_ACCESS_SECRET`
- `VITE_SPOTIFY_CLIENT_ID`
- `VITE_SPOTIFY_CLIENT_SECRET`
- `VITE_BANDSINTOWN_APP_ID`
- `VITE_SONGKICK_API_KEY`
- `VITE_RESIDENT_ADVISOR_BASE_URL`
- `VITE_TICKETMASTER_API_KEY`
- `VITE_DEFAULT_UTM_SOURCE`

### Stub file map (exact paths)
- `src/types/contracts.ts`
- `src/lib/scoring.ts`
- `src/lib/indexedAudioStore.ts`
- `src/lib/mockData.ts`
- `src/components/HomeInputPanel.tsx`
- `src/components/LocationFilterPanel.tsx`
- `src/components/ResultsSection.tsx`
- `src/styles/theme.css`
- `public/manifest.webmanifest`
- `src/sw.ts`
- `src/lib/adapters/types.ts`
- `src/lib/adapters/gateway.ts`

## Parallel workstreams

### Workstream 1 — Product shell & design system baseline (Agent role: Frontend shell engineer)
- **File ownership**:
  - `src/App.tsx`
  - `src/main.tsx`
  - `src/index.css`
  - `src/styles/theme.css`
- **Inputs**: Shared contracts and UI props above.
- **Outputs**: Runnable shell with dark Tidal-inspired layout and route-less staged flow.
- **Tasks**:
  1. Add CSS variables for dark theme + cyan accent.
  2. Build app frame with title, nav affordance, and stacked sections.
  3. Wire shell state for song input, filters, results list, loading/error banners.
- **Success criteria**:
  - `npm run build` passes.
  - Home→filters→results simulated flow works with mock data.
  - No text contrast issues on dark background for key labels/buttons.
- **Validation**:
  - `npm run build` exits 0.
  - `npm run dev` then manual mobile viewport check (375x812).
- **Edge/negative tests**:
  - Empty manual input shows validation message.
  - Missing results state shows fallback copy.

### Workstream 2 — Input capture & offline audio persistence (Agent role: Media/offline engineer)
- **File ownership**:
  - `src/components/HomeInputPanel.tsx`
  - `src/lib/indexedAudioStore.ts`
- **Inputs**: `SongSeedInput`, offline requirement.
- **Outputs**: Record button UX + 10s timer simulation + IndexedDB save path.
- **Tasks**:
  1. Implement media recording capability check and fallback message.
  2. Save blob metadata into IndexedDB store.
  3. Expose callback payload for parent flow.
- **Success criteria**:
  - On unsupported browser, warning shown.
  - On simulated offline path, record metadata saved locally.
- **Validation**:
  - `npm run build` exits 0.
  - Manual: disable network, click record stop, see “saved for retry” notice.
- **Edge/negative tests**:
  - Permission denied path displays non-blocking error.
  - Zero-length recording rejected.

### Workstream 3 — Filters + locale/radius behavior (Agent role: Search UX engineer)
- **File ownership**:
  - `src/components/LocationFilterPanel.tsx`
- **Inputs**: `SearchFilters` contract.
- **Outputs**: Location text input, radius slider, mi/km toggle, timeframe presets.
- **Tasks**:
  1. Detect locale default unit (`mi` for `en-US`, else `km`).
  2. Implement slider range (10–100) and timeframe presets.
  3. Emit controlled `onChange` + `onSearch`.
- **Success criteria**:
  - Toggle and slider update label and outgoing state.
  - Preset buttons set start/end dates correctly.
- **Validation**:
  - `npm run build` exits 0.
  - Manual: interact with controls and verify values in UI summary.
- **Edge/negative tests**:
  - Empty location keeps search disabled.
  - End date before start date auto-corrects.

### Workstream 4 — Ranking + results rendering + pagination shell (Agent role: Relevance engineer)
- **File ownership**:
  - `src/lib/scoring.ts`
  - `src/lib/mockData.ts`
  - `src/components/ResultsSection.tsx`
- **Inputs**: `ConcertEvent` and scoring weights in spec.
- **Outputs**: Deterministic ranking utility + top-3 highlight + load-more section.
- **Tasks**:
  1. Implement weighted rank with exact-artist priority override.
  2. Render top 3 cards and remaining list.
  3. Add “Load More” callback and empty-state suggestion.
- **Success criteria**:
  - Exact artist event ranks above all non-exact matches.
  - List renders at least 10 mocked items with load-more behavior.
- **Validation**:
  - `npm run build` exits 0.
  - Manual: verify top card includes exact artist badge.
- **Edge/negative tests**:
  - No events => fallback + broaden suggestion copy.
  - Missing image/price fields render sensible defaults.

### Workstream 5 — PWA plumbing + manifest/service worker (Agent role: Platform engineer)
- **File ownership**:
  - `public/manifest.webmanifest`
  - `src/sw.ts`
- `src/lib/adapters/types.ts`
- `src/lib/adapters/gateway.ts`
  - `public/icons/*` (if created)
- **Inputs**: Offline requirement, no account persistence.
- **Outputs**: Installable metadata + basic cache-first static assets service worker.
- **Tasks**:
  1. Add manifest metadata/theme colors/icons.
  2. Add service worker install/activate/fetch handlers (static shell caching).
  3. Register SW in app entry.
- **Success criteria**:
  - Build includes manifest + SW script.
  - App shell still loads when offline after first visit.
- **Validation**:
  - `npm run build` exits 0.
  - Manual DevTools > Application shows registered SW.
- **Edge/negative tests**:
  - SW update path clears old cache names.
  - Network failure serves cached shell for navigation requests.

## Integration plan (dependency-avoiding)
- Integrate through the contracts-only boundary in `src/types/contracts.ts`.
- Use mock adapters (`src/lib/mockData.ts`) until API adapters are implemented; this prevents blockers.
- Merge order (non-blocking): 5, 4, 3, 2, 1 (any order works since each workstream owns separate files).
- Conflict prevention:
  - `App.tsx` only consumes public component props/interfaces.
  - No shared edits allowed outside declared ownership; if needed, add adapter files instead of editing shared modules.

## Acceptance checklist (1:1 with success criteria)
- [ ] Build succeeds with no TypeScript errors.
- [ ] Manual input path can trigger mocked discovery flow.
- [ ] Recording UI handles unsupported/permission-denied paths.
- [ ] Locale-aware radius unit defaults correctly and remains toggleable.
- [ ] Ranking places exact artist at top with visible indicator.
- [ ] Results show top 3 + scroll list + load more action.
- [ ] Empty states suggest broadening radius/timeframe.
- [ ] Manifest + service worker are present and SW registers.
- [ ] Outbound tracking format decision documented as pending for later implementation.

## Risks and mitigations (parallel-specific)
1. **Contract drift across agents**
   - Mitigation: compile-time enforcement through shared interfaces in `src/types/contracts.ts`; PRs failing typecheck must update contracts explicitly.
2. **Hidden coupling in `App.tsx` orchestration**
   - Mitigation: keep `App.tsx` as thin coordinator; use adapter functions and stable prop contracts.
3. **UI inconsistency from parallel styling changes**
   - Mitigation: all design tokens centralized in `src/styles/theme.css`; components consume variables only.
4. **Offline behavior differs by browser**
   - Mitigation: explicit capability checks and fallback notices; no hard failure when MediaRecorder/IndexedDB unavailable.
