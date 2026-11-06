import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { anniversaryConfig as cfg } from '../config/anniversary'

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: 'easeOut' }
})

// Scene B — the welcome. Short, warm, and straight into the room.
export default function WelcomeScene({ onEnter }) {
  return (
    <div className="welcome">
      <div className="welcome-glow" aria-hidden="true" />
      <motion.p className="welcome-heart" {...fadeUp(0.1)}>
        <Heart size={30} fill="currentColor" strokeWidth={1} />
      </motion.p>
      <motion.h1 {...fadeUp(0.3)}>{cfg.welcomeTitle}</motion.h1>
      <motion.p className="welcome-sub" {...fadeUp(0.6)}>
        {cfg.welcomeSubtitle}
      </motion.p>
      <motion.p className="welcome-msg" {...fadeUp(0.9)}>
        {cfg.welcomeMessage}
      </motion.p>
      <motion.button
        type="button"
        className="enter-button"
        onClick={onEnter}
        {...fadeUp(1.25)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Sparkles size={19} /> {cfg.enterButtonText}
      </motion.button>
      <motion.p className="welcome-controls-note" {...fadeUp(1.5)}>
        <span className="desktop-only">
          You are Sonai❤️ — walk with W A S D, Babai❤️ will hold your hand
        </span>
        <span className="mobile-only">
          You are Sonai❤️ — use the joystick to walk, drag to look around,
          tap ✋ to interact.
          <br />
          Babai❤️ will be right beside you, holding your hand…
        </span>
      </motion.p>
    </div>
  )
}
