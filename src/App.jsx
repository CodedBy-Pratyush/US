import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import RibbonOpening from './components/RibbonOpening'
import WelcomeScene from './components/WelcomeScene'
import LoadingScreen from './components/LoadingScreen'
import MusicController from './components/MusicController'
import MemoryViewer from './components/MemoryViewer'
import ProposalInteraction from './components/ProposalInteraction'
import GameControls from './components/GameControls'
import AnniversaryWorld from './three/AnniversaryWorld'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'
import { anniversaryConfig as cfg } from './config/anniversary'

// Journey: opening (ribbon) -> welcome -> loading -> room (3D world)
// Overlays inside the room: memory viewer, proposal. Music is created
// once here and never unmounts, so it plays continuously throughout.
export default function App() {
  const [scene, setScene] = useState('opening')
  const [openMemory, setOpenMemory] = useState(null)
  const [showProposal, setShowProposal] = useState(false)
  const [nearest, setNearest] = useState(null)
  const [ceremonyMode, setCeremonyMode] = useState('welcome') // welcome | cake | ring
  const [cakeFlash, setCakeFlash] = useState(false)
  const [cakeDone, setCakeDone] = useState(false)
  // Explicit per-event lifecycle: available -> starting -> running ->
  // completed -> exited. Kept in a ref (no re-render needed); events never
  // read each other's status, so one can never block the other.
  const eventsRef = useRef({ cake: 'available', ring: 'available' })
  const setEvent = (name, status) => {
    eventsRef.current = { ...eventsRef.current, [name]: status }
  }
  const isBusy = (name) => ['starting', 'running'].includes(eventsRef.current[name])
  const ceremonyRef = useRef('welcome')
  ceremonyRef.current = ceremonyMode
  const [proposalScene, setProposalScene] = useState(false) // kneel -> ring -> hug
  const [wearingRing, setWearingRing] = useState(false)
  const [foreverFlash, setForeverFlash] = useState(false)
  const [proposalEnded, setProposalEnded] = useState(false)
  const proposalEndedRef = useRef(false)
  const timers = useRef([])
  const [videoStatus, setVideoStatus] = useState({
    playing: false,
    muted: true,
    failed: false,
    ended: false
  })
  // Shared ceremony stage, written by the 3D couple every phase
  // change and read here for UI milestones — so the banners, the ring
  // on her finger and the scene endings are driven by the ACTUAL 3D
  // timeline, never by wall-clock timers that can desync on slow
  // devices.
  const stageRef = useRef({ cake: 0, cakeDone: false, proposal: 0, proposalDone: false })
  const joystickRef = useRef({ x: 0, y: 0 })
  // Sonai IS the player character. This holds her position/facing and
  // the orbit camera; Babai walks beside her holding her hand.
  const playerStateRef = useRef({
    x: -0.32,
    z: 6.3,
    yaw: 0,
    camYaw: 0,
    camPitch: 0.34,
    speed: 0
  })
  const music = useBackgroundMusic(cfg.music)
  const musicRef = useRef(music)
  musicRef.current = music

  const overlayOpen = Boolean(openMemory) || showProposal

  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
  useEffect(
    () => () => timers.current.forEach((t) => clearTimeout(t)),
    []
  )

  // She taps the cake -> the couple walks to it and cuts it together,
  // the guests cheer harder, and the message flashes on screen.
  const startCakeCut = useCallback(() => {
    if (ceremonyRef.current !== 'welcome' || isBusy('cake')) return // no duplicate triggers
    ceremonyRef.current = 'cake'
    setEvent('cake', 'starting')
    stageRef.current.cake = 0
    stageRef.current.cakeDone = false
    setCakeFlash(false)
    setCakeDone(false)
    setCeremonyMode('cake')
  }, [])

  const finishCakeScene = useCallback(() => {
    setEvent('cake', 'exited')
    setCakeDone(false)
    setCakeFlash(false)
    stageRef.current.cake = 0
    stageRef.current.cakeDone = false
    setCeremonyMode('welcome')
  }, [])

  // Cake milestones, driven by the 3D timeline.
  useEffect(() => {
    if (ceremonyMode !== 'cake') return undefined
    const id = setInterval(() => {
      const s = stageRef.current
      if (s.cake >= 1 && eventsRef.current.cake === 'starting') setEvent('cake', 'running')
      setCakeFlash(s.cake === 2 || s.cake === 3)
      if (s.cakeDone) {
        setEvent('cake', 'completed')
        setCakeDone(true)
      }
    }, 250)
    return () => clearInterval(id)
  }, [ceremonyMode])

  // She taps the ring -> the couple walks to the ring table, the
  // camera glides to the wide ceremony position, and the question
  // flashes on screen FIRST.
  const startRingMoment = useCallback(() => {
    if (ceremonyRef.current !== 'welcome' || isBusy('ring')) return // no duplicate triggers
    ceremonyRef.current = 'ring'
    setEvent('ring', 'starting')
    setProposalScene(false)
    setCeremonyMode('ring')
    later(() => setShowProposal(true), 2100)
  }, [later])

  // She taps YES -> the card closes and the proposal SCENE plays out
  // in full view: Babai kneels, puts the ring on her finger, she
  // wears it, and they hug — while the guests cheer.
  const handleProposalYes = useCallback(() => {
    setEvent('ring', 'running')
    setShowProposal(false)
    stageRef.current.proposal = 0
    stageRef.current.proposalDone = false
    proposalEndedRef.current = false
    setProposalEnded(false)
    setWearingRing(false) // a repeat proposal starts with a bare finger
    setProposalScene(true)
  }, [])

  // Proposal milestones, driven by the 3D timeline: the ring appears
  // on her finger when the placement phase completes, the final
  // reveal shows while they hug, and the scene ends only after the
  // hug has been held — all at whatever speed the device can render.
  useEffect(() => {
    if (!proposalScene) return undefined
    const id = setInterval(() => {
      const s = stageRef.current
      if (s.proposal >= 2) setWearingRing(true)
      if (s.proposal >= 3) setForeverFlash(true)
      if (s.proposalDone && !proposalEndedRef.current) {
        // Hug has been held: show the Continue card (same one as the
        // cake scene) and let the hug keep playing behind it.
        proposalEndedRef.current = true
        setEvent('ring', 'completed')
        setForeverFlash(false)
        setProposalEnded(true)
      }
    }, 250)
    return () => clearInterval(id)
  }, [proposalScene])

  const finishProposalScene = useCallback(() => {
    setEvent('ring', 'exited')
    const st = stageRef.current
    st.proposalDone = false
    st.proposal = 0
    proposalEndedRef.current = false
    setProposalEnded(false)
    setForeverFlash(false)
    setProposalScene(false)
    setCeremonyMode('welcome')
  }, [])

  const handleInteract = useCallback(
    (item) => {
      if (!item) return
      if (item.type === 'memory') setOpenMemory(item.memory)
      else if (item.type === 'ring') startRingMoment()
      else if (item.type === 'cake') startCakeCut()
      else if (item.type === 'video') {
        window.dispatchEvent(new Event('anniversary:video-toggle'))
      }
    },
    [startCakeCut, startRingMoment]
  )

  // Direct taps on the 3D cake / ring meshes route to the same actions.
  useEffect(() => {
    const onCake = () => startCakeCut()
    const onRing = () => startRingMoment()
    window.addEventListener('anniversary:cake', onCake)
    window.addEventListener('anniversary:ring', onRing)
    return () => {
      window.removeEventListener('anniversary:cake', onCake)
      window.removeEventListener('anniversary:ring', onRing)
    }
  }, [startCakeCut, startRingMoment])

  const closeProposal = useCallback(() => {
    setShowProposal(false)
    if (!proposalScene) {
      setEvent('ring', 'exited')
      setCeremonyMode('welcome')
    }
  }, [proposalScene])

  // Preview deep-links (for testing the scenes directly):
  //   ?preview=proposal      -> room, ring tapped, question showing
  //   ?preview=proposal-yes  -> same, then auto-Yes into the 3D scene
  //   ?preview=cake          -> room, cake scene playing
  const previewHandled = useRef(false)
  useEffect(() => {
    if (previewHandled.current) return
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (!preview) return
    previewHandled.current = true
    setScene('room')
    if (preview === 'proposal') {
      startRingMoment()
    } else if (preview === 'proposal-yes') {
      startRingMoment()
      later(() => handleProposalYes(), 5600)
    } else if (preview === 'cake') {
      startCakeCut()
    }
  }, [later, startRingMoment, handleProposalYes, startCakeCut])

  // The room video is always silent; the song (cfg.music) is the only audio.

  const enterRoom = useCallback(() => {
    setScene('loading')
    // The room is procedural and media loads progressively, so this is
    // a short cinematic beat, not a wait for large files.
    setTimeout(() => setScene('room'), 900)
  }, [])

  const exitRoom = useCallback(() => {
    document.exitPointerLock?.()
    for (const n of ['cake', 'ring']) if (isBusy(n)) setEvent(n, 'exited')
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
    setOpenMemory(null)
    setShowProposal(false)
    setCakeFlash(false)
    setCakeDone(false)
    setProposalScene(false)
    setWearingRing(false)
    setForeverFlash(false)
    proposalEndedRef.current = false
    setProposalEnded(false)
    stageRef.current = { cake: 0, cakeDone: false, proposal: 0, proposalDone: false }
    setCeremonyMode('welcome')
    setNearest(null)
    playerStateRef.current = {
      x: -0.32, z: 6.3, yaw: 0, camYaw: 0, camPitch: 0.34, speed: 0
    }
    setScene('welcome')
  }, [])

  return (
    <div className="app">
      {scene !== 'opening' && <MusicController music={music} />}

      <AnimatePresence mode="wait">
        {scene === 'opening' && (
          <RibbonOpening
            key="opening"
            onCut={() => {
              music.start() // first meaningful gesture — music may begin
              setScene('welcome')
            }}
          />
        )}
        {scene === 'welcome' && <WelcomeScene key="welcome" onEnter={enterRoom} />}
        {scene === 'loading' && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {scene === 'room' && (
        <div className="room-scene">
          <div className="room-canvas">
            <AnniversaryWorld
              roaming={!overlayOpen && ceremonyMode === 'welcome'}
              joystickRef={joystickRef}
              nearest={nearest}
              ceremonyMode={ceremonyMode}
              proposalScene={proposalScene}
              wearingRing={wearingRing}
              stageRef={stageRef}
              playerStateRef={playerStateRef}
              onNearestChange={setNearest}
              onInteract={handleInteract}
              onVideoStatus={setVideoStatus}
            />
          </div>
          {/* Room dims gently during the proposal; the ring glows */}
          {ceremonyMode === 'ring' && <div className="ceremony-dim" aria-hidden="true" />}
          {/* Cake-cut celebration flash */}
          <AnimatePresence>
            {cakeFlash && ceremonyMode === 'cake' && (
              <motion.div
                className="cake-flash"
                initial={{ opacity: 0, y: -18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <span className="cake-flash-names">{cfg.characters.coupleTitle}</span>
                <span className="cake-flash-main">{cfg.characters.cakeCutMessage}</span>
                <span className="cake-flash-sub">{cfg.characters.cakeCutSubMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Final reveal — while they hug, low on screen so the
              couple stays fully visible above it */}
          <AnimatePresence>
            {foreverFlash && (
              <motion.div
                className="final-reveal"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <span className="final-reveal-title">{cfg.characters.finalRevealTitle}</span>
                <span className="final-reveal-line">{cfg.anniversaryTitle}</span>
                <span className="final-reveal-line">{cfg.personalMessage}</span>
                <span className="final-reveal-date">{cfg.anniversaryDate}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Cake scene end card — her button returns to the room */}
          <AnimatePresence>
            {cakeDone && ceremonyMode === 'cake' && (
              <motion.div
                className="cake-done-card"
                initial={{ opacity: 0, y: 22, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <p>{cfg.characters.cakeDoneMessage}</p>
                <button type="button" className="enter-button small" onClick={finishCakeScene}>
                  {cfg.characters.continueButton}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Proposal end card — her button returns to the room */}
          <AnimatePresence>
            {proposalEnded && (
              <motion.div
                className="cake-done-card"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <p>{cfg.proposalYesMessage}</p>
                <button type="button" className="enter-button small" onClick={finishProposalScene}>
                  {cfg.characters.continueButton}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Ring teaser while the couple takes position */}
          <AnimatePresence>
            {ceremonyMode === 'ring' && !showProposal && !proposalScene && (
              <motion.div
                className="cake-flash ring-flash"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="cake-flash-main">{cfg.characters.ringMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <GameControls
            cinematic={ceremonyMode !== 'welcome'}
            nearest={ceremonyMode === 'welcome' ? nearest : null}
            videoStatus={videoStatus}
            onExitRoom={exitRoom}
            joystickRef={joystickRef}
          />
          <AnimatePresence>
            {openMemory && (
              <MemoryViewer
                key="memory"
                memory={openMemory}
                onClose={() => setOpenMemory(null)}
              />
            )}
            {showProposal && (
              <ProposalInteraction
                key="proposal"
                onClose={closeProposal}
                onYes={handleProposalYes}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
