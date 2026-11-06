import { Music, Volume2, VolumeX } from 'lucide-react'

// Discreet music toggle, visible throughout the journey.
export default function MusicController({ music }) {
  if (music.hasError) {
    return (
      <div className="music-controller music-missing" title="Add your song at public/media/our-song.mp3">
        <Music size={17} /> <span>Song not added yet</span>
      </div>
    )
  }
  return (
    <div className="music-controller">
      <button
        type="button"
        onClick={music.toggle}
        aria-label={music.isPlaying ? 'Pause music' : 'Play music'}
      >
        <Music size={17} className={music.isPlaying ? 'spin-slow' : ''} />
        <span>{music.isPlaying ? 'Playing' : 'Paused'}</span>
      </button>
      <button
        type="button"
        onClick={music.toggleMute}
        aria-label={music.isMuted ? 'Unmute music' : 'Mute music'}
      >
        {music.isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>
    </div>
  )
}
