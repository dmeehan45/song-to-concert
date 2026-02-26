import { useRef, useState } from 'react'
import { saveAudioClip } from '../lib/indexedAudioStore'
import type { SongSeedInput } from '../types/contracts'

interface HomeInputPanelProps {
  onManualSubmit: (input: SongSeedInput) => void
  onOfflineSaved: (message: string) => void
}

export function HomeInputPanel({ onManualSubmit, onOfflineSaved }: HomeInputPanelProps) {
  const [manualInput, setManualInput] = useState('')
  const [recordingState, setRecordingState] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const submitManual = () => {
    if (!manualInput.trim()) return
    onManualSubmit({ mode: 'text', query: manualInput.trim() })
  }

  const startRecording = async () => {
    if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) {
      setRecordingState('Recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size === 0) {
          setRecordingState('No audio captured. Please retry.')
          return
        }

        if (!navigator.onLine) {
          await saveAudioClip({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            blob,
          })
          const message = 'Offline: audio saved locally for retry.'
          setRecordingState(message)
          onOfflineSaved(message)
          return
        }

        setRecordingState('Audio captured. Recognition hookup is scaffolded.')
      }

      recorder.start()
      setRecordingState('Recording... auto-stop at 10 seconds.')
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
        stream.getTracks().forEach((track) => track.stop())
      }, 10000)
    } catch {
      setRecordingState('Microphone access denied or unavailable.')
    }
  }

  return (
    <>
      <h2>Identify a song</h2>
      <p className="subtle">Hear a track you like? Start with recording or type artist/title.</p>
      <button className="action" onClick={startRecording} type="button">
        Record song (10s)
      </button>
      <div className="input-row">
        <label className="field" htmlFor="seed-input">
          Song, artist, or genre
        </label>
        <input
          id="seed-input"
          aria-label="Song, artist, or genre"
          placeholder="Song, artist, or genre"
          value={manualInput}
          onChange={(event) => setManualInput(event.target.value)}
        />
        <button className="action secondary" type="button" onClick={submitManual}>
          Use text
        </button>
      </div>
      {recordingState && (
        <p className="status" aria-live="polite">
          {recordingState}
        </p>
      )}
    </>
  )
}
